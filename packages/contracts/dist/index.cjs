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
  BeerJsonLooseSchema: () => BeerJsonLooseSchema,
  BillingConfirmRequestSchema: () => BillingConfirmRequestSchema,
  BillingConfirmResponseSchema: () => BillingConfirmResponseSchema,
  BillingIntentRequestSchema: () => BillingIntentRequestSchema,
  BillingIntentResponseSchema: () => BillingIntentResponseSchema,
  BillingPurchaseIntentModeSchema: () => BillingPurchaseIntentModeSchema,
  BillingPurchaseProviderSchema: () => BillingPurchaseProviderSchema,
  BillingTierSchema: () => BillingTierSchema,
  BillingWorkspaceIdParamsSchema: () => BillingWorkspaceIdParamsSchema,
  BrewSessionSummarySchema: () => BrewSessionSummarySchema,
  BrewSessionsRecentQuerySchema: () => BrewSessionsRecentQuerySchema,
  BrewSessionsRecentResponseSchema: () => BrewSessionsRecentResponseSchema,
  ContextMeResponseSchema: () => ContextMeResponseSchema,
  CrpProposeScheduleAdjustmentInputSchema: () => CrpProposeScheduleAdjustmentInputSchema,
  CrpProposeScheduleAdjustmentOutputSchema: () => CrpProposeScheduleAdjustmentOutputSchema,
  ErrorResponseSchema: () => ErrorResponseSchema,
  HealthResponseSchema: () => HealthResponseSchema,
  IntegrationBrewSessionRefSchema: () => IntegrationBrewSessionRefSchema,
  IntegrationCreateResponseSchema: () => IntegrationCreateResponseSchema,
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
  IntegrationRevealResponseSchema: () => IntegrationRevealResponseSchema,
  IntegrationSummarySchema: () => IntegrationSummarySchema,
  IntegrationTokenParamsSchema: () => IntegrationTokenParamsSchema,
  IntegrationWorkspaceIdParamsSchema: () => IntegrationWorkspaceIdParamsSchema,
  IntegrationWorkspaceKindParamsSchema: () => IntegrationWorkspaceKindParamsSchema,
  MrpProposeOrderAdjustmentInputSchema: () => MrpProposeOrderAdjustmentInputSchema,
  MrpProposeOrderAdjustmentOutputSchema: () => MrpProposeOrderAdjustmentOutputSchema,
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
  TierLimitsSchema: () => TierLimitsSchema,
  TiltIngestBodySchema: () => TiltIngestBodySchema,
  TiltIngestResponseSchema: () => TiltIngestResponseSchema,
  UiDensitySchema: () => UiDensitySchema,
  UiFontScaleSchema: () => UiFontScaleSchema,
  UiThemeSchema: () => UiThemeSchema,
  UpdateWorkspaceAiSettingsRequestSchema: () => UpdateWorkspaceAiSettingsRequestSchema,
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
  analysisFormatHints: () => analysisFormatHints,
  parseAuthMeResponse: () => parseAuthMeResponse,
  parseRenderJobStatusResponse: () => parseRenderJobStatusResponse,
  parseRenderJobSubmitRequest: () => parseRenderJobSubmitRequest,
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

