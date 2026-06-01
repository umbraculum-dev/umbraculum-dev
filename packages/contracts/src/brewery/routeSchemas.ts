/**
 * Brewery vertical route contracts (OpenAPI brewery tag).
 * Complex JSON fields use z.unknown() — contracts + route tables win on edge validation.
 */
import { z } from "zod";

const isoDateTime = z.preprocess((v) => {
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
  version: z.number(),
  code: z.string().nullable(),
  category: z.string().nullable(),
  categoryId: z.string().nullable(),
  sortOrder: z.number(),
});

export const StylesListResponseSchema = z.object({
  ok: z.literal(true),
  styles: z.array(BeerStyleSchema),
});

export const EquipmentProfilePayloadSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  equipment: z.record(z.string(), z.unknown()),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const EquipmentProfilesListResponseSchema = z.object({
  ok: z.literal(true),
  profiles: z.array(EquipmentProfilePayloadSchema),
});

export const EquipmentProfileResponseSchema = z.object({
  ok: z.literal(true),
  profile: EquipmentProfilePayloadSchema,
});

export const EquipmentProfileCreateRequestSchema = z.record(z.string(), z.unknown());

export const EquipmentProfilePatchRequestSchema = z.record(z.string(), z.unknown());

export const InventoryItemPayloadSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  category: z.string(),
  ingredientId: z.string().nullable(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  metadataJson: z.unknown().nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const InventoryListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(InventoryItemPayloadSchema),
});

export const InventoryItemResponseSchema = z.object({
  ok: z.literal(true),
  item: InventoryItemPayloadSchema,
});

export const InventoryCreateRequestSchema = z.record(z.string(), z.unknown());

export const InventoryPatchRequestSchema = z.record(z.string(), z.unknown());

export const BrewdaySettingsPayloadSchema = z.record(z.string(), z.unknown());

export const BrewdaySettingsResponseSchema = z.object({
  ok: z.literal(true),
  settings: BrewdaySettingsPayloadSchema.nullable(),
});

export const BrewdaySettingsPatchRequestSchema = z.record(z.string(), z.unknown());

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

export const IngredientsSearchQuerySchema = z.object({
  query: z.string().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const IntegrationReadingsQuerySchema = z.object({
  kind: z.enum(["tilt", "ispindel", "rapt"]),
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

export const RecipeImportFormatSchema = z.enum(["beerjson", "beerxml"]);

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
  warnings: z.array(z.string()).optional(),
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
