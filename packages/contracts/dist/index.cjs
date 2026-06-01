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
  ActiveWorkspaceContextResponseSchema: () => ActiveWorkspaceContextResponseSchema,
  AdPlacementSchema: () => AdPlacementSchema,
  AdPlatformSchema: () => AdPlatformSchema,
  AdSlotParamsSchema: () => AdSlotParamsSchema,
  AdSlotQuerySchema: () => AdSlotQuerySchema,
  AdSlotResponseSchema: () => AdSlotResponseSchema,
  AiChatRequestBodySchema: () => AiChatRequestBodySchema,
  AiProposalActionResponseSchema: () => AiProposalActionResponseSchema,
  AiProposalDtoSchema: () => AiProposalDtoSchema,
  AiProposalGetResponseSchema: () => AiProposalGetResponseSchema,
  AiProposalIdParamsSchema: () => AiProposalIdParamsSchema,
  AiProposalListResponseSchema: () => AiProposalListResponseSchema,
  AiProposalStatusSchema: () => AiProposalStatusSchema,
  AiProviderSchema: () => AiProviderSchema,
  AiRoleLimitsSchema: () => AiRoleLimitsSchema,
  AiSseAssistantChunkEventSchema: () => AiSseAssistantChunkEventSchema,
  AiSseCompleteEventSchema: () => AiSseCompleteEventSchema,
  AiSseErrorEventSchema: () => AiSseErrorEventSchema,
  AiSseEventSchema: () => AiSseEventSchema,
  AiSseProposalEventSchema: () => AiSseProposalEventSchema,
  AiSseToolCallEventSchema: () => AiSseToolCallEventSchema,
  AiSseToolResultEventSchema: () => AiSseToolResultEventSchema,
  AiToolCallRecordSchema: () => AiToolCallRecordSchema,
  AiUsageByUserSchema: () => AiUsageByUserSchema,
  AiUsageDailyPointSchema: () => AiUsageDailyPointSchema,
  AiUsageLedgerEntrySchema: () => AiUsageLedgerEntrySchema,
  AiUsageMonthlySchema: () => AiUsageMonthlySchema,
  AiUsageRoleAlertSchema: () => AiUsageRoleAlertSchema,
  AiUsageUserAlertSchema: () => AiUsageUserAlertSchema,
  AuthActiveWorkspaceRequestSchema: () => AuthActiveWorkspaceRequestSchema,
  AuthActiveWorkspaceResponseSchema: () => AuthActiveWorkspaceResponseSchema,
  AuthLoginNativeResponseSchema: () => AuthLoginNativeResponseSchema,
  AuthLoginRequestSchema: () => AuthLoginRequestSchema,
  AuthLoginResponseSchema: () => AuthLoginResponseSchema,
  AuthLogoutResponseSchema: () => AuthLogoutResponseSchema,
  AuthMeResponseSchema: () => AuthMeResponseSchema,
  AuthMeResponseUserSchema: () => AuthMeResponseUserSchema,
  AuthMeResponseWorkspaceSchema: () => AuthMeResponseWorkspaceSchema,
  AuthPreferencesPatchRequestSchema: () => AuthPreferencesPatchRequestSchema,
  AuthPreferencesPatchResponseSchema: () => AuthPreferencesPatchResponseSchema,
  AuthSessionUserSchema: () => AuthSessionUserSchema,
  AuthSignupRequestSchema: () => AuthSignupRequestSchema,
  AuthSignupResponseSchema: () => AuthSignupResponseSchema,
  AuthWebviewBridgeQuerySchema: () => AuthWebviewBridgeQuerySchema,
  AuthWebviewExchangeRequestSchema: () => AuthWebviewExchangeRequestSchema,
  AuthWebviewExchangeResponseSchema: () => AuthWebviewExchangeResponseSchema,
  BeerJsonExportResponseSchema: () => BeerJsonExportResponseSchema,
  BeerJsonLooseSchema: () => BeerJsonLooseSchema,
  BeerStyleSchema: () => BeerStyleSchema,
  BillingConfirmRequestSchema: () => BillingConfirmRequestSchema,
  BillingConfirmResponseSchema: () => BillingConfirmResponseSchema,
  BillingIntentRequestSchema: () => BillingIntentRequestSchema,
  BillingIntentResponseSchema: () => BillingIntentResponseSchema,
  BillingPurchaseIntentModeSchema: () => BillingPurchaseIntentModeSchema,
  BillingPurchaseProviderSchema: () => BillingPurchaseProviderSchema,
  BillingTierSchema: () => BillingTierSchema,
  BillingWorkspaceIdParamsSchema: () => BillingWorkspaceIdParamsSchema,
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
  BrewSessionSummarySchema: () => BrewSessionSummarySchema,
  BrewSessionsListResponseSchema: () => BrewSessionsListResponseSchema,
  BrewSessionsRecentQuerySchema: () => BrewSessionsRecentQuerySchema,
  BrewSessionsRecentResponseSchema: () => BrewSessionsRecentResponseSchema,
  BrewdaySettingsPatchRequestSchema: () => BrewdaySettingsPatchRequestSchema,
  BrewdaySettingsPayloadSchema: () => BrewdaySettingsPayloadSchema,
  BrewdaySettingsResponseSchema: () => BrewdaySettingsResponseSchema,
  ContextMeResponseSchema: () => ContextMeResponseSchema,
  CrpProposeScheduleAdjustmentInputSchema: () => CrpProposeScheduleAdjustmentInputSchema,
  CrpProposeScheduleAdjustmentOutputSchema: () => CrpProposeScheduleAdjustmentOutputSchema,
  EquipmentProfileCreateRequestSchema: () => EquipmentProfileCreateRequestSchema,
  EquipmentProfilePatchRequestSchema: () => EquipmentProfilePatchRequestSchema,
  EquipmentProfilePayloadSchema: () => EquipmentProfilePayloadSchema,
  EquipmentProfileResponseSchema: () => EquipmentProfileResponseSchema,
  EquipmentProfilesListResponseSchema: () => EquipmentProfilesListResponseSchema,
  ErrorResponseSchema: () => ErrorResponseSchema,
  FermentableItemSchema: () => FermentableItemSchema,
  FermentablesListResponseSchema: () => FermentablesListResponseSchema,
  HealthResponseSchema: () => HealthResponseSchema,
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
  IntegrationBrewSessionRefSchema: () => IntegrationBrewSessionRefSchema,
  IntegrationCreateResponseSchema: () => IntegrationCreateResponseSchema,
  IntegrationDetachRequestSchema: () => IntegrationDetachRequestSchema,
  IntegrationDetachResponseSchema: () => IntegrationDetachResponseSchema,
  IntegrationDeviceAttachRequestSchema: () => IntegrationDeviceAttachRequestSchema,
  IntegrationDeviceAttachResponseSchema: () => IntegrationDeviceAttachResponseSchema,
  IntegrationDeviceAttachmentSchema: () => IntegrationDeviceAttachmentSchema,
  IntegrationDeviceDetachResponseSchema: () => IntegrationDeviceDetachResponseSchema,
  IntegrationDeviceIdParamsSchema: () => IntegrationDeviceIdParamsSchema,
  IntegrationDeviceReadingSchema: () => IntegrationDeviceReadingSchema,
  IntegrationDeviceSchema: () => IntegrationDeviceSchema,
  IntegrationDevicesListResponseSchema: () => IntegrationDevicesListResponseSchema,
  IntegrationDevicesQuerySchema: () => IntegrationDevicesQuerySchema,
  IntegrationGetResponseSchema: () => IntegrationGetResponseSchema,
  IntegrationKindSchema: () => IntegrationKindSchema,
  IntegrationOkResponseSchema: () => IntegrationOkResponseSchema,
  IntegrationReadingSchema: () => IntegrationReadingSchema,
  IntegrationReadingsQuerySchema: () => IntegrationReadingsQuerySchema,
  IntegrationReadingsResponseSchema: () => IntegrationReadingsResponseSchema,
  IntegrationRevealResponseSchema: () => IntegrationRevealResponseSchema,
  IntegrationSummarySchema: () => IntegrationSummarySchema,
  IntegrationTokenParamsSchema: () => IntegrationTokenParamsSchema,
  IntegrationWorkspaceIdParamsSchema: () => IntegrationWorkspaceIdParamsSchema,
  IntegrationWorkspaceKindParamsSchema: () => IntegrationWorkspaceKindParamsSchema,
  InventoryCategoryQuerySchema: () => InventoryCategoryQuerySchema,
  InventoryCreateRequestSchema: () => InventoryCreateRequestSchema,
  InventoryItemPayloadSchema: () => InventoryItemPayloadSchema,
  InventoryItemResponseSchema: () => InventoryItemResponseSchema,
  InventoryListResponseSchema: () => InventoryListResponseSchema,
  InventoryPatchRequestSchema: () => InventoryPatchRequestSchema,
  MashComputeAndSaveRequestSchema: () => MashComputeAndSaveRequestSchema,
  MashComputeAndSaveResponseSchema: () => MashComputeAndSaveResponseSchema,
  MrpProposeOrderAdjustmentInputSchema: () => MrpProposeOrderAdjustmentInputSchema,
  MrpProposeOrderAdjustmentOutputSchema: () => MrpProposeOrderAdjustmentOutputSchema,
  OkResponseSchema: () => OkResponseSchema,
  PlatformAdCreateRequestSchema: () => PlatformAdCreateRequestSchema,
  PlatformAdCreateResponseSchema: () => PlatformAdCreateResponseSchema,
  PlatformAdIdParamsSchema: () => PlatformAdIdParamsSchema,
  PlatformAdOkResponseSchema: () => PlatformAdOkResponseSchema,
  PlatformAdPatchRequestSchema: () => PlatformAdPatchRequestSchema,
  PlatformAdRowSchema: () => PlatformAdRowSchema,
  PlatformAdminOkResponseSchema: () => PlatformAdminOkResponseSchema,
  PlatformAdsListResponseSchema: () => PlatformAdsListResponseSchema,
  PlatformImportFormatSchema: () => PlatformImportFormatSchema,
  PlatformRecipeBulkImportPreviewItemSchema: () => PlatformRecipeBulkImportPreviewItemSchema,
  PlatformRecipeBulkImportPreviewRequestSchema: () => PlatformRecipeBulkImportPreviewRequestSchema,
  PlatformRecipeBulkImportPreviewResponseSchema: () => PlatformRecipeBulkImportPreviewResponseSchema,
  PlatformRecipeBulkImportRequestSchema: () => PlatformRecipeBulkImportRequestSchema,
  PlatformRecipeBulkImportResponseSchema: () => PlatformRecipeBulkImportResponseSchema,
  PlatformRecipeExportQuerySchema: () => PlatformRecipeExportQuerySchema,
  PlatformRecipeIdParamsSchema: () => PlatformRecipeIdParamsSchema,
  PlatformRecipeImportPreviewRequestSchema: () => PlatformRecipeImportPreviewRequestSchema,
  PlatformRecipeImportPreviewResponseSchema: () => PlatformRecipeImportPreviewResponseSchema,
  PlatformRecipeImportRequestSchema: () => PlatformRecipeImportRequestSchema,
  PlatformRecipeImportResponseSchema: () => PlatformRecipeImportResponseSchema,
  PlatformRecipeSummarySchema: () => PlatformRecipeSummarySchema,
  PlatformRecipesListQuerySchema: () => PlatformRecipesListQuerySchema,
  PlatformRecipesListResponseSchema: () => PlatformRecipesListResponseSchema,
  PlatformWorkspaceRowSchema: () => PlatformWorkspaceRowSchema,
  PlatformWorkspacesListResponseSchema: () => PlatformWorkspacesListResponseSchema,
  PreferredLocaleSchema: () => PreferredLocaleSchema,
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
  RenderDeliverySchema: () => RenderDeliverySchema,
  RenderErrorSchema: () => RenderErrorSchema,
  RenderJobCancelResponseSchema: () => RenderJobCancelResponseSchema,
  RenderJobResultResponseSchema: () => RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema: () => RenderJobStatusResponseSchema,
  RenderJobStatusSchema: () => RenderJobStatusSchema,
  RenderJobSubmitRequestSchema: () => RenderJobSubmitRequestSchema,
  RenderJobSubmitResponseSchema: () => RenderJobSubmitResponseSchema,
  RenderKindSchema: () => RenderKindSchema,
  RenderStatusSchema: () => RenderStatusSchema,
  RenderVisibilitySchema: () => RenderVisibilitySchema,
  ResolvedAdSchema: () => ResolvedAdSchema,
  SafeNextPathSchema: () => SafeNextPathSchema,
  SpargeComputeAndSaveRequestSchema: () => SpargeComputeAndSaveRequestSchema,
  SpargeComputeAndSaveResponseSchema: () => SpargeComputeAndSaveResponseSchema,
  StylesListResponseSchema: () => StylesListResponseSchema,
  TierLimitsSchema: () => TierLimitsSchema,
  TiltIngestBodySchema: () => TiltIngestBodySchema,
  TiltIngestResponseSchema: () => TiltIngestResponseSchema,
  UiDensitySchema: () => UiDensitySchema,
  UiFontScaleSchema: () => UiFontScaleSchema,
  UiThemeSchema: () => UiThemeSchema,
  UpdateWorkspaceAiSettingsRequestSchema: () => UpdateWorkspaceAiSettingsRequestSchema,
  WaterCalcRequestSchema: () => WaterCalcRequestSchema,
  WaterCalcResultOnlyResponseSchema: () => WaterCalcResultOnlyResponseSchema,
  WaterCalcWithDerivationResponseSchema: () => WaterCalcWithDerivationResponseSchema,
  WaterProfileCreateRequestSchema: () => WaterProfileCreateRequestSchema,
  WaterProfileItemSchema: () => WaterProfileItemSchema,
  WaterProfilePatchRequestSchema: () => WaterProfilePatchRequestSchema,
  WaterProfileResponseSchema: () => WaterProfileResponseSchema,
  WaterProfilesListResponseSchema: () => WaterProfilesListResponseSchema,
  WebhookOkResponseSchema: () => WebhookOkResponseSchema,
  WebhookRevenuecatBodySchema: () => WebhookRevenuecatBodySchema,
  WebhookStripeBodySchema: () => WebhookStripeBodySchema,
  WorkspaceAiSettingsParamsSchema: () => WorkspaceAiSettingsParamsSchema,
  WorkspaceAiSettingsResponseSchema: () => WorkspaceAiSettingsResponseSchema,
  WorkspaceAiSettingsSchema: () => WorkspaceAiSettingsSchema,
  WorkspaceAiUsageResponseSchema: () => WorkspaceAiUsageResponseSchema,
  WorkspaceBillingResponseSchema: () => WorkspaceBillingResponseSchema,
  WorkspaceBrandPatchRequestSchema: () => WorkspaceBrandPatchRequestSchema,
  WorkspaceBrandPatchResponseSchema: () => WorkspaceBrandPatchResponseSchema,
  WorkspaceCreateRequestSchema: () => WorkspaceCreateRequestSchema,
  WorkspaceCreateResponseSchema: () => WorkspaceCreateResponseSchema,
  WorkspaceIdParamsSchema: () => WorkspaceIdParamsSchema,
  WorkspaceRowSchema: () => WorkspaceRowSchema,
  WorkspacesListResponseSchema: () => WorkspacesListResponseSchema,
  YeastItemSchema: () => YeastItemSchema,
  YeastsListResponseSchema: () => YeastsListResponseSchema,
  analysisFormatHints: () => analysisFormatHints,
  parseAuthMeResponse: () => parseAuthMeResponse,
  parseBoilComputeAndSaveResponse: () => parseBoilComputeAndSaveResponse,
  parseBrewSessionCreateResponse: () => parseBrewSessionCreateResponse,
  parseBrewSessionsListResponse: () => parseBrewSessionsListResponse,
  parseGravityAnalysisResponseV1: () => parseGravityAnalysisResponseV1,
  parseMashComputeAndSaveResponse: () => parseMashComputeAndSaveResponse,
  parseRecipeWaterHubSummaryResponse: () => parseRecipeWaterHubSummaryResponse,
  parseRecipesListResponse: () => parseRecipesListResponse,
  parseRenderJobStatusResponse: () => parseRenderJobStatusResponse,
  parseRenderJobSubmitRequest: () => parseRenderJobSubmitRequest,
  parseSpargeComputeAndSaveResponse: () => parseSpargeComputeAndSaveResponse,
  parseWaterProfileItem: () => parseWaterProfileItem,
  parseWaterProfilesResponse: () => parseWaterProfilesResponse,
  waterFormatHints: () => waterFormatHints
});
module.exports = __toCommonJS(index_exports);