// src/ai/aiUsage.ts
var import_zod10 = require("zod");
var AiUsageMonthlySchema = import_zod10.z.object({
  tokensIn: import_zod10.z.number().int().nonnegative(),
  tokensOut: import_zod10.z.number().int().nonnegative(),
  costMicroUsd: import_zod10.z.number().nonnegative(),
  callCount: import_zod10.z.number().int().nonnegative()
});
var AiUsageDailyPointSchema = import_zod10.z.object({
  day: import_zod10.z.string(),
  tokensIn: import_zod10.z.number().int().nonnegative(),
  tokensOut: import_zod10.z.number().int().nonnegative(),
  calls: import_zod10.z.number().int().nonnegative()
});
var AiUsageByUserSchema = import_zod10.z.object({
  userId: import_zod10.z.string().min(1),
  email: import_zod10.z.string().nullable(),
  role: import_zod10.z.string().nullable(),
  tokensInToday: import_zod10.z.number().int().nonnegative(),
  tokensOutToday: import_zod10.z.number().int().nonnegative(),
  tokensInMonth: import_zod10.z.number().int().nonnegative(),
  tokensOutMonth: import_zod10.z.number().int().nonnegative(),
  costMicroUsdMonth: import_zod10.z.number().nonnegative(),
  callCountMonth: import_zod10.z.number().int().nonnegative()
});
var AiUsageRoleAlertSchema = import_zod10.z.object({
  role: import_zod10.z.string(),
  used: import_zod10.z.number().nonnegative(),
  limit: import_zod10.z.number().nonnegative(),
  percent: import_zod10.z.number().nonnegative()
});
var AiUsageUserAlertSchema = import_zod10.z.object({
  userId: import_zod10.z.string().min(1),
  usedToday: import_zod10.z.number().nonnegative(),
  cap: import_zod10.z.number().nonnegative(),
  percent: import_zod10.z.number().nonnegative()
});
var WorkspaceAiUsageResponseSchema = import_zod10.z.object({
  ok: import_zod10.z.literal(true),
  monthly: AiUsageMonthlySchema,
  dailySeries: import_zod10.z.array(AiUsageDailyPointSchema),
  roleLimits: import_zod10.z.record(import_zod10.z.string(), import_zod10.z.number()),
  roleUsage: import_zod10.z.record(import_zod10.z.string(), import_zod10.z.number()),
  perUserDailyCap: import_zod10.z.number().int().nonnegative(),
  byUser: import_zod10.z.array(AiUsageByUserSchema),
  alerts: import_zod10.z.object({
    roleAlerts: import_zod10.z.array(AiUsageRoleAlertSchema),
    userAlerts: import_zod10.z.array(AiUsageUserAlertSchema)
  })
});
var AiToolCallRecordSchema = import_zod10.z.object({
  name: import_zod10.z.string(),
  argsJson: import_zod10.z.string(),
  resultJson: import_zod10.z.string(),
  durationMs: import_zod10.z.number().nonnegative(),
  errored: import_zod10.z.boolean()
});
var AiUsageLedgerEntrySchema = import_zod10.z.object({
  id: import_zod10.z.string().min(1),
  workspaceId: import_zod10.z.string().min(1),
  userId: import_zod10.z.string().min(1),
  sessionId: import_zod10.z.string().nullable(),
  model: import_zod10.z.string(),
  tokensIn: import_zod10.z.number().int().nonnegative(),
  tokensOut: import_zod10.z.number().int().nonnegative(),
  costMicroUsd: import_zod10.z.number().nonnegative(),
  durationMs: import_zod10.z.number().nonnegative(),
  providerRequestId: import_zod10.z.string().nullable(),
  toolCalls: import_zod10.z.array(AiToolCallRecordSchema),
  createdAt: import_zod10.z.string()
});

// src/ai/aiSettings.ts
var import_zod11 = require("zod");
var AiProviderSchema = import_zod11.z.enum(["anthropic", "openai"]);
var AiRoleLimitsSchema = import_zod11.z.record(import_zod11.z.string(), import_zod11.z.number().nonnegative());
var WorkspaceAiSettingsSchema = import_zod11.z.object({
  workspaceId: import_zod11.z.string().min(1),
  provider: AiProviderSchema,
  hasKey: import_zod11.z.boolean(),
  enabled: import_zod11.z.boolean(),
  roleLimits: AiRoleLimitsSchema,
  perUserDailyCap: import_zod11.z.number().int().nonnegative(),
  dataEgressAccepted: import_zod11.z.boolean(),
  dataEgressAcceptedAt: import_zod11.z.string().nullable(),
  createdAt: import_zod11.z.string(),
  updatedAt: import_zod11.z.string()
});
var UpdateWorkspaceAiSettingsRequestSchema = import_zod11.z.object({
  provider: AiProviderSchema.optional(),
  apiKey: import_zod11.z.string().optional(),
  enabled: import_zod11.z.boolean().optional(),
  roleLimits: AiRoleLimitsSchema.optional(),
  perUserDailyCap: import_zod11.z.number().int().nonnegative().optional(),
  dataEgressAccepted: import_zod11.z.boolean().optional()
}).strict();
var WorkspaceAiSettingsResponseSchema = import_zod11.z.object({
  ok: import_zod11.z.literal(true),
  settings: WorkspaceAiSettingsSchema
});
var WorkspaceAiSettingsParamsSchema = import_zod11.z.object({
  workspaceId: import_zod11.z.string().trim().min(1, "Params.workspaceId is required")
});

