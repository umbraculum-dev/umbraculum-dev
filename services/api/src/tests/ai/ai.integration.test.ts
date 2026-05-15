import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// Mock @anthropic-ai/sdk BEFORE importing buildApp. The orchestrator uses
// `new Anthropic({ apiKey })` and calls `client.messages.create(...)`.
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    public readonly messages: { create: typeof mockCreate };
    constructor(_opts: { apiKey: string }) {
      this.messages = { create: mockCreate };
    }
  }
  return { default: Anthropic };
});

import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";

describe("ai (chat + settings + gating)", () => {
  const app = buildApp();

  let adminCookie = "";
  let adminUserId = "";
  let workspaceId = "";

  let memberCookie = "";
  let memberUserId = "";

  beforeAll(async () => {
    await app.ready();
    const admin = await createSessionForTestUser(app, { role: "brewery_admin", activeWorkspace: true });
    adminCookie = admin.cookie;
    adminUserId = admin.userId;
    workspaceId = admin.workspaceId;

    // Create a member of the same workspace.
    const memberSession = await createSessionForTestUser(app, {
      role: "member",
      activeWorkspace: true,
    });
    memberUserId = memberSession.userId;
    // Move the member into the admin's workspace + point their session there.
    await app.prisma.workspaceMember.create({
      data: { userId: memberUserId, workspaceId, role: "member" },
    });
    await app.prisma.session.update({
      where: { id: memberSession.cookie.replace("sid=", "") },
      data: { activeWorkspaceId: workspaceId },
    });
    memberCookie = memberSession.cookie;
  });

  afterEach(() => {
    mockCreate.mockReset();
  });

  afterAll(async () => {
    await app.prisma.aiUsageLedger.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.prisma.workspaceAiSettings
      .deleteMany({ where: { workspaceId } })
      .catch(() => {});
    await app.prisma.workspaceBilling.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.close();
  });

  // ----- Gating preflight -----

  it("free tier rejects /ai/chat with 402 + ai_subscription_required", async () => {
    await app.prisma.workspaceBilling.upsert({
      where: { workspaceId },
      create: { workspaceId, tier: "free", source: "manual" },
      update: { tier: "free" },
    });
    const res = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "hello" },
    });
    expect(res.statusCode).toBe(402);
    const body = res.json() as { error?: { code?: string } };
    expect(body.error?.code).toBe("ai_subscription_required");
  });

  it("premium tier without enable rejects with 403 ai_not_enabled", async () => {
    await app.prisma.workspaceBilling.upsert({
      where: { workspaceId },
      create: { workspaceId, tier: "premium", source: "manual" },
      update: { tier: "premium" },
    });
    // Ensure settings row exists but is not enabled.
    await app.prisma.workspaceAiSettings.upsert({
      where: { workspaceId },
      create: { workspaceId, enabled: false },
      update: { enabled: false, encryptedKey: null, dataEgressAccepted: false },
    });

    const res = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "hello" },
    });
    expect(res.statusCode).toBe(403);
    const body = res.json() as { error?: { code?: string } };
    expect(body.error?.code).toBe("ai_not_enabled");
  });

  // ----- Settings (admin-only writes) -----

  it("non-admin cannot PUT settings", async () => {
    const res = await app.inject({
      method: "PUT",
      url: `/workspaces/${workspaceId}/ai/settings`,
      headers: { cookie: memberCookie, "content-type": "application/json" },
      payload: { enabled: true },
    });
    expect(res.statusCode).toBe(403);
  });

  it("admin PUT stores the key (hasKey true) but never returns it", async () => {
    const res = await app.inject({
      method: "PUT",
      url: `/workspaces/${workspaceId}/ai/settings`,
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: {
        enabled: true,
        apiKey: "sk-ant-test-1",
        dataEgressAccepted: true,
        perUserDailyCap: 200000,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { settings: { hasKey?: boolean; enabled?: boolean } };
    expect(body.settings.hasKey).toBe(true);
    expect(body.settings.enabled).toBe(true);
    expect(JSON.stringify(body)).not.toContain("sk-ant-test-1");
  });

  // ----- Happy path -----

  it("admin happy path: model emits text, ledger row is written", async () => {
    mockCreate.mockResolvedValueOnce({
      id: "msg_test_1",
      content: [{ type: "text", text: "Hello back." }],
      stop_reason: "end_turn",
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const res = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "hi" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.payload).toContain("event: assistant_chunk");
    expect(res.payload).toContain("Hello back.");
    expect(res.payload).toContain("event: complete");

    const rows = await app.prisma.aiUsageLedger.findMany({
      where: { workspaceId, userId: adminUserId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    expect(rows[0]).toBeDefined();
    expect(rows[0].tokensIn).toBe(10);
    expect(rows[0].tokensOut).toBe(5);
    expect(rows[0].model).toBeTruthy();
  });

  it("tool-use loop: model calls a tool, gets a result, then finishes", async () => {
    // First call: model asks to use brewery.recipeLookup.
    mockCreate.mockResolvedValueOnce({
      id: "msg_test_tool_1",
      content: [
        { type: "tool_use", id: "toolu_1", name: "brewery.recipeLookup", input: { name: "stout" } },
      ],
      stop_reason: "tool_use",
      usage: { input_tokens: 20, output_tokens: 10 },
    });
    // Second call: model returns final text after seeing the tool result.
    mockCreate.mockResolvedValueOnce({
      id: "msg_test_tool_2",
      content: [{ type: "text", text: "I checked, here is what I found." }],
      stop_reason: "end_turn",
      usage: { input_tokens: 30, output_tokens: 15 },
    });

    const res = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "any stouts?" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.payload).toContain("event: tool_call");
    expect(res.payload).toContain("brewery.recipeLookup");
    expect(res.payload).toContain("event: tool_result");
    expect(res.payload).toContain("event: complete");

    // Token accumulation: 20+30 in, 10+15 out.
    const rows = await app.prisma.aiUsageLedger.findMany({
      where: { workspaceId, userId: adminUserId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    expect(rows[0].tokensIn).toBe(50);
    expect(rows[0].tokensOut).toBe(25);
  });

  // ----- Per-user daily cap -----

  it("per-user daily cap rejects with 429 ai_rate_limit", async () => {
    // Shrink the cap so existing ledger rows exceed it.
    await app.prisma.workspaceAiSettings.update({
      where: { workspaceId },
      data: { perUserDailyCap: 1 },
    });
    const res = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "another?" },
    });
    expect(res.statusCode).toBe(429);
    const body = res.json() as { error?: { code?: string; details?: { scope?: string } } };
    expect(body.error?.code).toBe("ai_rate_limit");
    expect(body.error?.details?.scope).toBe("user_daily");
    // Restore for any subsequent tests.
    await app.prisma.workspaceAiSettings.update({
      where: { workspaceId },
      data: { perUserDailyCap: 200000 },
    });
  });

  // ----- Usage endpoint -----

  it("GET /workspaces/:id/ai/usage returns aggregated data for admin", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/ai/usage`,
      headers: { cookie: adminCookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      monthly: { tokensIn: number; tokensOut: number; callCount: number };
      byUser: Array<{ userId: string }>;
    };
    expect(body.monthly.callCount).toBeGreaterThanOrEqual(2);
    expect(body.byUser.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /workspaces/:id/ai/usage rejects non-admin members", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/workspaces/${workspaceId}/ai/usage`,
      headers: { cookie: memberCookie },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { error?: { code?: string } };
    expect(body.error?.code).toBe("ai_admin_only");
  });
});
