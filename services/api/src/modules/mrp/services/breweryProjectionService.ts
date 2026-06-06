/**
 * @arch-boundary Cross-schema read of brewery brew sessions/recipes for MRP production-order
 * projections until a dedicated BreweryScheduleProjection port lands (Tier B epic).
 */
import {
  ProductionOrderGetResponseSchema,
  type ProductionOrder,
  type ProductionOrderGetResponse,
  type MaterialRequirement,
  type Bom,
} from "@umbraculum/mrp-contracts";

import {
  parseBreweryBrewSessionProductionOrderId,
  parseBreweryRecipeBomId,
} from "../../../platform/breweryProjectionIds.js";
import { BrewdaySettingsStepSchema } from "../../../platform/breweryProjectionSchemas.js";
import type {
  BreweryScheduleProjection,
  ProjectedBrewSession,
} from "../../../platform/breweryScheduleProjection.js";
import {
  sourceSteps,
  toBom,
  toMaterialRequirements,
  toOperations,
  toProductionOrder,
  type ProjectedStep,
} from "../breweryProjectionMappers.js";

type BrewSessionRow = ProjectedBrewSession;

export class MrpBreweryProjectionService {
  constructor(private readonly schedule: BreweryScheduleProjection) {}

  async listProjectedBoms(workspaceId: string): Promise<readonly Bom[]> {
    const recipes = await this.schedule.listRecipes(workspaceId);
    return recipes.map((recipe) => toBom(recipe));
  }

  async getProjectedBomById(workspaceId: string, bomId: string): Promise<Bom | null> {
    const recipeId = parseBreweryRecipeBomId(bomId);
    if (!recipeId) return null;
    const recipe = await this.schedule.getRecipe(workspaceId, recipeId);
    return recipe ? toBom(recipe) : null;
  }

  async listProjectedProductionOrders(
    workspaceId: string,
    status?: string,
  ): Promise<readonly ProductionOrder[]> {
    const sessions = await this.findBrewSessions(workspaceId);
    return sessions
      .map((session) => toProductionOrder(session))
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

    const operations = await this.toOperationsWithFallback(session);
    const materialRequirements = toMaterialRequirements(session);
    return ProductionOrderGetResponseSchema.shape.item.parse({
      ...toProductionOrder(session),
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
    return session ? toMaterialRequirements(session) : [];
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

  private async toOperationsWithFallback(session: BrewSessionRow) {
    const steps = sourceSteps(session);
    const fallbackSteps = steps.length > 0 ? [] : await this.settingsFallbackSteps(session.workspaceId);
    return toOperations(session, fallbackSteps);
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