// src/ai/aiChat.ts
var import_zod12 = require("zod");
var AiChatRequestBodySchema = import_zod12.z.object({
  message: import_zod12.z.string().trim().min(1).max(8e3),
  sessionId: import_zod12.z.string().trim().min(1).max(200).optional(),
  routeId: import_zod12.z.string().trim().min(1).max(128).optional()
}).strict();
var AiSseAssistantChunkEventSchema = import_zod12.z.object({
  type: import_zod12.z.literal("assistant_chunk"),
  text: import_zod12.z.string()
});
var AiSseToolCallEventSchema = import_zod12.z.object({
  type: import_zod12.z.literal("tool_call"),
  name: import_zod12.z.string(),
  argsJson: import_zod12.z.string()
});
var AiSseToolResultEventSchema = import_zod12.z.object({
  type: import_zod12.z.literal("tool_result"),
  name: import_zod12.z.string(),
  resultJson: import_zod12.z.string(),
  durationMs: import_zod12.z.number(),
  errored: import_zod12.z.boolean()
});
var AiSseProposalEventSchema = import_zod12.z.object({
  type: import_zod12.z.literal("proposal"),
  proposalId: import_zod12.z.string(),
  moduleCode: import_zod12.z.string(),
  proposalType: import_zod12.z.string(),
  summary: import_zod12.z.string()
});
var AiSseCompleteEventSchema = import_zod12.z.object({
  type: import_zod12.z.literal("complete"),
  usage: import_zod12.z.object({
    tokensIn: import_zod12.z.number(),
    tokensOut: import_zod12.z.number(),
    durationMs: import_zod12.z.number(),
    model: import_zod12.z.string()
  })
});
var AiSseErrorEventSchema = import_zod12.z.object({
  type: import_zod12.z.literal("error"),
  code: import_zod12.z.string(),
  message: import_zod12.z.string()
});
var AiSseEventSchema = import_zod12.z.discriminatedUnion("type", [
  AiSseAssistantChunkEventSchema,
  AiSseToolCallEventSchema,
  AiSseToolResultEventSchema,
  AiSseProposalEventSchema,
  AiSseCompleteEventSchema,
  AiSseErrorEventSchema
]);

// src/ai/aiProposals.ts
var import_zod13 = require("zod");
var AiProposalStatusSchema = import_zod13.z.enum(["pending", "applied", "rejected"]);
var AiProposalDtoSchema = import_zod13.z.object({
  id: import_zod13.z.string().uuid(),
  workspaceId: import_zod13.z.string().uuid(),
  userId: import_zod13.z.string().uuid(),
  moduleCode: import_zod13.z.string().min(1).max(32),
  proposalType: import_zod13.z.string().min(1).max(64),
  summary: import_zod13.z.string().min(1).max(2e3),
  payloadJson: import_zod13.z.record(import_zod13.z.string(), import_zod13.z.unknown()),
  status: AiProposalStatusSchema,
  createdAt: import_zod13.z.string(),
  appliedAt: import_zod13.z.string().nullable(),
  rejectedAt: import_zod13.z.string().nullable()
}).strict();
var AiProposalListResponseSchema = import_zod13.z.object({
  ok: import_zod13.z.literal(true),
  items: import_zod13.z.array(AiProposalDtoSchema)
}).strict();
var AiProposalIdParamsSchema = import_zod13.z.object({
  id: import_zod13.z.string().trim().min(1, "Params.id is required")
});
var AiProposalGetResponseSchema = import_zod13.z.object({
  ok: import_zod13.z.literal(true),
  proposal: AiProposalDtoSchema
}).strict();
var AiProposalActionResponseSchema = import_zod13.z.object({
  ok: import_zod13.z.literal(true),
  proposal: AiProposalDtoSchema,
  appliedPreviewOnly: import_zod13.z.boolean().optional()
}).strict();
var MrpProposeOrderAdjustmentInputSchema = import_zod13.z.object({
  productionOrderId: import_zod13.z.string().uuid(),
  suggestedStartDate: import_zod13.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  suggestedQuantity: import_zod13.z.number().positive().optional(),
  rationale: import_zod13.z.string().max(500).optional()
}).strict();
var MrpProposeOrderAdjustmentOutputSchema = import_zod13.z.object({
  ok: import_zod13.z.literal(true),
  proposalId: import_zod13.z.string().uuid(),
  summary: import_zod13.z.string()
}).strict();
var CrpProposeScheduleAdjustmentInputSchema = import_zod13.z.object({
  resourceId: import_zod13.z.string().uuid().optional(),
  suggestedDate: import_zod13.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rationale: import_zod13.z.string().max(500).optional()
}).strict();
var CrpProposeScheduleAdjustmentOutputSchema = import_zod13.z.object({
  ok: import_zod13.z.literal(true),
  proposalId: import_zod13.z.string().uuid(),
  summary: import_zod13.z.string()
}).strict();

