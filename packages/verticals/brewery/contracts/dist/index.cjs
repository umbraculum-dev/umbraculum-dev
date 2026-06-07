"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BeerJsonExportResponseSchema: () => BeerJsonExportResponseSchema,
  BeerStyleSchema: () => BeerStyleSchema,
  BoilComputeAndSaveRequestSchema: () => BoilComputeAndSaveRequestSchema,
  BoilComputeAndSaveResponseSchema: () => BoilComputeAndSaveResponseSchema,
  BrewSessionCreateResponseSchema: () => BrewSessionCreateResponseSchema,
  BrewSessionDetailResponseSchema: () => BrewSessionDetailResponseSchema,
  BrewSessionIdParamsSchema: () => BrewSessionIdParamsSchema,
  BrewSessionLogSchema: () => BrewSessionLogSchema,
  BrewSessionPatchRequestSchema: () => BrewSessionPatchRequestSchema,
  BrewSessionPayloadSchema: () => BrewSessionPayloadSchema,
  BrewSessionRecipeRefSchema: () => BrewSessionRecipeRefSchema,
  BrewSessionStepLogRequestSchema: () => BrewSessionStepLogRequestSchema,
  BrewSessionStepParamsSchema: () => BrewSessionStepParamsSchema,
  BrewSessionStepResponseSchema: () => BrewSessionStepResponseSchema,
  BrewSessionStepSchema: () => BrewSessionStepSchema,
  BrewSessionStepTimerPatchRequestSchema: () => BrewSessionStepTimerPatchRequestSchema,
  BrewSessionStepsPatchRequestSchema: () => BrewSessionStepsPatchRequestSchema,
  BrewSessionStepsResponseSchema: () => BrewSessionStepsResponseSchema,
  BrewSessionStopRequestSchema: () => BrewSessionStopRequestSchema,
  BrewSessionsListResponseSchema: () => BrewSessionsListResponseSchema,
  BrewdaySettingsPatchRequestSchema: () => BrewdaySettingsPatchRequestSchema,
  BrewdaySettingsPayloadSchema: () => BrewdaySettingsPayloadSchema,
  BrewdaySettingsResponseSchema: () => BrewdaySettingsResponseSchema,
  CONTRACT_VERSION: () => CONTRACT_VERSION,
  EquipmentProfileCreateRequestSchema: () => EquipmentProfileCreateRequestSchema,
  EquipmentProfilePatchRequestSchema: () => EquipmentProfilePatchRequestSchema,
  EquipmentProfilePayloadSchema: () => EquipmentProfilePayloadSchema,
  EquipmentProfileResponseSchema: () => EquipmentProfileResponseSchema,
  EquipmentProfilesListResponseSchema: () => EquipmentProfilesListResponseSchema,
  FermentableItemSchema: () => FermentableItemSchema,
  FermentablesListResponseSchema: () => FermentablesListResponseSchema,
  HopItemSchema: () => HopItemSchema,
  HopsListResponseSchema: () => HopsListResponseSchema,
  IdParamsSchema: () => IdParamsSchema,
  IngredientSyncResponseSchema: () => IngredientSyncResponseSchema,
  IngredientSyncResultSchema: () => IngredientSyncResultSchema,
  IngredientSyncRunSchema: () => IngredientSyncRunSchema,
  IngredientSyncRunsResponseSchema: () => IngredientSyncRunsResponseSchema,
  IngredientsSearchQuerySchema: () => IngredientsSearchQuerySchema,
  IntegrationAttachRequestSchema: () => IntegrationAttachRequestSchema,
  IntegrationAttachResponseSchema: () => IntegrationAttachResponseSchema,
  IntegrationAttachmentDeviceSchema: () => IntegrationAttachmentDeviceSchema,
  IntegrationAttachmentSchema: () => IntegrationAttachmentSchema,
  IntegrationAttachmentsResponseSchema: () => IntegrationAttachmentsResponseSchema,
  IntegrationDetachRequestSchema: () => IntegrationDetachRequestSchema,
  IntegrationDetachResponseSchema: () => IntegrationDetachResponseSchema,
  IntegrationReadingSchema: () => IntegrationReadingSchema,
  IntegrationReadingsQuerySchema: () => IntegrationReadingsQuerySchema,
  IntegrationReadingsResponseSchema: () => IntegrationReadingsResponseSchema,
  InventoryCategoryQuerySchema: () => InventoryCategoryQuerySchema,
  InventoryCreateRequestSchema: () => InventoryCreateRequestSchema,
  InventoryItemPayloadSchema: () => InventoryItemPayloadSchema,
  InventoryItemResponseSchema: () => InventoryItemResponseSchema,
  InventoryListResponseSchema: () => InventoryListResponseSchema,
  InventoryPatchRequestSchema: () => InventoryPatchRequestSchema,
  MashComputeAndSaveRequestSchema: () => MashComputeAndSaveRequestSchema,
  MashComputeAndSaveResponseSchema: () => MashComputeAndSaveResponseSchema,
  OkResponseSchema: () => OkResponseSchema,
  RecipeBulkImportCreatedItemSchema: () => RecipeBulkImportCreatedItemSchema,
  RecipeBulkImportFailedItemSchema: () => RecipeBulkImportFailedItemSchema,
  RecipeBulkImportPreviewItemSchema: () => RecipeBulkImportPreviewItemSchema,
  RecipeBulkImportPreviewResponseSchema: () => RecipeBulkImportPreviewResponseSchema,
  RecipeBulkImportRequestSchema: () => RecipeBulkImportRequestSchema,
  RecipeBulkImportResponseSchema: () => RecipeBulkImportResponseSchema,
  RecipeCreateRequestSchema: () => RecipeCreateRequestSchema,
  RecipeIdParamsSchema: () => RecipeIdParamsSchema,
  RecipeImportFormatSchema: () => RecipeImportFormatSchema,
  RecipeImportPreviewPayloadSchema: () => RecipeImportPreviewPayloadSchema,
  RecipeImportPreviewResponseSchema: () => RecipeImportPreviewResponseSchema,
  RecipeImportRequestSchema: () => RecipeImportRequestSchema,
  RecipeImportResponseSchema: () => RecipeImportResponseSchema,
  RecipeImportWarningSchema: () => RecipeImportWarningSchema,
  RecipeListResponseSchema: () => RecipeListResponseSchema,
  RecipePatchRequestSchema: () => RecipePatchRequestSchema,
  RecipePayloadSchema: () => RecipePayloadSchema,
  RecipeResponseSchema: () => RecipeResponseSchema,
  RecipeVersionsResponseSchema: () => RecipeVersionsResponseSchema,
  RecipeWaterHubSummaryResponseSchema: () => RecipeWaterHubSummaryResponseSchema,
  RecipeWaterSettingsGetResponseSchema: () => RecipeWaterSettingsGetResponseSchema,
  RecipeWaterSettingsPayloadSchema: () => RecipeWaterSettingsPayloadSchema,
  RecipeWaterSettingsPutRequestSchema: () => RecipeWaterSettingsPutRequestSchema,
  RecipeWaterSettingsPutResponseSchema: () => RecipeWaterSettingsPutResponseSchema,
  RecipesListResponseSchema: () => RecipesListResponseSchema,
  SpargeComputeAndSaveRequestSchema: () => SpargeComputeAndSaveRequestSchema,
  SpargeComputeAndSaveResponseSchema: () => SpargeComputeAndSaveResponseSchema,
  StylesListResponseSchema: () => StylesListResponseSchema,
  WaterCalcRequestSchema: () => WaterCalcRequestSchema,
  WaterCalcResultOnlyResponseSchema: () => WaterCalcResultOnlyResponseSchema,
  WaterCalcWithDerivationResponseSchema: () => WaterCalcWithDerivationResponseSchema,
  WaterProfileCreateRequestSchema: () => WaterProfileCreateRequestSchema,
  WaterProfileItemSchema: () => WaterProfileItemSchema,
  WaterProfilePatchRequestSchema: () => WaterProfilePatchRequestSchema,
  WaterProfileResponseSchema: () => WaterProfileResponseSchema,
  WaterProfilesListResponseSchema: () => WaterProfilesListResponseSchema,
  YeastItemSchema: () => YeastItemSchema,
  YeastsListResponseSchema: () => YeastsListResponseSchema,
  classifyContractVersionSkew: () => classifyContractVersionSkew,
  isoDateTime: () => isoDateTime,
  parseBoilComputeAndSaveResponse: () => parseBoilComputeAndSaveResponse,
  parseBrewSessionCreateResponse: () => parseBrewSessionCreateResponse,
  parseBrewSessionsListResponse: () => parseBrewSessionsListResponse,
  parseGravityAnalysisResponseV1: () => parseGravityAnalysisResponseV1,
  parseMashComputeAndSaveResponse: () => parseMashComputeAndSaveResponse,
  parseRecipeWaterHubSummaryResponse: () => parseRecipeWaterHubSummaryResponse,
  parseRecipesListResponse: () => parseRecipesListResponse,
  parseSemVer: () => parseSemVer,
  parseSpargeComputeAndSaveResponse: () => parseSpargeComputeAndSaveResponse,
  parseWaterProfileItem: () => parseWaterProfileItem,
  parseWaterProfilesResponse: () => parseWaterProfilesResponse
});
module.exports = __toCommonJS(index_exports);

