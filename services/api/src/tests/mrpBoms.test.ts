import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BomGetResponseSchema, BomListResponseSchema } from "@umbraculum/mrp-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("mrp BOMs — Wave 1 read path", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let bomAId = "";
  let bomBId = "";

  beforeAll(async () => {
    await app.ready();
    const sessionA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;
    const sessionB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;

    await app.prisma.mrpBom.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    const bomA = await app.prisma.mrpBom.create({
      data: {
        workspaceId: workspaceA,
        code: "PALE-ALE",
        name: "Pale Ale",
        ownerModule: "brewery",
        sourceRefId: "recipe-a",
        lines: { create: [{ lineNumber: 1, description: "Pale malt", quantity: 42, unit: "kg" }] },
      },
    });
    bomAId = bomA.id;
    const bomB = await app.prisma.mrpBom.create({
      data: {
        workspaceId: workspaceB,
        code: "PALE-ALE",
        name: "Workspace B Pale Ale",
      },
    });
    bomBId = bomB.id;
  });

  afterAll(async () => {
    await app.prisma.mrpBom.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await app.inject({ method: "GET", url: "/mrp/boms" });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("missing_session");
  });

  it("lists rows for the active workspace only and allows same codes across workspaces", async () => {
    const resA = await app.inject({ method: "GET", url: "/mrp/boms", headers: { cookie: cookieA } });
    expect(resA.statusCode).toBe(200);
    expect(BomListResponseSchema.parse(resA.json()).items[0]?.id).toBe(bomAId);

    const resB = await app.inject({ method: "GET", url: "/mrp/boms", headers: { cookie: cookieB } });
    expect(resB.statusCode).toBe(200);
    const bodyB = BomListResponseSchema.parse(resB.json());
    expect(bodyB.items[0]?.id).toBe(bomBId);
    expect(bodyB.items[0]?.workspaceId).toBe(workspaceB);
  });

  it("returns BOM detail in the active workspace", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/mrp/boms/${bomAId}`,
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(200);
    expect(BomGetResponseSchema.parse(res.json()).item.lines[0]?.description).toBe("Pale malt");
  });

  it("L2 detail isolation returns 404 for another workspace's BOM", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/mrp/boms/${bomAId}`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("bom_not_found");
  });
});
