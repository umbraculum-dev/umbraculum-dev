/**
 * @arch-boundary Cross-schema read of brewery brew sessions/recipes for MRP production-order
 * projections until a dedicated BreweryScheduleProjection port lands (Tier B epic).
 */
import type { BrewSessionStatus } from "@prisma/client";
import {
  BomSchema,
  MaterialRequirementSchema,
  OperationSchema,
  ProductionOrderGetResponseSchema,
  ProductionOrderSchema,
  type Bom,
  type MaterialRequirement,
  type Operation,
  type ProductionOrder,
  type ProductionOrderGetResponse,
  type ProductionOrderStatus,
} from "@umbraculum/mrp-contracts";

import {
  breweryBrewSessionProductionOrderId,
  breweryBrewSessionStepOperationId,
  breweryMaterialRequirementId,
  breweryRecipeBomId,
  parseBreweryBrewSessionProductionOrderId,
  parseBreweryRecipeBomId,
} from "../../../platform/breweryProjectionIds.js";
import {
  addMinutes,
  BrewdaySettingsStepSchema,
  extractBeerJsonIngredients,
  isPositiveInt,
  operationCode,
  recipeBatchSize,
  recipeCode,
  schedulingBase,
} from "../../../platform/breweryProjectionSchemas.js";
import type {
  BreweryScheduleProjection,
  ProjectedBrewSession,
  ProjectedRecipe,
} from "../../../platform/breweryScheduleProjection.js";

type RecipeRow = ProjectedRecipe;
type BrewSessionRow = ProjectedBrewSession;

type ProjectedStep = {
  id: string;
  sectionId: string;
  name: string;
  isDisabled: boolean;
  sortOrder: number;
  minutesPlanned: number | null;
};

export class MrpBreweryProjectionService {
  constructor(private readonly schedule: BreweryScheduleProjection) {}

  async listProjectedBoms(workspaceId: string): Promise<readonly Bom[]> {
    const recipes = await this.schedule.listRecipes(workspaceId);
    return recipes.map((recipe) => this.toBom(recipe));
  }

  async getProjectedBomById(workspaceId: string, bomId: string): Promise<Bom | null> {
    const recipeId = parseBreweryRecipeBomId(bomId);
    if (!recipeId) return null;
    const recipe = await this.schedule.getRecipe(workspaceId, recipeId);
    return recipe ? this.toBom(recipe) : null;
  }

  async listProjectedProductionOrders(
    workspaceId: string,
    status?: string,
  ): Promise<readonly ProductionOrder[]> {
    const sessions = await this.findBrewSessions(workspaceId);
    return sessions
      .map((session) => this.toProductionOrder(session))
      .filter((order) => !status || order.status === status)
      .sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
  }

  async getProjectedProductionOrderById(
    workspaceId: string,
    productionOrderId: string,
  ): Promise<ProductionOrderGetResponse["item"] | null> {
    const sessionId = parseBreweryBrewSessionProductionOrderId(productionOrderId);
    if (!sessionId) return null;
    const session = await this.findBrewSession(workspaceId, sessionId);
    if (!session) return null;

    const operations = await this.toOperations(session);
    const materialRequirements = this.toMaterialRequirements(session);
    return ProductionOrderGetResponseSchema.shape.item.parse({
      ...this.toProductionOrder(session),
      operations,
      materialRequirements,
    });
  }

  async listProjectedMaterialRequirements(
    workspaceId: string,
    productionOrderId?: string,
  ): Promise<readonly MaterialRequirement[]> {
    if (!productionOrderId) return [];
    const sessionId = parseBreweryBrewSessionProductionOrderId(productionOrderId);
    if (!sessionId) return [];
    const session = await this.findBrewSession(workspaceId, sessionId);
    return session ? this.toMaterialRequirements(session) : [];
  }

  private async findBrewSessions(workspaceId: string): Promise<readonly BrewSessionRow[]> {
    return this.schedule.listBrewSessionsWithSteps(workspaceId);
  }

  private async findBrewSession(
    workspaceId: string,
    sessionId: string,
  ): Promise<BrewSessionRow | null> {
    return this.schedule.getBrewSessionWithSteps(workspaceId, sessionId);
  }

  private toBom(recipe: RecipeRow): Bom {
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

  private toProductionOrder(session: BrewSessionRow): ProductionOrder {
    const orderId = breweryBrewSessionProductionOrderId(session.id);
    const batchSize = recipeBatchSize(session.recipe.beerJsonRecipeJson);
    const plannedStartAt = schedulingBase(session);
    const operationDurations = sourceSteps(session).map((step) => step.minutesPlanned);
    const dueAt = plannedStartAt && operationDurations.length > 0 && operationDurations.every(isPositiveInt)
      ? addMinutes(plannedStartAt, operationDurations.reduce((sum, minutes) => sum + (minutes ?? 0), 0))
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

  private async toOperations(session: BrewSessionRow): Promise<readonly Operation[]> {
    const steps = sourceSteps(session);
    const fallbackSteps = steps.length > 0 ? [] : await this.settingsFallbackSteps(session.workspaceId);
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

  private toMaterialRequirements(session: BrewSessionRow): readonly MaterialRequirement[] {
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

  private async settingsFallbackSteps(workspaceId: string): Promise<readonly ProjectedStep[]> {
    const settings = await this.schedule.getBrewdaySettings(workspaceId);
    if (!settings) return [];
    const defaultSteps = BrewdaySettingsStepSchema.array().safeParse(settings.defaultStepsJson);
    const customSteps = BrewdaySettingsStepSchema.array().safeParse(settings.customSectionsJson);
    return [...(defaultSteps.success ? defaultSteps.data : []), ...(customSteps.success ? customSteps.data : [])]
      .filter((step) => !step.exclude)
      .map((step, index) => ({
        id: `${workspaceId}-${step.id}`,
        sectionId: step.sectionId,
        name: step.name,
        isDisabled: false,
        sortOrder: index + 1,
        minutesPlanned: step.minutes ?? null,
      }));
  }
}

function mapBrewSessionStatus(status: BrewSessionStatus): ProductionOrderStatus {
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

function sourceSteps(session: BrewSessionRow): ProjectedStep[] {
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