// src/version.ts
var CONTRACT_VERSION = "0.1.0-alpha.1";
function parseSemVer(input) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(input);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    return null;
  }
  const prerelease = match[4];
  if (prerelease === void 0) {
    return { major, minor, patch };
  }
  return { major, minor, patch, prerelease };
}
function classifyContractVersionSkew(runtime, expected = CONTRACT_VERSION) {
  const r = parseSemVer(runtime);
  const e = parseSemVer(expected);
  if (!r || !e) return "unparseable";
  if (r.major !== e.major) return "major";
  if (r.minor !== e.minor) return "minor";
  if (r.patch !== e.patch) return "patch";
  return "match";
}

// src/brewery/routeSchemasCommon.ts
var import_zod = require("zod");
var isoDateTime = import_zod.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod.z.string());
var OkResponseSchema = import_zod.z.object({
  ok: import_zod.z.literal(true)
});
var IdParamsSchema = import_zod.z.object({
  id: import_zod.z.string().min(1, "id required")
});
var InventoryCategoryQuerySchema = import_zod.z.object({
  category: import_zod.z.string().optional()
});
var BeerStyleSchema = import_zod.z.object({
  key: import_zod.z.string(),
  name: import_zod.z.string(),
  source: import_zod.z.string(),
  /** Style guide revision label (e.g. `"2021"`, `"v1"`) — stored as text in `beer_styles.version`. */
  version: import_zod.z.string(),
  code: import_zod.z.string().nullable(),
  category: import_zod.z.string().nullable(),
  categoryId: import_zod.z.string().nullable(),
  sortOrder: import_zod.z.number()
});
var StylesListResponseSchema = import_zod.z.object({
  ok: import_zod.z.literal(true),
  styles: import_zod.z.array(BeerStyleSchema)
});
var RecipeIdParamsSchema = import_zod.z.object({
  recipeId: import_zod.z.string().min(1, "recipeId required")
});
var BrewSessionIdParamsSchema = import_zod.z.object({
  brewSessionId: import_zod.z.string().min(1, "brewSessionId required")
});
var BrewSessionStepParamsSchema = import_zod.z.object({
  brewSessionId: import_zod.z.string().min(1, "brewSessionId required"),
  stepId: import_zod.z.string().min(1, "stepId required")
});
var IntegrationReadingsQuerySchema = import_zod.z.object({
  kind: import_zod.z.enum(["tilt", "ispindel", "rapt"]),
  limit: import_zod.z.coerce.number().int().positive().optional()
});

// src/brewery/routeSchemasEquipment.ts
var import_zod2 = require("zod");
var EquipmentProfilePayloadSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  workspaceId: import_zod2.z.string(),
  name: import_zod2.z.string(),
  equipment: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()),
  createdAt: isoDateTime,
  updatedAt: isoDateTime
});
var EquipmentProfilesListResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  profiles: import_zod2.z.array(EquipmentProfilePayloadSchema)
});
var EquipmentProfileResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  profile: EquipmentProfilePayloadSchema
});
var EquipmentProfileCreateRequestSchema = import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown());
var EquipmentProfilePatchRequestSchema = import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown());

// src/brewery/routeSchemasInventory.ts
var import_zod3 = require("zod");
var InventoryItemPayloadSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  workspaceId: import_zod3.z.string(),
  category: import_zod3.z.string(),
  ingredientId: import_zod3.z.string().nullable(),
  name: import_zod3.z.string(),
  quantity: import_zod3.z.number(),
  unit: import_zod3.z.string(),
  metadataJson: import_zod3.z.unknown().nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime
});
var InventoryListResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  items: import_zod3.z.array(InventoryItemPayloadSchema)
});
var InventoryItemResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  item: InventoryItemPayloadSchema
});
var InventoryCreateRequestSchema = import_zod3.z.record(import_zod3.z.string(), import_zod3.z.unknown());
var InventoryPatchRequestSchema = import_zod3.z.record(import_zod3.z.string(), import_zod3.z.unknown());
var BrewdaySettingsPayloadSchema = import_zod3.z.record(import_zod3.z.string(), import_zod3.z.unknown());
var BrewdaySettingsResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  settings: BrewdaySettingsPayloadSchema.nullable()
});
var BrewdaySettingsPatchRequestSchema = import_zod3.z.record(import_zod3.z.string(), import_zod3.z.unknown());

// src/brewery/routeSchemasRecipes.ts
var import_zod4 = require("zod");
var RecipePayloadSchema = import_zod4.z.record(import_zod4.z.string(), import_zod4.z.unknown());
var RecipeListResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  recipes: import_zod4.z.array(import_zod4.z.record(import_zod4.z.string(), import_zod4.z.unknown()))
});
var RecipeResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  recipe: RecipePayloadSchema
});
var RecipeCreateRequestSchema = import_zod4.z.object({
  name: import_zod4.z.string(),
  styleKey: import_zod4.z.string().optional(),
  notes: import_zod4.z.string().nullable().optional(),
  beerJsonRecipeJson: import_zod4.z.unknown().optional(),
  recipeExtJson: import_zod4.z.unknown().optional()
});
var RecipePatchRequestSchema = import_zod4.z.object({
  name: import_zod4.z.string().optional(),
  styleKey: import_zod4.z.string().optional(),
  notes: import_zod4.z.string().optional(),
  beerJsonRecipeJson: import_zod4.z.unknown().optional(),
  recipeExtJson: import_zod4.z.unknown().optional()
});
var RecipeVersionsResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  versions: import_zod4.z.array(import_zod4.z.record(import_zod4.z.string(), import_zod4.z.unknown()))
});
var BeerJsonExportResponseSchema = import_zod4.z.custom(
  (data) => data instanceof Buffer,
  { message: "Expected binary export body" }
);
var RecipeImportFormatSchema = import_zod4.z.enum(["beerjson", "beerxml"]);
var RecipeImportWarningSchema = import_zod4.z.object({
  code: import_zod4.z.string(),
  message: import_zod4.z.string()
});
var RecipeImportRequestSchema = import_zod4.z.object({
  format: RecipeImportFormatSchema,
  content: import_zod4.z.string().min(1),
  styleKey: import_zod4.z.string().optional()
});
var RecipeBulkImportRequestSchema = import_zod4.z.object({
  format: RecipeImportFormatSchema,
  content: import_zod4.z.string().min(1)
});
var RecipeImportPreviewPayloadSchema = import_zod4.z.record(import_zod4.z.string(), import_zod4.z.unknown());
var RecipeImportPreviewResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  format: RecipeImportFormatSchema,
  preview: RecipeImportPreviewPayloadSchema,
  workspaceId: import_zod4.z.string()
});
var RecipeImportResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  recipe: RecipePayloadSchema,
  warnings: import_zod4.z.array(RecipeImportWarningSchema).optional()
});
var RecipeBulkImportPreviewItemSchema = import_zod4.z.record(import_zod4.z.string(), import_zod4.z.unknown());
var RecipeBulkImportPreviewResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  format: RecipeImportFormatSchema,
  previewItems: import_zod4.z.array(RecipeBulkImportPreviewItemSchema),
  workspaceId: import_zod4.z.string()
});
var RecipeBulkImportCreatedItemSchema = import_zod4.z.record(import_zod4.z.string(), import_zod4.z.unknown());
var RecipeBulkImportFailedItemSchema = import_zod4.z.object({
  index: import_zod4.z.number(),
  name: import_zod4.z.string(),
  error: import_zod4.z.string()
});
var RecipeBulkImportResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  created: import_zod4.z.array(RecipeBulkImportCreatedItemSchema),
  failed: import_zod4.z.array(RecipeBulkImportFailedItemSchema)
});

