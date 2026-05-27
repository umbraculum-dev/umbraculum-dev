import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitResponseSchema,
} from "@umbraculum/contracts";
import {
  CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
  CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
  CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
  CRP_SCHEDULE_PDF_TEMPLATE_REF,
} from "@umbraculum/crp-contracts";
import {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
} from "@umbraculum/mrp-contracts";

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

async function submitPollDownload(input: {
  readonly app: ReturnType<typeof buildApp>;
  readonly cookie: string;
  readonly method?: "GET" | "POST";
  readonly url: string;
  readonly payload?: unknown;
  readonly expectedTemplateRef: string;
}) {
  const res = await input.app.inject({
    method: input.method ?? "POST",
    url: input.url,
    headers: { cookie: input.cookie, "content-type": "application/json" },
    payload: input.payload ?? {},
  });
  expect(res.statusCode).toBe(202);
  const submit = RenderJobSubmitResponseSchema.parse(res.json());
  expect(submit.job.templateRef).toBe(input.expectedTemplateRef);
  await waitForSucceeded({ app: input.app, cookie: input.cookie, jobId: submit.job.id });
  const resultRes = await input.app.inject({
    method: "GET",
    url: `/rendering/jobs/${submit.job.id}/result`,
    headers: { cookie: input.cookie },
  });
  expect(resultRes.statusCode).toBe(200);
  const resultBody = RenderJobResultResponseSchema.parse(resultRes.json());
  const download = await input.app.inject({
    method: "GET",
    url: resultBody.signedUrl,
  });
  expect(download.statusCode).toBe(200);
  expect(download.rawPayload.length).toBeGreaterThan(10);
  return submit.job.id;
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

  it("submits MRP work-order PDF and CRP capacity-load XLSX render jobs without materializing planning rows", async () => {
    const orderId = breweryBrewSessionProductionOrderId(sessionA);
    const countsBefore = await readMaterializedPlanningCounts();

    await submitPollDownload({
      app,
      cookie: cookieA,
      url: `/mrp/work-orders/${orderId}/render-jobs`,
      payload: { templateRef: MRP_WORK_ORDER_PDF_TEMPLATE_REF },
      expectedTemplateRef: MRP_WORK_ORDER_PDF_TEMPLATE_REF,
    });
    await submitPollDownload({
      app,
      cookie: cookieA,
      url: "/crp/capacity-load/render-jobs",
      expectedTemplateRef: CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
    });

    await expect(readMaterializedPlanningCounts()).resolves.toEqual(countsBefore);
  });

  it("submits MRP route-card PDF render job", async () => {
    const orderId = breweryBrewSessionProductionOrderId(sessionA);
    await submitPollDownload({
      app,
      cookie: cookieA,
      url: `/mrp/work-orders/${orderId}/render-jobs`,
      payload: { templateRef: MRP_ROUTE_CARD_PDF_TEMPLATE_REF },
      expectedTemplateRef: MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
    });
  });

  it("submits MRP material-requirements XLSX render job", async () => {
    const orderId = breweryBrewSessionProductionOrderId(sessionA);
    const countsBefore = await readMaterializedPlanningCounts();
    await submitPollDownload({
      app,
      cookie: cookieA,
      url: `/mrp/production-orders/${orderId}/material-requirements/render-jobs`,
      expectedTemplateRef: MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
    });
    await expect(readMaterializedPlanningCounts()).resolves.toEqual(countsBefore);
  });

  it("submits MRP production-order list CSV render job", async () => {
    await submitPollDownload({
      app,
      cookie: cookieA,
      url: "/mrp/production-orders/render-jobs",
      expectedTemplateRef: MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
    });
  });

  it("submits CRP schedule PDF render job", async () => {
    const countsBefore = await readMaterializedPlanningCounts();
    await submitPollDownload({
      app,
      cookie: cookieA,
      url: "/crp/schedule/render-jobs",
      expectedTemplateRef: CRP_SCHEDULE_PDF_TEMPLATE_REF,
    });
    await expect(readMaterializedPlanningCounts()).resolves.toEqual(countsBefore);
  });

  it("submits CRP resource-calendar CSV render job", async () => {
    await submitPollDownload({
      app,
      cookie: cookieA,
      url: "/crp/resources/calendar/render-jobs",
      expectedTemplateRef: CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
    });
  });

  it("submits CRP conflict-report PDF render job", async () => {
    await submitPollDownload({
      app,
      cookie: cookieA,
      url: "/crp/conflicts/render-jobs",
      expectedTemplateRef: CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
    });
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
