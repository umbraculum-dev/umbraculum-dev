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
import { z } from "zod";
var isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());
var OkResponseSchema = z.object({
  ok: z.literal(true)
});
var IdParamsSchema = z.object({
  id: z.string().min(1, "id required")
});
var InventoryCategoryQuerySchema = z.object({
  category: z.string().optional()
});
var BeerStyleSchema = z.object({
  key: z.string(),
  name: z.string(),
  source: z.string(),
  /** Style guide revision label (e.g. `"2021"`, `"v1"`) — stored as text in `beer_styles.version`. */
  version: z.string(),
  code: z.string().nullable(),
  category: z.string().nullable(),
  categoryId: z.string().nullable(),
  sortOrder: z.number()
});
var StylesListResponseSchema = z.object({
  ok: z.literal(true),
  styles: z.array(BeerStyleSchema)
});
var RecipeIdParamsSchema = z.object({
  recipeId: z.string().min(1, "recipeId required")
});
var BrewSessionIdParamsSchema = z.object({
  brewSessionId: z.string().min(1, "brewSessionId required")
});
var BrewSessionStepParamsSchema = z.object({
  brewSessionId: z.string().min(1, "brewSessionId required"),
  stepId: z.string().min(1, "stepId required")
});
var IntegrationReadingsQuerySchema = z.object({
  kind: z.enum(["tilt", "ispindel", "rapt"]),
  limit: z.coerce.number().int().positive().optional()
});

// src/brewery/routeSchemasEquipment.ts
import { z as z2 } from "zod";
var EquipmentProfilePayloadSchema = z2.object({
  id: z2.string(),
  workspaceId: z2.string(),
  name: z2.string(),
  equipment: z2.record(z2.string(), z2.unknown()),
  createdAt: isoDateTime,
  updatedAt: isoDateTime
});
var EquipmentProfilesListResponseSchema = z2.object({
  ok: z2.literal(true),
  profiles: z2.array(EquipmentProfilePayloadSchema)
});
var EquipmentProfileResponseSchema = z2.object({
  ok: z2.literal(true),
  profile: EquipmentProfilePayloadSchema
});
var EquipmentProfileCreateRequestSchema = z2.record(z2.string(), z2.unknown());
var EquipmentProfilePatchRequestSchema = z2.record(z2.string(), z2.unknown());

// src/brewery/routeSchemasInventory.ts
import { z as z3 } from "zod";
var InventoryItemPayloadSchema = z3.object({
  id: z3.string(),
  workspaceId: z3.string(),
  category: z3.string(),
  ingredientId: z3.string().nullable(),
  name: z3.string(),
  quantity: z3.number(),
  unit: z3.string(),
  metadataJson: z3.unknown().nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime
});
var InventoryListResponseSchema = z3.object({
  ok: z3.literal(true),
  items: z3.array(InventoryItemPayloadSchema)
});
var InventoryItemResponseSchema = z3.object({
  ok: z3.literal(true),
  item: InventoryItemPayloadSchema
});
var InventoryCreateRequestSchema = z3.record(z3.string(), z3.unknown());
var InventoryPatchRequestSchema = z3.record(z3.string(), z3.unknown());
var BrewdaySettingsPayloadSchema = z3.record(z3.string(), z3.unknown());
var BrewdaySettingsResponseSchema = z3.object({
  ok: z3.literal(true),
  settings: BrewdaySettingsPayloadSchema.nullable()
});
var BrewdaySettingsPatchRequestSchema = z3.record(z3.string(), z3.unknown());

