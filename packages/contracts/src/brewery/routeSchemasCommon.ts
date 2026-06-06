/**
 * Shared brewery route schema primitives.
 */
import { z } from "zod";

export const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

export const OkResponseSchema = z.object({
  ok: z.literal(true),
});

export const IdParamsSchema = z.object({
  id: z.string().min(1, "id required"),
});

export const InventoryCategoryQuerySchema = z.object({
  category: z.string().optional(),
});

export const BeerStyleSchema = z.object({
  key: z.string(),
  name: z.string(),
  source: z.string(),
  /** Style guide revision label (e.g. `"2021"`, `"v1"`) — stored as text in `beer_styles.version`. */
  version: z.string(),
  code: z.string().nullable(),
  category: z.string().nullable(),
  categoryId: z.string().nullable(),
  sortOrder: z.number(),
});

export const StylesListResponseSchema = z.object({
  ok: z.literal(true),
  styles: z.array(BeerStyleSchema),
});

export const RecipeIdParamsSchema = z.object({
  recipeId: z.string().min(1, "recipeId required"),
});

export const BrewSessionIdParamsSchema = z.object({
  brewSessionId: z.string().min(1, "brewSessionId required"),
});

export const BrewSessionStepParamsSchema = z.object({
  brewSessionId: z.string().min(1, "brewSessionId required"),
  stepId: z.string().min(1, "stepId required"),
});

export const IntegrationReadingsQuerySchema = z.object({
  kind: z.enum(["tilt", "ispindel", "rapt"]),
  limit: z.coerce.number().int().positive().optional(),
});
