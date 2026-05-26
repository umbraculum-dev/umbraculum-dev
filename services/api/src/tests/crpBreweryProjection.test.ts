import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CapacityConflictListResponseSchema,
  CapacityLoadResponseSchema,
  ResourceGetResponseSchema,
  ResourceListResponseSchema,
  ScheduledOperationListResponseSchema,
  WorkCenterListResponseSchema,
} from "@umbraculum/crp-contracts";

import { buildApp } from "../app.js";
import {
  automationVesselResourceId,
  breweryCapacityConflictId,
  breweryScheduledOperationId,
  equipmentProfileWorkCenterId,
} from "../modules/crp/services/breweryProjectionIds.js";
import { breweryBrewSessionProductionOrderId } from "../modules/mrp/services/breweryProjectionIds.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("crp brewery projections — Wave 2 read path", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let recipeAId = "";
  let sessionAId = "";
  let timedStepAId = "";
  let missingDurationStepAId = "";
  let profileAId = "";
  let vesselAId = "";
  let recipeBId = "";
  let sessionBId = "";
  let profileBId = "";
  let vesselBId = "";

  beforeAll(async () => {
    await app.ready();
    const sessionA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;
    const sessionB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;

    profileAId = (await app.prisma.equipmentProfile.create({
      data: {
        workspaceId: workspaceA,
        name: "Projection Cellar Profile",
        mashVolumeLiters: 30,
      },
    })).id;
    vesselAId = (await app.prisma.vessel.create({
      data: {
        workspaceId: workspaceA,
        code: "FV-01",
        displayName: "Fermenter 1",
        vesselKind: "fermenter",
        equipmentProfileId: profileAId,
      },
    })).id;
    const recipeA = await app.prisma.recipe.create({
      data: {
        workspaceId: workspaceA,
        name: "CRP Projection Ale",
        styleKey: "custom",
        versionGroupId: randomUUID(),
        recipeExtJson: {
          equipmentSource: {
            equipmentProfileId: profileAId,
            copiedAt: "2026-08-01T00:00:00.000Z",
          },
        },
        beerJsonRecipeJson: buildBeerJsonRecipe("CRP Projection Ale"),
      },
    });
    recipeAId = recipeA.id;
    const brewSessionA = await app.prisma.brewSession.create({
      data: {
        workspaceId: workspaceA,
        recipeId: recipeAId,
        code: "CRP-ALPHA",
        status: "draft",
        scheduledDate: new Date("2026-08-03T00:00:00.000Z"),
        steps: {
          create: [
            {
              sectionId: "mash",
              name: "Mash",
              sortOrder: 1,
              minutesPlanned: 60,
            },
            {
              sectionId: "boil",
              name: "Boil",
              sortOrder: 2,
              minutesPlanned: null,
            },
          ],
        },
      },
      include: { steps: true },
    });
    sessionAId = brewSessionA.id;
    timedStepAId = brewSessionA.steps.find((step) => step.name === "Mash")?.id ?? "";
    missingDurationStepAId = brewSessionA.steps.find((step) => step.name === "Boil")?.id ?? "";

    profileBId = (await app.prisma.equipmentProfile.create({
      data: {
        workspaceId: workspaceB,
        name: "Projection Cellar Profile",
      },
    })).id;
    vesselBId = (await app.prisma.vessel.create({
      data: {
        workspaceId: workspaceB,
        code: "FV-01",
        displayName: "Workspace B Fermenter",
        vesselKind: "fermenter",
        equipmentProfileId: profileBId,
      },
    })).id;
    const recipeB = await app.prisma.recipe.create({
      data: {
        workspaceId: workspaceB,
        name: "CRP Projection Ale",
        styleKey: "custom",
        versionGroupId: randomUUID(),
        recipeExtJson: {
          equipmentSource: {
            equipmentProfileId: profileBId,
            copiedAt: "2026-08-01T00:00:00.000Z",
          },
        },
        beerJsonRecipeJson: buildBeerJsonRecipe("CRP Projection Ale"),
      },
    });
    recipeBId = recipeB.id;
    sessionBId = (await app.prisma.brewSession.create({
      data: {
        workspaceId: workspaceB,
        recipeId: recipeBId,
        code: "CRP-ALPHA",
        status: "draft",
        scheduledDate: new Date("2026-08-04T00:00:00.000Z"),
      },
    })).id;
  });

  afterAll(async () => {
    await app.prisma.brewSessionStep.deleteMany({
      where: { brewSession: { workspaceId: { in: [workspaceA, workspaceB] } } },
    });
    await app.prisma.brewSession.deleteMany({
      where: { id: { in: [sessionAId, sessionBId].filter(Boolean) } },
    });
    await app.prisma.vessel.deleteMany({
      where: { id: { in: [vesselAId, vesselBId].filter(Boolean) } },
    });
    await app.prisma.equipmentProfile.deleteMany({
      where: { id: { in: [profileAId, profileBId].filter(Boolean) } },
    });
    await app.prisma.recipe.deleteMany({
      where: { id: { in: [recipeAId, recipeBId].filter(Boolean) } },
    });
    await app.close();
  });

  it("projects automation vessels as CRP equipment resources", async () => {
    const res = await app.inject({ method: "GET", url: "/crp/resources", headers: { cookie: cookieA } });
    expect(res.statusCode).toBe(200);
    const body = ResourceListResponseSchema.parse(res.json());
    const resource = body.items.find((item) => item.id === automationVesselResourceId(vesselAId));
    expect(resource?.code).toBe("FV-01");
    expect(resource?.sourceModule).toBe("automation");

    const detail = await app.inject({
      method: "GET",
      url: `/crp/resources/${automationVesselResourceId(vesselAId)}`,
      headers: { cookie: cookieA },
    });
    expect(detail.statusCode).toBe(200);
    expect(ResourceGetResponseSchema.parse(detail.json()).item.sourceRefId).toBe(vesselAId);
  });

  it("projects equipment profiles as CRP work-center metadata", async () => {
    const res = await app.inject({ method: "GET", url: "/crp/work-centers", headers: { cookie: cookieA } });
    expect(res.statusCode).toBe(200);
    const body = WorkCenterListResponseSchema.parse(res.json());
    const workCenter = body.items.find((item) => item.id === equipmentProfileWorkCenterId(profileAId));
    expect(workCenter?.sourceModule).toBe("brewery");
    expect(workCenter?.resourceId).toBe(automationVesselResourceId(vesselAId));
  });

  it("projects timed brew-session steps as scheduled operations and load", async () => {
    const scheduled = await app.inject({
      method: "GET",
      url: "/crp/scheduled-operations",
      headers: { cookie: cookieA },
    });
    expect(scheduled.statusCode).toBe(200);
    const scheduledBody = ScheduledOperationListResponseSchema.parse(scheduled.json());
    const scheduledOperation = scheduledBody.items.find((item) => item.id === breweryScheduledOperationId(timedStepAId));
    expect(scheduledOperation?.resourceId).toBe(automationVesselResourceId(vesselAId));
    expect(scheduledOperation?.workCenterId).toBe(equipmentProfileWorkCenterId(profileAId));
    expect(scheduledOperation?.productionOrderId).toBe(breweryBrewSessionProductionOrderId(sessionAId));
    expect(scheduledOperation?.plannedDurationMinutes).toBe(60);
    expect(scheduledOperation?.sourceModule).toBe("brewery");
    expect(scheduledOperation?.sourceRefId).toBe(timedStepAId);

    const load = await app.inject({
      method: "GET",
      url: `/crp/capacity-load?resourceId=${automationVesselResourceId(vesselAId)}`,
      headers: { cookie: cookieA },
    });
    expect(load.statusCode).toBe(200);
    const loadBody = CapacityLoadResponseSchema.parse(load.json());
    expect(loadBody.item.buckets[0]?.plannedMinutes).toBe(60);
    expect(loadBody.item.buckets[0]?.availableMinutes).toBe(0);
    expect(loadBody.item.buckets[0]?.overloadMinutes).toBe(60);
  });

  it("reports conservative read-only conflicts for missing projection inputs", async () => {
    const res = await app.inject({ method: "GET", url: "/crp/conflicts", headers: { cookie: cookieA } });
    expect(res.statusCode).toBe(200);
    const body = CapacityConflictListResponseSchema.parse(res.json());
    const conflict = body.items.find((item) =>
      item.id === breweryCapacityConflictId("missing-duration", missingDurationStepAId)
    );
    expect(conflict?.message).toContain("no positive planned duration");
    expect(conflict?.resourceId).toBeNull();
    expect(conflict?.scheduledOperationId).toBeNull();
  });

  it("L2 cross-workspace isolation keeps projected IDs scoped to the active workspace", async () => {
    const detail = await app.inject({
      method: "GET",
      url: `/crp/resources/${automationVesselResourceId(vesselAId)}`,
      headers: { cookie: cookieB },
    });
    expect(detail.statusCode).toBe(404);
    expect(detail.json().error.code).toBe("resource_not_found");

    const listB = await app.inject({ method: "GET", url: "/crp/resources", headers: { cookie: cookieB } });
    expect(listB.statusCode).toBe(200);
    const bodyB = ResourceListResponseSchema.parse(listB.json());
    expect(bodyB.items[0]?.id).toBe(automationVesselResourceId(vesselBId));
    expect(bodyB.items[0]?.workspaceId).toBe(workspaceB);
  });
});

function buildBeerJsonRecipe(name: string) {
  return {
    beerjson: {
      version: 1,
      recipes: [{
        name,
        batch_size: { unit: "l", value: 20 },
        ingredients: {
          fermentable_additions: [],
          hop_additions: [],
          culture_additions: [],
          miscellaneous_additions: [],
        },
      }],
    },
  };
}
