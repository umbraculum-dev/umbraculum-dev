import type {
  CrpAvailabilityWindow,
  CrpCapacityConflict,
  CrpScheduledOperation,
  CrpWorkCenter,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import {
  CapacityBucketSchema,
  CapacityConflictSchema,
  CapacityLoadSchema,
  ScheduledOperationSchema,
  WorkCenterSchema,
  type CapacityConflict,
  type CapacityLoad,
  type ScheduledOperation,
  type WorkCenter,
} from "@umbraculum/crp-contracts";

import { WorkspacesService } from "../../../services/workspacesService.js";
import { CrpBreweryProjectionService } from "./breweryProjectionService.js";

type ResourceWithLoadRows = Prisma.CrpResourceGetPayload<{
  include: { calendars: { include: { windows: true } }; scheduledOperations: true };
}>;

export class CrpPlanningService {
  private readonly workspaces: WorkspacesService;
  private readonly breweryProjections: CrpBreweryProjectionService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.breweryProjections = new CrpBreweryProjectionService(prisma);
  }

  async listWorkCenters(userId: string, workspaceId: string): Promise<readonly WorkCenter[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.crpWorkCenter.findMany({
      where: { workspaceId },
      orderBy: [{ code: "asc" }],
    });
    const persisted = rows.map((row) => toWorkCenter(row));
    const projected = await this.breweryProjections.listProjectedWorkCenters(workspaceId);
    return [...persisted, ...projected].sort((a, b) => a.code.localeCompare(b.code));
  }

  async getCapacityLoad(
    userId: string,
    workspaceId: string,
    resourceId?: string,
  ): Promise<CapacityLoad> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const resources = await this.prisma.crpResource.findMany({
      where: { workspaceId, ...(resourceId ? { id: resourceId } : {}) },
      include: { calendars: { include: { windows: true } }, scheduledOperations: true },
      orderBy: [{ code: "asc" }],
    });
    const persisted = CapacityLoadSchema.parse({
      workspaceId,
      buckets: resources.flatMap((resource) => toCapacityBuckets(resource)),
    });
    const projected = await this.breweryProjections.getProjectedCapacityLoad(workspaceId, resourceId);
    return CapacityLoadSchema.parse({
      workspaceId,
      buckets: [...persisted.buckets, ...projected.buckets],
    });
  }

  async listScheduledOperations(
    userId: string,
    workspaceId: string,
  ): Promise<readonly ScheduledOperation[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.crpScheduledOperation.findMany({
      where: { workspaceId },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    });
    const persisted = rows.map((row) => toScheduledOperation(row));
    const projected = await this.breweryProjections.listProjectedScheduledOperations(workspaceId);
    return [...persisted, ...projected].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  }

  async listConflicts(userId: string, workspaceId: string): Promise<readonly CapacityConflict[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.crpCapacityConflict.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    const persisted = rows.map((row) => toConflict(row));
    const projected = await this.breweryProjections.listProjectedConflicts(workspaceId);
    return [...persisted, ...projected].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }
}

function toWorkCenter(row: CrpWorkCenter): WorkCenter {
  return WorkCenterSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    code: row.code,
    name: row.name,
    resourceId: row.resourceId,
    status: row.status,
    sourceModule: row.sourceModule,
    sourceRefId: row.sourceRefId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function toCapacityBuckets(resource: ResourceWithLoadRows) {
  const windows = resource.calendars.flatMap((calendar) => calendar.windows);
  if (windows.length === 0) return [];
  const bucketStartAt = minDate(windows.map((window) => window.startsAt));
  const bucketEndAt = maxDate(windows.map((window) => window.endsAt));
  const availableMinutes = windows.reduce(
    (sum: number, window: CrpAvailabilityWindow) => sum + window.capacityMinutes,
    0,
  );
  const plannedMinutes = resource.scheduledOperations.reduce(
    (sum, operation) => sum + operation.plannedDurationMinutes,
    0,
  );
  return [
    CapacityBucketSchema.parse({
      resourceId: resource.id,
      resourceCode: resource.code,
      bucketStartAt: bucketStartAt.toISOString(),
      bucketEndAt: bucketEndAt.toISOString(),
      availableMinutes,
      plannedMinutes,
      overloadMinutes: Math.max(0, plannedMinutes - availableMinutes),
    }),
  ];
}

function toScheduledOperation(row: CrpScheduledOperation): ScheduledOperation {
  return ScheduledOperationSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    resourceId: row.resourceId,
    workCenterId: row.workCenterId,
    productionOrderId: row.productionOrderId,
    operationId: row.operationId,
    operationCode: row.operationCode,
    name: row.name,
    status: row.status,
    sourceModule: row.sourceModule,
    sourceRefId: row.sourceRefId,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    plannedDurationMinutes: row.plannedDurationMinutes,
  });
}

function toConflict(row: CrpCapacityConflict): CapacityConflict {
  return CapacityConflictSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    severity: row.severity,
    status: row.status,
    message: row.message,
    resourceId: row.resourceId,
    scheduledOperationId: row.scheduledOperationId,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  });
}

function minDate(values: readonly Date[]): Date {
  return values.reduce((min, value) => (value < min ? value : min), values[0] ?? new Date());
}

function maxDate(values: readonly Date[]): Date {
  return values.reduce((max, value) => (value > max ? value : max), values[0] ?? new Date());
}
