const BOM_PREFIX = "brewery-recipe-";
const PRODUCTION_ORDER_PREFIX = "brewery-brew-session-";
const OPERATION_PREFIX = "brewery-brew-session-step-";
const MATERIAL_REQUIREMENT_PREFIX = "brewery-material-requirement-";

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

export function breweryBrewSessionStepOperationId(stepId: string): string {
  return `${OPERATION_PREFIX}${stepId}`;
}

export function breweryMaterialRequirementId(sessionId: string, ingredientId: string): string {
  return `${MATERIAL_REQUIREMENT_PREFIX}${sessionId}-${ingredientId}`;
}
