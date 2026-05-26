const VESSEL_RESOURCE_PREFIX = "automation-vessel-";
const EQUIPMENT_PROFILE_PREFIX = "brewery-equipment-profile-";
const SCHEDULED_OPERATION_PREFIX = "brewery-brew-session-step-";
const CONFLICT_PREFIX = "brewery-capacity-conflict-";

export function automationVesselResourceId(vesselId: string): string {
  return `${VESSEL_RESOURCE_PREFIX}${vesselId}`;
}

export function parseAutomationVesselResourceId(resourceId: string): string | null {
  return resourceId.startsWith(VESSEL_RESOURCE_PREFIX)
    ? resourceId.slice(VESSEL_RESOURCE_PREFIX.length)
    : null;
}

export function equipmentProfileWorkCenterId(equipmentProfileId: string): string {
  return `${EQUIPMENT_PROFILE_PREFIX}${equipmentProfileId}`;
}

export function equipmentProfileResourceId(equipmentProfileId: string): string {
  return `${EQUIPMENT_PROFILE_PREFIX}${equipmentProfileId}`;
}

export function breweryScheduledOperationId(stepId: string): string {
  return `${SCHEDULED_OPERATION_PREFIX}${stepId}`;
}

export function breweryCapacityConflictId(reason: string, sourceId: string): string {
  return `${CONFLICT_PREFIX}${reason}-${sourceId}`;
}