// src/brewery/routeSchemasIngredients.ts
var import_zod5 = require("zod");
var IngredientsSearchQuerySchema = import_zod5.z.object({
  query: import_zod5.z.string().optional(),
  offset: import_zod5.z.coerce.number().int().nonnegative().optional(),
  limit: import_zod5.z.coerce.number().int().positive().optional()
});
var FermentableItemSchema = import_zod5.z.record(import_zod5.z.string(), import_zod5.z.unknown());
var FermentablesListResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  items: import_zod5.z.array(FermentableItemSchema),
  total: import_zod5.z.number(),
  offset: import_zod5.z.number(),
  limit: import_zod5.z.number()
});
var HopItemSchema = import_zod5.z.record(import_zod5.z.string(), import_zod5.z.unknown());
var HopsListResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  items: import_zod5.z.array(HopItemSchema),
  total: import_zod5.z.number(),
  offset: import_zod5.z.number(),
  limit: import_zod5.z.number()
});
var YeastItemSchema = import_zod5.z.record(import_zod5.z.string(), import_zod5.z.unknown());
var YeastsListResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  items: import_zod5.z.array(YeastItemSchema)
});
var IngredientSyncRunSchema = import_zod5.z.record(import_zod5.z.string(), import_zod5.z.unknown());
var IngredientSyncRunsResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  runs: import_zod5.z.array(IngredientSyncRunSchema)
});
var IngredientSyncResultSchema = import_zod5.z.record(import_zod5.z.string(), import_zod5.z.unknown());
var IngredientSyncResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  result: IngredientSyncResultSchema
});

// src/brewery/listResponses.ts
var import_zod6 = require("zod");
var RecipeListItemSchema = import_zod6.z.object({
  id: import_zod6.z.string(),
  accountId: import_zod6.z.string().optional(),
  name: import_zod6.z.string(),
  styleKey: import_zod6.z.string().optional(),
  style: import_zod6.z.string().nullable().optional(),
  version: import_zod6.z.number().optional()
});
var RecipesListResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  recipes: import_zod6.z.array(RecipeListItemSchema)
});
function parseRecipesListResponse(payload) {
  return RecipesListResponseSchema.parse(payload);
}
var isoDateTime2 = import_zod6.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod6.z.string());
var BrewSessionListItemSchema = import_zod6.z.object({
  id: import_zod6.z.string(),
  code: import_zod6.z.string(),
  status: import_zod6.z.string(),
  createdAt: isoDateTime2,
  startedAt: import_zod6.z.preprocess((v) => v instanceof Date ? v.toISOString() : v, import_zod6.z.string().nullable()).optional(),
  stoppedAt: import_zod6.z.preprocess((v) => v instanceof Date ? v.toISOString() : v, import_zod6.z.string().nullable()).optional()
});
var BrewSessionsListResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  brewSessions: import_zod6.z.array(BrewSessionListItemSchema)
});
function parseBrewSessionsListResponse(payload) {
  return BrewSessionsListResponseSchema.parse(payload);
}
var BrewSessionRecipeRefSchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1),
  name: import_zod6.z.string(),
  version: import_zod6.z.number().int()
});
var BrewSessionLogSchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1),
  brewSessionId: import_zod6.z.string().min(1),
  kind: import_zod6.z.string(),
  message: import_zod6.z.string(),
  createdAt: isoDateTime2,
  stepId: import_zod6.z.string().nullable(),
  payloadJson: import_zod6.z.record(import_zod6.z.string(), import_zod6.z.unknown()).nullable().optional()
}).passthrough();
var BrewSessionStepSchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1),
  brewSessionId: import_zod6.z.string().min(1),
  name: import_zod6.z.string(),
  status: import_zod6.z.string(),
  sortOrder: import_zod6.z.number().int(),
  sectionId: import_zod6.z.string(),
  sectionName: import_zod6.z.string().nullable(),
  createdAt: isoDateTime2,
  updatedAt: isoDateTime2,
  isDisabled: import_zod6.z.boolean(),
  customTimerEnabled: import_zod6.z.boolean(),
  note: import_zod6.z.string().nullable(),
  minutesPlanned: import_zod6.z.number().nullable(),
  offsetMinutesFromEnd: import_zod6.z.number().nullable(),
  relativeToStepId: import_zod6.z.string().nullable(),
  timerAccumulatedSeconds: import_zod6.z.number(),
  timerLastStartedAt: isoDateTime2.nullable(),
  timerPausedAt: isoDateTime2.nullable(),
  timerStartedAt: isoDateTime2.nullable(),
  timerState: import_zod6.z.string(),
  timerStoppedAt: isoDateTime2.nullable()
}).passthrough();
var BrewSessionPayloadSchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1),
  workspaceId: import_zod6.z.string().min(1),
  recipeId: import_zod6.z.string().min(1),
  code: import_zod6.z.string().nullable(),
  status: import_zod6.z.string(),
  createdAt: isoDateTime2,
  updatedAt: isoDateTime2,
  startedAt: isoDateTime2.nullable(),
  pausedAt: isoDateTime2.nullable(),
  stoppedAt: isoDateTime2.nullable(),
  scheduledDate: isoDateTime2.nullable(),
  recipe: BrewSessionRecipeRefSchema.optional(),
  steps: import_zod6.z.array(BrewSessionStepSchema).optional(),
  logs: import_zod6.z.array(BrewSessionLogSchema).optional()
}).passthrough();
var BrewSessionDetailResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  brewSession: BrewSessionPayloadSchema
});
var BrewSessionCreateResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  brewSession: BrewSessionPayloadSchema,
  steps: import_zod6.z.array(BrewSessionStepSchema)
});
var BrewSessionStepResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  step: BrewSessionStepSchema
});
var BrewSessionStepsResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  steps: import_zod6.z.array(BrewSessionStepSchema)
});
var BrewSessionPatchRequestSchema = import_zod6.z.object({
  scheduledDate: import_zod6.z.string().nullable().optional()
});
var BrewSessionStepsPatchRequestSchema = import_zod6.z.object({
  steps: import_zod6.z.array(import_zod6.z.record(import_zod6.z.string(), import_zod6.z.unknown()))
});
var BrewSessionStepTimerPatchRequestSchema = import_zod6.z.object({
  customTimerEnabled: import_zod6.z.boolean()
});
var BrewSessionStopRequestSchema = import_zod6.z.preprocess(
  (raw) => raw === null || raw === void 0 ? {} : raw,
  import_zod6.z.object({
    reason: import_zod6.z.enum(["auto", "manual"]).optional()
  })
);
var BrewSessionStepLogRequestSchema = import_zod6.z.object({
  status: import_zod6.z.enum(["pending", "in_progress", "done", "skipped", "not_applicable"]),
  note: import_zod6.z.string().nullable().optional(),
  name: import_zod6.z.string().optional(),
  isDisabled: import_zod6.z.boolean().optional()
});
var IntegrationAttachmentDeviceSchema = import_zod6.z.record(import_zod6.z.string(), import_zod6.z.unknown());
var IntegrationAttachmentSchema = import_zod6.z.object({
  id: import_zod6.z.string(),
  attachedAt: isoDateTime2,
  device: IntegrationAttachmentDeviceSchema
});
var IntegrationAttachmentsResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  attachments: import_zod6.z.array(IntegrationAttachmentSchema)
});
var IntegrationAttachRequestSchema = import_zod6.z.object({
  kind: import_zod6.z.enum(["tilt", "ispindel", "rapt"]),
  deviceId: import_zod6.z.string().min(1)
});
var IntegrationAttachResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  attachment: import_zod6.z.record(import_zod6.z.string(), import_zod6.z.unknown())
});
var IntegrationDetachRequestSchema = import_zod6.z.object({
  deviceId: import_zod6.z.string().min(1)
});
var IntegrationDetachResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  detachedCount: import_zod6.z.number()
});
var IntegrationReadingSchema = import_zod6.z.record(import_zod6.z.string(), import_zod6.z.unknown());
var IntegrationReadingsResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  readings: import_zod6.z.array(IntegrationReadingSchema)
});
function parseBrewSessionCreateResponse(payload) {
  const parsed = BrewSessionCreateResponseSchema.parse(payload);
  const brewSession = parsed.brewSession;
  return { brewSession: { id: typeof brewSession.id === "string" ? brewSession.id : "" } };
}

