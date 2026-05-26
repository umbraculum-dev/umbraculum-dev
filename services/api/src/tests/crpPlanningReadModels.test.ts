import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CapacityConflictListResponseSchema,
  CapacityLoadResponseSchema,
  ScheduledOperationListResponseSchema,
  WorkCenterListResponseSchema,
} from "@umbraculum/crp-contracts";

import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("crp planning read models — Wave 1 read path", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";
  let resourceAId = "";
  let resourceBId = "";
  let workCenterAId = "";

  beforeAll(async () => {
    await app.ready();
    const sessionA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;
    const sessionB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;

    await app.prisma.crpCapacityConflict.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpScheduledOperation.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpWorkCenter.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpResourceCalendar.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpResource.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    const resourceA = await app.prisma.crpResource.create({
      data: {
        workspaceId: workspaceA,
        code: "FV-01",
        name: "Fermenter 1",
        kind: "equipment",
        status: "active",
      },
    });
    resourceAId = resourceA.id;
    const resourceB = await app.prisma.crpResource.create({
      data: {
        workspaceId: workspaceB,
        code: "FV-01",
        name: "Workspace B Fermenter",
        kind: "equipment",
        status: "active",
      },
    });
    resourceBId = resourceB.id;

    const workCenter = await app.prisma.crpWorkCenter.create({
      data: {
        workspaceId: workspaceA,
        code: "CELLAR",
        name: "Cellar",
        resourceId: resourceAId,
      },
    });
    workCenterAId = workCenter.id;
    const calendar = await app.prisma.crpResourceCalendar.create({
      data: {
        workspaceId: workspaceA,
        resourceId: resourceAId,
        code: "FV-01-CAL",
        name: "FV-01 Calendar",
        windows: {
          create: [{
            workspaceId: workspaceA,
            resourceId: resourceAId,
            startsAt: new Date("2026-08-01T08:00:00.000Z"),
            endsAt: new Date("2026-08-01T16:00:00.000Z"),
            capacityMinutes: 480,
          }],
        },
      },
    });
    void calendar;
    const operation = await app.prisma.crpScheduledOperation.create({
      data: {
        workspaceId: workspaceA,
        resourceId: resourceAId,
        workCenterId: workCenterAId,
        operationCode: "mash",
        name: "Mash",
        productionOrderId: "po-a",
        operationId: "op-a",
        sourceModule: "mrp",
        sourceRefId: "op-a",
        startsAt: new Date("2026-08-01T09:00:00.000Z"),
        endsAt: new Date("2026-08-01T10:30:00.000Z"),
        plannedDurationMinutes: 90,
      },
    });
    await app.prisma.crpCapacityConflict.create({
      data: {
        workspaceId: workspaceA,
        severity: "warning",
        status: "open",
        message: "Sample overload warning",
        resourceId: resourceAId,
        scheduledOperationId: operation.id,
        startsAt: new Date("2026-08-01T09:00:00.000Z"),
        endsAt: new Date("2026-08-01T10:30:00.000Z"),
      },
    });
  });

  afterAll(async () => {
    await app.prisma.crpCapacityConflict.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpScheduledOperation.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpWorkCenter.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpResourceCalendar.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.crpResource.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await app.inject({ method: "GET", url: "/crp/work-centers" });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("missing_session");
  });

  it("lists work centers, scheduled operations, conflicts, and load for the active workspace", async () => {
    const workCenters = await app.inject({
      method: "GET",
      url: "/crp/work-centers",
      headers: { cookie: cookieA },
    });
    expect(workCenters.statusCode).toBe(200);
    expect(WorkCenterListResponseSchema.parse(workCenters.json()).items[0]?.id)
      .toBe(workCenterAId);

    const scheduled = await app.inject({
      method: "GET",
      url: "/crp/scheduled-operations",
      headers: { cookie: cookieA },
    });
    expect(scheduled.statusCode).toBe(200);
    expect(ScheduledOperationListResponseSchema.parse(scheduled.json()).items[0]?.resourceId)
      .toBe(resourceAId);

    const conflicts = await app.inject({
      method: "GET",
      url: "/crp/conflicts",
      headers: { cookie: cookieA },
    });
    expect(conflicts.statusCode).toBe(200);
    expect(CapacityConflictListResponseSchema.parse(conflicts.json()).items[0]?.severity)
      .toBe("warning");

    const load = await app.inject({
      method: "GET",
      url: `/crp/capacity-load?resourceId=${resourceAId}`,
      headers: { cookie: cookieA },
    });
    expect(load.statusCode).toBe(200);
    const loadBody = CapacityLoadResponseSchema.parse(load.json());
    expect(loadBody.item.buckets[0]?.plannedMinutes).toBe(90);
    expect(loadBody.item.buckets[0]?.overloadMinutes).toBe(0);
  });

  it("L2 cross-workspace isolation: workspace B sees none of workspace A's planning rows", async () => {
    const workCenters = await app.inject({
      method: "GET",
      url: "/crp/work-centers",
      headers: { cookie: cookieB },
    });
    expect(workCenters.statusCode).toBe(200);
    expect(WorkCenterListResponseSchema.parse(workCenters.json()).items).toHaveLength(0);

    const load = await app.inject({
      method: "GET",
      url: `/crp/capacity-load?resourceId=${resourceBId}`,
      headers: { cookie: cookieB },
    });
    expect(load.statusCode).toBe(200);
    expect(CapacityLoadResponseSchema.parse(load.json()).item.buckets).toHaveLength(0);
  });

  it("returns 400 for invalid capacity-load filters", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/crp/capacity-load?resourceId=",
      headers: { cookie: cookieA },
    });
    expect(res.statusCode).toBe(400);
  });
});