// src/auth/meResponse.ts
var import_zod = require("zod");
var optionalStringWithNullPreserved = import_zod.z.unknown().transform((v) => {
  if (v === null) return null;
  if (typeof v === "string") return v;
  return void 0;
});
var stringOrNullSoft = import_zod.z.unknown().transform((v) => {
  if (typeof v === "string") return v;
  return null;
});
var optionalBooleanSoft = import_zod.z.unknown().transform((v) => {
  if (typeof v === "boolean") return v;
  return void 0;
});
var AuthMeResponseUserSchema = import_zod.z.object({
  id: import_zod.z.string().min(1, "user.id required"),
  email: import_zod.z.string().min(1, "user.email required"),
  preferredLocale: import_zod.z.unknown().transform((v) => typeof v === "string" ? v : "en").default("en"),
  preferredTheme: optionalStringWithNullPreserved.optional(),
  preferredFontScale: optionalStringWithNullPreserved.optional(),
  preferredDensity: optionalStringWithNullPreserved.optional(),
  isPlatformAdmin: optionalBooleanSoft.optional()
}).transform((u) => ({
  id: u.id,
  email: u.email,
  preferredLocale: u.preferredLocale,
  preferredTheme: u.preferredTheme,
  preferredFontScale: u.preferredFontScale,
  preferredDensity: u.preferredDensity,
  isPlatformAdmin: u.isPlatformAdmin
}));
var AuthMeResponseWorkspaceSchema = import_zod.z.object({
  id: import_zod.z.string().min(1, "workspace.id required"),
  name: import_zod.z.string().min(1, "workspace.name required"),
  role: import_zod.z.string(),
  brandKey: optionalStringWithNullPreserved.optional()
});
var AuthMeResponseSchema = import_zod.z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      return raw;
    }
    const r = raw;
    const workspacesRaw = Array.isArray(r["workspaces"]) ? r["workspaces"] : Array.isArray(r["accounts"]) ? r["accounts"] : r["workspaces"];
    const activeWorkspaceIdRaw = "activeWorkspaceId" in r ? r["activeWorkspaceId"] : r["activeAccountId"];
    return {
      ok: r["ok"],
      user: r["user"],
      workspaces: workspacesRaw,
      activeWorkspaceId: activeWorkspaceIdRaw,
      role: r["role"]
    };
  },
  import_zod.z.object({
    ok: import_zod.z.literal(true, "ok must be true"),
    user: AuthMeResponseUserSchema,
    workspaces: import_zod.z.array(AuthMeResponseWorkspaceSchema, "workspaces must be array"),
    activeWorkspaceId: stringOrNullSoft,
    role: stringOrNullSoft
  })
);
function parseAuthMeResponse(payload) {
  return AuthMeResponseSchema.parse(payload);
}

// src/auth/platformAuth.ts
var import_zod2 = require("zod");
var PreferredLocaleSchema = import_zod2.z.unknown().transform((v) => v === "en" || v === "it" ? v : "en");
var UiThemeSchema = import_zod2.z.unknown().transform((v) => {
  if (v === "default" || v === "hc_dark" || v === "hc_light") return v;
  return "default";
});
var UiFontScaleSchema = import_zod2.z.unknown().transform((v) => {
  if (v === "sm" || v === "md" || v === "lg" || v === "xl") return v;
  return "md";
});
var UiDensitySchema = import_zod2.z.unknown().transform((v) => {
  if (v === "comfortable" || v === "compact") return v;
  return "comfortable";
});
var SafeNextPathSchema = import_zod2.z.preprocess(
  (v) => typeof v === "string" ? v.trim() : v,
  import_zod2.z.string().min(1, "next is required").refine((next) => next.startsWith("/"), "next must start with '/'").refine((next) => !next.startsWith("//"), "next must not start with '//'").refine((next) => !next.includes("://"), "next must be a relative path").refine(
    (next) => next === "/en" || next.startsWith("/en/") || next === "/it" || next.startsWith("/it/"),
    "next must start with '/en' or '/it'"
  )
);
var AuthSessionUserSchema = import_zod2.z.object({
  id: import_zod2.z.string().min(1),
  email: import_zod2.z.string().min(1),
  preferredLocale: PreferredLocaleSchema
});
var AuthSignupRequestSchema = import_zod2.z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return raw;
    const r = raw;
    return {
      email: r["email"],
      password: r["password"],
      preferredLocale: r["preferredLocale"],
      workspaceName: typeof r["workspaceName"] === "string" ? r["workspaceName"] : r["accountName"]
    };
  },
  import_zod2.z.object({
    email: import_zod2.z.string().transform((v) => v.trim().toLowerCase()).pipe(import_zod2.z.string().min(1).includes("@", { message: "Email is required" })),
    password: import_zod2.z.string().min(8, "Password must be at least 8 characters"),
    preferredLocale: PreferredLocaleSchema.optional(),
    workspaceName: import_zod2.z.string().optional()
  })
);
var AuthSignupResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  user: AuthSessionUserSchema,
  activeWorkspaceId: import_zod2.z.string().nullable()
});
var AuthLoginRequestSchema = import_zod2.z.object({
  email: import_zod2.z.string().transform((v) => v.trim().toLowerCase()).pipe(import_zod2.z.string().min(1).includes("@", { message: "Email is required" })),
  password: import_zod2.z.string().min(1, "Password is required"),
  preferredLocale: PreferredLocaleSchema.optional()
});
var AuthLoginResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  user: AuthSessionUserSchema,
  workspaces: import_zod2.z.array(AuthMeResponseWorkspaceSchema),
  activeWorkspaceId: import_zod2.z.string().nullable()
});
var AuthLoginNativeResponseSchema = AuthLoginResponseSchema.extend({
  token: import_zod2.z.string().min(1)
});
var AuthLogoutResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true)
});
var AuthWebviewExchangeRequestSchema = import_zod2.z.object({
  next: SafeNextPathSchema
});
var AuthWebviewExchangeResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  code: import_zod2.z.string().min(1),
  expiresAt: import_zod2.z.string().min(1),
  bridgeUrl: import_zod2.z.string().min(1)
});
var AuthWebviewBridgeQuerySchema = import_zod2.z.object({
  code: import_zod2.z.string().min(1, "Query.code is required"),
  next: SafeNextPathSchema
});
var AuthPreferencesPatchRequestSchema = import_zod2.z.object({
  preferredTheme: UiThemeSchema.optional(),
  preferredFontScale: UiFontScaleSchema.optional(),
  preferredDensity: UiDensitySchema.optional()
});
var AuthPreferencesPatchResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  preferences: import_zod2.z.object({
    preferredTheme: import_zod2.z.string(),
    preferredFontScale: import_zod2.z.string(),
    preferredDensity: import_zod2.z.string()
  })
});
var AuthActiveWorkspaceRequestSchema = import_zod2.z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return raw;
    const r = raw;
    return {
      workspaceId: typeof r["workspaceId"] === "string" ? r["workspaceId"] : r["accountId"]
    };
  },
  import_zod2.z.object({
    workspaceId: import_zod2.z.string().min(1, "Body.workspaceId is required")
  })
);
var AuthActiveWorkspaceResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  activeWorkspaceId: import_zod2.z.string().nullable()
});