// src/water/parseHubSummary.ts
function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function parseIonProfilePpm(v) {
  if (!v || typeof v !== "object") return null;
  const o = v;
  const keys = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) if (!isFiniteNumber(o[k])) return null;
  return {
    calcium: o["calcium"],
    magnesium: o["magnesium"],
    sodium: o["sodium"],
    sulfate: o["sulfate"],
    chloride: o["chloride"],
    bicarbonate: o["bicarbonate"]
  };
}
function parseExpectedRaRange(v) {
  if (!v || typeof v !== "object") return null;
  const o = v;
  const rationaleKey = o["rationaleKey"] === "styleExpectedRaDark" || o["rationaleKey"] === "styleExpectedRaPale" || o["rationaleKey"] === "styleExpectedRaAmber" ? o["rationaleKey"] : null;
  if (!rationaleKey) return null;
  if (!isFiniteNumber(o["min"]) || !isFiniteNumber(o["max"])) return null;
  return { min: o["min"], max: o["max"], rationaleKey };
}
function parseStream(v) {
  if (!v || typeof v !== "object") return null;
  const o = v;
  const key = o["key"] === "mash" || o["key"] === "sparge" || o["key"] === "boil" ? o["key"] : null;
  if (!key) return null;
  const volumeLiters = o["volumeLiters"] === null ? null : isFiniteNumber(o["volumeLiters"]) ? o["volumeLiters"] : null;
  const ph = o["ph"] === null ? null : isFiniteNumber(o["ph"]) ? o["ph"] : null;
  const finalAlkalinityPpmCaCO3 = o["finalAlkalinityPpmCaCO3"] === null ? null : isFiniteNumber(o["finalAlkalinityPpmCaCO3"]) ? o["finalAlkalinityPpmCaCO3"] : null;
  const ionsPpm = parseIonProfilePpm(o["ionsPpm"]);
  const saltsBreakdown = (() => {
    if (o["saltsBreakdown"] === null) return null;
    if (!Array.isArray(o["saltsBreakdown"])) return null;
    const rows = [];
    for (const row of o["saltsBreakdown"]) {
      if (!row || typeof row !== "object") continue;
      const r = row;
      const saltKey = typeof r["saltKey"] === "string" ? r["saltKey"] : null;
      const grams = isFiniteNumber(r["grams"]) ? r["grams"] : null;
      if (!saltKey || grams === null) continue;
      rows.push({ saltKey, grams });
    }
    return rows.length ? rows : null;
  })();
  const acidType = typeof o["acidType"] === "string" ? o["acidType"] : o["acidType"] === null ? null : null;
  const acidMode = o["acidMode"] === "manual" || o["acidMode"] === "required" ? o["acidMode"] : null;
  const acidStrengthKind = typeof o["acidStrengthKind"] === "string" ? o["acidStrengthKind"] : o["acidStrengthKind"] === null ? null : null;
  const acidStrengthValue = o["acidStrengthValue"] === null ? null : isFiniteNumber(o["acidStrengthValue"]) ? o["acidStrengthValue"] : null;
  const acidAmountMl = o["acidAmountMl"] === null ? null : isFiniteNumber(o["acidAmountMl"]) ? o["acidAmountMl"] : null;
  const acidAmountGrams = o["acidAmountGrams"] === null ? null : isFiniteNumber(o["acidAmountGrams"]) ? o["acidAmountGrams"] : null;
  return {
    key,
    volumeLiters,
    ph,
    finalAlkalinityPpmCaCO3,
    ionsPpm,
    saltsBreakdown,
    acidType,
    acidMode,
    acidStrengthKind,
    acidStrengthValue,
    acidAmountMl,
    acidAmountGrams
  };
}
function parseRecipeWaterHubSummaryResponse(x) {
  const root = x ?? {};
  if (!root || typeof root !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse");
  if (root["ok"] !== true) throw new Error("Invalid RecipeWaterHubSummaryResponse.ok");
  const s = root["summary"];
  if (!s || typeof s !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary");
  const version = s["version"] === 1 ? 1 : null;
  if (version === null) throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.version");
  const status = s["status"] ?? null;
  if (!status || typeof status !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.status");
  const statusObj = status;
  const mashOverallSnapshot = (() => {
    const v = statusObj["mashOverallSnapshot"];
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v;
    const ph = o["ph"];
    const kind = ph?.["kind"] === "target" || ph?.["kind"] === "estimated" ? ph["kind"] : null;
    const value = isFiniteNumber(ph?.["value"]) ? ph["value"] : null;
    const finalAlk = isFiniteNumber(o["finalAlkalinityPpmCaCO3"]) ? o["finalAlkalinityPpmCaCO3"] : null;
    if (!kind || value === null || finalAlk === null) return null;
    return { ph: { kind, value }, finalAlkalinityPpmCaCO3: finalAlk };
  })();
  const sObj = s;
  const streams = Array.isArray(sObj["streams"]) ? sObj["streams"].map(parseStream).filter(Boolean) : [];
  const merged = sObj["merged"] ?? null;
  if (!merged || typeof merged !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.merged");
  const mergedIons = parseIonProfilePpm(merged["ionsPpm"]);
  const mergedPh = merged["ph"] === null ? null : isFiniteNumber(merged["ph"]) ? merged["ph"] : null;
  const mergedFinalAlk = merged["finalAlkalinityPpmCaCO3"] === null ? null : isFiniteNumber(merged["finalAlkalinityPpmCaCO3"]) ? merged["finalAlkalinityPpmCaCO3"] : null;
  const totalVolumeLiters = isFiniteNumber(merged["totalVolumeLiters"]) ? merged["totalVolumeLiters"] : 0;
  const finalRecap = sObj["finalRecap"] ?? null;
  if (!finalRecap || typeof finalRecap !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.finalRecap");
  const predictedMashPh = (() => {
    const v = finalRecap["predictedMashPh"];
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v;
    const kind = o["kind"] === "target" || o["kind"] === "estimated" ? o["kind"] : null;
    const value = isFiniteNumber(o["value"]) ? o["value"] : null;
    if (!kind || value === null) return null;
    return { kind, value };
  })();
  const formatHints = root["formatHints"] && typeof root["formatHints"] === "object" && !Array.isArray(root["formatHints"]) ? root["formatHints"] : void 0;
  return {
    ok: true,
    summary: {
      version,
      status: {
        mashAcidificationMode: typeof statusObj["mashAcidificationMode"] === "string" ? statusObj["mashAcidificationMode"] : null,
        spargeAcidificationMode: typeof statusObj["spargeAcidificationMode"] === "string" ? statusObj["spargeAcidificationMode"] : null,
        boilAcidificationMode: typeof statusObj["boilAcidificationMode"] === "string" ? statusObj["boilAcidificationMode"] : null,
        mashLastCalculatedAt: typeof statusObj["mashLastCalculatedAt"] === "string" ? statusObj["mashLastCalculatedAt"] : null,
        spargeLastCalculatedAt: typeof statusObj["spargeLastCalculatedAt"] === "string" ? statusObj["spargeLastCalculatedAt"] : null,
        boilLastCalculatedAt: typeof statusObj["boilLastCalculatedAt"] === "string" ? statusObj["boilLastCalculatedAt"] : null,
        mashOverallSnapshot
      },
      streams,
      merged: {
        totalVolumeLiters,
        ph: mergedPh,
        finalAlkalinityPpmCaCO3: mergedFinalAlk,
        ionsPpm: mergedIons
      },
      finalRecap: {
        predictedMashPh,
        residualAlkalinityMashOverallPpmCaCO3: isFiniteNumber(finalRecap["residualAlkalinityMashOverallPpmCaCO3"]) ? finalRecap["residualAlkalinityMashOverallPpmCaCO3"] : finalRecap["residualAlkalinityMashOverallPpmCaCO3"] === null ? null : null,
        residualAlkalinityMergedPpmCaCO3: isFiniteNumber(finalRecap["residualAlkalinityMergedPpmCaCO3"]) ? finalRecap["residualAlkalinityMergedPpmCaCO3"] : finalRecap["residualAlkalinityMergedPpmCaCO3"] === null ? null : null,
        styleExpectedRa: parseExpectedRaRange(finalRecap["styleExpectedRa"])
      }
    },
    formatHints
  };
}

// src/water/waterProfile.ts
function isString(v) {
  return typeof v === "string";
}
function isNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
var SCOPES = ["system", "account", "public"];
var TYPES = ["water", "dilution"];
var VERIFICATION_STATUSES = ["verified", "unverified"];
function parseWaterProfile(v) {
  if (!isObject(v)) throw new Error("Invalid WaterProfile: expected object");
  const id = isString(v["id"]) ? v["id"] : "";
  const key = isString(v["key"]) ? v["key"] : "";
  const scope = isString(v["scope"]) && SCOPES.includes(v["scope"]) ? v["scope"] : "system";
  const type = isString(v["type"]) && TYPES.includes(v["type"]) ? v["type"] : "water";
  const workspaceId = v["workspaceId"] === null ? null : isString(v["workspaceId"]) ? v["workspaceId"] : v["accountId"] === null ? null : isString(v["accountId"]) ? v["accountId"] : null;
  const name = isString(v["name"]) ? v["name"] : "";
  const ph = v["ph"] === null || v["ph"] === void 0 ? void 0 : isNumber(v["ph"]) ? v["ph"] : void 0;
  const calcium = isNumber(v["calcium"]) ? v["calcium"] : 0;
  const magnesium = isNumber(v["magnesium"]) ? v["magnesium"] : 0;
  const sodium = isNumber(v["sodium"]) ? v["sodium"] : 0;
  const sulfate = isNumber(v["sulfate"]) ? v["sulfate"] : 0;
  const chloride = isNumber(v["chloride"]) ? v["chloride"] : 0;
  const bicarbonate = isNumber(v["bicarbonate"]) ? v["bicarbonate"] : 0;
  const verificationStatus = isString(v["verificationStatus"]) && VERIFICATION_STATUSES.includes(v["verificationStatus"]) ? v["verificationStatus"] : "unverified";
  const source = isString(v["source"]) ? v["source"] : "";
  if (!id || !key || !name) throw new Error("Invalid WaterProfile: id, key, name required");
  return {
    id,
    key,
    scope,
    type,
    workspaceId,
    name,
    ph,
    calcium,
    magnesium,
    sodium,
    sulfate,
    chloride,
    bicarbonate,
    verificationStatus,
    source
  };
}
function parseWaterProfileItem(payload) {
  return parseWaterProfile(payload);
}
function parseArray(v, parse) {
  if (!Array.isArray(v)) throw new Error("Expected array");
  return v.map((x, i) => {
    try {
      return parse(x);
    } catch (e) {
      throw new Error("Invalid array item[" + i + "]: " + (e instanceof Error ? e.message : String(e)));
    }
  });
}
function parseWaterProfilesResponse(payload) {
  if (!isObject(payload)) throw new Error("Invalid WaterProfilesResponse: expected object");
  if (payload["ok"] !== true) throw new Error("Invalid WaterProfilesResponse: ok must be true");
  const system = parseArray(payload["system"], parseWaterProfile);
  const publicProfiles = parseArray(payload["public"], parseWaterProfile);
  const workspaceRaw = Array.isArray(payload["workspace"]) ? payload["workspace"] : Array.isArray(payload["account"]) ? payload["account"] : null;
  if (!workspaceRaw) throw new Error("Invalid WaterProfilesResponse: workspace must be array");
  const workspace = parseArray(workspaceRaw, parseWaterProfile);
  return { ok: true, system, public: publicProfiles, workspace };
}

// src/water/parseComputeAndSaveDerivation.ts
function isFiniteNumber2(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject2(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseIonProfilePpm2(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const keys = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) {
    if (!isFiniteNumber2(v[k])) throw new Error(`Invalid ${label}.${String(k)}`);
  }
  return {
    calcium: v["calcium"],
    magnesium: v["magnesium"],
    sodium: v["sodium"],
    sulfate: v["sulfate"],
    chloride: v["chloride"],
    bicarbonate: v["bicarbonate"]
  };
}
function parseDerivationValue(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  if (v["kind"] === "number") {
    if (!isFiniteNumber2(v["value"])) throw new Error(`Invalid ${label}.value`);
    const unit = typeof v["unit"] === "string" ? v["unit"] : void 0;
    return unit ? { kind: "number", value: v["value"], unit } : { kind: "number", value: v["value"] };
  }
  if (v["kind"] === "string") {
    if (typeof v["value"] !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: v["value"] };
  }
  if (v["kind"] === "boolean") {
    if (typeof v["value"] !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: v["value"] };
  }
  if (v["kind"] === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}
function parseDerivationLine(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const id = typeof v["id"] === "string" ? v["id"] : "";
  if (!id) throw new Error(`Invalid ${label}.id`);
  return { id, value: parseDerivationValue(v["value"], `${label}.value`) };
}
function parseDerivation(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const kind = typeof v["kind"] === "string" ? v["kind"] : "";
  if (!kind) throw new Error(`Invalid ${label}.kind`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const formulaId = typeof v["formulaId"] === "string" ? v["formulaId"] : "";
  if (!formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const inputs = Array.isArray(v["inputs"]) ? v["inputs"].map((x, i) => parseDerivationLine(x, `${label}.inputs[${i}]`)) : [];
  const intermediates = Array.isArray(v["intermediates"]) ? v["intermediates"].map((x, i) => parseDerivationLine(x, `${label}.intermediates[${i}]`)) : [];
  const breakdowns = Array.isArray(v["breakdowns"]) ? v["breakdowns"].filter(
    (b) => isObject2(b) && typeof b["id"] === "string" && Array.isArray(b["rows"])
  ).map((b) => ({
    id: b["id"],
    rows: b["rows"].filter(
      (r) => isObject2(r)
    )
  })) : void 0;
  const notes = Array.isArray(v["notes"]) ? v["notes"].filter((n) => typeof n === "string") : void 0;
  return {
    kind,
    version: 1,
    formulaId,
    inputs,
    intermediates,
    breakdowns,
    notes
  };
}

// src/water/parseComputeAndSaveResultParsers.ts
function isFiniteNumber3(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject3(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseSettingsSavedRef(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const recipeId = typeof v["recipeId"] === "string" ? v["recipeId"] : "";
  if (!recipeId) throw new Error(`Invalid ${label}.recipeId`);
  return { recipeId };
}
function parseSaltAdditionsResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const baseProfile = parseIonProfilePpm2(v["baseProfile"], `${label}.baseProfile`);
  const resultingProfile = parseIonProfilePpm2(v["resultingProfile"], `${label}.resultingProfile`);
  const deltasPpm = parseIonProfilePpm2(v["deltasPpm"], `${label}.deltasPpm`);
  const breakdown = Array.isArray(v["breakdown"]) ? v["breakdown"].filter(
    (r) => isObject3(r) && typeof r["saltKey"] === "string" && isFiniteNumber3(r["grams"])
  ).map((r) => ({
    saltKey: r["saltKey"],
    grams: r["grams"],
    deltasPpm: isObject3(r["deltasPpm"]) ? r["deltasPpm"] : {}
  })) : [];
  return { baseProfile, resultingProfile, deltasPpm, breakdown };
}
function parseAcidificationResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber3(v["finalAlkalinityPpmCaCO3"]) ? v["finalAlkalinityPpmCaCO3"] : NaN;
  const sulfateAddedPpm = isFiniteNumber3(v["sulfateAddedPpm"]) ? v["sulfateAddedPpm"] : NaN;
  const chlorideAddedPpm = isFiniteNumber3(v["chlorideAddedPpm"]) ? v["chlorideAddedPpm"] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  if (!Number.isFinite(sulfateAddedPpm)) throw new Error(`Invalid ${label}.sulfateAddedPpm`);
  if (!Number.isFinite(chlorideAddedPpm)) throw new Error(`Invalid ${label}.chlorideAddedPpm`);
  return {
    acidRequiredMl: v["acidRequiredMl"] === null ? null : isFiniteNumber3(v["acidRequiredMl"]) ? v["acidRequiredMl"] : null,
    acidRequiredTsp: v["acidRequiredTsp"] === null ? null : isFiniteNumber3(v["acidRequiredTsp"]) ? v["acidRequiredTsp"] : null,
    acidRequiredGrams: v["acidRequiredGrams"] === null ? null : isFiniteNumber3(v["acidRequiredGrams"]) ? v["acidRequiredGrams"] : null,
    acidRequiredKg: v["acidRequiredKg"] === null ? null : isFiniteNumber3(v["acidRequiredKg"]) ? v["acidRequiredKg"] : null,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: isObject3(v["debug"]) ? v["debug"] : void 0
  };
}
function parseAcidificationManualResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const achievedPh = isFiniteNumber3(v["achievedPh"]) ? v["achievedPh"] : NaN;
  if (!Number.isFinite(achievedPh)) throw new Error(`Invalid ${label}.achievedPh`);
  const clamped = v["clamped"] === "none" || v["clamped"] === "low" || v["clamped"] === "high" ? v["clamped"] : "none";
  const iterations = isFiniteNumber3(v["iterations"]) ? v["iterations"] : 0;
  const targetAmount = isFiniteNumber3(v["targetAmount"]) ? v["targetAmount"] : NaN;
  const predictedAmount = isFiniteNumber3(v["predictedAmount"]) ? v["predictedAmount"] : NaN;
  return {
    achievedPh,
    predicted: parseAcidificationResult(v["predicted"], `${label}.predicted`),
    clamped,
    iterations,
    targetAmount,
    predictedAmount
  };
}
function parseMashTargetMashPhResult(v, label) {
  const base = parseAcidificationResult(v, label);
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const estimatedMashPhRoomTemp = isFiniteNumber3(v["estimatedMashPhRoomTemp"]) ? v["estimatedMashPhRoomTemp"] : NaN;
  if (!Number.isFinite(estimatedMashPhRoomTemp)) throw new Error(`Invalid ${label}.estimatedMashPhRoomTemp`);
  return { ...base, estimatedMashPhRoomTemp };
}
function parseOverallResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const calculatedAt = typeof v["calculatedAt"] === "string" ? v["calculatedAt"] : "";
  if (!calculatedAt) throw new Error(`Invalid ${label}.calculatedAt`);
  const ionsPpm = parseIonProfilePpm2(v["ionsPpm"], `${label}.ionsPpm`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber3(v["finalAlkalinityPpmCaCO3"]) ? v["finalAlkalinityPpmCaCO3"] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  const ph = isObject3(v["ph"]) ? v["ph"] : null;
  const kind = ph?.["kind"] === "target" || ph?.["kind"] === "estimated" ? ph["kind"] : null;
  const value = isFiniteNumber3(ph?.["value"]) ? ph["value"] : null;
  if (!kind || value === null) throw new Error(`Invalid ${label}.ph`);
  return {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3,
    ph: { kind, value },
    debug: isObject3(v["debug"]) ? v["debug"] : void 0
  };
}

// src/water/parseComputeAndSaveAcidBlocks.ts
function isFiniteNumber4(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject4(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseMashAcidBlock(v, label) {
  if (!isObject4(v)) throw new Error(`Invalid ${label}`);
  const kind = v["kind"];
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "mash_acidification_target_mash_ph") {
    return {
      kind,
      mode: "targetPh",
      result: parseMashTargetMashPhResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "mash_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseSpargeAcidBlock(v, label) {
  if (!isObject4(v)) throw new Error(`Invalid ${label}`);
  const kind = v["kind"];
  if (kind === "sparge_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "sparge_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseBoilAcidBlock(v, label) {
  if (!isObject4(v)) throw new Error(`Invalid ${label}`);
  const kind = v["kind"];
  if (kind === "boil_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "boil_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseNumberFormatHintV1(v, label) {
  if (!isObject4(v)) throw new Error(`Invalid ${label}`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v["style"] === "fixed" || v["style"] === "significant" ? v["style"] : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber4(v["decimals"]) ? v["decimals"] : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unitRaw = typeof v["unit"] === "string" ? v["unit"] : void 0;
  const clamp = isObject4(v["clamp"]) ? {
    min: isFiniteNumber4(v["clamp"]["min"]) ? v["clamp"]["min"] : void 0,
    max: isFiniteNumber4(v["clamp"]["max"]) ? v["clamp"]["max"] : void 0
  } : void 0;
  return { version: 1, style, decimals, unit: unitRaw, clamp };
}
function parseFormatHints(root) {
  const hintsOut = {};
  const h = root["formatHints"];
  if (isObject4(h)) {
    for (const [k, val] of Object.entries(h)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(val, `formatHints.${k}`);
      } catch {
      }
    }
  }
  return hintsOut;
}

// src/water/parseComputeAndSaveMash.ts
function isObject5(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseMashComputeAndSaveResponse(x) {
  if (!isObject5(x)) throw new Error("Invalid MashComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid MashComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid MashComputeAndSaveResponseV1.version");
  const salts = isObject5(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const overall = isObject5(x["overall"]) ? x["overall"] : {};
  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x["settings"], "MashComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts["result"], "MashComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts["derivation"], "MashComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseMashAcidBlock(acid, "MashComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall["result"], "MashComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall["derivation"], "MashComputeAndSaveResponseV1.overall.derivation")
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}

// src/water/parseComputeAndSaveSpargeBoil.ts
function isObject6(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseSpargeComputeAndSaveResponse(x) {
  if (!isObject6(x)) throw new Error("Invalid SpargeComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid SpargeComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid SpargeComputeAndSaveResponseV1.version");
  const salts = isObject6(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x["settings"], "SpargeComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts["result"], "SpargeComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts["derivation"], "SpargeComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseSpargeAcidBlock(acid, "SpargeComputeAndSaveResponseV1.acid"),
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}
function parseBoilComputeAndSaveResponse(x) {
  if (!isObject6(x)) throw new Error("Invalid BoilComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid BoilComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid BoilComputeAndSaveResponseV1.version");
  const salts = isObject6(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const overall = isObject6(x["overall"]) ? x["overall"] : {};
  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x["settings"], "BoilComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts["result"], "BoilComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts["derivation"], "BoilComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseBoilAcidBlock(acid, "BoilComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall["result"], "BoilComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall["derivation"], "BoilComputeAndSaveResponseV1.overall.derivation")
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}

// src/water/routeSchemas.ts
var import_zod7 = require("zod");
var recordBody = import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown());
var recordResult = import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown());
var RecipeWaterHubSummaryResponseSchema = import_zod7.z.custom(
  (data) => {
    try {
      parseRecipeWaterHubSummaryResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid recipe water hub summary response" }
);
var WaterProfilesListResponseSchema = import_zod7.z.custom(
  (data) => {
    try {
      parseWaterProfilesResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid water profiles list response" }
);
var WaterProfileItemSchema = import_zod7.z.custom(
  (data) => {
    try {
      parseWaterProfileItem(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid water profile" }
);
var WaterProfileResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  profile: WaterProfileItemSchema
});
var ionField = import_zod7.z.union([import_zod7.z.number(), import_zod7.z.string(), import_zod7.z.null()]).optional();
var WaterProfileCreateRequestSchema = import_zod7.z.object({
  scope: import_zod7.z.enum(["system", "account", "public"]).optional(),
  type: import_zod7.z.enum(["water", "dilution"]).optional(),
  name: import_zod7.z.string().optional(),
  ph: ionField,
  calcium: ionField,
  magnesium: ionField,
  sodium: ionField,
  sulfate: ionField,
  chloride: ionField,
  bicarbonate: ionField
});
var WaterProfilePatchRequestSchema = WaterProfileCreateRequestSchema.extend({
  verificationStatus: import_zod7.z.enum(["verified", "unverified"]).optional()
});
var RecipeWaterSettingsPayloadSchema = import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown());
var RecipeWaterSettingsGetResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  settings: RecipeWaterSettingsPayloadSchema.nullable()
});
var RecipeWaterSettingsPutRequestSchema = import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown());
var RecipeWaterSettingsPutResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  settings: RecipeWaterSettingsPayloadSchema
});
var emptyObjectBody = (schema) => import_zod7.z.preprocess((raw) => raw === null || raw === void 0 ? {} : raw, schema);
var MashComputeAndSaveRequestSchema = emptyObjectBody(import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown()));
var MashComputeAndSaveResponseSchema = import_zod7.z.custom(
  (data) => {
    try {
      parseMashComputeAndSaveResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid mash compute-and-save response" }
);
var SpargeComputeAndSaveRequestSchema = emptyObjectBody(import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown()));
var SpargeComputeAndSaveResponseSchema = import_zod7.z.custom(
  (data) => {
    try {
      parseSpargeComputeAndSaveResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid sparge compute-and-save response" }
);
var BoilComputeAndSaveRequestSchema = emptyObjectBody(import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown()));
var BoilComputeAndSaveResponseSchema = import_zod7.z.custom(
  (data) => {
    try {
      parseBoilComputeAndSaveResponse(data);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid boil compute-and-save response" }
);
var WaterCalcRequestSchema = recordBody;
var WaterCalcWithDerivationResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  result: recordResult,
  derivation: recordResult
});
var WaterCalcResultOnlyResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  result: recordResult
});

// src/analysis/parseGravityAnalysis.ts
function isFiniteNumber5(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject7(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseCanonicalModels(v) {
  const o = isObject7(v) ? v : null;
  const ibu = o?.["ibu"] === "tinseth" || o?.["ibu"] === "rager" ? o["ibu"] : "tinseth";
  const srm = o?.["srm"] === "morey" || o?.["srm"] === "daniels" ? o["srm"] : "morey";
  return { ibu, srm };
}
function parseNumberFormatHintV12(v, label) {
  if (!isObject7(v)) throw new Error(`Invalid ${label}`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v["style"] === "fixed" || v["style"] === "significant" ? v["style"] : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber5(v["decimals"]) ? v["decimals"] : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unit = typeof v["unit"] === "string" ? v["unit"] : void 0;
  const clamp = isObject7(v["clamp"]) ? {
    min: isFiniteNumber5(v["clamp"]["min"]) ? v["clamp"]["min"] : void 0,
    max: isFiniteNumber5(v["clamp"]["max"]) ? v["clamp"]["max"] : void 0
  } : void 0;
  return { version: 1, style, decimals, unit, clamp };
}
function parseDerivationLineValue(v, label) {
  if (!isObject7(v)) throw new Error(`Invalid ${label}`);
  if (v["kind"] === "number") {
    if (!isFiniteNumber5(v["value"])) throw new Error(`Invalid ${label}.value`);
    const unit = typeof v["unit"] === "string" ? v["unit"] : void 0;
    return unit ? { kind: "number", value: v["value"], unit } : { kind: "number", value: v["value"] };
  }
  if (v["kind"] === "string") {
    if (typeof v["value"] !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: v["value"] };
  }
  if (v["kind"] === "boolean") {
    if (typeof v["value"] !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: v["value"] };
  }
  if (v["kind"] === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}
function parseDerivation2(v, label) {
  if (!isObject7(v)) throw new Error(`Invalid ${label}`);
  if (typeof v["kind"] !== "string" || !v["kind"]) throw new Error(`Invalid ${label}.kind`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  if (typeof v["formulaId"] !== "string" || !v["formulaId"]) throw new Error(`Invalid ${label}.formulaId`);
  const parseLine = (x, i, base) => {
    if (!isObject7(x)) throw new Error(`Invalid ${base}[${i}]`);
    if (typeof x["id"] !== "string" || !x["id"]) throw new Error(`Invalid ${base}[${i}].id`);
    return { id: x["id"], value: parseDerivationLineValue(x["value"], `${base}[${i}].value`) };
  };
  const inputs = Array.isArray(v["inputs"]) ? v["inputs"].map((x, i) => parseLine(x, i, `${label}.inputs`)) : [];
  const intermediates = Array.isArray(v["intermediates"]) ? v["intermediates"].map((x, i) => parseLine(x, i, `${label}.intermediates`)) : [];
  return {
    kind: v["kind"],
    version: 1,
    formulaId: v["formulaId"],
    inputs,
    intermediates,
    breakdowns: Array.isArray(v["breakdowns"]) ? v["breakdowns"] : void 0,
    notes: Array.isArray(v["notes"]) ? v["notes"].filter((n) => typeof n === "string") : void 0
  };
}
function parseGravityAnalysisResponseV1(x) {
  if (!isObject7(x)) throw new Error("Invalid GravityAnalysisResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid GravityAnalysisResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid GravityAnalysisResponseV1.version");
  const canonicalModels = parseCanonicalModels(x["canonicalModels"]);
  if (!isObject7(x["result"])) throw new Error("Invalid GravityAnalysisResponseV1.result");
  const r = x["result"];
  const warningsRaw = Array.isArray(r["warnings"]) ? r["warnings"] : [];
  const warnings = warningsRaw.map((w) => isObject7(w) && typeof w["code"] === "string" ? w["code"] : "").filter((c) => Boolean(c)).map((code) => ({ code }));
  const result = {
    boilTimeMinutes: r["boilTimeMinutes"] === null ? null : isFiniteNumber5(r["boilTimeMinutes"]) ? r["boilTimeMinutes"] : null,
    kettleVolumeLiters: r["kettleVolumeLiters"] === null ? null : isFiniteNumber5(r["kettleVolumeLiters"]) ? r["kettleVolumeLiters"] : null,
    preBoilVolumeLiters: r["preBoilVolumeLiters"] === null ? null : isFiniteNumber5(r["preBoilVolumeLiters"]) ? r["preBoilVolumeLiters"] : null,
    ogEstimatedSg: r["ogEstimatedSg"] === null ? null : isFiniteNumber5(r["ogEstimatedSg"]) ? r["ogEstimatedSg"] : null,
    pbgEstimatedSg: r["pbgEstimatedSg"] === null ? null : isFiniteNumber5(r["pbgEstimatedSg"]) ? r["pbgEstimatedSg"] : null,
    ibuTinsethEstimated: r["ibuTinsethEstimated"] === null ? null : isFiniteNumber5(r["ibuTinsethEstimated"]) ? r["ibuTinsethEstimated"] : null,
    ibuRagerEstimated: r["ibuRagerEstimated"] === null ? null : isFiniteNumber5(r["ibuRagerEstimated"]) ? r["ibuRagerEstimated"] : null,
    buGuRatio: r["buGuRatio"] === null ? null : isFiniteNumber5(r["buGuRatio"]) ? r["buGuRatio"] : null,
    colorSrmMoreyEstimated: r["colorSrmMoreyEstimated"] === null ? null : isFiniteNumber5(r["colorSrmMoreyEstimated"]) ? r["colorSrmMoreyEstimated"] : null,
    colorSrmDanielsEstimated: r["colorSrmDanielsEstimated"] === null ? null : isFiniteNumber5(r["colorSrmDanielsEstimated"]) ? r["colorSrmDanielsEstimated"] : null,
    fgEstimatedSg: r["fgEstimatedSg"] === null ? null : isFiniteNumber5(r["fgEstimatedSg"]) ? r["fgEstimatedSg"] : null,
    abvEstimatedPercent: r["abvEstimatedPercent"] === null ? null : isFiniteNumber5(r["abvEstimatedPercent"]) ? r["abvEstimatedPercent"] : null,
    attenuationEffectivePercent: r["attenuationEffectivePercent"] === null ? null : isFiniteNumber5(r["attenuationEffectivePercent"]) ? r["attenuationEffectivePercent"] : null,
    warnings
  };
  const derivationsOut = {};
  if (isObject7(x["derivations"])) {
    for (const [k, val] of Object.entries(x["derivations"])) {
      try {
        derivationsOut[k] = parseDerivation2(val, `GravityAnalysisResponseV1.derivations.${k}`);
      } catch {
      }
    }
  }
  const hintsOut = {};
  if (isObject7(x["formatHints"])) {
    for (const [k, val] of Object.entries(x["formatHints"])) {
      try {
        hintsOut[k] = parseNumberFormatHintV12(val, `GravityAnalysisResponseV1.formatHints.${k}`);
      } catch {
      }
    }
  }
  return {
    ok: true,
    version: 1,
    canonicalModels,
    result,
    derivations: derivationsOut,
    formatHints: hintsOut
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BeerJsonExportResponseSchema,
  BeerStyleSchema,
  BoilComputeAndSaveRequestSchema,
  BoilComputeAndSaveResponseSchema,
  BrewSessionCreateResponseSchema,
  BrewSessionDetailResponseSchema,
  BrewSessionIdParamsSchema,
  BrewSessionLogSchema,
  BrewSessionPatchRequestSchema,
  BrewSessionPayloadSchema,
  BrewSessionRecipeRefSchema,
  BrewSessionStepLogRequestSchema,
  BrewSessionStepParamsSchema,
  BrewSessionStepResponseSchema,
  BrewSessionStepSchema,
  BrewSessionStepTimerPatchRequestSchema,
  BrewSessionStepsPatchRequestSchema,
  BrewSessionStepsResponseSchema,
  BrewSessionStopRequestSchema,
  BrewSessionsListResponseSchema,
  BrewdaySettingsPatchRequestSchema,
  BrewdaySettingsPayloadSchema,
  BrewdaySettingsResponseSchema,
  CONTRACT_VERSION,
  EquipmentProfileCreateRequestSchema,
  EquipmentProfilePatchRequestSchema,
  EquipmentProfilePayloadSchema,
  EquipmentProfileResponseSchema,
  EquipmentProfilesListResponseSchema,
  FermentableItemSchema,
  FermentablesListResponseSchema,
  HopItemSchema,
  HopsListResponseSchema,
  IdParamsSchema,
  IngredientSyncResponseSchema,
  IngredientSyncResultSchema,
  IngredientSyncRunSchema,
  IngredientSyncRunsResponseSchema,
  IngredientsSearchQuerySchema,
  IntegrationAttachRequestSchema,
  IntegrationAttachResponseSchema,
  IntegrationAttachmentDeviceSchema,
  IntegrationAttachmentSchema,
  IntegrationAttachmentsResponseSchema,
  IntegrationDetachRequestSchema,
  IntegrationDetachResponseSchema,
  IntegrationReadingSchema,
  IntegrationReadingsQuerySchema,
  IntegrationReadingsResponseSchema,
  InventoryCategoryQuerySchema,
  InventoryCreateRequestSchema,
  InventoryItemPayloadSchema,
  InventoryItemResponseSchema,
  InventoryListResponseSchema,
  InventoryPatchRequestSchema,
  MashComputeAndSaveRequestSchema,
  MashComputeAndSaveResponseSchema,
  OkResponseSchema,
  RecipeBulkImportCreatedItemSchema,
  RecipeBulkImportFailedItemSchema,
  RecipeBulkImportPreviewItemSchema,
  RecipeBulkImportPreviewResponseSchema,
  RecipeBulkImportRequestSchema,
  RecipeBulkImportResponseSchema,
  RecipeCreateRequestSchema,
  RecipeIdParamsSchema,
  RecipeImportFormatSchema,
  RecipeImportPreviewPayloadSchema,
  RecipeImportPreviewResponseSchema,
  RecipeImportRequestSchema,
  RecipeImportResponseSchema,
  RecipeImportWarningSchema,
  RecipeListResponseSchema,
  RecipePatchRequestSchema,
  RecipePayloadSchema,
  RecipeResponseSchema,
  RecipeVersionsResponseSchema,
  RecipeWaterHubSummaryResponseSchema,
  RecipeWaterSettingsGetResponseSchema,
  RecipeWaterSettingsPayloadSchema,
  RecipeWaterSettingsPutRequestSchema,
  RecipeWaterSettingsPutResponseSchema,
  RecipesListResponseSchema,
  SpargeComputeAndSaveRequestSchema,
  SpargeComputeAndSaveResponseSchema,
  StylesListResponseSchema,
  WaterCalcRequestSchema,
  WaterCalcResultOnlyResponseSchema,
  WaterCalcWithDerivationResponseSchema,
  WaterProfileCreateRequestSchema,
  WaterProfileItemSchema,
  WaterProfilePatchRequestSchema,
  WaterProfileResponseSchema,
  WaterProfilesListResponseSchema,
  YeastItemSchema,
  YeastsListResponseSchema,
  classifyContractVersionSkew,
  isoDateTime,
  parseBoilComputeAndSaveResponse,
  parseBrewSessionCreateResponse,
  parseBrewSessionsListResponse,
  parseGravityAnalysisResponseV1,
  parseMashComputeAndSaveResponse,
  parseRecipeWaterHubSummaryResponse,
  parseRecipesListResponse,
  parseSemVer,
  parseSpargeComputeAndSaveResponse,
  parseWaterProfileItem,
  parseWaterProfilesResponse
});
