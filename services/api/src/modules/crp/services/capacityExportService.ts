import type { PrismaClient } from "@prisma/client";
import {
  CrpCapacityLoadXlsxInputSchema,
  CrpConflictReportPdfInputSchema,
  CrpResourceCalendarCsvInputSchema,
  CrpSchedulePdfInputSchema,
  type CrpCapacityLoadXlsxInput,
  type CrpConflictReportPdfInput,
  type CrpResourceCalendarCsvInput,
  type CrpSchedulePdfInput,
} from "@umbraculum/crp-contracts";

import { CrpPlanningService } from "./planningService.js";
import { CrpResourcesService } from "./resourcesService.js";

export class CapacityExportService {
  private readonly planning: CrpPlanningService;
  private readonly resources: CrpResourcesService;

  constructor(prisma: PrismaClient) {
    this.planning = new CrpPlanningService(prisma);
    this.resources = new CrpResourcesService(prisma);
  }

  async buildCapacityLoadXlsxInput(
    userId: string,
    workspaceId: string,
    resourceId?: string,
  ): Promise<CrpCapacityLoadXlsxInput> {
    const load = await this.planning.getCapacityLoad(userId, workspaceId, resourceId);
    return CrpCapacityLoadXlsxInputSchema.parse({
      workspaceId,
      loadBuckets: load.buckets,
    });
  }

  async buildSchedulePdfInput(
    userId: string,
    workspaceId: string,
    resourceId?: string,
  ): Promise<CrpSchedulePdfInput> {
    const [load, resourceList, scheduledOperations] = await Promise.all([
      this.planning.getCapacityLoad(userId, workspaceId, resourceId),
      this.resources.listResources(userId, workspaceId),
      this.planning.listScheduledOperations(userId, workspaceId),
    ]);
    const filteredOperations = resourceId
      ? scheduledOperations.filter((operation) => operation.resourceId === resourceId)
      : scheduledOperations;
    return CrpSchedulePdfInputSchema.parse({
      workspaceId,
      generatedAt: new Date().toISOString(),
      resources: resourceList,
      scheduledOperations: filteredOperations,
      loadBuckets: load.buckets,
    });
  }

  async buildResourceCalendarCsvInput(
    userId: string,
    workspaceId: string,
    resourceId?: string,
  ): Promise<CrpResourceCalendarCsvInput> {
    const [load, resourceList] = await Promise.all([
      this.planning.getCapacityLoad(userId, workspaceId, resourceId),
      this.resources.listResources(userId, workspaceId),
    ]);
    const filteredResources = resourceId
      ? resourceList.filter((resource) => resource.id === resourceId)
      : resourceList;
    return CrpResourceCalendarCsvInputSchema.parse({
      workspaceId,
      resources: filteredResources,
      loadBuckets: load.buckets,
    });
  }

  async buildConflictReportPdfInput(
    userId: string,
    workspaceId: string,
    resourceId?: string,
  ): Promise<CrpConflictReportPdfInput> {
    const [load, conflicts] = await Promise.all([
      this.planning.getCapacityLoad(userId, workspaceId, resourceId),
      this.planning.listConflicts(userId, workspaceId),
    ]);
    const filteredConflicts = resourceId
      ? conflicts.filter((conflict) => conflict.resourceId === resourceId)
      : conflicts;
    return CrpConflictReportPdfInputSchema.parse({
      workspaceId,
      generatedAt: new Date().toISOString(),
      conflicts: filteredConflicts,
      loadBuckets: load.buckets,
    });
  }
}
