import type { BrewSessionStatus, Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
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

type RecipeRow = Prisma.RecipeGetPayload<Record<string, never>>;
type BrewSessionRow = Prisma.BrewSessionGetPayload<{
  include: { recipe: true; steps: true };
}>;

type ProjectedStep = {
  id: string;
  sectionId: string;
  name: string;
  isDisabled: boolean;
  sortOrder: number;
  minutesPlanned: number | null;
};

const BeerJsonAmountSchema = z.object({
  value: z.number().finite().positive(),
  unit: z.string().min(1),
}).passthrough();

const BeerJsonIngredientAdditionSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  amount: BeerJsonAmountSchema,
}).passthrough();

const BeerJsonRecipePayloadSchema = z.object({
  beerjson: z.object({
    recipes: z.array(z.object({
      batch_size: BeerJsonAmountSchema.optional(),
      ingredients: z.object({
        fermentable_additions: z.array(BeerJsonIngredientAdditionSchema).optional(),
        hop_additions: z.array(BeerJsonIngredientAdditionSchema).optional(),
        culture_additions: z.array(BeerJsonIngredientAdditionSchema).optional(),
        miscellaneous_additions: z.array(BeerJsonIngredientAdditionSchema).optional(),
      }).passthrough().optional(),
    }).passthrough()).min(1),
  }).passthrough(),
}).passthrough();

const BrewdaySettingsStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sectionId: z.string().min(1),
  exclude: z.boolean().optional().default(false),
  minutes: z.number().int().positive().nullable().optional(),
}).passthrough();

type BeerJsonIngredient = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  materialRefModule: string;
};

/** @arch-boundary — intentional coupling
 * Reason: Wave 1 MRP brewery projection reads core Recipe/BrewSession schema in-process.
 * Revisit: SOLID subplan B3 (BreweryScheduleProjection port)
 * Owner: mrp
 */
export class MrpBreweryProjectionService {
  constructor(private readonly prisma: PrismaClient) {}

  async listProjectedBoms(workspaceId: string): Promise<readonly Bom[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { version: "asc" }],
    });
    return recipes.map((recipe) => this.toBom(recipe));
  }

  async getProjectedBomById(workspaceId: string, bomId: string): Promise<Bom | null> {
    const recipeId = parseBreweryRecipeBomId(bomId);
    if (!recipeId) return null;
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, workspaceId },
    });
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
    return this.prisma.brewSession.findMany({
      where: { workspaceId },
      include: { recipe: true, steps: true },
      orderBy: [{ code: "asc" }],
    });
  }

  private async findBrewSession(
    workspaceId: string,
    sessionId: string,
  ): Promise<BrewSessionRow | null> {
    return this.prisma.brewSession.findFirst({
      where: { id: sessionId, workspaceId },
      include: { recipe: true, steps: true },
    });
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
    const plannedStartAt = productionOrderStart(session);
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
        earliestStartAt: productionOrderStart(session)?.toISOString() ?? null,
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
    const settings = await this.prisma.brewdaySettings.findUnique({ where: { workspaceId } });
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

function extractBeerJsonIngredients(payload: unknown): readonly BeerJsonIngredient[] {
  const parsed = BeerJsonRecipePayloadSchema.safeParse(payload);
  if (!parsed.success) return [];
  const ingredients = parsed.data.beerjson.recipes[0]?.ingredients;
  if (!ingredients) return [];

  return [
    ...ingredientGroup("fermentable", ingredients.fermentable_additions ?? []),
    ...ingredientGroup("hop", ingredients.hop_additions ?? []),
    ...ingredientGroup("culture", ingredients.culture_additions ?? []),
    ...ingredientGroup("miscellaneous", ingredients.miscellaneous_additions ?? []),
  ];
}

function ingredientGroup(
  materialRefModule: string,
  additions: readonly z.infer<typeof BeerJsonIngredientAdditionSchema>[],
): BeerJsonIngredient[] {
  return additions.map((addition, index) => ({
    id: addition.id ?? `${materialRefModule}-${index + 1}`,
    description: addition.name,
    quantity: addition.amount.value,
    unit: addition.amount.unit,
    materialRefModule: `brewery.${materialRefModule}`,
  }));
}

function recipeBatchSize(payload: unknown): { quantity: number; unit: string } | null {
  const parsed = BeerJsonRecipePayloadSchema.safeParse(payload);
  if (!parsed.success) return null;
  const batchSize = parsed.data.beerjson.recipes[0]?.batch_size;
  return batchSize ? { quantity: batchSize.value, unit: batchSize.unit } : null;
}

function recipeCode(recipe: RecipeRow): string {
  return `recipe-${recipe.versionGroupId}-v${recipe.version}`;
}

function productionOrderStart(session: BrewSessionRow): Date | null {
  return session.startedAt ?? session.scheduledDate ?? null;
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

function operationCode(step: ProjectedStep): string {
  const stem = `${step.sectionId}-${step.sortOrder}-${step.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return stem || step.id;
}

function isPositiveInt(value: number | null): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function addMinutes(start: Date, minutes: number): Date {
  return new Date(start.getTime() + minutes * 60_000);
}
