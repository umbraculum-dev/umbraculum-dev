import { z } from "zod";

export const IngredientsSearchQuerySchema = z.object({
  query: z.string().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const FermentableItemSchema = z.record(z.string(), z.unknown());

export const FermentablesListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(FermentableItemSchema),
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
});

export const HopItemSchema = z.record(z.string(), z.unknown());

export const HopsListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(HopItemSchema),
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
});

export const YeastItemSchema = z.record(z.string(), z.unknown());

export const YeastsListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(YeastItemSchema),
});

export const IngredientSyncRunSchema = z.record(z.string(), z.unknown());

export const IngredientSyncRunsResponseSchema = z.object({
  ok: z.literal(true),
  runs: z.array(IngredientSyncRunSchema),
});

export const IngredientSyncResultSchema = z.record(z.string(), z.unknown());

export const IngredientSyncResponseSchema = z.object({
  ok: z.literal(true),
  result: IngredientSyncResultSchema,
});