// src/brewery/routeSchemasRecipes.ts
import { z as z4 } from "zod";
var RecipePayloadSchema = z4.record(z4.string(), z4.unknown());
var RecipeListResponseSchema = z4.object({
  ok: z4.literal(true),
  recipes: z4.array(z4.record(z4.string(), z4.unknown()))
});
var RecipeResponseSchema = z4.object({
  ok: z4.literal(true),
  recipe: RecipePayloadSchema
});
var RecipeCreateRequestSchema = z4.object({
  name: z4.string(),
  styleKey: z4.string().optional(),
  notes: z4.string().nullable().optional(),
  beerJsonRecipeJson: z4.unknown().optional(),
  recipeExtJson: z4.unknown().optional()
});
var RecipePatchRequestSchema = z4.object({
  name: z4.string().optional(),
  styleKey: z4.string().optional(),
  notes: z4.string().optional(),
  beerJsonRecipeJson: z4.unknown().optional(),
  recipeExtJson: z4.unknown().optional()
});
var RecipeVersionsResponseSchema = z4.object({
  ok: z4.literal(true),
  versions: z4.array(z4.record(z4.string(), z4.unknown()))
});
var BeerJsonExportResponseSchema = z4.custom(
  (data) => data instanceof Buffer,
  { message: "Expected binary export body" }
);
var RecipeImportFormatSchema = z4.enum(["beerjson", "beerxml"]);
var RecipeImportWarningSchema = z4.object({
  code: z4.string(),
  message: z4.string()
});
var RecipeImportRequestSchema = z4.object({
  format: RecipeImportFormatSchema,
  content: z4.string().min(1),
  styleKey: z4.string().optional()
});
var RecipeBulkImportRequestSchema = z4.object({
  format: RecipeImportFormatSchema,
  content: z4.string().min(1)
});
var RecipeImportPreviewPayloadSchema = z4.record(z4.string(), z4.unknown());
var RecipeImportPreviewResponseSchema = z4.object({
  ok: z4.literal(true),
  format: RecipeImportFormatSchema,
  preview: RecipeImportPreviewPayloadSchema,
  workspaceId: z4.string()
});
var RecipeImportResponseSchema = z4.object({
  ok: z4.literal(true),
  recipe: RecipePayloadSchema,
  warnings: z4.array(RecipeImportWarningSchema).optional()
});
var RecipeBulkImportPreviewItemSchema = z4.record(z4.string(), z4.unknown());
var RecipeBulkImportPreviewResponseSchema = z4.object({
  ok: z4.literal(true),
  format: RecipeImportFormatSchema,
  previewItems: z4.array(RecipeBulkImportPreviewItemSchema),
  workspaceId: z4.string()
});
var RecipeBulkImportCreatedItemSchema = z4.record(z4.string(), z4.unknown());
var RecipeBulkImportFailedItemSchema = z4.object({
  index: z4.number(),
  name: z4.string(),
  error: z4.string()
});
var RecipeBulkImportResponseSchema = z4.object({
  ok: z4.literal(true),
  created: z4.array(RecipeBulkImportCreatedItemSchema),
  failed: z4.array(RecipeBulkImportFailedItemSchema)
});

// src/brewery/routeSchemasIngredients.ts
import { z as z5 } from "zod";
var IngredientsSearchQuerySchema = z5.object({
  query: z5.string().optional(),
  offset: z5.coerce.number().int().nonnegative().optional(),
  limit: z5.coerce.number().int().positive().optional()
});
var FermentableItemSchema = z5.record(z5.string(), z5.unknown());
var FermentablesListResponseSchema = z5.object({
  ok: z5.literal(true),
  items: z5.array(FermentableItemSchema),
  total: z5.number(),
  offset: z5.number(),
  limit: z5.number()
});
var HopItemSchema = z5.record(z5.string(), z5.unknown());
var HopsListResponseSchema = z5.object({
  ok: z5.literal(true),
  items: z5.array(HopItemSchema),
  total: z5.number(),
  offset: z5.number(),
  limit: z5.number()
});
var YeastItemSchema = z5.record(z5.string(), z5.unknown());
var YeastsListResponseSchema = z5.object({
  ok: z5.literal(true),
  items: z5.array(YeastItemSchema)
});
var IngredientSyncRunSchema = z5.record(z5.string(), z5.unknown());
var IngredientSyncRunsResponseSchema = z5.object({
  ok: z5.literal(true),
  runs: z5.array(IngredientSyncRunSchema)
});
var IngredientSyncResultSchema = z5.record(z5.string(), z5.unknown());
var IngredientSyncResponseSchema = z5.object({
  ok: z5.literal(true),
  result: IngredientSyncResultSchema
});

