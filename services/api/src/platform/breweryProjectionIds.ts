/**
 * Shared projection identity helpers for MRP/CRP brewery read models.
 * Single source of truth for cross-module ID prefixes (SOLID audit A1).
 */

const BOM_PREFIX = "brewery-recipe-";
const PRODUCTION_ORDER_PREFIX = "brewery-brew-session-";
const BREW_SESSION_STEP_PREFIX = "brewery-brew-session-step-";
const MATERIAL_REQUIREMENT_PREFIX = "brewery-material-requirement-";

const VESSEL_RESOURCE_PREFIX = "automation-vessel-";
const EQUIPMENT_PROFILE_PREFIX = "brewery-equipment-profile-";
const CONFLICT_PREFIX = "brewery-capacity-conflict-";

export function breweryRecipeBomId(recipeId: string): string {
  return `${BOM_PREFIX}${recipeId}`;
}

export function parseBreweryRecipeBomId(bomId: string): string | null {
  return bomId.startsWith(BOM_PREFIX) ? bomId.slice(BOM_PREFIX.length) : null;
}

export function breweryBrewSessionProductionOrderId(sessionId: string): string {
  return `${PRODUCTION_ORDER_PREFIX}${sessionId}`;
}

export function parseBreweryBrewSessionProductionOrderId(orderId: string): string | null {
  return orderId.startsWith(PRODUCTION_ORDER_PREFIX)
    ? orderId.slice(PRODUCTION_ORDER_PREFIX.length)
    : null;
}

/** MRP operation id and CRP scheduled-operation id share this prefix. */
export function breweryBrewSessionStepOperationId(stepId: string): string {
  return `${BREW_SESSION_STEP_PREFIX}${stepId}`;
}

/** Alias for CRP scheduled-operation naming. */
export function breweryScheduledOperationId(stepId: string): string {
  return breweryBrewSessionStepOperationId(stepId);
}

export function breweryMaterialRequirementId(sessionId: string, ingredientId: string): string {
  return `${MATERIAL_REQUIREMENT_PREFIX}${sessionId}-${ingredientId}`;
}

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

export function breweryCapacityConflictId(reason: string, sourceId: string): string {
  return `${CONFLICT_PREFIX}${reason}-${sourceId}`;
}