// src/health/routeSchemas.ts
var import_zod3 = require("zod");
var HealthResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true)
});

// src/workspaces/platformWorkspaces.ts
var import_zod4 = require("zod");
var ContextMeResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  userId: import_zod4.z.string().min(1),
  activeWorkspaceId: import_zod4.z.string().nullable(),
  role: import_zod4.z.string().nullable()
});
var WorkspacesListResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  workspaces: import_zod4.z.array(AuthMeResponseWorkspaceSchema)
});
var WorkspaceCreateRequestSchema = import_zod4.z.object({
  name: import_zod4.z.string().trim().min(1, "Body.name is required")
});
var isoDateTime = import_zod4.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod4.z.string());
var WorkspaceRowSchema = import_zod4.z.object({
  id: import_zod4.z.string().min(1),
  name: import_zod4.z.string(),
  brandKey: import_zod4.z.string(),
  adsDisabled: import_zod4.z.boolean(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime
});
var WorkspaceCreateResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  workspace: WorkspaceRowSchema
});
var WorkspaceIdParamsSchema = import_zod4.z.object({
  id: import_zod4.z.string().min(1, "Params.id is required")
});
var WorkspaceBrandPatchRequestSchema = import_zod4.z.object({
  brandKey: import_zod4.z.unknown().transform((v) => {
    if (v === "default" || v === "acme" || v === "forest") return v;
    return "default";
  })
});
var WorkspaceBrandPatchResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  workspace: import_zod4.z.object({
    id: import_zod4.z.string().min(1),
    name: import_zod4.z.string(),
    brandKey: import_zod4.z.string()
  })
});
var ActiveWorkspaceContextResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  activeWorkspaceId: import_zod4.z.string().min(1),
  role: import_zod4.z.string()
});

// src/billing/routeSchemas.ts
var import_zod5 = require("zod");
var isoDateTime2 = import_zod5.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod5.z.string());
var BillingWorkspaceIdParamsSchema = import_zod5.z.object({
  workspaceId: import_zod5.z.string().trim().min(1, "Params.workspaceId is required")
});
var BillingPurchaseProviderSchema = import_zod5.z.enum(["stripe", "apple", "google"]);
var BillingPurchaseIntentModeSchema = import_zod5.z.enum(["purchase", "restore"]);
var BillingIntentRequestSchema = import_zod5.z.object({
  planCode: import_zod5.z.string().trim().min(1, "Body.planCode is required"),
  provider: BillingPurchaseProviderSchema,
  mode: import_zod5.z.preprocess(
    (v) => v === "restore" ? "restore" : v === "purchase" ? "purchase" : v,
    BillingPurchaseIntentModeSchema
  ).optional()
}).strict();
var BillingIntentResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  billingIntentId: import_zod5.z.string().min(1),
  workspaceId: import_zod5.z.string().min(1),
  planCode: import_zod5.z.string().min(1),
  provider: BillingPurchaseProviderSchema,
  mode: import_zod5.z.enum(["purchase", "restore"]),
  expiresAt: isoDateTime2,
  clientReferenceId: import_zod5.z.string().min(1),
  stripePricingTableId: import_zod5.z.string().nullable(),
  stripePublishableKey: import_zod5.z.string().nullable()
});
var BillingTierSchema = import_zod5.z.enum(["free", "premium", "pro", "pro_plus"]);
var TierLimitsSchema = import_zod5.z.object({
  aiEnabled: import_zod5.z.boolean(),
  maxRecipesPerWorkspace: import_zod5.z.number(),
  maxVersionsPerRecipe: import_zod5.z.number(),
  maxVessels: import_zod5.z.number(),
  maxAdaptersConnected: import_zod5.z.number(),
  automationAiToolsEnabled: import_zod5.z.boolean()
});
var WorkspaceBillingResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  workspaceId: import_zod5.z.string().min(1),
  tier: BillingTierSchema,
  expiresAt: isoDateTime2.nullable(),
  limits: TierLimitsSchema,
  usage: import_zod5.z.object({
    recipesCount: import_zod5.z.number().int().nonnegative()
  })
});
var BillingConfirmRequestSchema = import_zod5.z.object({
  billingIntentId: import_zod5.z.string().trim().min(1, "Body.billingIntentId is required")
}).strict();
var BillingConfirmResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true)
});

// src/ads/routeSchemas.ts
var import_zod6 = require("zod");
var isoDateTime3 = import_zod6.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod6.z.string());
var optionalIsoDateTime = import_zod6.z.preprocess((v) => {
  if (v === null || v === void 0 || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  return v;
}, isoDateTime3.nullable());
var AdPlacementSchema = import_zod6.z.enum([
  "global_top",
  "global_bottom",
  "recipe_edit_after_fermentables",
  "recipe_edit_after_hops",
  "recipe_edit_after_yeast"
]);
var AdPlatformSchema = import_zod6.z.unknown().transform((v) => v === "web" ? "web" : "web");
var AdSlotParamsSchema = import_zod6.z.object({
  placement: AdPlacementSchema
});
var AdSlotQuerySchema = import_zod6.z.object({
  platform: AdPlatformSchema.optional()
});
var ResolvedAdSchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1),
  imageUrl: import_zod6.z.string().min(1),
  linkUrl: import_zod6.z.string().min(1),
  altText: import_zod6.z.string().min(1)
});
var AdSlotResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  placement: AdPlacementSchema,
  platform: import_zod6.z.literal("web"),
  disabled: import_zod6.z.boolean(),
  ad: ResolvedAdSchema.nullable()
});
var PlatformAdRowSchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1),
  placement: AdPlacementSchema,
  platform: import_zod6.z.literal("web"),
  imageUrl: import_zod6.z.string(),
  linkUrl: import_zod6.z.string(),
  altText: import_zod6.z.string(),
  isActive: import_zod6.z.boolean(),
  startsAt: optionalIsoDateTime,
  endsAt: optionalIsoDateTime,
  priority: import_zod6.z.number().int(),
  weight: import_zod6.z.number().int(),
  createdAt: isoDateTime3,
  updatedAt: isoDateTime3
});
var PlatformAdsListResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  ads: import_zod6.z.array(PlatformAdRowSchema)
});
var PlatformAdCreateRequestSchema = import_zod6.z.object({
  placement: AdPlacementSchema,
  platform: AdPlatformSchema.optional(),
  imageUrl: import_zod6.z.string().trim().min(1, "Body.imageUrl is required"),
  linkUrl: import_zod6.z.string().trim().min(1, "Body.linkUrl is required"),
  altText: import_zod6.z.string().trim().min(1, "Body.altText is required"),
  startsAt: optionalIsoDateTime.optional(),
  endsAt: optionalIsoDateTime.optional(),
  isActive: import_zod6.z.boolean().optional(),
  priority: import_zod6.z.number().int().optional(),
  weight: import_zod6.z.number().int().optional()
});
var PlatformAdCreateResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  id: import_zod6.z.string().min(1)
});
var PlatformAdIdParamsSchema = import_zod6.z.object({
  id: import_zod6.z.string().min(1, "Params.id is required")
});
var PlatformAdPatchRequestSchema = import_zod6.z.object({
  placement: AdPlacementSchema.optional(),
  platform: AdPlatformSchema.optional(),
  imageUrl: import_zod6.z.string().trim().optional(),
  linkUrl: import_zod6.z.string().trim().optional(),
  altText: import_zod6.z.string().trim().optional(),
  isActive: import_zod6.z.boolean().optional(),
  startsAt: optionalIsoDateTime.optional(),
  endsAt: optionalIsoDateTime.optional(),
  priority: import_zod6.z.number().int().optional(),
  weight: import_zod6.z.number().int().optional()
}).strict();
var PlatformAdOkResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true)
});

// src/integrations/routeSchemas.ts
var import_zod7 = require("zod");
var isoDateTime4 = import_zod7.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod7.z.string());
var IntegrationKindSchema = import_zod7.z.enum(["tilt", "ispindel", "rapt"]);
var IntegrationWorkspaceIdParamsSchema = import_zod7.z.object({
  workspaceId: import_zod7.z.string().trim().min(1, "Params.workspaceId is required")
});
var IntegrationWorkspaceKindParamsSchema = import_zod7.z.object({
  workspaceId: import_zod7.z.string().trim().min(1, "Params.workspaceId is required"),
  kind: import_zod7.z.preprocess(
    (v) => typeof v === "string" ? v.trim().toLowerCase() : v,
    IntegrationKindSchema
  )
});
var IntegrationTokenParamsSchema = import_zod7.z.object({
  token: import_zod7.z.string().trim().min(1, "Params.token is required")
});
var IntegrationSummarySchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1),
  workspaceId: import_zod7.z.string().min(1),
  kind: IntegrationKindSchema,
  revokedAt: isoDateTime4.nullable(),
  createdAt: isoDateTime4,
  updatedAt: isoDateTime4
});
var IntegrationRevealResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  integrationId: import_zod7.z.string().min(1),
  kind: IntegrationKindSchema,
  token: import_zod7.z.string().min(1),
  publicPath: import_zod7.z.string().min(1)
});
var IntegrationGetResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  integration: IntegrationSummarySchema.nullable()
});
var IntegrationCreateResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  integrationId: import_zod7.z.string().min(1),
  token: import_zod7.z.string().min(1),
  publicPath: import_zod7.z.string().min(1)
});
var IntegrationOkResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true)
});
var TiltIngestBodySchema = import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown());
var TiltIngestResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  integrationId: import_zod7.z.string().min(1),
  deviceId: import_zod7.z.string().min(1),
  readingId: import_zod7.z.string().min(1),
  brewSessionId: import_zod7.z.string().nullable()
});
var IntegrationDevicesQuerySchema = import_zod7.z.object({
  includeReadings: import_zod7.z.unknown().optional().transform((v) => v === true || v === "true" || v === "1"),
  readingsLimit: import_zod7.z.unknown().optional().transform((v) => {
    const raw = typeof v === "string" ? v.trim() : "";
    const n = raw ? Number.parseInt(raw, 10) : 20;
    if (!Number.isFinite(n) || Number.isNaN(n)) return 20;
    return Math.max(1, Math.min(200, n));
  })
});
var IntegrationDeviceReadingSchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1),
  brewSessionId: import_zod7.z.string().nullable(),
  recordedAt: isoDateTime4.nullable(),
  receivedAt: isoDateTime4,
  temperatureC: import_zod7.z.number().nullable(),
  gravitySg: import_zod7.z.number().nullable(),
  rawJson: import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown()).optional()
});
var IntegrationBrewSessionRefSchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1),
  code: import_zod7.z.string().nullable(),
  status: import_zod7.z.string(),
  createdAt: isoDateTime4,
  startedAt: isoDateTime4.nullable(),
  recipe: import_zod7.z.object({
    id: import_zod7.z.string().min(1),
    name: import_zod7.z.string(),
    version: import_zod7.z.number().int()
  })
});
var IntegrationDeviceAttachmentSchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1),
  attachedAt: isoDateTime4,
  brewSession: IntegrationBrewSessionRefSchema
});
var IntegrationDeviceSchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1),
  deviceKey: import_zod7.z.string().min(1),
  displayName: import_zod7.z.string().nullable(),
  metadataJson: import_zod7.z.record(import_zod7.z.string(), import_zod7.z.unknown()).nullable(),
  lastSeenAt: isoDateTime4.nullable(),
  createdAt: isoDateTime4,
  activeAttachment: IntegrationDeviceAttachmentSchema.nullable(),
  lastReading: IntegrationDeviceReadingSchema.nullable(),
  recentReadings: import_zod7.z.array(IntegrationDeviceReadingSchema).nullable().optional()
});
var IntegrationDevicesListResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  devices: import_zod7.z.array(IntegrationDeviceSchema)
});
var IntegrationDeviceIdParamsSchema = import_zod7.z.object({
  workspaceId: import_zod7.z.string().trim().min(1, "Params.workspaceId is required"),
  deviceId: import_zod7.z.string().trim().min(1, "Params.deviceId is required")
});
var IntegrationDeviceAttachRequestSchema = import_zod7.z.object({
  brewSessionId: import_zod7.z.string().trim().min(1, "Body.brewSessionId is required")
});
var IntegrationDeviceAttachResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  attachment: import_zod7.z.object({
    id: import_zod7.z.string().min(1),
    attachedAt: isoDateTime4,
    brewSessionId: import_zod7.z.string().min(1)
  })
});
var IntegrationDeviceDetachResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  detachedCount: import_zod7.z.number().int().nonnegative()
});
var BrewSessionsRecentQuerySchema = import_zod7.z.object({
  limit: import_zod7.z.unknown().optional().transform((v) => {
    const raw = typeof v === "string" ? v.trim() : "";
    const n = raw ? Number.parseInt(raw, 10) : 20;
    if (!Number.isFinite(n) || Number.isNaN(n)) return 20;
    return Math.max(1, Math.min(100, n));
  })
});
var BrewSessionSummarySchema = import_zod7.z.object({
  id: import_zod7.z.string().min(1),
  recipeId: import_zod7.z.string().min(1),
  code: import_zod7.z.string().nullable(),
  status: import_zod7.z.string(),
  startedAt: isoDateTime4.nullable(),
  pausedAt: isoDateTime4.nullable(),
  stoppedAt: isoDateTime4.nullable(),
  scheduledDate: isoDateTime4.nullable(),
  createdAt: isoDateTime4,
  recipe: import_zod7.z.object({
    id: import_zod7.z.string().min(1),
    name: import_zod7.z.string(),
    version: import_zod7.z.number().int()
  })
});
var BrewSessionsRecentResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
  brewSessions: import_zod7.z.array(BrewSessionSummarySchema)
});

