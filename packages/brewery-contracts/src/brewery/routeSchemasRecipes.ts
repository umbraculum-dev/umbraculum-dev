import { z } from "zod";

export const RecipePayloadSchema = z.record(z.string(), z.unknown());

export const RecipeListResponseSchema = z.object({
  ok: z.literal(true),
  recipes: z.array(z.record(z.string(), z.unknown())),
});

export const RecipeResponseSchema = z.object({
  ok: z.literal(true),
  recipe: RecipePayloadSchema,
});

export const RecipeCreateRequestSchema = z.object({
  name: z.string(),
  styleKey: z.string().optional(),
  notes: z.string().nullable().optional(),
  beerJsonRecipeJson: z.unknown().optional(),
  recipeExtJson: z.unknown().optional(),
});

export const RecipePatchRequestSchema = z.object({
  name: z.string().optional(),
  styleKey: z.string().optional(),
  notes: z.string().optional(),
  beerJsonRecipeJson: z.unknown().optional(),
  recipeExtJson: z.unknown().optional(),
});

export const RecipeVersionsResponseSchema = z.object({
  ok: z.literal(true),
  versions: z.array(z.record(z.string(), z.unknown())),
});

/** BeerJSON export routes stream raw bytes; OpenAPI documents a placeholder object. */
export const BeerJsonExportResponseSchema = z.custom<Buffer>(
  (data) => data instanceof Buffer,
  { message: "Expected binary export body" },
);

export const RecipeImportFormatSchema = z.enum(["beerjson", "beerxml"]);

export const RecipeImportWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const RecipeImportRequestSchema = z.object({
  format: RecipeImportFormatSchema,
  content: z.string().min(1),
  styleKey: z.string().optional(),
});

export const RecipeBulkImportRequestSchema = z.object({
  format: RecipeImportFormatSchema,
  content: z.string().min(1),
});

export const RecipeImportPreviewPayloadSchema = z.record(z.string(), z.unknown());

export const RecipeImportPreviewResponseSchema = z.object({
  ok: z.literal(true),
  format: RecipeImportFormatSchema,
  preview: RecipeImportPreviewPayloadSchema,
  workspaceId: z.string(),
});

export const RecipeImportResponseSchema = z.object({
  ok: z.literal(true),
  recipe: RecipePayloadSchema,
  warnings: z.array(RecipeImportWarningSchema).optional(),
});

export const RecipeBulkImportPreviewItemSchema = z.record(z.string(), z.unknown());

export const RecipeBulkImportPreviewResponseSchema = z.object({
  ok: z.literal(true),
  format: RecipeImportFormatSchema,
  previewItems: z.array(RecipeBulkImportPreviewItemSchema),
  workspaceId: z.string(),
});

export const RecipeBulkImportCreatedItemSchema = z.record(z.string(), z.unknown());

export const RecipeBulkImportFailedItemSchema = z.object({
  index: z.number(),
  name: z.string(),
  error: z.string(),
});

export const RecipeBulkImportResponseSchema = z.object({
  ok: z.literal(true),
  created: z.array(RecipeBulkImportCreatedItemSchema),
  failed: z.array(RecipeBulkImportFailedItemSchema),
});
