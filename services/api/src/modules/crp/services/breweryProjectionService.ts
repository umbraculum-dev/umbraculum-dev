/**
 * @arch-boundary Cross-schema read of brewery brew sessions, equipment, and automation vessels
 * for CRP capacity projections until a dedicated BreweryScheduleProjection port lands (Tier B epic).
 */
import type { Vessel } from "@prisma/client";
import {
  CapacityBucketSchema,
  type CapacityConflict,
  type CapacityLoad,
  type Resource,
  type ScheduledOperation,
  type WorkCenter,
} from "@umbraculum/crp-contracts";

import {
  automationVesselResourceId,
  breweryCapacityConflictId,
  equipmentProfileWorkCenterId,
  parseAutomationVesselResourceId,
} from "../../../platform/breweryProjectionIds.js";
import {
  addMinutes,
  isPositiveInt,
  schedulingBase,
} from "../../../platform/breweryProjectionSchemas.js";
import type {
  BreweryScheduleProjection,
  ProjectedBrewSession,
} from "../../../platform/breweryScheduleProjection.js";
import {
  CapacityLoadSchema,
  resolveVesselResource,
  sourceSteps,
  toConflict,
  toEquipmentProfileWorkCenter,
  toScheduledOperation,
  toVesselResource,
  type ScheduledStep,
} from "../breweryProjectionMappers.js";

type BrewSessionWithRecipeSteps = ProjectedBrewSession;

export class CrpBreweryProjectionService {
  constructor(private readonly schedule: BreweryScheduleProjection) {}

  async listProjectedResources(workspaceId: string, kind?: string): Promise<readonly Resource[]> {
    if (kind && kind !== "equipment") return [];
    const vessels = await this.schedule.listVessels(workspaceId);
    return vessels.map((vessel) => toVesselResource(vessel));
  }

  async getProjectedResourceById(workspaceId: string, resourceId: string): Promise<Resource | null> {
    const vesselId = parseAutomationVesselResourceId(resourceId);
    if (!vesselId) return null;
    const vessel = await this.schedule.getVessel(workspaceId, vesselId);
    return vessel ? toVesselResource(vessel) : null;
  }

  async listProjectedWorkCenters(workspaceId: string): Promise<readonly WorkCenter[]> {
    const [profiles, vessels] = await Promise.all([
      this.schedule.listEquipmentProfiles(workspaceId),
      this.schedule.listVessels(workspaceId),
    ]);
    return profiles.map((profile) => toEquipmentProfileWorkCenter(profile, vessels));
  }

  async listProjectedScheduledOperations(
    workspaceId: string,
  ): Promise<readonly ScheduledOperation[]> {
    const [sessions, vessels] = await this.loadSchedulingSources(workspaceId);
    return sessions
      .flatMap((session) => this.resolveScheduledSteps(session, vessels))
      .map((scheduled) => toScheduledOperation(scheduled))
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  }

  async getProjectedCapacityLoad(workspaceId: string, resourceId?: string): Promise<CapacityLoad> {
    const operations = await this.listProjectedScheduledOperations(workspaceId);
    const filtered = operations.filter((operation) =>
      operation.resourceId && (!resourceId || operation.resourceId === resourceId),
    );
    const buckets = new Map<string, { resourceId: string; resourceCode: string; startsAt: Date; endsAt: Date; plannedMinutes: number }>();
    const resources = await this.listProjectedResources(workspaceId);
    const resourceCodes = new Map(resources.map((resource) => [resource.id, resource.code]));

    for (const operation of filtered) {
      if (!operation.resourceId) continue;
      const resourceCode = resourceCodes.get(operation.resourceId);
      if (!resourceCode) continue;
      const startsAt = new Date(operation.startsAt);
      const endsAt = new Date(operation.endsAt);
      const existing = buckets.get(operation.resourceId);
      if (!existing) {
        buckets.set(operation.resourceId, {
          resourceId: operation.resourceId,
          resourceCode,
          startsAt,
          endsAt,
          plannedMinutes: operation.plannedDurationMinutes,
        });
        continue;
      }
      existing.startsAt = startsAt < existing.startsAt ? startsAt : existing.startsAt;
      existing.endsAt = endsAt > existing.endsAt ? endsAt : existing.endsAt;
      existing.plannedMinutes += operation.plannedDurationMinutes;
    }

    return CapacityLoadSchema.parse({
      workspaceId,
      buckets: [...buckets.values()].map((bucket) =>
        CapacityBucketSchema.parse({
          resourceId: bucket.resourceId,
          resourceCode: bucket.resourceCode,
          bucketStartAt: bucket.startsAt.toISOString(),
          bucketEndAt: bucket.endsAt.toISOString(),
          availableMinutes: 0,
          plannedMinutes: bucket.plannedMinutes,
          overloadMinutes: bucket.plannedMinutes,
        }),
      ),
    });
  }

