import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

const TEST_WORKSPACE_ID = "22222222-2222-2222-2222-222222222225";

describe("equipment-profiles", () => {
  const app = buildApp();
  let cookieAdmin = "";
  let cookieViewer = "";
  let adminWorkspaceId = "";
  let viewerWorkspaceId = "";

  beforeAll(async () => {
    await app.ready();

    const admin = await createSessionForTestUser(app, { activeWorkspace: true, role: "brewery_admin" });
    cookieAdmin = admin.cookie;
    adminWorkspaceId = admin.workspaceId;

    const viewer = await createSessionForTestUser(app, { activeWorkspace: true, role: "viewer" });
    cookieViewer = viewer.cookie;
    viewerWorkspaceId = viewer.workspaceId;

    // Ensure we have a stable account to attach profiles to across test runs.
    // (createSessionForTestUser creates its own account, but we also keep this one tidy for cleanup.)
    await app.prisma.workspace.upsert({
      where: { id: TEST_WORKSPACE_ID },
      create: { id: TEST_WORKSPACE_ID, name: "Test Brewery (equipment-profiles)" },
      update: { name: "Test Brewery (equipment-profiles)" },
    });

    await app.prisma.equipmentProfile.deleteMany({
      where: { workspaceId: adminWorkspaceId, name: { startsWith: "Test Equipment Profile" } },
    });
    await app.prisma.equipmentProfile.deleteMany({
      where: { workspaceId: viewerWorkspaceId, name: { startsWith: "Test Equipment Profile" } },
    });
  });

  afterAll(async () => {
    // Cleanup: keep shared dev DB tidy.
    await app.prisma.equipmentProfile.deleteMany({
      where: { workspaceId: adminWorkspaceId, name: { startsWith: "Test Equipment Profile" } },
    });
    await app.prisma.equipmentProfile.deleteMany({
      where: { workspaceId: viewerWorkspaceId, name: { startsWith: "Test Equipment Profile" } },
    });
    await app.close();
  });

  it("requires authentication for GET /equipment-profiles", async () => {
    const res = await app.inject({ method: "GET", url: "/equipment-profiles" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_session", message: "Not authenticated" },
    });
  });

  it("admin can create, update, list, and delete an equipment profile", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/equipment-profiles",
      headers: { cookie: cookieAdmin },
      payload: {
        name: "Test Equipment Profile 1",
        kettleVolumeLiters: 35,
        mashEfficiencyPercent: 72,
        otherLossesLiters: 1.2,
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json();
    expect(created.ok).toBe(true);
    expect(created.profile.name).toBe("Test Equipment Profile 1");
    expect(created.profile.equipment.kettle.kettleVolumeLiters).toBe(35);
    expect(created.profile.equipment.mash.mashEfficiencyPercent).toBe(72);

    const patch = await app.inject({
      method: "PATCH",
      url: `/equipment-profiles/${created.profile.id}`,
      headers: { cookie: cookieAdmin },
      payload: {
        name: "Test Equipment Profile 1 (updated)",
        kettleVolumeLiters: 40,
      },
    });
    expect(patch.statusCode).toBe(200);
    const patched = patch.json();
    expect(patched.ok).toBe(true);
    expect(patched.profile.name).toBe("Test Equipment Profile 1 (updated)");
    expect(patched.profile.equipment.kettle.kettleVolumeLiters).toBe(40);

    const list = await app.inject({
      method: "GET",
      url: "/equipment-profiles",
      headers: { cookie: cookieAdmin },
    });
    expect(list.statusCode).toBe(200);
    const listed = list.json();
    expect(listed.ok).toBe(true);
    expect(Array.isArray(listed.profiles)).toBe(true);
    expect(listed.profiles.some((p: any) => p.id === created.profile.id)).toBe(true);

    const del = await app.inject({
      method: "DELETE",
      url: `/equipment-profiles/${created.profile.id}`,
      headers: { cookie: cookieAdmin },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json()).toEqual({ ok: true });
  });

  it("viewer can create, update, list, and delete an equipment profile (v0: no ACL)", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/equipment-profiles",
      headers: { cookie: cookieViewer },
      payload: {
        name: "Test Equipment Profile Viewer 1",
        kettleVolumeLiters: 25,
        mashEfficiencyPercent: 70,
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json();
    expect(created.ok).toBe(true);
    expect(created.profile.name).toBe("Test Equipment Profile Viewer 1");

    const patch = await app.inject({
      method: "PATCH",
      url: `/equipment-profiles/${created.profile.id}`,
      headers: { cookie: cookieViewer },
      payload: { kettleVolumeLiters: 28 },
    });
    expect(patch.statusCode).toBe(200);

    const list = await app.inject({
      method: "GET",
      url: "/equipment-profiles",
      headers: { cookie: cookieViewer },
    });
    expect(list.statusCode).toBe(200);
    const listed = list.json();
    expect(listed.ok).toBe(true);
    expect(listed.profiles.some((p: any) => p.id === created.profile.id)).toBe(true);

    const del = await app.inject({
      method: "DELETE",
      url: `/equipment-profiles/${created.profile.id}`,
      headers: { cookie: cookieViewer },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json()).toEqual({ ok: true });
  });
});