// src/rendering/renderJobs.ts
var import_zod14 = require("zod");
var RenderKindSchema = import_zod14.z.enum([
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
var RenderStatusSchema = import_zod14.z.enum([
  "queued",
  "running",
  "succeeded",
  "failed"
]);
var RenderVisibilitySchema = import_zod14.z.enum(["workspace", "public"]);
var RenderDeliverySchema = import_zod14.z.discriminatedUnion("mode", [
  import_zod14.z.object({ mode: import_zod14.z.literal("stream-response") }).strict(),
  import_zod14.z.object({
    mode: import_zod14.z.literal("persist-to-media"),
    visibility: RenderVisibilitySchema
  }).strict(),
  import_zod14.z.object({
    mode: import_zod14.z.literal("email"),
    to: import_zod14.z.array(import_zod14.z.string().email()).min(1, "email.to required"),
    subject: import_zod14.z.string().min(1, "email.subject required")
  }).strict()
]);
var RenderErrorSchema = import_zod14.z.object({
  code: import_zod14.z.string().min(1, "error.code required"),
  message: import_zod14.z.string().min(1, "error.message required")
}).strict();
var RenderJobSubmitRequestSchema = import_zod14.z.object({
  templateRef: import_zod14.z.string().min(1, "templateRef required"),
  kind: RenderKindSchema.optional(),
  data: import_zod14.z.unknown(),
  delivery: RenderDeliverySchema.optional()
}).strict();
var RenderJobStatusSchema = import_zod14.z.object({
  id: import_zod14.z.string().min(1, "job.id required"),
  templateRef: import_zod14.z.string().min(1, "job.templateRef required"),
  kind: RenderKindSchema,
  status: RenderStatusSchema,
  deliveryMode: import_zod14.z.string().min(1, "job.deliveryMode required"),
  requestedAt: import_zod14.z.string().min(1, "job.requestedAt required"),
  startedAt: import_zod14.z.string().nullable(),
  completedAt: import_zod14.z.string().nullable(),
  artifactId: import_zod14.z.string().nullable(),
  mediaAssetId: import_zod14.z.string().nullable(),
  error: RenderErrorSchema.nullable()
}).strict();
var RenderJobSubmitResponseSchema = import_zod14.z.object({
  ok: import_zod14.z.literal(true),
  mode: import_zod14.z.literal("async"),
  job: RenderJobStatusSchema
}).strict();
var RenderJobStatusResponseSchema = import_zod14.z.object({
  ok: import_zod14.z.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobCancelResponseSchema = import_zod14.z.object({
  ok: import_zod14.z.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobResultResponseSchema = import_zod14.z.object({
  ok: import_zod14.z.literal(true),
  job: RenderJobStatusSchema,
  signedUrl: import_zod14.z.string().min(1, "signedUrl required"),
  expiresAt: import_zod14.z.string().min(1, "expiresAt required")
}).strict();
var ErrorResponseSchema = import_zod14.z.object({
  ok: import_zod14.z.literal(false),
  error: RenderErrorSchema.extend({
    details: import_zod14.z.record(import_zod14.z.string(), import_zod14.z.unknown()).optional()
  }).strict()
}).strict();
function parseRenderJobSubmitRequest(payload) {
  return RenderJobSubmitRequestSchema.parse(payload);
}
function parseRenderJobStatusResponse(payload) {
  return RenderJobStatusResponseSchema.parse(payload);
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
  BeerJsonLooseSchema,
  BillingConfirmRequestSchema,
  BillingConfirmResponseSchema,
  BillingIntentRequestSchema,
  BillingIntentResponseSchema,
  BillingPurchaseIntentModeSchema,
  BillingPurchaseProviderSchema,
  BillingTierSchema,
  BillingWorkspaceIdParamsSchema,
  BrewSessionSummarySchema,
  BrewSessionsRecentQuerySchema,
  BrewSessionsRecentResponseSchema,
  ContextMeResponseSchema,
  CrpProposeScheduleAdjustmentInputSchema,
  CrpProposeScheduleAdjustmentOutputSchema,
  ErrorResponseSchema,
  HealthResponseSchema,
  IntegrationBrewSessionRefSchema,
  IntegrationCreateResponseSchema,
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
  IntegrationRevealResponseSchema,
  IntegrationSummarySchema,
  IntegrationTokenParamsSchema,
  IntegrationWorkspaceIdParamsSchema,
  IntegrationWorkspaceKindParamsSchema,
  MrpProposeOrderAdjustmentInputSchema,
  MrpProposeOrderAdjustmentOutputSchema,
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
  TierLimitsSchema,
  TiltIngestBodySchema,
  TiltIngestResponseSchema,
  UiDensitySchema,
  UiFontScaleSchema,
  UiThemeSchema,
  UpdateWorkspaceAiSettingsRequestSchema,
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
  analysisFormatHints,
  parseAuthMeResponse,
  parseRenderJobStatusResponse,
  parseRenderJobSubmitRequest,
  waterFormatHints
});
