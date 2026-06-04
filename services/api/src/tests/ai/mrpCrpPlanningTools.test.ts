import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../../app.js";
import {
  automationVesselResourceId,
  breweryBrewSessionProductionOrderId,
  breweryCapacityConflictId,
  breweryScheduledOperationId,
  equipmentProfileWorkCenterId,
} from "../../platform/breweryProjectionIds.js";
import {
  createMrpExplainMaterialRequirementsTool,
  createMrpGetProductionOrderTool,
  createMrpListProductionOrdersTool,
} from "../../services/ai/tools/mrp/index.js";
import {
  createCrpExplainCapacityLoadTool,
  createCrpListConflictsTool,
  createCrpListResourcesTool,
  createCrpListScheduledOperationsTool,
  createCrpListWorkCentersTool,
} from "../../services/ai/tools/crp/index.js";
import { createSessionForTestUser } from "../helpers/session.js";

describe("MRP/CRP AI planning tools — Wave 5 read-only advisor", () => {
  const app = buildApp();

  let userA = "";
  let workspaceA = "";
  let userB = "";
  let workspaceB = "";
  let recipeA = "";
  let sessionA = "";
  let equipmentProfileA = "";
  let vesselA = "";
  let timedStepA = "";
  let missingDurationStepA = "";

  beforeAll(async () => {
    await app.ready();
    const sessionForA = await createSessionForTestUser(app, { activeWorkspace: true });
    userA = sessionForA.userId;
    workspaceA = sessionForA.workspaceId;
    const sessionForB = await createSessionForTestUser(app, { activeWorkspace: true });
    userB = sessionForB.userId;
    workspaceB = sessionForB.workspaceId;

    const equipment = await app.prisma.equipmentProfile.create({
      data: {
        workspaceId: workspaceA,
        name: "Wave 5 AI Brewhouse",
        kettleVolumeLiters: 35,
        mashVolumeLiters: 30,
        mashEfficiencyPercent: 75,
      },
    });
    equipmentProfileA = equipment.id;

    const vessel = await app.prisma.vessel.create({
      data: {
        workspaceId: workspaceA,
        code: "W5-KETTLE-01",
        displayName: "Wave 5 AI Kettle",
        vesselKind: "kettle",
        equipmentProfileId: equipmentProfileA,
      },
    });
    vesselA = vessel.id;

    const recipe = await app.prisma.recipe.create({
      data: {
        workspaceId: workspaceA,
        name: "Wave 5 AI Pale Ale",
        styleKey: "custom",
        versionGroupId: randomUUID(),
        version: 1,
        beerJsonRecipeJson: buildBeerJsonRecipe("Wave 5 AI Pale Ale"),
        recipeExtJson: {
          equipmentSource: {
            equipmentProfileId: equipmentProfileA,
            copiedAt: "2026-08-05T00:00:00.000Z",
          },
        },
      },
    });
    recipeA = recipe.id;

    const brewSession = await app.prisma.brewSession.create({
      data: {
        workspaceId: workspaceA,
        recipeId: recipeA,
        code: "W5-AI-001",
        status: "draft",
        scheduledDate: new Date("2026-08-05T00:00:00.000Z"),
        steps: {
          create: [
            {
              sectionId: "mash",
              sectionName: "Mash",
              name: "Wave 5 AI Mash",
              sortOrder: 1,
              minutesPlanned: 60,
              customTimerEnabled: true,
            },
            {
              sectionId: "boil",
              sectionName: "Boil",
              name: "Wave 5 AI Boil Missing Duration",
              sortOrder: 2,
              minutesPlanned: null,
              customTimerEnabled: true,
            },
          ],
        },
      },
      include: { steps: true },
    });
    sessionA = brewSession.id;
    timedStepA = brewSession.steps.find((step) => step.name === "Wave 5 AI Mash")?.id ?? "";
    missingDurationStepA =
      brewSession.steps.find((step) => step.name === "Wave 5 AI Boil Missing Duration")?.id ?? "";
  });

  afterAll(async () => {
    await app.prisma.brewSessionStep.deleteMany({
      where: { brewSession: { workspaceId: { in: [workspaceA, workspaceB].filter(Boolean) } } },
    });
    await app.prisma.brewSession.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB].filter(Boolean) } },
    });
    await app.prisma.vessel.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB].filter(Boolean) } },
    });
    await app.prisma.equipmentProfile.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB].filter(Boolean) } },
    });
    await app.prisma.recipe.deleteMany({
      where: { id: { in: [recipeA].filter(Boolean) } },
    });
    await app.close();
  });

  it("returns deterministic MRP/CRP read-model evidence without materializing rows", async () => {
    const countsBefore = await readMaterializedPlanningCounts();
    const ctx = { userId: userA, workspaceId: workspaceA, requestId: "wave5-test" };

    const listOrders = await createMrpListProductionOrdersTool(app.prisma).handler({}, ctx);
    expect(listOrders.items.some((item) => item.id === breweryBrewSessionProductionOrderId(sessionA))).toBe(true);

    const order = await createMrpGetProductionOrderTool(app.prisma).handler(
      { productionOrderId: breweryBrewSessionProductionOrderId(sessionA) },
      ctx,
    );
    expect(order.item.sourceModule).toBe("brewery");
    expect(order.item.operations.some((operation) => operation.id.includes(timedStepA))).toBe(true);

    const materials = await createMrpExplainMaterialRequirementsTool(app.prisma).handler(
      { productionOrderId: breweryBrewSessionProductionOrderId(sessionA) },
      ctx,
    );
    expect(materials.items.map((item) => item.description)).toContain("Wave 5 Pale Malt");

    const resources = await createCrpListResourcesTool(app.prisma).handler({}, ctx);
    expect(resources.items.some((item) => item.id === automationVesselResourceId(vesselA))).toBe(true);

    const workCenters = await createCrpListWorkCentersTool(app.prisma).handler({}, ctx);
    expect(workCenters.items.some((item) => item.id === equipmentProfileWorkCenterId(equipmentProfileA))).toBe(true);

    const scheduled = await createCrpListScheduledOperationsTool(app.prisma).handler({}, ctx);
    expect(scheduled.items.some((item) => item.id === breweryScheduledOperationId(timedStepA))).toBe(true);

    const load = await createCrpExplainCapacityLoadTool(app.prisma).handler(
      { resourceId: automationVesselResourceId(vesselA) },
      ctx,
    );
    expect(load.item.buckets[0]?.plannedMinutes).toBe(60);
    expect(load.item.buckets[0]?.availableMinutes).toBe(0);

    const conflicts = await createCrpListConflictsTool(app.prisma).handler({}, ctx);
    expect(
      conflicts.items.some((item) =>
        item.id === breweryCapacityConflictId("missing-duration", missingDurationStepA)
      ),
    ).toBe(true);

    await expect(readMaterializedPlanningCounts()).resolves.toEqual(countsBefore);
  });

  it("inherits workspace isolation from MRP/CRP services", async () => {
    const ctxB = { userId: userB, workspaceId: workspaceB, requestId: "wave5-test-b" };
    await expect(
      createMrpGetProductionOrderTool(app.prisma).handler(
        { productionOrderId: breweryBrewSessionProductionOrderId(sessionA) },
        ctxB,
      ),
    ).rejects.toThrow(/No production order/);

    await expect(
      createCrpExplainCapacityLoadTool(app.prisma).handler(
        { resourceId: automationVesselResourceId(vesselA) },
        ctxB,
      ),
    ).resolves.toEqual({ ok: true, item: { workspaceId: workspaceB, buckets: [] } });
  });

  async function readMaterializedPlanningCounts() {
    const [
      mrpProductionOrders,
      mrpMaterialRequirements,
      crpResources,
      crpWorkCenters,
      crpScheduledOperations,
      crpCapacityConflicts,
    ] = await Promise.all([
      app.prisma.mrpProductionOrder.count({ where: { workspaceId: workspaceA } }),
      app.prisma.mrpMaterialRequirement.count({ where: { workspaceId: workspaceA } }),
      app.prisma.crpResource.count({ where: { workspaceId: workspaceA } }),
      app.prisma.crpWorkCenter.count({ where: { workspaceId: workspaceA } }),
      app.prisma.crpScheduledOperation.count({ where: { workspaceId: workspaceA } }),
      app.prisma.crpCapacityConflict.count({ where: { workspaceId: workspaceA } }),
    ]);
    return {
      mrpProductionOrders,
      mrpMaterialRequirements,
      crpResources,
      crpWorkCenters,
      crpScheduledOperations,
      crpCapacityConflicts,
    };
  }
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
            id: "wave5-grain-1",
            name: "Wave 5 Pale Malt",
            type: "grain",
            amount: { unit: "kg", value: 4.5 },
          }],
          hop_additions: [{
            id: "wave5-hop-1",
            name: "Wave 5 Cascade",
            amount: { unit: "g", value: 35 },
          }],
          culture_additions: [{
            id: "wave5-yeast-1",
            name: "Wave 5 US-05",
            amount: { unit: "pkg", value: 1 },
          }],
          miscellaneous_additions: [],
        },
      }],
    },
  };
}
