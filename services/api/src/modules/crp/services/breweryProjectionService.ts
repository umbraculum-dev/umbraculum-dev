import type { BrewSessionStep, EquipmentProfile, Prisma, PrismaClient, Vessel } from "@prisma/client";
import { z } from "zod";
import {
  CapacityBucketSchema,
  CapacityConflictSchema,
  CapacityLoadSchema,
  ResourceSchema,
  ScheduledOperationSchema,
  WorkCenterSchema,
  type CapacityConflict,
  type CapacityLoad,
  type Resource,
  type ScheduledOperation,
  type WorkCenter,
} from "@umbraculum/crp-contracts";

import {
  automationVesselResourceId,
  breweryCapacityConflictId,
  breweryScheduledOperationId,
  equipmentProfileWorkCenterId,
  parseAutomationVesselResourceId,
} from "./breweryProjectionIds.js";
import { breweryBrewSessionProductionOrderId } from "../../mrp/services/breweryProjectionIds.js";

type BrewSessionWithRecipeSteps = Prisma.BrewSessionGetPayload<{
  include: { recipe: true; steps: true };
}>;

type ScheduledStep = {
  step: BrewSessionStep;
  session: BrewSessionWithRecipeSteps;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  resourceId: string | null;
  workCenterId: string | null;
};

const EquipmentSourceSchema = z.object({
  equipmentSource: z.object({
    equipmentProfileId: z.string().min(1).optional(),
  }).passthrough().optional(),
}).passthrough();

export class CrpBreweryProjectionService {
  constructor(private readonly prisma: PrismaClient) {}

  async listProjectedResources(workspaceId: string, kind?: string): Promise<readonly Resource[]> {
    if (kind && kind !== "equipment") return [];
    const vessels = await this.prisma.vessel.findMany({
      where: { workspaceId },
      orderBy: [{ code: "asc" }],
    });
    return vessels.map((vessel) => toVesselResource(vessel));
  }

  async getProjectedResourceById(workspaceId: string, resourceId: string): Promise<Resource | null> {
    const vesselId = parseAutomationVesselResourceId(resourceId);
    if (!vesselId) return null;
    const vessel = await this.prisma.vessel.findFirst({
      where: { id: vesselId, workspaceId },
    });
    return vessel ? toVesselResource(vessel) : null;
  }

  async listProjectedWorkCenters(workspaceId: string): Promise<readonly WorkCenter[]> {
    const [profiles, vessels] = await Promise.all([
      this.prisma.equipmentProfile.findMany({
        where: { workspaceId },
        orderBy: [{ name: "asc" }],
      }),
      this.prisma.vessel.findMany({
        where: { workspaceId },
        orderBy: [{ code: "asc" }],
      }),
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
      this.prisma.brewSession.findMany({
        where: { workspaceId },
        include: { recipe: true, steps: true },
        orderBy: [{ code: "asc" }],
      }),
      this.prisma.vessel.findMany({
        where: { workspaceId },
        orderBy: [{ code: "asc" }],
      }),
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

function toVesselResource(vessel: Vessel): Resource {
  return ResourceSchema.parse({
    id: automationVesselResourceId(vessel.id),
    workspaceId: vessel.workspaceId,
    code: vessel.code,
    name: vessel.displayName,
    kind: "equipment",
    status: "active",
    sourceModule: "automation",
    sourceRefId: vessel.id,
    createdAt: vessel.createdAt.toISOString(),
    updatedAt: vessel.updatedAt.toISOString(),
  });
}

function toEquipmentProfileWorkCenter(
  profile: EquipmentProfile,
  vessels: readonly Vessel[],
): WorkCenter {
  const matchingVessels = vessels.filter((vessel) => vessel.equipmentProfileId === profile.id);
  return WorkCenterSchema.parse({
    id: equipmentProfileWorkCenterId(profile.id),
    workspaceId: profile.workspaceId,
    code: equipmentProfileCode(profile),
    name: profile.name,
    resourceId: matchingVessels.length === 1 ? automationVesselResourceId(matchingVessels[0]?.id ?? "") : null,
    status: "active",
    sourceModule: "brewery",
    sourceRefId: profile.id,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  });
}

function toScheduledOperation(scheduled: ScheduledStep): ScheduledOperation {
  return ScheduledOperationSchema.parse({
    id: breweryScheduledOperationId(scheduled.step.id),
    workspaceId: scheduled.session.workspaceId,
    resourceId: scheduled.resourceId,
    workCenterId: scheduled.workCenterId,
    productionOrderId: breweryBrewSessionProductionOrderId(scheduled.session.id),
    operationId: breweryScheduledOperationId(scheduled.step.id),
    operationCode: operationCode(scheduled.step),
    name: scheduled.step.name,
    status: mapStepStatus(scheduled.step.status),
    sourceModule: "brewery",
    sourceRefId: scheduled.step.id,
    startsAt: scheduled.startsAt.toISOString(),
    endsAt: scheduled.endsAt.toISOString(),
    plannedDurationMinutes: scheduled.durationMinutes,
  });
}

function toConflict(args: {
  id: string;
  workspaceId: string;
  message: string;
  step: BrewSessionStep;
  scheduled: ScheduledStep | undefined;
}): CapacityConflict {
  return CapacityConflictSchema.parse({
    id: args.id,
    workspaceId: args.workspaceId,
    severity: "warning",
    status: "open",
    message: args.message,
    resourceId: args.scheduled?.resourceId ?? null,
    scheduledOperationId: args.scheduled ? breweryScheduledOperationId(args.step.id) : null,
    startsAt: args.scheduled?.startsAt.toISOString() ?? null,
    endsAt: args.scheduled?.endsAt.toISOString() ?? null,
    createdAt: args.step.updatedAt.toISOString(),
  });
}

function resolveVesselResource(
  session: BrewSessionWithRecipeSteps,
  vessels: readonly Vessel[],
): { vesselId: string | null; equipmentProfileId: string | null } {
  const equipmentProfileId = recipeEquipmentProfileId(session.recipe.recipeExtJson);
  if (!equipmentProfileId) return { vesselId: null, equipmentProfileId: null };
  const matches = vessels.filter((vessel) => vessel.equipmentProfileId === equipmentProfileId);
  return {
    vesselId: matches.length === 1 ? matches[0]?.id ?? null : null,
    equipmentProfileId,
  };
}

function recipeEquipmentProfileId(recipeExtJson: unknown): string | null {
  const parsed = EquipmentSourceSchema.safeParse(recipeExtJson);
  return parsed.success ? parsed.data.equipmentSource?.equipmentProfileId ?? null : null;
}

function schedulingBase(session: BrewSessionWithRecipeSteps): Date | null {
  return session.startedAt ?? session.scheduledDate ?? null;
}

function sourceSteps(session: BrewSessionWithRecipeSteps): BrewSessionStep[] {
  return session.steps
    .filter((step) => !step.isDisabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapStepStatus(status: BrewSessionStep["status"]): ScheduledOperation["status"] {
  switch (status) {
    case "done":
      return "completed";
    default:
      return "planned";
  }
}

function operationCode(step: BrewSessionStep): string {
  const stem = `${step.sectionId}-${step.sortOrder}-${step.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return stem || step.id;
}

function equipmentProfileCode(profile: EquipmentProfile): string {
  const stem = profile.name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return stem || profile.id;
}

function isPositiveInt(value: number | null): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function addMinutes(start: Date, minutes: number): Date {
  return new Date(start.getTime() + minutes * 60_000);
}
