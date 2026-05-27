import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitResponseSchema,
} from "@umbraculum/contracts";
import { CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF } from "@umbraculum/crp-contracts";
import { MRP_WORK_ORDER_PDF_TEMPLATE_REF } from "@umbraculum/mrp-contracts";

import { buildApp } from "../app.js";
import { breweryBrewSessionProductionOrderId } from "../modules/mrp/services/breweryProjectionIds.js";
import { createSessionForTestUser } from "./helpers/session.js";

async function waitForSucceeded(input: {
  readonly app: ReturnType<typeof buildApp>;
  readonly cookie: string;
  readonly jobId: string;
}) {
  const deadline = Date.now() + 15_000;
  let lastStatus = "";
  while (Date.now() < deadline) {
    const res = await input.app.inject({
      method: "GET",
      url: `/rendering/jobs/${input.jobId}`,
      headers: { cookie: input.cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = RenderJobStatusResponseSchema.parse(res.json());
    lastStatus = body.job.status;
    if (body.job.status === "succeeded") return body;
    if (body.job.status === "failed") {
      throw new Error(`render job failed: ${body.job.error?.code ?? "unknown"}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`render job did not succeed before timeout; last status=${lastStatus}`);
}

describe("MRP/CRP rendering — Wave 6 templates", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let sessionA = "";
  let recipeA = "";
  let equipmentProfileA = "";

  beforeAll(async () => {
    await app.ready();
    const sessionForA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessionForA.cookie;
    workspaceA = sessionForA.workspaceId;
    const sessionForB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessionForB.cookie;
    workspaceB = sessionForB.workspaceId;

    const equipment = await app.prisma.equipmentProfile.create({
      data: {
        workspaceId: workspaceA,
        name: "Wave 6 Render Brewhouse",
        kettleVolumeLiters: 35,
        mashVolumeLiters: 30,
        mashEfficiencyPercent: 75,
      },
    });
    equipmentProfileA = equipment.id;

    await app.prisma.vessel.create({
      data: {
        workspaceId: workspaceA,
        code: "W6-KETTLE-01",
        displayName: "Wave 6 Render Kettle",
        vesselKind: "kettle",
        equipmentProfileId: equipmentProfileA,
      },
    });

    const recipe = await app.prisma.recipe.create({
      data: {
        workspaceId: workspaceA,
        name: "Wave 6 Render Pale Ale",
        styleKey: "custom",
        versionGroupId: randomUUID(),
        version: 1,
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [{
              name: "Wave 6 Render Pale Ale",
              type: "all grain",
              author: "umbraculum-test",
              batch_size: { unit: "l", value: 20 },
              ingredients: {
                fermentable_additions: [{
                  id: "w6-grain-1",
                  name: "Wave 6 Pale Malt",
                  type: "grain",
                  amount: { unit: "kg", value: 4.5 },
                }],
                hop_additions: [],
                culture_additions: [],
                miscellaneous_additions: [],
              },
            }],
          },
        },
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
        code: "W6-RENDER-001",
        status: "draft",
        scheduledDate: new Date("2026-08-05T00:00:00.000Z"),
        steps: {
          create: [{
            sectionId: "mash",
            sectionName: "Mash",
            name: "Wave 6 Render Mash",
            sortOrder: 1,
            minutesPlanned: 60,
            customTimerEnabled: true,
          }],
        },
      },
    });
    sessionA = brewSession.id;
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
    await app.prisma.recipe.deleteMany({ where: { id: { in: [recipeA].filter(Boolean) } } });
    await app.close();
  });

  it("returns a work-order preview for a projected production order", async () => {
    const orderId = breweryBrewSessionProductionOrderId(sessionA);
    const res = await app.inject({
      method: "GET",
      url: `/mrp/work-orders/${orderId}/preview`,
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { item: { productionOrder: { orderNumber: string } } };
    expect(body.item.productionOrder.orderNumber).toBe("W6-RENDER-001");
  });

  it("submits MRP work-order PDF and CRP capacity-load XLSX render jobs", async () => {
    const orderId = breweryBrewSessionProductionOrderId(sessionA);
    const countsBefore = await readMaterializedPlanningCounts();

    const workOrderSubmit = await app.inject({
      method: "POST",
      url: `/mrp/work-orders/${orderId}/render-jobs`,
      headers: { cookie: cookieA, "content-type": "application/json" },
      payload: { templateRef: MRP_WORK_ORDER_PDF_TEMPLATE_REF },
    });
    expect(workOrderSubmit.statusCode).toBe(202);
    const workOrderJob = RenderJobSubmitResponseSchema.parse(workOrderSubmit.json());
    expect(workOrderJob.job.templateRef).toBe("mrp:work-order-pdf@v1");

    const capacitySubmit = await app.inject({
      method: "POST",
      url: "/crp/capacity-load/render-jobs",
      headers: { cookie: cookieA, "content-type": "application/json" },
      payload: {},
    });
    expect(capacitySubmit.statusCode).toBe(202);
    const capacityJob = RenderJobSubmitResponseSchema.parse(capacitySubmit.json());
    expect(capacityJob.job.templateRef).toBe(CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF);

    await waitForSucceeded({ app, cookie: cookieA, jobId: workOrderJob.job.id });
    await waitForSucceeded({ app, cookie: cookieA, jobId: capacityJob.job.id });

    const workOrderResult = await app.inject({
      method: "GET",
      url: `/rendering/jobs/${workOrderJob.job.id}/result`,
      headers: { cookie: cookieA },
    });
    expect(workOrderResult.statusCode).toBe(200);
    const workOrderResultBody = RenderJobResultResponseSchema.parse(workOrderResult.json());
    const workOrderDownload = await app.inject({
      method: "GET",
      url: workOrderResultBody.signedUrl,
    });
    expect(workOrderDownload.statusCode).toBe(200);
    expect(workOrderDownload.rawPayload.length).toBeGreaterThan(100);

    await expect(readMaterializedPlanningCounts()).resolves.toEqual(countsBefore);
  });

  it("denies cross-workspace render-job submission", async () => {
    const orderId = breweryBrewSessionProductionOrderId(sessionA);
    const res = await app.inject({
      method: "POST",
      url: `/mrp/work-orders/${orderId}/render-jobs`,
      headers: { cookie: cookieB, "content-type": "application/json" },
      payload: { templateRef: MRP_WORK_ORDER_PDF_TEMPLATE_REF },
    });
    expect(res.statusCode).toBe(404);
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
