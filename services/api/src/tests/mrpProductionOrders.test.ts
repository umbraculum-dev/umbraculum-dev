import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  MaterialRequirementListResponseSchema,
  ProductionOrderGetResponseSchema,
  ProductionOrderListResponseSchema,
} from "@umbraculum/mrp-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("mrp production orders — Wave 1 read path", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let noWorkspaceCookie = "";
  let productionOrderAId = "";
  let productionOrderBId = "";

  beforeAll(async () => {
    await app.ready();
    const sessionA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;
    const sessionB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;
    noWorkspaceCookie = (await createSessionForTestUser(app, { activeWorkspace: false })).cookie;

    await app.prisma.mrpProductionOrder.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });

    const a = await app.prisma.mrpProductionOrder.create({
      data: {
        workspaceId: workspaceA,
        orderNumber: "MRP-001",
        status: "planned",
        sourceModule: "brewery",
        sourceRefId: "session-a",
        quantity: 10,
        unit: "bbl",
        lines: { create: [{ lineNumber: 1, description: "A batch", quantity: 10, unit: "bbl" }] },
        operations: {
          create: [{ workspaceId: workspaceA, sequence: 1, code: "mash", name: "Mash" }],
        },
        materialRequirements: {
          create: [{ workspaceId: workspaceA, description: "Pale malt", requiredQuantity: 42, unit: "kg" }],
        },
      },
    });
    productionOrderAId = a.id;
    const b = await app.prisma.mrpProductionOrder.create({
      data: {
        workspaceId: workspaceB,
        orderNumber: "MRP-001",
        status: "released",
        quantity: 5,
        unit: "bbl",
      },
    });
    productionOrderBId = b.id;
  });

  afterAll(async () => {
    await app.prisma.mrpProductionOrder.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  it("returns 401 when unauthenticated and when no active workspace exists", async () => {
    const unauth = await app.inject({ method: "GET", url: "/mrp/production-orders" });
    expect(unauth.statusCode).toBe(401);
    expect(unauth.json().error.code).toBe("missing_session");

    const noWorkspace = await app.inject({
      method: "GET",
      url: "/mrp/production-orders",
      headers: { cookie: noWorkspaceCookie },
    });
    expect(noWorkspace.statusCode).toBe(401);
    expect(noWorkspace.json().error.code).toBe("missing_active_workspace");
  });

  it("lists rows for the active workspace only and allows same order numbers across workspaces", async () => {
    const resA = await app.inject({
      method: "GET",
      url: "/mrp/production-orders",
      headers: { cookie: cookieA },
    });
    expect(resA.statusCode).toBe(200);
    const bodyA = ProductionOrderListResponseSchema.parse(resA.json());
    expect(bodyA.items).toHaveLength(1);
    expect(bodyA.items[0]?.id).toBe(productionOrderAId);
    expect(bodyA.items[0]?.workspaceId).toBe(workspaceA);

    const resB = await app.inject({
      method: "GET",
      url: "/mrp/production-orders",
      headers: { cookie: cookieB },
    });
    expect(resB.statusCode).toBe(200);
    const bodyB = ProductionOrderListResponseSchema.parse(resB.json());
    expect(bodyB.items).toHaveLength(1);
    expect(bodyB.items[0]?.id).toBe(productionOrderBId);
    expect(bodyB.items[0]?.workspaceId).toBe(workspaceB);
  });

  it("returns 400 for invalid query filters", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/mrp/production-orders?status=draft",
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns details and nested material requirements for the active workspace", async () => {
    const detail = await app.inject({
      method: "GET",
      url: `/mrp/production-orders/${productionOrderAId}`,
      headers: { cookie: cookieA },
    });
    expect(detail.statusCode).toBe(200);
    const body = ProductionOrderGetResponseSchema.parse(detail.json());
    expect(body.item.operations[0]?.code).toBe("mash");

    const requirements = await app.inject({
      method: "GET",
      url: `/mrp/production-orders/${productionOrderAId}/material-requirements`,
      headers: { cookie: cookieA },
    });
    expect(requirements.statusCode).toBe(200);
    expect(MaterialRequirementListResponseSchema.parse(requirements.json()).items[0]?.description)
      .toBe("Pale malt");
  });

  it("L2 detail isolation returns 404 for another workspace's production order", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/mrp/production-orders/${productionOrderAId}`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("production_order_not_found");
  });
});
