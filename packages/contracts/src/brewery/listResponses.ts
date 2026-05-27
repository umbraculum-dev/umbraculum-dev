/**
 * Brewery list API responses consumed by web and native clients.
 */
import { z } from "zod";

const RecipeListItemSchema = z.object({
  id: z.string(),
  accountId: z.string().optional(),
  name: z.string(),
  styleKey: z.string().optional(),
  style: z.string().nullable().optional(),
  version: z.number().optional(),
});

export type RecipeListItem = z.infer<typeof RecipeListItemSchema>;

export const RecipesListResponseSchema = z.object({
  ok: z.literal(true),
  recipes: z.array(RecipeListItemSchema),
});

export type RecipesListResponse = z.infer<typeof RecipesListResponseSchema>;

export function parseRecipesListResponse(payload: unknown): RecipesListResponse {
  return RecipesListResponseSchema.parse(payload);
}

const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

const BrewSessionListItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: z.string(),
  createdAt: isoDateTime,
  startedAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string().nullable()).optional(),
  stoppedAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string().nullable()).optional(),
});

export type BrewSessionListItem = z.infer<typeof BrewSessionListItemSchema>;

export const BrewSessionsListResponseSchema = z.object({
  ok: z.literal(true),
  brewSessions: z.array(BrewSessionListItemSchema),
});

export type BrewSessionsListResponse = z.infer<typeof BrewSessionsListResponseSchema>;

export function parseBrewSessionsListResponse(payload: unknown): BrewSessionsListResponse {
  return BrewSessionsListResponseSchema.parse(payload);
}

const BrewSessionCreateResponseSchema = z.object({
  ok: z.literal(true),
  brewSession: z.object({
    id: z.string(),
  }),
});

export function parseBrewSessionCreateResponse(payload: unknown): { brewSession: { id: string } } {
  const parsed = BrewSessionCreateResponseSchema.parse(payload);
  return { brewSession: parsed.brewSession };
}
