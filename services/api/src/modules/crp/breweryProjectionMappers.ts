/**
 * @arch-boundary CRP brewery projection mappers — pure transforms from schedule rows to CRP contracts.
 */
import type { BrewSessionStep, EquipmentProfile, Vessel } from "@prisma/client";
import {
  CapacityConflictSchema,
  CapacityBucketSchema,
  CapacityLoadSchema,
  ResourceSchema,
  ScheduledOperationSchema,
  WorkCenterSchema,
  type CapacityConflict,
  type ScheduledOperation,
} from "@umbraculum/crp-contracts";

import {
  automationVesselResourceId,
  breweryBrewSessionProductionOrderId,
  breweryScheduledOperationId,
  equipmentProfileWorkCenterId,
} from "../../platform/breweryProjectionIds.js";
import { operationCode, recipeEquipmentProfileId } from "../../platform/breweryProjectionSchemas.js";
import type { ProjectedBrewSession } from "../../platform/breweryScheduleProjection.js";

export type ScheduledStep = {
  step: BrewSessionStep;
  session: ProjectedBrewSession;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  resourceId: string | null;
  workCenterId: string | null;
};

export function toVesselResource(vessel: Vessel) {
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

export function toEquipmentProfileWorkCenter(
  profile: EquipmentProfile,
  vessels: readonly Vessel[],
) {
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

export function toScheduledOperation(scheduled: ScheduledStep): ScheduledOperation {
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

export function toConflict(args: {
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

export function resolveVesselResource(
  session: ProjectedBrewSession,
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

export function sourceSteps(session: ProjectedBrewSession): BrewSessionStep[] {
  return session.steps
    .filter((step) => !step.isDisabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function mapStepStatus(status: BrewSessionStep["status"]): ScheduledOperation["status"] {
  switch (status) {
    case "done":
      return "completed";
    default:
      return "planned";
  }
}

export function equipmentProfileCode(profile: EquipmentProfile): string {
  const stem = profile.name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return stem || profile.id;
}

export { CapacityBucketSchema, CapacityLoadSchema };
