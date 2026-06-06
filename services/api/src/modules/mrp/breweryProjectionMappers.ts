/**
 * @arch-boundary MRP brewery projection mappers — pure transforms from schedule rows to MRP contracts.
 */
import type { BrewSessionStatus } from "@prisma/client";
import {
  BomSchema,
  MaterialRequirementSchema,
  OperationSchema,
  ProductionOrderSchema,
  type Bom,
  type MaterialRequirement,
  type Operation,
  type ProductionOrder,
  type ProductionOrderStatus,
} from "@umbraculum/mrp-contracts";

import {
  breweryBrewSessionProductionOrderId,
  breweryBrewSessionStepOperationId,
  breweryMaterialRequirementId,
  breweryRecipeBomId,
} from "../../platform/breweryProjectionIds.js";
import {
  addMinutes,
  extractBeerJsonIngredients,
  isPositiveInt,
  operationCode,
  recipeBatchSize,
  recipeCode,
  schedulingBase,
} from "../../platform/breweryProjectionSchemas.js";
import type {
  ProjectedBrewSession,
  ProjectedRecipe,
} from "../../platform/breweryScheduleProjection.js";

export type ProjectedStep = {
  id: string;
  sectionId: string;
  name: string;
  isDisabled: boolean;
  sortOrder: number;
  minutesPlanned: number | null;
};

export function mapBrewSessionStatus(status: BrewSessionStatus): ProductionOrderStatus {
  switch (status) {
    case "draft":
      return "planned";
    case "running":
    case "paused":
      return "in_progress";
    case "stopped":
      return "completed";
    default:
      return "planned";
  }
}

export function sourceSteps(session: ProjectedBrewSession): ProjectedStep[] {
  return session.steps
    .filter((step) => !step.isDisabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((step) => ({
      id: step.id,
      sectionId: step.sectionId,
      name: step.name,
      isDisabled: step.isDisabled,
      sortOrder: step.sortOrder,
      minutesPlanned: step.minutesPlanned,
    }));
}

export function toBom(recipe: ProjectedRecipe): Bom {
  const bomId = breweryRecipeBomId(recipe.id);
  return BomSchema.parse({
    id: bomId,
    workspaceId: recipe.workspaceId,
    code: recipeCode(recipe),
    name: recipe.name,
    ownerModule: "brewery",
    sourceRefId: recipe.id,
    lines: extractBeerJsonIngredients(recipe.beerJsonRecipeJson).map((ingredient, index) => ({
      id: `${bomId}-line-${index + 1}`,
      bomId,
      lineNumber: index + 1,
      materialRefModule: ingredient.materialRefModule,
      materialRefId: ingredient.id,
      description: ingredient.description,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      lossPercent: null,
    })),
  });
}

export function toProductionOrder(session: ProjectedBrewSession): ProductionOrder {
  const orderId = breweryBrewSessionProductionOrderId(session.id);
  const batchSize = recipeBatchSize(session.recipe.beerJsonRecipeJson);
  const plannedStartAt = schedulingBase(session);
  const operationDurations = sourceSteps(session).map((step) => step.minutesPlanned);
  const dueAt = plannedStartAt && operationDurations.length > 0 && operationDurations.every(isPositiveInt)
    ? addMinutes(
        plannedStartAt,
        operationDurations.reduce<number>((sum, minutes) => sum + (minutes ?? 0), 0),
      )
    : null;

  return ProductionOrderSchema.parse({
    id: orderId,
    workspaceId: session.workspaceId,
    orderNumber: session.code,
    status: mapBrewSessionStatus(session.status),
    sourceModule: "brewery",
    sourceRefId: session.id,
    outputProductId: null,
    outputVariantId: null,
    quantity: batchSize?.quantity ?? 1,
    unit: batchSize?.unit ?? "batch",
    plannedStartAt: plannedStartAt?.toISOString() ?? null,
    dueAt: dueAt?.toISOString() ?? null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    lines: [{
      id: `${orderId}-line-1`,
      productionOrderId: orderId,
      lineNumber: 1,
      outputProductId: null,
      outputVariantId: null,
      description: session.recipe.name,
      quantity: batchSize?.quantity ?? 1,
      unit: batchSize?.unit ?? "batch",
    }],
  });
}

export function toOperations(
  session: ProjectedBrewSession,
  fallbackSteps: readonly ProjectedStep[],
): readonly Operation[] {
  const steps = sourceSteps(session);
  const orderId = breweryBrewSessionProductionOrderId(session.id);
  return [...steps, ...fallbackSteps].map((step, index) => {
    const operationId = breweryBrewSessionStepOperationId(step.id);
    return OperationSchema.parse({
      id: operationId,
      workspaceId: session.workspaceId,
      productionOrderId: orderId,
      sequence: index + 1,
      code: operationCode(step),
      name: step.name,
      requiredResourceKind: step.sectionId,
      plannedDurationMinutes: isPositiveInt(step.minutesPlanned) ? step.minutesPlanned : null,
      earliestStartAt: schedulingBase(session)?.toISOString() ?? null,
      dueAt: null,
    });
  });
}

export function toMaterialRequirements(session: ProjectedBrewSession): readonly MaterialRequirement[] {
  const orderId = breweryBrewSessionProductionOrderId(session.id);
  const bomId = breweryRecipeBomId(session.recipe.id);
  return extractBeerJsonIngredients(session.recipe.beerJsonRecipeJson).map((ingredient, index) =>
    MaterialRequirementSchema.parse({
      id: breweryMaterialRequirementId(session.id, ingredient.id),
      workspaceId: session.workspaceId,
      productionOrderId: orderId,
      bomLineId: `${bomId}-line-${index + 1}`,
      materialRefModule: ingredient.materialRefModule,
      materialRefId: ingredient.id,
      description: ingredient.description,
      requiredQuantity: ingredient.quantity,
      unit: ingredient.unit,
      availabilityStatus: "available_assumed",
      availabilityNote: "Read-time brewery projection; inventory availability is not reserved in Wave 2.",
    }),
  );
}
