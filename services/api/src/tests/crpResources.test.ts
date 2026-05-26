import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ResourceGetResponseSchema, ResourceListResponseSchema } from "@umbraculum/crp-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("crp resources — Wave 1 read path", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let noWorkspaceCookie = "";
  let resourceAId = "";
  let resourceBId = "";

  beforeAll(async () => {
    await app.ready();
    const sessionA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;
    const sessionB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;
    noWorkspaceCookie = (await createSessionForTestUser(app, { activeWorkspace: false })).cookie;

    await app.prisma.crpResource.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    resourceAId = (await app.prisma.crpResource.create({
      data: {
        workspaceId: workspaceA,
        code: "FV-01",
        name: "Fermenter 1",
        kind: "equipment",
        status: "active",
      },
    })).id;
    resourceBId = (await app.prisma.crpResource.create({
      data: {
        workspaceId: workspaceB,
        code: "FV-01",
        name: "Workspace B Fermenter",
        kind: "equipment",
        status: "active",
      },
    })).id;
  });

  afterAll(async () => {
    await app.prisma.crpResource.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  it("returns 401 when unauthenticated and when no active workspace exists", async () => {
    const unauth = await app.inject({ method: "GET", url: "/crp/resources" });
    expect(unauth.statusCode).toBe(401);
    expect(unauth.json().error.code).toBe("missing_session");

    const noWorkspace = await app.inject({
      method: "GET",
      url: "/crp/resources",
      headers: { cookie: noWorkspaceCookie },
    });
    expect(noWorkspace.statusCode).toBe(401);
    expect(noWorkspace.json().error.code).toBe("missing_active_workspace");
  });

  it("lists rows for the active workspace only and allows same codes across workspaces", async () => {
    const resA = await app.inject({ method: "GET", url: "/crp/resources", headers: { cookie: cookieA } });
    expect(resA.statusCode).toBe(200);
    expect(ResourceListResponseSchema.parse(resA.json()).items[0]?.id).toBe(resourceAId);

    const resB = await app.inject({ method: "GET", url: "/crp/resources", headers: { cookie: cookieB } });
    expect(resB.statusCode).toBe(200);
    const bodyB = ResourceListResponseSchema.parse(resB.json());
    expect(bodyB.items[0]?.id).toBe(resourceBId);
    expect(bodyB.items[0]?.workspaceId).toBe(workspaceB);
  });

  it("returns 400 for invalid resource-kind filters", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/crp/resources?kind=tank",
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns detail in the active workspace and 404 across workspaces", async () => {
    const ok = await app.inject({
      method: "GET",
      url: `/crp/resources/${resourceAId}`,
      headers: { cookie: cookieA },
    });
    expect(ok.statusCode).toBe(200);
    expect(ResourceGetResponseSchema.parse(ok.json()).item.id).toBe(resourceAId);

    const isolated = await app.inject({
      method: "GET",
      url: `/crp/resources/${resourceAId}`,
      headers: { cookie: cookieB },
    });
    expect(isolated.statusCode).toBe(404);
    expect(isolated.json().error.code).toBe("resource_not_found");
  });
});
