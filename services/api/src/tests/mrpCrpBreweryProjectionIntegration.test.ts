import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  MaterialRequirementListResponseSchema,
  ProductionOrderListResponseSchema,
} from "@umbraculum/mrp-contracts";
import {
  CapacityConflictListResponseSchema,
  CapacityLoadResponseSchema,
  ScheduledOperationListResponseSchema,
} from "@umbraculum/crp-contracts";

import { buildApp } from "../app.js";
import {
  automationVesselResourceId,
  breweryCapacityConflictId,
  breweryScheduledOperationId,
} from "../modules/crp/services/breweryProjectionIds.js";
import {
  breweryBrewSessionProductionOrderId,
  breweryRecipeBomId,
} from "../modules/mrp/services/breweryProjectionIds.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("mrp/crp brewery projection integration — Wave 2 read path", () => {
  const app = buildApp();

  let cookie = "";
  let workspaceId = "";
  let recipeId = "";
  let sessionId = "";
  let stepId = "";
  let missingDurationStepId = "";
  let profileId = "";
  let vesselId = "";

  beforeAll(async () => {
    await app.ready();
    const session = await createSessionForTestUser(app, { activeWorkspace: true });
    cookie = session.cookie;
    workspaceId = session.workspaceId;

    profileId = (await app.prisma.equipmentProfile.create({
      data: {
        workspaceId,
        name: "Integrated Projection Profile",
      },
    })).id;
    vesselId = (await app.prisma.vessel.create({
      data: {
        workspaceId,
        code: "BK-01",
        displayName: "Brew Kettle 1",
        vesselKind: "kettle",
        equipmentProfileId: profileId,
      },
    })).id;
    recipeId = (await app.prisma.recipe.create({
      data: {
        workspaceId,
        name: "Integrated Projection Ale",
        styleKey: "custom",
        versionGroupId: randomUUID(),
        recipeExtJson: {
          equipmentSource: {
            equipmentProfileId: profileId,
            copiedAt: "2026-08-01T00:00:00.000Z",
          },
        },
        beerJsonRecipeJson: buildBeerJsonRecipe(),
      },
    })).id;
    const brewSession = await app.prisma.brewSession.create({
      data: {
        workspaceId,
        recipeId,
        code: "INT-ALPHA",
        status: "draft",
        scheduledDate: new Date("2026-08-05T00:00:00.000Z"),
        steps: {
          create: [
            {
              sectionId: "boil",
              name: "Boil",
              sortOrder: 1,
              minutesPlanned: 75,
            },
            {
              sectionId: "cooling",
              name: "Cooling Missing Duration",
              sortOrder: 2,
              minutesPlanned: null,
            },
          ],
        },
      },
      include: { steps: true },
    });
    sessionId = brewSession.id;
    stepId = brewSession.steps.find((step) => step.name === "Boil")?.id ?? "";
    missingDurationStepId = brewSession.steps.find((step) => step.name === "Cooling Missing Duration")?.id ?? "";
  });

  afterAll(async () => {
    await app.prisma.brewSessionStep.deleteMany({ where: { brewSessionId: sessionId } });
    await app.prisma.brewSession.deleteMany({ where: { id: sessionId } });
    await app.prisma.vessel.deleteMany({ where: { id: vesselId } });
    await app.prisma.equipmentProfile.deleteMany({ where: { id: profileId } });
    await app.prisma.recipe.deleteMany({ where: { id: recipeId } });
    await app.close();
  });

  it("reads one brewery seed through MRP and CRP projections without materializing MRP/CRP rows", async () => {
    const beforeRecipe = await app.prisma.recipe.findUniqueOrThrow({ where: { id: recipeId } });
    const beforeSession = await app.prisma.brewSession.findUniqueOrThrow({ where: { id: sessionId } });
    const beforeStep = await app.prisma.brewSessionStep.findUniqueOrThrow({ where: { id: stepId } });
    const beforeVessel = await app.prisma.vessel.findUniqueOrThrow({ where: { id: vesselId } });

    const boms = await app.inject({ method: "GET", url: "/mrp/boms", headers: { cookie } });
    expect(boms.statusCode).toBe(200);
    expect(boms.json().items.some((item: { id: string }) => item.id === breweryRecipeBomId(recipeId))).toBe(true);

    const orders = await app.inject({ method: "GET", url: "/mrp/production-orders", headers: { cookie } });
    expect(orders.statusCode).toBe(200);
    const ordersBody = ProductionOrderListResponseSchema.parse(orders.json());
    expect(ordersBody.items.some((item) => item.id === breweryBrewSessionProductionOrderId(sessionId))).toBe(true);

    const requirements = await app.inject({
      method: "GET",
      url: `/mrp/production-orders/${breweryBrewSessionProductionOrderId(sessionId)}/material-requirements`,
      headers: { cookie },
    });
    expect(requirements.statusCode).toBe(200);
    expect(MaterialRequirementListResponseSchema.parse(requirements.json()).items[0]?.description).toBe("Pale malt");

    const scheduled = await app.inject({
      method: "GET",
      url: "/crp/scheduled-operations",
      headers: { cookie },
    });
    expect(scheduled.statusCode).toBe(200);
    const scheduledBody = ScheduledOperationListResponseSchema.parse(scheduled.json());
    const scheduledOperation = scheduledBody.items.find((item) => item.id === breweryScheduledOperationId(stepId));
    expect(scheduledOperation?.resourceId).toBe(automationVesselResourceId(vesselId));
    expect(scheduledOperation?.productionOrderId).toBe(breweryBrewSessionProductionOrderId(sessionId));
    expect(scheduledOperation?.sourceRefId).toBe(stepId);

    const load = await app.inject({
      method: "GET",
      url: `/crp/capacity-load?resourceId=${automationVesselResourceId(vesselId)}`,
      headers: { cookie },
    });
    expect(load.statusCode).toBe(200);
    expect(CapacityLoadResponseSchema.parse(load.json()).item.buckets[0]?.plannedMinutes).toBe(75);

    const conflicts = await app.inject({
      method: "GET",
      url: "/crp/conflicts",
      headers: { cookie },
    });
    expect(conflicts.statusCode).toBe(200);
    const conflictsBody = CapacityConflictListResponseSchema.parse(conflicts.json());
    expect(
      conflictsBody.items.some((item) =>
        item.id === breweryCapacityConflictId("missing-duration", missingDurationStepId)
      ),
    ).toBe(true);

    expect(await app.prisma.mrpBom.count({ where: { workspaceId } })).toBe(0);
    expect(await app.prisma.mrpProductionOrder.count({ where: { workspaceId } })).toBe(0);
    expect(await app.prisma.crpResource.count({ where: { workspaceId } })).toBe(0);
    expect(await app.prisma.crpScheduledOperation.count({ where: { workspaceId } })).toBe(0);

    const afterRecipe = await app.prisma.recipe.findUniqueOrThrow({ where: { id: recipeId } });
    const afterSession = await app.prisma.brewSession.findUniqueOrThrow({ where: { id: sessionId } });
    const afterStep = await app.prisma.brewSessionStep.findUniqueOrThrow({ where: { id: stepId } });
    const afterVessel = await app.prisma.vessel.findUniqueOrThrow({ where: { id: vesselId } });
    expect(afterRecipe.updatedAt.getTime()).toBe(beforeRecipe.updatedAt.getTime());
    expect(afterSession.updatedAt.getTime()).toBe(beforeSession.updatedAt.getTime());
    expect(afterStep.updatedAt.getTime()).toBe(beforeStep.updatedAt.getTime());
    expect(afterVessel.updatedAt.getTime()).toBe(beforeVessel.updatedAt.getTime());
  });
});

function buildBeerJsonRecipe() {
  return {
    beerjson: {
      version: 1,
      recipes: [{
        name: "Integrated Projection Ale",
        batch_size: { unit: "l", value: 25 },
        ingredients: {
          fermentable_additions: [{
            id: "grain-1",
            name: "Pale malt",
            amount: { unit: "kg", value: 5 },
          }],
          hop_additions: [],
          culture_additions: [],
          miscellaneous_additions: [],
        },
      }],
    },
  };
}
