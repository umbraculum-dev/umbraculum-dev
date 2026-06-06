import { z } from "zod";

import type { ProjectedRecipe } from "./breweryScheduleProjection.js";

export const BeerJsonAmountSchema = z.object({
  value: z.number().finite().positive(),
  unit: z.string().min(1),
}).passthrough();

export const BeerJsonIngredientAdditionSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  amount: BeerJsonAmountSchema,
}).passthrough();

export const BeerJsonRecipePayloadSchema = z.object({
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

export const BrewdaySettingsStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sectionId: z.string().min(1),
  exclude: z.boolean().optional().default(false),
  minutes: z.number().int().positive().nullable().optional(),
}).passthrough();

export const EquipmentSourceSchema = z.object({
  equipmentSource: z.object({
    equipmentProfileId: z.string().min(1).optional(),
  }).passthrough().optional(),
}).passthrough();

export type BeerJsonIngredient = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  materialRefModule: string;
};

export function extractBeerJsonIngredients(payload: unknown): readonly BeerJsonIngredient[] {
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

export function ingredientGroup(
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

export function recipeBatchSize(payload: unknown): { quantity: number; unit: string } | null {
  const parsed = BeerJsonRecipePayloadSchema.safeParse(payload);
  if (!parsed.success) return null;
  const batchSize = parsed.data.beerjson.recipes[0]?.batch_size;
  return batchSize ? { quantity: batchSize.value, unit: batchSize.unit } : null;
}

export function recipeCode(recipe: ProjectedRecipe): string {
  return `recipe-${recipe.versionGroupId}-v${recipe.version}`;
}

export function recipeEquipmentProfileId(recipeExtJson: unknown): string | null {
  const parsed = EquipmentSourceSchema.safeParse(recipeExtJson);
  return parsed.success ? parsed.data.equipmentSource?.equipmentProfileId ?? null : null;
}

export function schedulingBase(session: { startedAt: Date | null; scheduledDate: Date | null }): Date | null {
  return session.startedAt ?? session.scheduledDate ?? null;
}

export function operationCode(step: { sectionId: string; sortOrder: number; name: string; id: string }): string {
  const stem = `${step.sectionId}-${step.sortOrder}-${step.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return stem || step.id;
}

export function isPositiveInt(value: number | null): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function addMinutes(start: Date, minutes: number): Date {
  return new Date(start.getTime() + minutes * 60_000);
}
