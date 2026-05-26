import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  BomGetResponseSchema,
  BomListResponseSchema,
  MaterialRequirementListResponseSchema,
  ProductionOrderGetResponseSchema,
  ProductionOrderListResponseSchema,
} from "@umbraculum/mrp-contracts";

import { buildApp } from "../app.js";
import {
  breweryBrewSessionProductionOrderId,
  breweryRecipeBomId,
} from "../modules/mrp/services/breweryProjectionIds.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("mrp brewery projections — Wave 2 read path", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let recipeAId = "";
  let recipeBId = "";
  let sessionAId = "";
  let sessionBId = "";
  let stepAId = "";
  let zeroDurationStepAId = "";

  beforeAll(async () => {
    await app.ready();
    const sessionA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;
    const sessionB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;

    const recipeA = await app.prisma.recipe.create({
      data: {
        workspaceId: workspaceA,
        name: "Wave 2 Projection Pale Ale",
        styleKey: "custom",
        versionGroupId: randomUUID(),
        version: 1,
        beerJsonRecipeJson: buildBeerJsonRecipe("Wave 2 Projection Pale Ale"),
      },
    });
    recipeAId = recipeA.id;
    const brewSessionA = await app.prisma.brewSession.create({
      data: {
        workspaceId: workspaceA,
        recipeId: recipeAId,
        code: "BATCH-ALPHA",
        status: "running",
        startedAt: new Date("2026-08-01T08:00:00.000Z"),
        steps: {
          create: [
            {
              sectionId: "mash",
              name: "Mash",
              sortOrder: 1,
              minutesPlanned: 60,
            },
            {
              sectionId: "cleanup",
              name: "Cleanup placeholder",
              sortOrder: 2,
              minutesPlanned: 0,
            },
          ],
        },
      },
      include: { steps: true },
    });
    sessionAId = brewSessionA.id;
    stepAId = brewSessionA.steps.find((step) => step.name === "Mash")?.id ?? "";
    zeroDurationStepAId = brewSessionA.steps.find((step) => step.name === "Cleanup placeholder")?.id ?? "";

    const recipeB = await app.prisma.recipe.create({
      data: {
        workspaceId: workspaceB,
        name: "Wave 2 Projection Pale Ale",
        styleKey: "custom",
        versionGroupId: randomUUID(),
        version: 1,
        beerJsonRecipeJson: buildBeerJsonRecipe("Wave 2 Projection Pale Ale"),
      },
    });
    recipeBId = recipeB.id;
    const brewSessionB = await app.prisma.brewSession.create({
      data: {
        workspaceId: workspaceB,
        recipeId: recipeBId,
        code: "BATCH-ALPHA",
        status: "draft",
        scheduledDate: new Date("2026-08-02T00:00:00.000Z"),
      },
    });
    sessionBId = brewSessionB.id;
  });

  afterAll(async () => {
    await app.prisma.brewSessionStep.deleteMany({
      where: { brewSession: { workspaceId: { in: [workspaceA, workspaceB] } } },
    });
    await app.prisma.brewSession.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.recipe.deleteMany({
      where: { id: { in: [recipeAId, recipeBId].filter(Boolean) } },
    });
    await app.close();
  });

  it("projects recipes as MRP BOMs with BeerJSON ingredient lines", async () => {
    const res = await app.inject({ method: "GET", url: "/mrp/boms", headers: { cookie: cookieA } });
    expect(res.statusCode).toBe(200);
    const body = BomListResponseSchema.parse(res.json());
    const bom = body.items.find((item) => item.id === breweryRecipeBomId(recipeAId));
    expect(bom?.workspaceId).toBe(workspaceA);
    expect(bom?.ownerModule).toBe("brewery");
    expect(bom?.sourceRefId).toBe(recipeAId);
    expect(bom?.lines.map((line) => line.description)).toEqual([
      "Pale malt",
      "Cascade",
      "US-05",
      "Whirlfloc",
    ]);
  });

  it("projects brew sessions as MRP production orders with operations", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/mrp/production-orders",
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(200);
    const list = ProductionOrderListResponseSchema.parse(res.json());
    const projectedOrder = list.items.find((item) => item.id === breweryBrewSessionProductionOrderId(sessionAId));
    expect(projectedOrder?.orderNumber).toBe("BATCH-ALPHA");
    expect(projectedOrder?.status).toBe("in_progress");

    const detail = await app.inject({
      method: "GET",
      url: `/mrp/production-orders/${breweryBrewSessionProductionOrderId(sessionAId)}`,
      headers: { cookie: cookieA },
    });
    expect(detail.statusCode).toBe(200);
    const body = ProductionOrderGetResponseSchema.parse(detail.json());
    expect(body.item.operations[0]?.id).toContain(stepAId);
    expect(body.item.operations[0]?.plannedDurationMinutes).toBe(60);
    expect(zeroDurationStepAId).not.toBe("");
    const zeroDurationOperation = body.item.operations.find((operation) =>
      operation.id.includes(zeroDurationStepAId)
    );
    expect(zeroDurationOperation?.plannedDurationMinutes).toBeNull();
  });

  it("derives production-order material requirements from the source recipe", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/mrp/production-orders/${breweryBrewSessionProductionOrderId(sessionAId)}/material-requirements`,
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(200);
    const body = MaterialRequirementListResponseSchema.parse(res.json());
    expect(body.items).toHaveLength(4);
    expect(body.items[0]?.availabilityStatus).toBe("available_assumed");
    expect(body.items.map((item) => item.materialRefModule)).toContain("brewery.fermentable");
  });

  it("returns projected BOM detail and keeps same codes isolated across workspaces", async () => {
    const detailA = await app.inject({
      method: "GET",
      url: `/mrp/boms/${breweryRecipeBomId(recipeAId)}`,
      headers: { cookie: cookieA },
    });
    expect(detailA.statusCode).toBe(200);
    expect(BomGetResponseSchema.parse(detailA.json()).item.workspaceId).toBe(workspaceA);

    const listB = await app.inject({
      method: "GET",
      url: "/mrp/production-orders",
      headers: { cookie: cookieB },
    });
    expect(listB.statusCode).toBe(200);
    const bodyB = ProductionOrderListResponseSchema.parse(listB.json());
    expect(bodyB.items[0]?.id).toBe(breweryBrewSessionProductionOrderId(sessionBId));
    expect(bodyB.items[0]?.orderNumber).toBe("BATCH-ALPHA");
    expect(bodyB.items[0]?.workspaceId).toBe(workspaceB);
  });

  it("L2 detail isolation returns 404 for another workspace's projected IDs", async () => {
    const bom = await app.inject({
      method: "GET",
      url: `/mrp/boms/${breweryRecipeBomId(recipeAId)}`,
      headers: { cookie: cookieB },
    });
    expect(bom.statusCode).toBe(404);
    expect(bom.json().error.code).toBe("bom_not_found");

    const order = await app.inject({
      method: "GET",
      url: `/mrp/production-orders/${breweryBrewSessionProductionOrderId(sessionAId)}`,
      headers: { cookie: cookieB },
    });
    expect(order.statusCode).toBe(404);
    expect(order.json().error.code).toBe("production_order_not_found");
  });
});

function buildBeerJsonRecipe(name: string) {
  return {
    beerjson: {
      version: 1,
      recipes: [{
        name,
        type: "all grain",
        author: "umbraculum-test",
        batch_size: { unit: "l", value: 20 },
        ingredients: {
          fermentable_additions: [{
            id: "grain-1",
            name: "Pale malt",
            type: "grain",
            amount: { unit: "kg", value: 4.5 },
          }],
          hop_additions: [{
            id: "hop-1",
            name: "Cascade",
            amount: { unit: "g", value: 35 },
          }],
          culture_additions: [{
            id: "yeast-1",
            name: "US-05",
            amount: { unit: "pkg", value: 1 },
          }],
          miscellaneous_additions: [{
            id: "misc-1",
            name: "Whirlfloc",
            amount: { unit: "tablet", value: 1 },
          }],
        },
      }],
    },
  };
}