// src/platformAdmin/routeSchemas.ts
var import_zod8 = require("zod");
var isoDateTime5 = import_zod8.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod8.z.string());
var PlatformWorkspaceRowSchema = import_zod8.z.object({
  id: import_zod8.z.string().min(1),
  name: import_zod8.z.string()
});
var PlatformWorkspacesListResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true),
  workspaces: import_zod8.z.array(PlatformWorkspaceRowSchema)
});
var PlatformRecipesListQuerySchema = import_zod8.z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object") return raw;
    const r = raw;
    return { workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  import_zod8.z.object({
    workspaceId: import_zod8.z.string().trim().min(1, "Query.workspaceId is required")
  })
);
var PlatformRecipeSummarySchema = import_zod8.z.object({
  id: import_zod8.z.string().min(1),
  name: import_zod8.z.string(),
  version: import_zod8.z.number().int(),
  styleKey: import_zod8.z.string().nullable().optional(),
  style: import_zod8.z.unknown().nullable().optional(),
  createdAt: isoDateTime5.optional(),
  updatedAt: isoDateTime5.optional()
});
var PlatformRecipesListResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true),
  recipes: import_zod8.z.array(import_zod8.z.unknown())
});
var PlatformRecipeIdParamsSchema = import_zod8.z.object({
  id: import_zod8.z.string().trim().min(1, "Params.id is required")
});
var PlatformRecipeExportQuerySchema = PlatformRecipesListQuerySchema;
var BeerJsonLooseSchema = import_zod8.z.unknown();
var PlatformImportFormatSchema = import_zod8.z.enum(["beerjson", "beerxml"]);
var workspaceIdPreprocess = import_zod8.z.preprocess(
  (raw) => {
    if (raw === null || raw === void 0) return {};
    if (typeof raw !== "object") return raw;
    const r = raw;
    return { ...r, workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  import_zod8.z.object({
    format: PlatformImportFormatSchema,
    content: import_zod8.z.string().min(1, "Body.content is required"),
    workspaceId: import_zod8.z.string().trim().min(1, "Body.workspaceId is required")
  })
);
var PlatformRecipeImportPreviewRequestSchema = workspaceIdPreprocess;
var PlatformRecipeImportPreviewResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true),
  format: PlatformImportFormatSchema,
  preview: import_zod8.z.object({
    name: import_zod8.z.string(),
    notes: import_zod8.z.string().nullable(),
    beerJsonRecipeJson: import_zod8.z.unknown(),
    warnings: import_zod8.z.array(import_zod8.z.string())
  }),
  workspaceId: import_zod8.z.string().min(1)
});
var PlatformRecipeImportRequestSchema = import_zod8.z.preprocess(
  (raw) => {
    if (raw === null || raw === void 0) return {};
    if (typeof raw !== "object") return raw;
    const r = raw;
    return { ...r, workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  import_zod8.z.object({
    format: PlatformImportFormatSchema,
    content: import_zod8.z.string().min(1, "Body.content is required"),
    styleKey: import_zod8.z.string().optional(),
    workspaceId: import_zod8.z.string().trim().min(1, "Body.workspaceId is required"),
    recipeExtJson: import_zod8.z.unknown().optional()
  })
);
var PlatformRecipeImportResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true),
  recipe: import_zod8.z.unknown(),
  warnings: import_zod8.z.array(import_zod8.z.string())
});
var PlatformRecipeBulkImportPreviewRequestSchema = workspaceIdPreprocess;
var PlatformRecipeBulkImportPreviewItemSchema = import_zod8.z.object({
  index: import_zod8.z.number().int(),
  name: import_zod8.z.string(),
  notes: import_zod8.z.string().nullable(),
  resolvedStyleKey: import_zod8.z.string(),
  resolvedStyleName: import_zod8.z.string().nullable(),
  resolvedStyleCode: import_zod8.z.string().nullable(),
  warnings: import_zod8.z.array(import_zod8.z.string())
});
var PlatformRecipeBulkImportPreviewResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true),
  format: PlatformImportFormatSchema,
  previewItems: import_zod8.z.array(PlatformRecipeBulkImportPreviewItemSchema),
  workspaceId: import_zod8.z.string().min(1)
});
var PlatformRecipeBulkImportRequestSchema = workspaceIdPreprocess;
var PlatformRecipeBulkImportResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true),
  created: import_zod8.z.array(
    import_zod8.z.object({
      index: import_zod8.z.number().int(),
      recipeId: import_zod8.z.string().min(1),
      name: import_zod8.z.string(),
      styleKey: import_zod8.z.string(),
      style: import_zod8.z.unknown().nullable(),
      warnings: import_zod8.z.array(import_zod8.z.string())
    })
  ),
  failed: import_zod8.z.array(
    import_zod8.z.object({
      index: import_zod8.z.number().int(),
      name: import_zod8.z.string(),
      error: import_zod8.z.string()
    })
  )
});
var PlatformAdminOkResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true)
});

// src/webhooks/routeSchemas.ts
var import_zod9 = require("zod");
var WebhookOkResponseSchema = import_zod9.z.object({
  ok: import_zod9.z.literal(true)
});
var WebhookStripeBodySchema = import_zod9.z.record(import_zod9.z.string(), import_zod9.z.unknown());
var WebhookRevenuecatBodySchema = import_zod9.z.unknown();

// src/brewery/routeSchemas.ts
var import_zod10 = require("zod");
var isoDateTime6 = import_zod10.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod10.z.string());
var OkResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true)
});
var IdParamsSchema = import_zod10.z.object({
  id: import_zod10.z.string().min(1, "id required")
});
var InventoryCategoryQuerySchema = import_zod10.z.object({
  category: import_zod10.z.string().optional()
});
var BeerStyleSchema = import_zod10.z.object({
  key: import_zod10.z.string(),
  name: import_zod10.z.string(),
  source: import_zod10.z.string(),
  version: import_zod10.z.number(),
  code: import_zod10.z.string().nullable(),
  category: import_zod10.z.string().nullable(),
  categoryId: import_zod10.z.string().nullable(),
  sortOrder: import_zod10.z.number()
});
var StylesListResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  styles: import_zod10.z.array(BeerStyleSchema)
});
var EquipmentProfilePayloadSchema = import_zod10.z.object({
  id: import_zod10.z.string(),
  workspaceId: import_zod10.z.string(),
  name: import_zod10.z.string(),
  equipment: import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown()),
  createdAt: isoDateTime6,
  updatedAt: isoDateTime6
});
var EquipmentProfilesListResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  profiles: import_zod10.z.array(EquipmentProfilePayloadSchema)
});
var EquipmentProfileResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  profile: EquipmentProfilePayloadSchema
});
var EquipmentProfileCreateRequestSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var EquipmentProfilePatchRequestSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var InventoryItemPayloadSchema = import_zod10.z.object({
  id: import_zod10.z.string(),
  workspaceId: import_zod10.z.string(),
  category: import_zod10.z.string(),
  ingredientId: import_zod10.z.string().nullable(),
  name: import_zod10.z.string(),
  quantity: import_zod10.z.number(),
  unit: import_zod10.z.string(),
  metadataJson: import_zod10.z.unknown().nullable(),
  createdAt: isoDateTime6,
  updatedAt: isoDateTime6
});
var InventoryListResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  items: import_zod10.z.array(InventoryItemPayloadSchema)
});
var InventoryItemResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  item: InventoryItemPayloadSchema
});
var InventoryCreateRequestSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var InventoryPatchRequestSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var BrewdaySettingsPayloadSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var BrewdaySettingsResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  settings: BrewdaySettingsPayloadSchema.nullable()
});
var BrewdaySettingsPatchRequestSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var RecipePayloadSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var RecipeListResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  recipes: import_zod10.z.array(import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown()))
});
var RecipeResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  recipe: RecipePayloadSchema
});
var RecipeCreateRequestSchema = import_zod10.z.object({
  name: import_zod10.z.string(),
  styleKey: import_zod10.z.string().optional(),
  notes: import_zod10.z.string().nullable().optional(),
  beerJsonRecipeJson: import_zod10.z.unknown().optional(),
  recipeExtJson: import_zod10.z.unknown().optional()
});
var RecipePatchRequestSchema = import_zod10.z.object({
  name: import_zod10.z.string().optional(),
  styleKey: import_zod10.z.string().optional(),
  notes: import_zod10.z.string().optional(),
  beerJsonRecipeJson: import_zod10.z.unknown().optional(),
  recipeExtJson: import_zod10.z.unknown().optional()
});
var RecipeVersionsResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  versions: import_zod10.z.array(import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown()))
});
var BeerJsonExportResponseSchema = import_zod10.z.custom(
  (data) => data instanceof Buffer,
  { message: "Expected binary export body" }
);
var RecipeIdParamsSchema = import_zod10.z.object({
  recipeId: import_zod10.z.string().min(1, "recipeId required")
});
var BrewSessionIdParamsSchema = import_zod10.z.object({
  brewSessionId: import_zod10.z.string().min(1, "brewSessionId required")
});
var BrewSessionStepParamsSchema = import_zod10.z.object({
  brewSessionId: import_zod10.z.string().min(1, "brewSessionId required"),
  stepId: import_zod10.z.string().min(1, "stepId required")
});
var IngredientsSearchQuerySchema = import_zod10.z.object({
  query: import_zod10.z.string().optional(),
  offset: import_zod10.z.coerce.number().int().nonnegative().optional(),
  limit: import_zod10.z.coerce.number().int().positive().optional()
});
var IntegrationReadingsQuerySchema = import_zod10.z.object({
  kind: import_zod10.z.enum(["tilt", "ispindel", "rapt"]),
  limit: import_zod10.z.coerce.number().int().positive().optional()
});
var FermentableItemSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var FermentablesListResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  items: import_zod10.z.array(FermentableItemSchema),
  total: import_zod10.z.number(),
  offset: import_zod10.z.number(),
  limit: import_zod10.z.number()
});
var HopItemSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var HopsListResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  items: import_zod10.z.array(HopItemSchema),
  total: import_zod10.z.number(),
  offset: import_zod10.z.number(),
  limit: import_zod10.z.number()
});
var YeastItemSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var YeastsListResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  items: import_zod10.z.array(YeastItemSchema)
});
var IngredientSyncRunSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var IngredientSyncRunsResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  runs: import_zod10.z.array(IngredientSyncRunSchema)
});
var IngredientSyncResultSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var IngredientSyncResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  result: IngredientSyncResultSchema
});
var RecipeImportFormatSchema = import_zod10.z.enum(["beerjson", "beerxml"]);
var RecipeImportWarningSchema = import_zod10.z.object({
  code: import_zod10.z.string(),
  message: import_zod10.z.string()
});
var RecipeImportRequestSchema = import_zod10.z.object({
  format: RecipeImportFormatSchema,
  content: import_zod10.z.string().min(1),
  styleKey: import_zod10.z.string().optional()
});
var RecipeBulkImportRequestSchema = import_zod10.z.object({
  format: RecipeImportFormatSchema,
  content: import_zod10.z.string().min(1)
});
var RecipeImportPreviewPayloadSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var RecipeImportPreviewResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  format: RecipeImportFormatSchema,
  preview: RecipeImportPreviewPayloadSchema,
  workspaceId: import_zod10.z.string()
});
var RecipeImportResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  recipe: RecipePayloadSchema,
  warnings: import_zod10.z.array(RecipeImportWarningSchema).optional()
});
var RecipeBulkImportPreviewItemSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var RecipeBulkImportPreviewResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  format: RecipeImportFormatSchema,
  previewItems: import_zod10.z.array(RecipeBulkImportPreviewItemSchema),
  workspaceId: import_zod10.z.string()
});
var RecipeBulkImportCreatedItemSchema = import_zod10.z.record(import_zod10.z.string(), import_zod10.z.unknown());
var RecipeBulkImportFailedItemSchema = import_zod10.z.object({
  index: import_zod10.z.number(),
  name: import_zod10.z.string(),
  error: import_zod10.z.string()
});
var RecipeBulkImportResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  created: import_zod10.z.array(RecipeBulkImportCreatedItemSchema),
  failed: import_zod10.z.array(RecipeBulkImportFailedItemSchema)
});

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