  async listProjectedConflicts(workspaceId: string): Promise<readonly CapacityConflict[]> {
    const [sessions, vessels] = await this.loadSchedulingSources(workspaceId);
    const conflicts: CapacityConflict[] = [];
    for (const session of sessions) {
      const baseStart = schedulingBase(session);
      const resolved = new Map<string, ScheduledStep>(
        this.resolveScheduledSteps(session, vessels).map((scheduled) => [scheduled.step.id, scheduled]),
      );
      for (const step of sourceSteps(session)) {
        const duration = step.minutesPlanned;
        const scheduled = resolved.get(step.id);
        if (!baseStart) {
          conflicts.push(toConflict({
            id: breweryCapacityConflictId("missing-start", step.id),
            workspaceId,
            message: `Brewery step "${step.name}" has no startedAt or scheduledDate for CRP scheduling.`,
            step,
            scheduled,
          }));
        } else if (!isPositiveInt(duration)) {
          conflicts.push(toConflict({
            id: breweryCapacityConflictId("missing-duration", step.id),
            workspaceId,
            message: `Brewery step "${step.name}" has no positive planned duration for CRP scheduling.`,
            step,
            scheduled,
          }));
        } else if (!scheduled?.resourceId) {
          conflicts.push(toConflict({
            id: breweryCapacityConflictId("missing-resource", step.id),
            workspaceId,
            message: `Brewery step "${step.name}" is timed but has no unambiguous vessel/resource assignment.`,
            step,
            scheduled,
          }));
        }
      }
    }
    return conflicts;
  }

  private async loadSchedulingSources(
    workspaceId: string,
  ): Promise<[readonly BrewSessionWithRecipeSteps[], readonly Vessel[]]> {
    return Promise.all([
      this.schedule.listBrewSessionsWithSteps(workspaceId),
      this.schedule.listVessels(workspaceId),
    ]);
  }

  private resolveScheduledSteps(
    session: BrewSessionWithRecipeSteps,
    vessels: readonly Vessel[],
  ): readonly ScheduledStep[] {
    const baseStart = schedulingBase(session);
    if (!baseStart) return [];

    const resource = resolveVesselResource(session, vessels);
    const workCenterId = resource.equipmentProfileId
      ? equipmentProfileWorkCenterId(resource.equipmentProfileId)
      : null;
    const resolved = new Map<string, ScheduledStep>();
    let cursor = baseStart;

    for (const step of sourceSteps(session)) {
      if (!isPositiveInt(step.minutesPlanned)) continue;
      const relativeBase = step.relativeToStepId ? resolved.get(step.relativeToStepId) : null;
      const startsAt = relativeBase
        ? addMinutes(relativeBase.endsAt, step.offsetMinutesFromEnd ?? 0)
        : cursor;
      const endsAt = addMinutes(startsAt, step.minutesPlanned);
      const scheduled: ScheduledStep = {
        step,
        session,
        startsAt,
        endsAt,
        durationMinutes: step.minutesPlanned,
        resourceId: resource.vesselId ? automationVesselResourceId(resource.vesselId) : null,
        workCenterId,
      };
      resolved.set(step.id, scheduled);
      if (!step.relativeToStepId) cursor = endsAt;
    }

    return [...resolved.values()];
  }
}