// src/brewery/listResponses.ts
import { z as z6 } from "zod";
var RecipeListItemSchema = z6.object({
  id: z6.string(),
  accountId: z6.string().optional(),
  name: z6.string(),
  styleKey: z6.string().optional(),
  style: z6.string().nullable().optional(),
  version: z6.number().optional()
});
var RecipesListResponseSchema = z6.object({
  ok: z6.literal(true),
  recipes: z6.array(RecipeListItemSchema)
});
function parseRecipesListResponse(payload) {
  return RecipesListResponseSchema.parse(payload);
}
var isoDateTime2 = z6.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z6.string());
var BrewSessionListItemSchema = z6.object({
  id: z6.string(),
  code: z6.string(),
  status: z6.string(),
  createdAt: isoDateTime2,
  startedAt: z6.preprocess((v) => v instanceof Date ? v.toISOString() : v, z6.string().nullable()).optional(),
  stoppedAt: z6.preprocess((v) => v instanceof Date ? v.toISOString() : v, z6.string().nullable()).optional()
});
var BrewSessionsListResponseSchema = z6.object({
  ok: z6.literal(true),
  brewSessions: z6.array(BrewSessionListItemSchema)
});
function parseBrewSessionsListResponse(payload) {
  return BrewSessionsListResponseSchema.parse(payload);
}
var BrewSessionRecipeRefSchema = z6.object({
  id: z6.string().min(1),
  name: z6.string(),
  version: z6.number().int()
});
var BrewSessionLogSchema = z6.object({
  id: z6.string().min(1),
  brewSessionId: z6.string().min(1),
  kind: z6.string(),
  message: z6.string(),
  createdAt: isoDateTime2,
  stepId: z6.string().nullable(),
  payloadJson: z6.record(z6.string(), z6.unknown()).nullable().optional()
}).passthrough();
var BrewSessionStepSchema = z6.object({
  id: z6.string().min(1),
  brewSessionId: z6.string().min(1),
  name: z6.string(),
  status: z6.string(),
  sortOrder: z6.number().int(),
  sectionId: z6.string(),
  sectionName: z6.string().nullable(),
  createdAt: isoDateTime2,
  updatedAt: isoDateTime2,
  isDisabled: z6.boolean(),
  customTimerEnabled: z6.boolean(),
  note: z6.string().nullable(),
  minutesPlanned: z6.number().nullable(),
  offsetMinutesFromEnd: z6.number().nullable(),
  relativeToStepId: z6.string().nullable(),
  timerAccumulatedSeconds: z6.number(),
  timerLastStartedAt: isoDateTime2.nullable(),
  timerPausedAt: isoDateTime2.nullable(),
  timerStartedAt: isoDateTime2.nullable(),
  timerState: z6.string(),
  timerStoppedAt: isoDateTime2.nullable()
}).passthrough();
var BrewSessionPayloadSchema = z6.object({
  id: z6.string().min(1),
  workspaceId: z6.string().min(1),
  recipeId: z6.string().min(1),
  code: z6.string().nullable(),
  status: z6.string(),
  createdAt: isoDateTime2,
  updatedAt: isoDateTime2,
  startedAt: isoDateTime2.nullable(),
  pausedAt: isoDateTime2.nullable(),
  stoppedAt: isoDateTime2.nullable(),
  scheduledDate: isoDateTime2.nullable(),
  recipe: BrewSessionRecipeRefSchema.optional(),
  steps: z6.array(BrewSessionStepSchema).optional(),
  logs: z6.array(BrewSessionLogSchema).optional()
}).passthrough();
var BrewSessionDetailResponseSchema = z6.object({
  ok: z6.literal(true),
  brewSession: BrewSessionPayloadSchema
});
var BrewSessionCreateResponseSchema = z6.object({
  ok: z6.literal(true),
  brewSession: BrewSessionPayloadSchema,
  steps: z6.array(BrewSessionStepSchema)
});
var BrewSessionStepResponseSchema = z6.object({
  ok: z6.literal(true),
  step: BrewSessionStepSchema
});
var BrewSessionStepsResponseSchema = z6.object({
  ok: z6.literal(true),
  steps: z6.array(BrewSessionStepSchema)
});
var BrewSessionPatchRequestSchema = z6.object({
  scheduledDate: z6.string().nullable().optional()
});
var BrewSessionStepsPatchRequestSchema = z6.object({
  steps: z6.array(z6.record(z6.string(), z6.unknown()))
});
var BrewSessionStepTimerPatchRequestSchema = z6.object({
  customTimerEnabled: z6.boolean()
});
var BrewSessionStopRequestSchema = z6.preprocess(
  (raw) => raw === null || raw === void 0 ? {} : raw,
  z6.object({
    reason: z6.enum(["auto", "manual"]).optional()
  })
);
var BrewSessionStepLogRequestSchema = z6.object({
  status: z6.enum(["pending", "in_progress", "done", "skipped", "not_applicable"]),
  note: z6.string().nullable().optional(),
  name: z6.string().optional(),
  isDisabled: z6.boolean().optional()
});
var IntegrationAttachmentDeviceSchema = z6.record(z6.string(), z6.unknown());
var IntegrationAttachmentSchema = z6.object({
  id: z6.string(),
  attachedAt: isoDateTime2,
  device: IntegrationAttachmentDeviceSchema
});
var IntegrationAttachmentsResponseSchema = z6.object({
  ok: z6.literal(true),
  attachments: z6.array(IntegrationAttachmentSchema)
});
var IntegrationAttachRequestSchema = z6.object({
  kind: z6.enum(["tilt", "ispindel", "rapt"]),
  deviceId: z6.string().min(1)
});
var IntegrationAttachResponseSchema = z6.object({
  ok: z6.literal(true),
  attachment: z6.record(z6.string(), z6.unknown())
});
var IntegrationDetachRequestSchema = z6.object({
  deviceId: z6.string().min(1)
});
var IntegrationDetachResponseSchema = z6.object({
  ok: z6.literal(true),
  detachedCount: z6.number()
});
var IntegrationReadingSchema = z6.record(z6.string(), z6.unknown());
var IntegrationReadingsResponseSchema = z6.object({
  ok: z6.literal(true),
  readings: z6.array(IntegrationReadingSchema)
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
import { z as z7 } from "zod";
var recordBody = z7.record(z7.string(), z7.unknown());
var recordResult = z7.record(z7.string(), z7.unknown());
var RecipeWaterHubSummaryResponseSchema = z7.custom(
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
var WaterProfilesListResponseSchema = z7.custom(
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
var WaterProfileItemSchema = z7.custom(
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
var WaterProfileResponseSchema = z7.object({
  ok: z7.literal(true),
  profile: WaterProfileItemSchema
});
var ionField = z7.union([z7.number(), z7.string(), z7.null()]).optional();
var WaterProfileCreateRequestSchema = z7.object({
  scope: z7.enum(["system", "account", "public"]).optional(),
  type: z7.enum(["water", "dilution"]).optional(),
  name: z7.string().optional(),
  ph: ionField,
  calcium: ionField,
  magnesium: ionField,
  sodium: ionField,
  sulfate: ionField,
  chloride: ionField,
  bicarbonate: ionField
});
var WaterProfilePatchRequestSchema = WaterProfileCreateRequestSchema.extend({
  verificationStatus: z7.enum(["verified", "unverified"]).optional()
});
var RecipeWaterSettingsPayloadSchema = z7.record(z7.string(), z7.unknown());
var RecipeWaterSettingsGetResponseSchema = z7.object({
  ok: z7.literal(true),
  settings: RecipeWaterSettingsPayloadSchema.nullable()
});
var RecipeWaterSettingsPutRequestSchema = z7.record(z7.string(), z7.unknown());
var RecipeWaterSettingsPutResponseSchema = z7.object({
  ok: z7.literal(true),
  settings: RecipeWaterSettingsPayloadSchema
});
var emptyObjectBody = (schema) => z7.preprocess((raw) => raw === null || raw === void 0 ? {} : raw, schema);
var MashComputeAndSaveRequestSchema = emptyObjectBody(z7.record(z7.string(), z7.unknown()));
var MashComputeAndSaveResponseSchema = z7.custom(
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
var SpargeComputeAndSaveRequestSchema = emptyObjectBody(z7.record(z7.string(), z7.unknown()));
var SpargeComputeAndSaveResponseSchema = z7.custom(
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
var BoilComputeAndSaveRequestSchema = emptyObjectBody(z7.record(z7.string(), z7.unknown()));
var BoilComputeAndSaveResponseSchema = z7.custom(
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
var WaterCalcWithDerivationResponseSchema = z7.object({
  ok: z7.literal(true),
  result: recordResult,
  derivation: recordResult
});
var WaterCalcResultOnlyResponseSchema = z7.object({
  ok: z7.literal(true),
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
export {
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
};
