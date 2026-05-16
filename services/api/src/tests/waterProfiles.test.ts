import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

// Use test-only IDs so running tests doesn't pollute seeded dev data.
const TEST_ADMIN_USER_ID = "11111111-1111-1111-1111-111111111113";
const TEST_ACCOUNT_A = "22222222-2222-2222-2222-222222222224";
const TEST_VIEWER_USER_ID = "11111111-1111-1111-1111-111111111114";

describe("water-profiles", () => {
  const app = buildApp();
  let cookieAdmin = "";
  let cookieViewer = "";
  let _cookieNoSession = "";

  beforeAll(async () => {
    await app.ready();
    const admin = await createSessionForTestUser(app, { activeWorkspace: true, role: "brewery_admin" });
    cookieAdmin = admin.cookie;

    const viewer = await createSessionForTestUser(app, { activeWorkspace: true, role: "viewer" });
    cookieViewer = viewer.cookie;

    // Used only to validate "not authenticated" behavior
    _cookieNoSession = "";

    await app.prisma.user.upsert({
      where: { id: TEST_ADMIN_USER_ID },
      create: { id: TEST_ADMIN_USER_ID, email: "test-water-profiles-admin@brewery.local" },
      update: { email: "test-water-profiles-admin@brewery.local" },
    });

    await app.prisma.workspace.upsert({
      where: { id: TEST_ACCOUNT_A },
      create: { id: TEST_ACCOUNT_A, name: "Test Brewery A (water-profiles)" },
      update: { name: "Test Brewery A (water-profiles)" },
    });

    await app.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: TEST_ACCOUNT_A, userId: TEST_ADMIN_USER_ID } },
      create: { workspaceId: TEST_ACCOUNT_A, userId: TEST_ADMIN_USER_ID, role: "brewery_admin" },
      update: { role: "brewery_admin" },
    });

    await app.prisma.user.upsert({
      where: { id: TEST_VIEWER_USER_ID },
      create: { id: TEST_VIEWER_USER_ID, email: "test-water-profiles-viewer@brewery.local" },
      update: { email: "test-water-profiles-viewer@brewery.local" },
    });
    await app.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: TEST_ACCOUNT_A, userId: TEST_VIEWER_USER_ID } },
      create: { workspaceId: TEST_ACCOUNT_A, userId: TEST_VIEWER_USER_ID, role: "viewer" },
      update: { role: "viewer" },
    });

    // Idempotence: wipe test-created (user-sourced) profiles from earlier runs.
    await app.prisma.waterProfile.deleteMany({ where: { workspaceId: TEST_ACCOUNT_A, source: "user" } });
  });

  afterAll(async () => {
    // Cleanup: keep shared dev DB tidy.
    await app.prisma.waterProfile.deleteMany({ where: { workspaceId: TEST_ACCOUNT_A, source: "user" } });
    await app.close();
  });

  it("requires authentication for GET /water-profiles", async () => {
    const res = await app.inject({ method: "GET", url: "/water-profiles" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_session", message: "Not authenticated" },
    });
  });

  it("lists system profiles for user (no account header)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/water-profiles",
      headers: { cookie: cookieAdmin },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.system)).toBe(true);
    expect(body.system.length).toBeGreaterThan(10);
    expect(Array.isArray(body.public)).toBe(true);
    expect(Array.isArray(body.workspace)).toBe(true);
    expect(body.workspace.length).toBe(0);
  });

  it("prevents non-admin from creating a profile", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/water-profiles",
      headers: { cookie: cookieViewer },
      payload: {
        scope: "public",
        type: "water",
        name: "My City Water",
        calcium: 10,
        magnesium: 2,
        sodium: 5,
        sulfate: 8,
        chloride: 7,
        bicarbonate: 25,
      },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "insufficient_role", message: "Only brewery admins can manage water profiles" },
    });
  });

  it("admin can create and verify/unverify a profile", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/water-profiles",
      headers: { cookie: cookieAdmin },
      payload: {
        scope: "public",
        type: "water",
        name: "Test Profile",
        calcium: 10,
        magnesium: 2,
        sodium: 5,
        sulfate: 8,
        chloride: 7,
        bicarbonate: 25,
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);
    expect(created.profile.scope).toBe("public");
    expect(created.profile.verificationStatus).toBe("unverified");

    const verify = await app.inject({
      method: "POST",
      url: `/water-profiles/${created.profile.id}/verify`,
      headers: { cookie: cookieAdmin },
    });
    expect(verify.statusCode).toBe(200);
    const verified = verify.json() as any;
    expect(verified.ok).toBe(true);
    expect(verified.profile.verificationStatus).toBe("verified");

    const unverify = await app.inject({
      method: "POST",
      url: `/water-profiles/${created.profile.id}/unverify`,
      headers: { cookie: cookieAdmin },
    });
    expect(unverify.statusCode).toBe(200);
    const unverified = unverify.json() as any;
    expect(unverified.ok).toBe(true);
    expect(unverified.profile.verificationStatus).toBe("unverified");

    // Cleanup: remove created public profile so it doesn't pollute shared dev DB.
    const del = await app.inject({
      method: "DELETE",
      url: `/water-profiles/${created.profile.id}`,
      headers: { cookie: cookieAdmin },
    });
    expect(del.statusCode).toBe(200);
  });

  it("admin can delete a non-system profile", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/water-profiles",
      headers: { cookie: cookieAdmin },
      payload: {
        scope: "public",
        type: "water",
        name: "Delete Profile",
        calcium: 10,
        magnesium: 2,
        sodium: 5,
        sulfate: 8,
        chloride: 7,
        bicarbonate: 25,
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    const del = await app.inject({
      method: "DELETE",
      url: `/water-profiles/${created.profile.id}`,
      headers: { cookie: cookieAdmin },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json()).toEqual({ ok: true });
  });
});