// src/water/parseComputeAndSave.ts
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
function parseSettingsSavedRef(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const recipeId = typeof v["recipeId"] === "string" ? v["recipeId"] : "";
  if (!recipeId) throw new Error(`Invalid ${label}.recipeId`);
  return { recipeId };
}
function parseSaltAdditionsResult(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const baseProfile = parseIonProfilePpm2(v["baseProfile"], `${label}.baseProfile`);
  const resultingProfile = parseIonProfilePpm2(v["resultingProfile"], `${label}.resultingProfile`);
  const deltasPpm = parseIonProfilePpm2(v["deltasPpm"], `${label}.deltasPpm`);
  const breakdown = Array.isArray(v["breakdown"]) ? v["breakdown"].filter(
    (r) => isObject2(r) && typeof r["saltKey"] === "string" && isFiniteNumber2(r["grams"])
  ).map((r) => ({
    saltKey: r["saltKey"],
    grams: r["grams"],
    deltasPpm: isObject2(r["deltasPpm"]) ? r["deltasPpm"] : {}
  })) : [];
  return { baseProfile, resultingProfile, deltasPpm, breakdown };
}
function parseAcidificationResult(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber2(v["finalAlkalinityPpmCaCO3"]) ? v["finalAlkalinityPpmCaCO3"] : NaN;
  const sulfateAddedPpm = isFiniteNumber2(v["sulfateAddedPpm"]) ? v["sulfateAddedPpm"] : NaN;
  const chlorideAddedPpm = isFiniteNumber2(v["chlorideAddedPpm"]) ? v["chlorideAddedPpm"] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  if (!Number.isFinite(sulfateAddedPpm)) throw new Error(`Invalid ${label}.sulfateAddedPpm`);
  if (!Number.isFinite(chlorideAddedPpm)) throw new Error(`Invalid ${label}.chlorideAddedPpm`);
  return {
    acidRequiredMl: v["acidRequiredMl"] === null ? null : isFiniteNumber2(v["acidRequiredMl"]) ? v["acidRequiredMl"] : null,
    acidRequiredTsp: v["acidRequiredTsp"] === null ? null : isFiniteNumber2(v["acidRequiredTsp"]) ? v["acidRequiredTsp"] : null,
    acidRequiredGrams: v["acidRequiredGrams"] === null ? null : isFiniteNumber2(v["acidRequiredGrams"]) ? v["acidRequiredGrams"] : null,
    acidRequiredKg: v["acidRequiredKg"] === null ? null : isFiniteNumber2(v["acidRequiredKg"]) ? v["acidRequiredKg"] : null,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: isObject2(v["debug"]) ? v["debug"] : void 0
  };
}
function parseAcidificationManualResult(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const achievedPh = isFiniteNumber2(v["achievedPh"]) ? v["achievedPh"] : NaN;
  if (!Number.isFinite(achievedPh)) throw new Error(`Invalid ${label}.achievedPh`);
  const clamped = v["clamped"] === "none" || v["clamped"] === "low" || v["clamped"] === "high" ? v["clamped"] : "none";
  const iterations = isFiniteNumber2(v["iterations"]) ? v["iterations"] : 0;
  const targetAmount = isFiniteNumber2(v["targetAmount"]) ? v["targetAmount"] : NaN;
  const predictedAmount = isFiniteNumber2(v["predictedAmount"]) ? v["predictedAmount"] : NaN;
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
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const estimatedMashPhRoomTemp = isFiniteNumber2(v["estimatedMashPhRoomTemp"]) ? v["estimatedMashPhRoomTemp"] : NaN;
  if (!Number.isFinite(estimatedMashPhRoomTemp)) throw new Error(`Invalid ${label}.estimatedMashPhRoomTemp`);
  return { ...base, estimatedMashPhRoomTemp };
}
function parseOverallResult(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  const calculatedAt = typeof v["calculatedAt"] === "string" ? v["calculatedAt"] : "";
  if (!calculatedAt) throw new Error(`Invalid ${label}.calculatedAt`);
  const ionsPpm = parseIonProfilePpm2(v["ionsPpm"], `${label}.ionsPpm`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber2(v["finalAlkalinityPpmCaCO3"]) ? v["finalAlkalinityPpmCaCO3"] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  const ph = isObject2(v["ph"]) ? v["ph"] : null;
  const kind = ph?.["kind"] === "target" || ph?.["kind"] === "estimated" ? ph["kind"] : null;
  const value = isFiniteNumber2(ph?.["value"]) ? ph["value"] : null;
  if (!kind || value === null) throw new Error(`Invalid ${label}.ph`);
  return {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3,
    ph: { kind, value },
    debug: isObject2(v["debug"]) ? v["debug"] : void 0
  };
}
function parseMashAcidBlock(v, label) {
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
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
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
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
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
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
  if (!isObject2(v)) throw new Error(`Invalid ${label}`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v["style"] === "fixed" || v["style"] === "significant" ? v["style"] : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber2(v["decimals"]) ? v["decimals"] : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unitRaw = typeof v["unit"] === "string" ? v["unit"] : void 0;
  const clamp = isObject2(v["clamp"]) ? {
    min: isFiniteNumber2(v["clamp"]["min"]) ? v["clamp"]["min"] : void 0,
    max: isFiniteNumber2(v["clamp"]["max"]) ? v["clamp"]["max"] : void 0
  } : void 0;
  return { version: 1, style, decimals, unit: unitRaw, clamp };
}
function parseFormatHints(root) {
  const hintsOut = {};
  const h = root["formatHints"];
  if (isObject2(h)) {
    for (const [k, val] of Object.entries(h)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(val, `formatHints.${k}`);
      } catch {
      }
    }
  }
  return hintsOut;
}
function parseMashComputeAndSaveResponse(x) {
  if (!isObject2(x)) throw new Error("Invalid MashComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid MashComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid MashComputeAndSaveResponseV1.version");
  const salts = isObject2(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const overall = isObject2(x["overall"]) ? x["overall"] : {};
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
function parseSpargeComputeAndSaveResponse(x) {
  if (!isObject2(x)) throw new Error("Invalid SpargeComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid SpargeComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid SpargeComputeAndSaveResponseV1.version");
  const salts = isObject2(x["salts"]) ? x["salts"] : {};
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
  if (!isObject2(x)) throw new Error("Invalid BoilComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid BoilComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid BoilComputeAndSaveResponseV1.version");
  const salts = isObject2(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const overall = isObject2(x["overall"]) ? x["overall"] : {};
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
var import_zod11 = require("zod");
var recordBody = import_zod11.z.record(import_zod11.z.string(), import_zod11.z.unknown());
var recordResult = import_zod11.z.record(import_zod11.z.string(), import_zod11.z.unknown());
var RecipeWaterHubSummaryResponseSchema = import_zod11.z.custom(
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
var WaterProfilesListResponseSchema = import_zod11.z.custom(
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
var WaterProfileItemSchema = import_zod11.z.custom(
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
var WaterProfileResponseSchema = import_zod11.z.object({
  ok: import_zod11.z.literal(true),
  profile: WaterProfileItemSchema
});
var ionField = import_zod11.z.union([import_zod11.z.number(), import_zod11.z.string(), import_zod11.z.null()]).optional();
var WaterProfileCreateRequestSchema = import_zod11.z.object({
  scope: import_zod11.z.enum(["system", "account", "public"]).optional(),
  type: import_zod11.z.enum(["water", "dilution"]).optional(),
  name: import_zod11.z.string().optional(),
  ph: ionField,
  calcium: ionField,
  magnesium: ionField,
  sodium: ionField,
  sulfate: ionField,
  chloride: ionField,
  bicarbonate: ionField
});
var WaterProfilePatchRequestSchema = WaterProfileCreateRequestSchema.extend({
  verificationStatus: import_zod11.z.enum(["verified", "unverified"]).optional()
});
var RecipeWaterSettingsPayloadSchema = import_zod11.z.record(import_zod11.z.string(), import_zod11.z.unknown());
var RecipeWaterSettingsGetResponseSchema = import_zod11.z.object({
  ok: import_zod11.z.literal(true),
  settings: RecipeWaterSettingsPayloadSchema.nullable()
});
var RecipeWaterSettingsPutRequestSchema = import_zod11.z.record(import_zod11.z.string(), import_zod11.z.unknown());
var RecipeWaterSettingsPutResponseSchema = import_zod11.z.object({
  ok: import_zod11.z.literal(true),
  settings: RecipeWaterSettingsPayloadSchema
});
var emptyObjectBody = (schema) => import_zod11.z.preprocess((raw) => raw === null || raw === void 0 ? {} : raw, schema);
var MashComputeAndSaveRequestSchema = emptyObjectBody(import_zod11.z.record(import_zod11.z.string(), import_zod11.z.unknown()));
var MashComputeAndSaveResponseSchema = import_zod11.z.custom(
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
var SpargeComputeAndSaveRequestSchema = emptyObjectBody(import_zod11.z.record(import_zod11.z.string(), import_zod11.z.unknown()));
var SpargeComputeAndSaveResponseSchema = import_zod11.z.custom(
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
var BoilComputeAndSaveRequestSchema = emptyObjectBody(import_zod11.z.record(import_zod11.z.string(), import_zod11.z.unknown()));
var BoilComputeAndSaveResponseSchema = import_zod11.z.custom(
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
var WaterCalcWithDerivationResponseSchema = import_zod11.z.object({
  ok: import_zod11.z.literal(true),
  result: recordResult,
  derivation: recordResult
});
var WaterCalcResultOnlyResponseSchema = import_zod11.z.object({
  ok: import_zod11.z.literal(true),
  result: recordResult
});

// src/format/formatHints.ts
function hintFixed(args) {
  return { version: 1, style: "fixed", decimals: args.decimals, unit: args.unit, clamp: args.clamp };
}
var waterFormatHints = {
  L: hintFixed({ decimals: 2, unit: "L" }),
  pH: hintFixed({ decimals: 2, unit: "pH" }),
  ppm_as_CaCO3: hintFixed({ decimals: 0, unit: "ppm_as_CaCO3" }),
  ppm: hintFixed({ decimals: 0, unit: "ppm" }),
  g: hintFixed({ decimals: 0, unit: "g" }),
  mL: hintFixed({ decimals: 0, unit: "mL" }),
  kg: hintFixed({ decimals: 2, unit: "kg" })
};
var analysisFormatHints = {
  boilTimeMinutes: hintFixed({ decimals: 0, unit: "min" }),
  kettleVolumeLiters: hintFixed({ decimals: 2, unit: "L" }),
  preBoilVolumeLiters: hintFixed({ decimals: 2, unit: "L" }),
  ogEstimatedSg: hintFixed({ decimals: 3, unit: "sg" }),
  pbgEstimatedSg: hintFixed({ decimals: 3, unit: "sg" }),
  fgEstimatedSg: hintFixed({ decimals: 3, unit: "sg" }),
  abvEstimatedPercent: hintFixed({ decimals: 2, unit: "percent" }),
  attenuationEffectivePercent: hintFixed({ decimals: 1, unit: "percent", clamp: { min: 0, max: 100 } }),
  ibuTinsethEstimated: hintFixed({ decimals: 1, unit: "ibu", clamp: { min: 0 } }),
  ibuRagerEstimated: hintFixed({ decimals: 1, unit: "ibu", clamp: { min: 0 } }),
  buGuRatio: hintFixed({ decimals: 2, clamp: { min: 0 } }),
  colorSrmMoreyEstimated: hintFixed({ decimals: 1, unit: "srm", clamp: { min: 0 } }),
  colorSrmDanielsEstimated: hintFixed({ decimals: 1, unit: "srm", clamp: { min: 0 } })
};

// src/analysis/parseGravityAnalysis.ts
function isFiniteNumber3(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject3(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseCanonicalModels(v) {
  const o = isObject3(v) ? v : null;
  const ibu = o?.["ibu"] === "tinseth" || o?.["ibu"] === "rager" ? o["ibu"] : "tinseth";
  const srm = o?.["srm"] === "morey" || o?.["srm"] === "daniels" ? o["srm"] : "morey";
  return { ibu, srm };
}
function parseNumberFormatHintV12(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v["style"] === "fixed" || v["style"] === "significant" ? v["style"] : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber3(v["decimals"]) ? v["decimals"] : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unit = typeof v["unit"] === "string" ? v["unit"] : void 0;
  const clamp = isObject3(v["clamp"]) ? {
    min: isFiniteNumber3(v["clamp"]["min"]) ? v["clamp"]["min"] : void 0,
    max: isFiniteNumber3(v["clamp"]["max"]) ? v["clamp"]["max"] : void 0
  } : void 0;
  return { version: 1, style, decimals, unit, clamp };
}
function parseDerivationLineValue(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  if (v["kind"] === "number") {
    if (!isFiniteNumber3(v["value"])) throw new Error(`Invalid ${label}.value`);
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
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  if (typeof v["kind"] !== "string" || !v["kind"]) throw new Error(`Invalid ${label}.kind`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  if (typeof v["formulaId"] !== "string" || !v["formulaId"]) throw new Error(`Invalid ${label}.formulaId`);
  const parseLine = (x, i, base) => {
    if (!isObject3(x)) throw new Error(`Invalid ${base}[${i}]`);
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
  if (!isObject3(x)) throw new Error("Invalid GravityAnalysisResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid GravityAnalysisResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid GravityAnalysisResponseV1.version");
  const canonicalModels = parseCanonicalModels(x["canonicalModels"]);
  if (!isObject3(x["result"])) throw new Error("Invalid GravityAnalysisResponseV1.result");
  const r = x["result"];
  const warningsRaw = Array.isArray(r["warnings"]) ? r["warnings"] : [];
  const warnings = warningsRaw.map((w) => isObject3(w) && typeof w["code"] === "string" ? w["code"] : "").filter((c) => Boolean(c)).map((code) => ({ code }));
  const result = {
    boilTimeMinutes: r["boilTimeMinutes"] === null ? null : isFiniteNumber3(r["boilTimeMinutes"]) ? r["boilTimeMinutes"] : null,
    kettleVolumeLiters: r["kettleVolumeLiters"] === null ? null : isFiniteNumber3(r["kettleVolumeLiters"]) ? r["kettleVolumeLiters"] : null,
    preBoilVolumeLiters: r["preBoilVolumeLiters"] === null ? null : isFiniteNumber3(r["preBoilVolumeLiters"]) ? r["preBoilVolumeLiters"] : null,
    ogEstimatedSg: r["ogEstimatedSg"] === null ? null : isFiniteNumber3(r["ogEstimatedSg"]) ? r["ogEstimatedSg"] : null,
    pbgEstimatedSg: r["pbgEstimatedSg"] === null ? null : isFiniteNumber3(r["pbgEstimatedSg"]) ? r["pbgEstimatedSg"] : null,
    ibuTinsethEstimated: r["ibuTinsethEstimated"] === null ? null : isFiniteNumber3(r["ibuTinsethEstimated"]) ? r["ibuTinsethEstimated"] : null,
    ibuRagerEstimated: r["ibuRagerEstimated"] === null ? null : isFiniteNumber3(r["ibuRagerEstimated"]) ? r["ibuRagerEstimated"] : null,
    buGuRatio: r["buGuRatio"] === null ? null : isFiniteNumber3(r["buGuRatio"]) ? r["buGuRatio"] : null,
    colorSrmMoreyEstimated: r["colorSrmMoreyEstimated"] === null ? null : isFiniteNumber3(r["colorSrmMoreyEstimated"]) ? r["colorSrmMoreyEstimated"] : null,
    colorSrmDanielsEstimated: r["colorSrmDanielsEstimated"] === null ? null : isFiniteNumber3(r["colorSrmDanielsEstimated"]) ? r["colorSrmDanielsEstimated"] : null,
    fgEstimatedSg: r["fgEstimatedSg"] === null ? null : isFiniteNumber3(r["fgEstimatedSg"]) ? r["fgEstimatedSg"] : null,
    abvEstimatedPercent: r["abvEstimatedPercent"] === null ? null : isFiniteNumber3(r["abvEstimatedPercent"]) ? r["abvEstimatedPercent"] : null,
    attenuationEffectivePercent: r["attenuationEffectivePercent"] === null ? null : isFiniteNumber3(r["attenuationEffectivePercent"]) ? r["attenuationEffectivePercent"] : null,
    warnings
  };
  const derivationsOut = {};
  if (isObject3(x["derivations"])) {
    for (const [k, val] of Object.entries(x["derivations"])) {
      try {
        derivationsOut[k] = parseDerivation2(val, `GravityAnalysisResponseV1.derivations.${k}`);
      } catch {
      }
    }
  }
  const hintsOut = {};
  if (isObject3(x["formatHints"])) {
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

// src/ai/aiUsage.ts
var import_zod12 = require("zod");
var AiUsageMonthlySchema = import_zod12.z.object({
  tokensIn: import_zod12.z.number().int().nonnegative(),
  tokensOut: import_zod12.z.number().int().nonnegative(),
  costMicroUsd: import_zod12.z.number().nonnegative(),
  callCount: import_zod12.z.number().int().nonnegative()
});
var AiUsageDailyPointSchema = import_zod12.z.object({
  day: import_zod12.z.string(),
  tokensIn: import_zod12.z.number().int().nonnegative(),
  tokensOut: import_zod12.z.number().int().nonnegative(),
  calls: import_zod12.z.number().int().nonnegative()
});
var AiUsageByUserSchema = import_zod12.z.object({
  userId: import_zod12.z.string().min(1),
  email: import_zod12.z.string().nullable(),
  role: import_zod12.z.string().nullable(),
  tokensInToday: import_zod12.z.number().int().nonnegative(),
  tokensOutToday: import_zod12.z.number().int().nonnegative(),
  tokensInMonth: import_zod12.z.number().int().nonnegative(),
  tokensOutMonth: import_zod12.z.number().int().nonnegative(),
  costMicroUsdMonth: import_zod12.z.number().nonnegative(),
  callCountMonth: import_zod12.z.number().int().nonnegative()
});
var AiUsageRoleAlertSchema = import_zod12.z.object({
  role: import_zod12.z.string(),
  used: import_zod12.z.number().nonnegative(),
  limit: import_zod12.z.number().nonnegative(),
  percent: import_zod12.z.number().nonnegative()
});
var AiUsageUserAlertSchema = import_zod12.z.object({
  userId: import_zod12.z.string().min(1),
  usedToday: import_zod12.z.number().nonnegative(),
  cap: import_zod12.z.number().nonnegative(),
  percent: import_zod12.z.number().nonnegative()
});
var WorkspaceAiUsageResponseSchema = import_zod12.z.object({
  ok: import_zod12.z.literal(true),
  monthly: AiUsageMonthlySchema,
  dailySeries: import_zod12.z.array(AiUsageDailyPointSchema),
  roleLimits: import_zod12.z.record(import_zod12.z.string(), import_zod12.z.number()),
  roleUsage: import_zod12.z.record(import_zod12.z.string(), import_zod12.z.number()),
  perUserDailyCap: import_zod12.z.number().int().nonnegative(),
  byUser: import_zod12.z.array(AiUsageByUserSchema),
  alerts: import_zod12.z.object({
    roleAlerts: import_zod12.z.array(AiUsageRoleAlertSchema),
    userAlerts: import_zod12.z.array(AiUsageUserAlertSchema)
  })
});
var AiToolCallRecordSchema = import_zod12.z.object({
  name: import_zod12.z.string(),
  argsJson: import_zod12.z.string(),
  resultJson: import_zod12.z.string(),
  durationMs: import_zod12.z.number().nonnegative(),
  errored: import_zod12.z.boolean()
});
var AiUsageLedgerEntrySchema = import_zod12.z.object({
  id: import_zod12.z.string().min(1),
  workspaceId: import_zod12.z.string().min(1),
  userId: import_zod12.z.string().min(1),
  sessionId: import_zod12.z.string().nullable(),
  model: import_zod12.z.string(),
  tokensIn: import_zod12.z.number().int().nonnegative(),
  tokensOut: import_zod12.z.number().int().nonnegative(),
  costMicroUsd: import_zod12.z.number().nonnegative(),
  durationMs: import_zod12.z.number().nonnegative(),
  providerRequestId: import_zod12.z.string().nullable(),
  toolCalls: import_zod12.z.array(AiToolCallRecordSchema),
  createdAt: import_zod12.z.string()
});

// src/ai/aiSettings.ts
var import_zod13 = require("zod");
var AiProviderSchema = import_zod13.z.enum(["anthropic", "openai"]);
var AiRoleLimitsSchema = import_zod13.z.record(import_zod13.z.string(), import_zod13.z.number().nonnegative());
var WorkspaceAiSettingsSchema = import_zod13.z.object({
  workspaceId: import_zod13.z.string().min(1),
  provider: AiProviderSchema,
  hasKey: import_zod13.z.boolean(),
  enabled: import_zod13.z.boolean(),
  roleLimits: AiRoleLimitsSchema,
  perUserDailyCap: import_zod13.z.number().int().nonnegative(),
  dataEgressAccepted: import_zod13.z.boolean(),
  dataEgressAcceptedAt: import_zod13.z.string().nullable(),
  createdAt: import_zod13.z.string(),
  updatedAt: import_zod13.z.string()
});
var UpdateWorkspaceAiSettingsRequestSchema = import_zod13.z.object({
  provider: AiProviderSchema.optional(),
  apiKey: import_zod13.z.string().optional(),
  enabled: import_zod13.z.boolean().optional(),
  roleLimits: AiRoleLimitsSchema.optional(),
  perUserDailyCap: import_zod13.z.number().int().nonnegative().optional(),
  dataEgressAccepted: import_zod13.z.boolean().optional()
}).strict();
var WorkspaceAiSettingsResponseSchema = import_zod13.z.object({
  ok: import_zod13.z.literal(true),
  settings: WorkspaceAiSettingsSchema
});
var WorkspaceAiSettingsParamsSchema = import_zod13.z.object({
  workspaceId: import_zod13.z.string().trim().min(1, "Params.workspaceId is required")
});

// src/ai/aiChat.ts
var import_zod14 = require("zod");
var AiChatRequestBodySchema = import_zod14.z.object({
  message: import_zod14.z.string().trim().min(1).max(8e3),
  sessionId: import_zod14.z.string().trim().min(1).max(200).optional(),
  routeId: import_zod14.z.string().trim().min(1).max(128).optional()
}).strict();
var AiSseAssistantChunkEventSchema = import_zod14.z.object({
  type: import_zod14.z.literal("assistant_chunk"),
  text: import_zod14.z.string()
});
var AiSseToolCallEventSchema = import_zod14.z.object({
  type: import_zod14.z.literal("tool_call"),
  name: import_zod14.z.string(),
  argsJson: import_zod14.z.string()
});
var AiSseToolResultEventSchema = import_zod14.z.object({
  type: import_zod14.z.literal("tool_result"),
  name: import_zod14.z.string(),
  resultJson: import_zod14.z.string(),
  durationMs: import_zod14.z.number(),
  errored: import_zod14.z.boolean()
});
var AiSseProposalEventSchema = import_zod14.z.object({
  type: import_zod14.z.literal("proposal"),
  proposalId: import_zod14.z.string(),
  moduleCode: import_zod14.z.string(),
  proposalType: import_zod14.z.string(),
  summary: import_zod14.z.string()
});
var AiSseCompleteEventSchema = import_zod14.z.object({
  type: import_zod14.z.literal("complete"),
  usage: import_zod14.z.object({
    tokensIn: import_zod14.z.number(),
    tokensOut: import_zod14.z.number(),
    durationMs: import_zod14.z.number(),
    model: import_zod14.z.string()
  })
});
var AiSseErrorEventSchema = import_zod14.z.object({
  type: import_zod14.z.literal("error"),
  code: import_zod14.z.string(),
  message: import_zod14.z.string()
});
var AiSseEventSchema = import_zod14.z.discriminatedUnion("type", [
  AiSseAssistantChunkEventSchema,
  AiSseToolCallEventSchema,
  AiSseToolResultEventSchema,
  AiSseProposalEventSchema,
  AiSseCompleteEventSchema,
  AiSseErrorEventSchema
]);

// src/ai/aiProposals.ts
var import_zod15 = require("zod");
var AiProposalStatusSchema = import_zod15.z.enum(["pending", "applied", "rejected"]);
var AiProposalDtoSchema = import_zod15.z.object({
  id: import_zod15.z.string().uuid(),
  workspaceId: import_zod15.z.string().uuid(),
  userId: import_zod15.z.string().uuid(),
  moduleCode: import_zod15.z.string().min(1).max(32),
  proposalType: import_zod15.z.string().min(1).max(64),
  summary: import_zod15.z.string().min(1).max(2e3),
  payloadJson: import_zod15.z.record(import_zod15.z.string(), import_zod15.z.unknown()),
  status: AiProposalStatusSchema,
  createdAt: import_zod15.z.string(),
  appliedAt: import_zod15.z.string().nullable(),
  rejectedAt: import_zod15.z.string().nullable()
}).strict();
var AiProposalListResponseSchema = import_zod15.z.object({
  ok: import_zod15.z.literal(true),
  items: import_zod15.z.array(AiProposalDtoSchema)
}).strict();
var AiProposalIdParamsSchema = import_zod15.z.object({
  id: import_zod15.z.string().trim().min(1, "Params.id is required")
});
var AiProposalGetResponseSchema = import_zod15.z.object({
  ok: import_zod15.z.literal(true),
  proposal: AiProposalDtoSchema
}).strict();
var AiProposalActionResponseSchema = import_zod15.z.object({
  ok: import_zod15.z.literal(true),
  proposal: AiProposalDtoSchema,
  appliedPreviewOnly: import_zod15.z.boolean().optional()
}).strict();
var MrpProposeOrderAdjustmentInputSchema = import_zod15.z.object({
  productionOrderId: import_zod15.z.string().uuid(),
  suggestedStartDate: import_zod15.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  suggestedQuantity: import_zod15.z.number().positive().optional(),
  rationale: import_zod15.z.string().max(500).optional()
}).strict();
var MrpProposeOrderAdjustmentOutputSchema = import_zod15.z.object({
  ok: import_zod15.z.literal(true),
  proposalId: import_zod15.z.string().uuid(),
  summary: import_zod15.z.string()
}).strict();
var CrpProposeScheduleAdjustmentInputSchema = import_zod15.z.object({
  resourceId: import_zod15.z.string().uuid().optional(),
  suggestedDate: import_zod15.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rationale: import_zod15.z.string().max(500).optional()
}).strict();
var CrpProposeScheduleAdjustmentOutputSchema = import_zod15.z.object({
  ok: import_zod15.z.literal(true),
  proposalId: import_zod15.z.string().uuid(),
  summary: import_zod15.z.string()
}).strict();

// src/rendering/renderJobs.ts
var import_zod16 = require("zod");
var RenderKindSchema = import_zod16.z.enum([
  "pdf",
  "xlsx",
  "csv",
  "docx",
  "odt",
  "html",
  "json",
  "xml",
  "barcode",
  "qr"
]);
var RenderStatusSchema = import_zod16.z.enum([
  "queued",
  "running",
  "succeeded",
  "failed"
]);
var RenderVisibilitySchema = import_zod16.z.enum(["workspace", "public"]);
var RenderDeliverySchema = import_zod16.z.discriminatedUnion("mode", [
  import_zod16.z.object({ mode: import_zod16.z.literal("stream-response") }).strict(),
  import_zod16.z.object({
    mode: import_zod16.z.literal("persist-to-media"),
    visibility: RenderVisibilitySchema
  }).strict(),
  import_zod16.z.object({
    mode: import_zod16.z.literal("email"),
    to: import_zod16.z.array(import_zod16.z.string().email()).min(1, "email.to required"),
    subject: import_zod16.z.string().min(1, "email.subject required")
  }).strict()
]);
var RenderErrorSchema = import_zod16.z.object({
  code: import_zod16.z.string().min(1, "error.code required"),
  message: import_zod16.z.string().min(1, "error.message required")
}).strict();
var RenderJobSubmitRequestSchema = import_zod16.z.object({
  templateRef: import_zod16.z.string().min(1, "templateRef required"),
  kind: RenderKindSchema.optional(),
  data: import_zod16.z.unknown(),
  delivery: RenderDeliverySchema.optional()
}).strict();
var RenderJobStatusSchema = import_zod16.z.object({
  id: import_zod16.z.string().min(1, "job.id required"),
  templateRef: import_zod16.z.string().min(1, "job.templateRef required"),
  kind: RenderKindSchema,
  status: RenderStatusSchema,
  deliveryMode: import_zod16.z.string().min(1, "job.deliveryMode required"),
  requestedAt: import_zod16.z.string().min(1, "job.requestedAt required"),
  startedAt: import_zod16.z.string().nullable(),
  completedAt: import_zod16.z.string().nullable(),
  artifactId: import_zod16.z.string().nullable(),
  mediaAssetId: import_zod16.z.string().nullable(),
  error: RenderErrorSchema.nullable()
}).strict();
var RenderJobSubmitResponseSchema = import_zod16.z.object({
  ok: import_zod16.z.literal(true),
  mode: import_zod16.z.literal("async"),
  job: RenderJobStatusSchema
}).strict();
var RenderJobStatusResponseSchema = import_zod16.z.object({
  ok: import_zod16.z.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobCancelResponseSchema = import_zod16.z.object({
  ok: import_zod16.z.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobResultResponseSchema = import_zod16.z.object({
  ok: import_zod16.z.literal(true),
  job: RenderJobStatusSchema,
  signedUrl: import_zod16.z.string().min(1, "signedUrl required"),
  expiresAt: import_zod16.z.string().min(1, "expiresAt required")
}).strict();
var ErrorResponseSchema = import_zod16.z.object({
  ok: import_zod16.z.literal(false),
  error: RenderErrorSchema.extend({
    details: import_zod16.z.record(import_zod16.z.string(), import_zod16.z.unknown()).optional()
  }).strict()
}).strict();
function parseRenderJobSubmitRequest(payload) {
  return RenderJobSubmitRequestSchema.parse(payload);
}
function parseRenderJobStatusResponse(payload) {
  return RenderJobStatusResponseSchema.parse(payload);
}

// src/brewery/listResponses.ts
var import_zod17 = require("zod");
var RecipeListItemSchema = import_zod17.z.object({
  id: import_zod17.z.string(),
  accountId: import_zod17.z.string().optional(),
  name: import_zod17.z.string(),
  styleKey: import_zod17.z.string().optional(),
  style: import_zod17.z.string().nullable().optional(),
  version: import_zod17.z.number().optional()
});
var RecipesListResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  recipes: import_zod17.z.array(RecipeListItemSchema)
});
function parseRecipesListResponse(payload) {
  return RecipesListResponseSchema.parse(payload);
}
var isoDateTime7 = import_zod17.z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, import_zod17.z.string());
var BrewSessionListItemSchema = import_zod17.z.object({
  id: import_zod17.z.string(),
  code: import_zod17.z.string(),
  status: import_zod17.z.string(),
  createdAt: isoDateTime7,
  startedAt: import_zod17.z.preprocess((v) => v instanceof Date ? v.toISOString() : v, import_zod17.z.string().nullable()).optional(),
  stoppedAt: import_zod17.z.preprocess((v) => v instanceof Date ? v.toISOString() : v, import_zod17.z.string().nullable()).optional()
});
var BrewSessionsListResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  brewSessions: import_zod17.z.array(BrewSessionListItemSchema)
});
function parseBrewSessionsListResponse(payload) {
  return BrewSessionsListResponseSchema.parse(payload);
}
var BrewSessionRecipeRefSchema = import_zod17.z.object({
  id: import_zod17.z.string().min(1),
  name: import_zod17.z.string(),
  version: import_zod17.z.number().int()
});
var BrewSessionLogSchema = import_zod17.z.object({
  id: import_zod17.z.string().min(1),
  brewSessionId: import_zod17.z.string().min(1),
  kind: import_zod17.z.string(),
  message: import_zod17.z.string(),
  createdAt: isoDateTime7,
  stepId: import_zod17.z.string().nullable(),
  payloadJson: import_zod17.z.record(import_zod17.z.string(), import_zod17.z.unknown()).nullable().optional()
}).passthrough();
var BrewSessionStepSchema = import_zod17.z.object({
  id: import_zod17.z.string().min(1),
  brewSessionId: import_zod17.z.string().min(1),
  name: import_zod17.z.string(),
  status: import_zod17.z.string(),
  sortOrder: import_zod17.z.number().int(),
  sectionId: import_zod17.z.string(),
  sectionName: import_zod17.z.string().nullable(),
  createdAt: isoDateTime7,
  updatedAt: isoDateTime7,
  isDisabled: import_zod17.z.boolean(),
  customTimerEnabled: import_zod17.z.boolean(),
  note: import_zod17.z.string().nullable(),
  minutesPlanned: import_zod17.z.number().nullable(),
  offsetMinutesFromEnd: import_zod17.z.number().nullable(),
  relativeToStepId: import_zod17.z.string().nullable(),
  timerAccumulatedSeconds: import_zod17.z.number(),
  timerLastStartedAt: isoDateTime7.nullable(),
  timerPausedAt: isoDateTime7.nullable(),
  timerStartedAt: isoDateTime7.nullable(),
  timerState: import_zod17.z.string(),
  timerStoppedAt: isoDateTime7.nullable()
}).passthrough();
var BrewSessionPayloadSchema = import_zod17.z.object({
  id: import_zod17.z.string().min(1),
  workspaceId: import_zod17.z.string().min(1),
  recipeId: import_zod17.z.string().min(1),
  code: import_zod17.z.string().nullable(),
  status: import_zod17.z.string(),
  createdAt: isoDateTime7,
  updatedAt: isoDateTime7,
  startedAt: isoDateTime7.nullable(),
  pausedAt: isoDateTime7.nullable(),
  stoppedAt: isoDateTime7.nullable(),
  scheduledDate: isoDateTime7.nullable(),
  recipe: BrewSessionRecipeRefSchema.optional(),
  steps: import_zod17.z.array(BrewSessionStepSchema).optional(),
  logs: import_zod17.z.array(BrewSessionLogSchema).optional()
}).passthrough();
var BrewSessionDetailResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  brewSession: BrewSessionPayloadSchema
});
var BrewSessionCreateResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  brewSession: BrewSessionPayloadSchema,
  steps: import_zod17.z.array(BrewSessionStepSchema)
});
var BrewSessionStepResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  step: BrewSessionStepSchema
});
var BrewSessionStepsResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  steps: import_zod17.z.array(BrewSessionStepSchema)
});
var BrewSessionPatchRequestSchema = import_zod17.z.object({
  scheduledDate: import_zod17.z.string().nullable().optional()
});
var BrewSessionStepsPatchRequestSchema = import_zod17.z.object({
  steps: import_zod17.z.array(import_zod17.z.record(import_zod17.z.string(), import_zod17.z.unknown()))
});
var BrewSessionStepTimerPatchRequestSchema = import_zod17.z.object({
  customTimerEnabled: import_zod17.z.boolean()
});
var BrewSessionStopRequestSchema = import_zod17.z.preprocess(
  (raw) => raw === null || raw === void 0 ? {} : raw,
  import_zod17.z.object({
    reason: import_zod17.z.enum(["auto", "manual"]).optional()
  })
);
var BrewSessionStepLogRequestSchema = import_zod17.z.object({
  status: import_zod17.z.enum(["pending", "in_progress", "done", "skipped", "not_applicable"]),
  note: import_zod17.z.string().nullable().optional(),
  name: import_zod17.z.string().optional(),
  isDisabled: import_zod17.z.boolean().optional()
});
var IntegrationAttachmentDeviceSchema = import_zod17.z.record(import_zod17.z.string(), import_zod17.z.unknown());
var IntegrationAttachmentSchema = import_zod17.z.object({
  id: import_zod17.z.string(),
  attachedAt: isoDateTime7,
  device: IntegrationAttachmentDeviceSchema
});
var IntegrationAttachmentsResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  attachments: import_zod17.z.array(IntegrationAttachmentSchema)
});
var IntegrationAttachRequestSchema = import_zod17.z.object({
  kind: import_zod17.z.enum(["tilt", "ispindel", "rapt"]),
  deviceId: import_zod17.z.string().min(1)
});
var IntegrationAttachResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  attachment: import_zod17.z.record(import_zod17.z.string(), import_zod17.z.unknown())
});
var IntegrationDetachRequestSchema = import_zod17.z.object({
  deviceId: import_zod17.z.string().min(1)
});
var IntegrationDetachResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  detachedCount: import_zod17.z.number()
});
var IntegrationReadingSchema = import_zod17.z.record(import_zod17.z.string(), import_zod17.z.unknown());
var IntegrationReadingsResponseSchema = import_zod17.z.object({
  ok: import_zod17.z.literal(true),
  readings: import_zod17.z.array(IntegrationReadingSchema)
});
function parseBrewSessionCreateResponse(payload) {
  const parsed = BrewSessionCreateResponseSchema.parse(payload);
  const brewSession = parsed.brewSession;
  return { brewSession: { id: typeof brewSession.id === "string" ? brewSession.id : "" } };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActiveWorkspaceContextResponseSchema,
  AdPlacementSchema,
  AdPlatformSchema,
  AdSlotParamsSchema,
  AdSlotQuerySchema,
  AdSlotResponseSchema,
  AiChatRequestBodySchema,
  AiProposalActionResponseSchema,
  AiProposalDtoSchema,
  AiProposalGetResponseSchema,
  AiProposalIdParamsSchema,
  AiProposalListResponseSchema,
  AiProposalStatusSchema,
  AiProviderSchema,
  AiRoleLimitsSchema,
  AiSseAssistantChunkEventSchema,
  AiSseCompleteEventSchema,
  AiSseErrorEventSchema,
  AiSseEventSchema,
  AiSseProposalEventSchema,
  AiSseToolCallEventSchema,
  AiSseToolResultEventSchema,
  AiToolCallRecordSchema,
  AiUsageByUserSchema,
  AiUsageDailyPointSchema,
  AiUsageLedgerEntrySchema,
  AiUsageMonthlySchema,
  AiUsageRoleAlertSchema,
  AiUsageUserAlertSchema,
  AuthActiveWorkspaceRequestSchema,
  AuthActiveWorkspaceResponseSchema,
  AuthLoginNativeResponseSchema,
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
  AuthLogoutResponseSchema,
  AuthMeResponseSchema,
  AuthMeResponseUserSchema,
  AuthMeResponseWorkspaceSchema,
  AuthPreferencesPatchRequestSchema,
  AuthPreferencesPatchResponseSchema,
  AuthSessionUserSchema,
  AuthSignupRequestSchema,
  AuthSignupResponseSchema,
  AuthWebviewBridgeQuerySchema,
  AuthWebviewExchangeRequestSchema,
  AuthWebviewExchangeResponseSchema,
  BeerJsonExportResponseSchema,
  BeerJsonLooseSchema,
  BeerStyleSchema,
  BillingConfirmRequestSchema,
  BillingConfirmResponseSchema,
  BillingIntentRequestSchema,
  BillingIntentResponseSchema,
  BillingPurchaseIntentModeSchema,
  BillingPurchaseProviderSchema,
  BillingTierSchema,
  BillingWorkspaceIdParamsSchema,
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
  BrewSessionSummarySchema,
  BrewSessionsListResponseSchema,
  BrewSessionsRecentQuerySchema,
  BrewSessionsRecentResponseSchema,
  BrewdaySettingsPatchRequestSchema,
  BrewdaySettingsPayloadSchema,
  BrewdaySettingsResponseSchema,
  ContextMeResponseSchema,
  CrpProposeScheduleAdjustmentInputSchema,
  CrpProposeScheduleAdjustmentOutputSchema,
  EquipmentProfileCreateRequestSchema,
  EquipmentProfilePatchRequestSchema,
  EquipmentProfilePayloadSchema,
  EquipmentProfileResponseSchema,
  EquipmentProfilesListResponseSchema,
  ErrorResponseSchema,
  FermentableItemSchema,
  FermentablesListResponseSchema,
  HealthResponseSchema,
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
  IntegrationBrewSessionRefSchema,
  IntegrationCreateResponseSchema,
  IntegrationDetachRequestSchema,
  IntegrationDetachResponseSchema,
  IntegrationDeviceAttachRequestSchema,
  IntegrationDeviceAttachResponseSchema,
  IntegrationDeviceAttachmentSchema,
  IntegrationDeviceDetachResponseSchema,
  IntegrationDeviceIdParamsSchema,
  IntegrationDeviceReadingSchema,
  IntegrationDeviceSchema,
  IntegrationDevicesListResponseSchema,
  IntegrationDevicesQuerySchema,
  IntegrationGetResponseSchema,
  IntegrationKindSchema,
  IntegrationOkResponseSchema,
  IntegrationReadingSchema,
  IntegrationReadingsQuerySchema,
  IntegrationReadingsResponseSchema,
  IntegrationRevealResponseSchema,
  IntegrationSummarySchema,
  IntegrationTokenParamsSchema,
  IntegrationWorkspaceIdParamsSchema,
  IntegrationWorkspaceKindParamsSchema,
  InventoryCategoryQuerySchema,
  InventoryCreateRequestSchema,
  InventoryItemPayloadSchema,
  InventoryItemResponseSchema,
  InventoryListResponseSchema,
  InventoryPatchRequestSchema,
  MashComputeAndSaveRequestSchema,
  MashComputeAndSaveResponseSchema,
  MrpProposeOrderAdjustmentInputSchema,
  MrpProposeOrderAdjustmentOutputSchema,
  OkResponseSchema,
  PlatformAdCreateRequestSchema,
  PlatformAdCreateResponseSchema,
  PlatformAdIdParamsSchema,
  PlatformAdOkResponseSchema,
  PlatformAdPatchRequestSchema,
  PlatformAdRowSchema,
  PlatformAdminOkResponseSchema,
  PlatformAdsListResponseSchema,
  PlatformImportFormatSchema,
  PlatformRecipeBulkImportPreviewItemSchema,
  PlatformRecipeBulkImportPreviewRequestSchema,
  PlatformRecipeBulkImportPreviewResponseSchema,
  PlatformRecipeBulkImportRequestSchema,
  PlatformRecipeBulkImportResponseSchema,
  PlatformRecipeExportQuerySchema,
  PlatformRecipeIdParamsSchema,
  PlatformRecipeImportPreviewRequestSchema,
  PlatformRecipeImportPreviewResponseSchema,
  PlatformRecipeImportRequestSchema,
  PlatformRecipeImportResponseSchema,
  PlatformRecipeSummarySchema,
  PlatformRecipesListQuerySchema,
  PlatformRecipesListResponseSchema,
  PlatformWorkspaceRowSchema,
  PlatformWorkspacesListResponseSchema,
  PreferredLocaleSchema,
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
  RenderDeliverySchema,
  RenderErrorSchema,
  RenderJobCancelResponseSchema,
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobStatusSchema,
  RenderJobSubmitRequestSchema,
  RenderJobSubmitResponseSchema,
  RenderKindSchema,
  RenderStatusSchema,
  RenderVisibilitySchema,
  ResolvedAdSchema,
  SafeNextPathSchema,
  SpargeComputeAndSaveRequestSchema,
  SpargeComputeAndSaveResponseSchema,
  StylesListResponseSchema,
  TierLimitsSchema,
  TiltIngestBodySchema,
  TiltIngestResponseSchema,
  UiDensitySchema,
  UiFontScaleSchema,
  UiThemeSchema,
  UpdateWorkspaceAiSettingsRequestSchema,
  WaterCalcRequestSchema,
  WaterCalcResultOnlyResponseSchema,
  WaterCalcWithDerivationResponseSchema,
  WaterProfileCreateRequestSchema,
  WaterProfileItemSchema,
  WaterProfilePatchRequestSchema,
  WaterProfileResponseSchema,
  WaterProfilesListResponseSchema,
  WebhookOkResponseSchema,
  WebhookRevenuecatBodySchema,
  WebhookStripeBodySchema,
  WorkspaceAiSettingsParamsSchema,
  WorkspaceAiSettingsResponseSchema,
  WorkspaceAiSettingsSchema,
  WorkspaceAiUsageResponseSchema,
  WorkspaceBillingResponseSchema,
  WorkspaceBrandPatchRequestSchema,
  WorkspaceBrandPatchResponseSchema,
  WorkspaceCreateRequestSchema,
  WorkspaceCreateResponseSchema,
  WorkspaceIdParamsSchema,
  WorkspaceRowSchema,
  WorkspacesListResponseSchema,
  YeastItemSchema,
  YeastsListResponseSchema,
  analysisFormatHints,
  parseAuthMeResponse,
  parseBoilComputeAndSaveResponse,
  parseBrewSessionCreateResponse,
  parseBrewSessionsListResponse,
  parseGravityAnalysisResponseV1,
  parseMashComputeAndSaveResponse,
  parseRecipeWaterHubSummaryResponse,
  parseRecipesListResponse,
  parseRenderJobStatusResponse,
  parseRenderJobSubmitRequest,
  parseSpargeComputeAndSaveResponse,
  parseWaterProfileItem,
  parseWaterProfilesResponse,
  waterFormatHints
});
