import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// Same mock pattern as ai.integration.test.ts. The two test files share the
// global `mockCreate` because vi.mock hoists per-file; here we own our own.
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

describe("ai memory (sprint #2)", () => {
  const app = buildApp();
  let adminCookie = "";
  let workspaceId = "";

  beforeAll(async () => {
    await app.ready();
    const admin = await createSessionForTestUser(app, {
      role: "brewery_admin",
      activeWorkspace: true,
    });
    adminCookie = admin.cookie;
    workspaceId = admin.workspaceId;

    // Enable + configure the workspace.
    await app.prisma.workspaceBilling.upsert({
      where: { workspaceId },
      create: { workspaceId, tier: "premium", source: "manual" },
      update: { tier: "premium" },
    });
    await app.inject({
      method: "PUT",
      url: `/workspaces/${workspaceId}/ai/settings`,
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: {
        enabled: true,
        apiKey: "sk-ant-memory-test",
        dataEgressAccepted: true,
        perUserDailyCap: 1000000,
      },
    });
  });

  afterEach(() => {
    mockCreate.mockReset();
  });

  afterAll(async () => {
    await app.prisma.workspaceAiMemory
      .deleteMany({ where: { workspaceId } })
      .catch(() => {});
    await app.prisma.aiUsageLedger.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.prisma.workspaceAiSettings
      .deleteMany({ where: { workspaceId } })
      .catch(() => {});
    await app.prisma.workspaceBilling.deleteMany({ where: { workspaceId } }).catch(() => {});
    await app.close();
  });

  it("turn 1 writer persists a fact; turn 2 system prompt contains it", async () => {
    // Clean state.
    await app.prisma.workspaceAiMemory
      .deleteMany({ where: { workspaceId } })
      .catch(() => {});

    // --- Turn 1: chat response + writer response (in order) ---
    mockCreate
      .mockResolvedValueOnce({
        id: "msg_t1",
        content: [{ type: "text", text: "Got it. FV-3 has a -0.6C offset." }],
        stop_reason: "end_turn",
        usage: { input_tokens: 10, output_tokens: 8 },
      })
      .mockResolvedValueOnce({
        id: "msg_writer_t1",
        content: [
          {
            type: "text",
            text: JSON.stringify({ addFacts: ["FV-3 has a known temperature offset of -0.6C"] }),
          },
        ],
        stop_reason: "end_turn",
        usage: { input_tokens: 0, output_tokens: 0 },
      });

    const res1 = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "FV-3 reads cold. The actual offset is -0.6C." },
    });
    expect(res1.statusCode).toBe(200);
    expect(res1.payload).toContain("event: complete");

    // Wait briefly for the post-complete writer to finish. The route closes
    // the SSE stream before the writer's awaited promise resolves; the
    // request handler awaits the generator completion, so by the time
    // app.inject returns the writer's .applyPatch() call has completed.
    // We still flush microtasks once to be safe.
    await new Promise((r) => setImmediate(r));

    const stored = await app.prisma.workspaceAiMemory.findUnique({ where: { workspaceId } });
    expect(stored).not.toBeNull();
    const memoryBlob = stored!.memoryBlob as { facts?: string[] };
    expect(memoryBlob.facts ?? []).toContain(
      "FV-3 has a known temperature offset of -0.6C",
    );

    // --- Turn 2: chat response + writer response ---
    mockCreate
      .mockResolvedValueOnce({
        id: "msg_t2",
        content: [{ type: "text", text: "Yes, I remember." }],
        stop_reason: "end_turn",
        usage: { input_tokens: 15, output_tokens: 3 },
      })
      .mockResolvedValueOnce({
        id: "msg_writer_t2",
        content: [{ type: "text", text: "{}" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 0, output_tokens: 0 },
      });

    const res2 = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "Do you remember FV-3's offset?" },
    });
    expect(res2.statusCode).toBe(200);

    // Inspect the system prompt sent to Anthropic for turn 2.
    const turn2Call = mockCreate.mock.calls.find(
      (c) =>
        c[0] &&
        Array.isArray(c[0].messages) &&
        c[0].messages.some(
          (m: { role?: string; content?: string }) =>
            m.role === "user" && m.content === "Do you remember FV-3's offset?",
        ),
    );
    expect(turn2Call).toBeDefined();
    const systemPrompt = turn2Call?.[0]?.system as string;
    expect(systemPrompt).toContain("Workspace memory");
    expect(systemPrompt).toContain("FV-3 has a known temperature offset of -0.6C");
  });

  it("writer failure leaves the memory unchanged (best-effort)", async () => {
    await app.prisma.workspaceAiMemory
      .deleteMany({ where: { workspaceId } })
      .catch(() => {});

    mockCreate
      .mockResolvedValueOnce({
        id: "msg_t1",
        content: [{ type: "text", text: "ok" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 5, output_tokens: 2 },
      })
      // Writer throws.
      .mockRejectedValueOnce(new Error("boom: writer failed"));

    const res = await app.inject({
      method: "POST",
      url: "/ai/chat",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      payload: { message: "whatever" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.payload).toContain("event: complete");

    await new Promise((r) => setImmediate(r));

    const stored = await app.prisma.workspaceAiMemory.findUnique({
      where: { workspaceId },
    });
    expect(stored).toBeNull();
  });
});
