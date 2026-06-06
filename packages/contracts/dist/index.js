// src/auth/meResponse.ts
import { z } from "zod";
var optionalStringWithNullPreserved = z.unknown().transform((v) => {
  if (v === null) return null;
  if (typeof v === "string") return v;
  return void 0;
});
var stringOrNullSoft = z.unknown().transform((v) => {
  if (typeof v === "string") return v;
  return null;
});
var optionalBooleanSoft = z.unknown().transform((v) => {
  if (typeof v === "boolean") return v;
  return void 0;
});
var AuthMeResponseUserSchema = z.object({
  id: z.string().min(1, "user.id required"),
  email: z.string().min(1, "user.email required"),
  preferredLocale: z.unknown().transform((v) => typeof v === "string" ? v : "en").default("en"),
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
var AuthMeResponseWorkspaceSchema = z.object({
  id: z.string().min(1, "workspace.id required"),
  name: z.string().min(1, "workspace.name required"),
  role: z.string(),
  brandKey: optionalStringWithNullPreserved.optional()
});
var AuthMeResponseSchema = z.preprocess(
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
  z.object({
    ok: z.literal(true, "ok must be true"),
    user: AuthMeResponseUserSchema,
    workspaces: z.array(AuthMeResponseWorkspaceSchema, "workspaces must be array"),
    activeWorkspaceId: stringOrNullSoft,
    role: stringOrNullSoft
  })
);
function parseAuthMeResponse(payload) {
  return AuthMeResponseSchema.parse(payload);
}

// src/auth/platformAuth.ts
import { z as z2 } from "zod";
var PreferredLocaleSchema = z2.unknown().transform((v) => v === "en" || v === "it" ? v : "en");
var UiThemeSchema = z2.unknown().transform((v) => {
  if (v === "default" || v === "hc_dark" || v === "hc_light") return v;
  return "default";
});
var UiFontScaleSchema = z2.unknown().transform((v) => {
  if (v === "sm" || v === "md" || v === "lg" || v === "xl") return v;
  return "md";
});
var UiDensitySchema = z2.unknown().transform((v) => {
  if (v === "comfortable" || v === "compact") return v;
  return "comfortable";
});
var SafeNextPathSchema = z2.preprocess(
  (v) => typeof v === "string" ? v.trim() : v,
  z2.string().min(1, "next is required").refine((next) => next.startsWith("/"), "next must start with '/'").refine((next) => !next.startsWith("//"), "next must not start with '//'").refine((next) => !next.includes("://"), "next must be a relative path").refine(
    (next) => next === "/en" || next.startsWith("/en/") || next === "/it" || next.startsWith("/it/"),
    "next must start with '/en' or '/it'"
  )
);
var AuthSessionUserSchema = z2.object({
  id: z2.string().min(1),
  email: z2.string().min(1),
  preferredLocale: PreferredLocaleSchema
});
var AuthSignupRequestSchema = z2.preprocess(
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
  z2.object({
    email: z2.string().transform((v) => v.trim().toLowerCase()).pipe(z2.string().min(1).includes("@", { message: "Email is required" })),
    password: z2.string().min(8, "Password must be at least 8 characters"),
    preferredLocale: PreferredLocaleSchema.optional(),
    workspaceName: z2.string().optional()
  })
);
var AuthSignupResponseSchema = z2.object({
  ok: z2.literal(true),
  user: AuthSessionUserSchema,
  activeWorkspaceId: z2.string().nullable()
});
var AuthLoginRequestSchema = z2.object({
  email: z2.string().transform((v) => v.trim().toLowerCase()).pipe(z2.string().min(1).includes("@", { message: "Email is required" })),
  password: z2.string().min(1, "Password is required"),
  preferredLocale: PreferredLocaleSchema.optional()
});
var AuthLoginResponseSchema = z2.object({
  ok: z2.literal(true),
  user: AuthSessionUserSchema,
  workspaces: z2.array(AuthMeResponseWorkspaceSchema),
  activeWorkspaceId: z2.string().nullable()
});
var AuthLoginNativeResponseSchema = AuthLoginResponseSchema.extend({
  token: z2.string().min(1)
});
var AuthLogoutResponseSchema = z2.object({
  ok: z2.literal(true)
});
var AuthWebviewExchangeRequestSchema = z2.object({
  next: SafeNextPathSchema
});
var AuthWebviewExchangeResponseSchema = z2.object({
  ok: z2.literal(true),
  code: z2.string().min(1),
  expiresAt: z2.string().min(1),
  bridgeUrl: z2.string().min(1)
});
var AuthWebviewBridgeQuerySchema = z2.object({
  code: z2.string().min(1, "Query.code is required"),
  next: SafeNextPathSchema
});
var AuthPreferencesPatchRequestSchema = z2.object({
  preferredTheme: UiThemeSchema.optional(),
  preferredFontScale: UiFontScaleSchema.optional(),
  preferredDensity: UiDensitySchema.optional()
});
var AuthPreferencesPatchResponseSchema = z2.object({
  ok: z2.literal(true),
  preferences: z2.object({
    preferredTheme: z2.string(),
    preferredFontScale: z2.string(),
    preferredDensity: z2.string()
  })
});
var AuthActiveWorkspaceRequestSchema = z2.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return raw;
    const r = raw;
    return {
      workspaceId: typeof r["workspaceId"] === "string" ? r["workspaceId"] : r["accountId"]
    };
  },
  z2.object({
    workspaceId: z2.string().min(1, "Body.workspaceId is required")
  })
);
var AuthActiveWorkspaceResponseSchema = z2.object({
  ok: z2.literal(true),
  activeWorkspaceId: z2.string().nullable()
});

// src/health/routeSchemas.ts
import { z as z3 } from "zod";
var HealthResponseSchema = z3.object({
  ok: z3.literal(true)
});

// src/workspaces/platformWorkspaces.ts
import { z as z4 } from "zod";
var ContextMeResponseSchema = z4.object({
  ok: z4.literal(true),
  userId: z4.string().min(1),
  activeWorkspaceId: z4.string().nullable(),
  role: z4.string().nullable()
});
var WorkspacesListResponseSchema = z4.object({
  ok: z4.literal(true),
  workspaces: z4.array(AuthMeResponseWorkspaceSchema)
});
var WorkspaceCreateRequestSchema = z4.object({
  name: z4.string().trim().min(1, "Body.name is required")
});
var isoDateTime = z4.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z4.string());
var WorkspaceRowSchema = z4.object({
  id: z4.string().min(1),
  name: z4.string(),
  brandKey: z4.string(),
  adsDisabled: z4.boolean(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime
});
var WorkspaceCreateResponseSchema = z4.object({
  ok: z4.literal(true),
  workspace: WorkspaceRowSchema
});
var WorkspaceIdParamsSchema = z4.object({
  id: z4.string().min(1, "Params.id is required")
});
var WorkspaceBrandPatchRequestSchema = z4.object({
  brandKey: z4.unknown().transform((v) => {
    if (v === "default" || v === "acme" || v === "forest") return v;
    return "default";
  })
});
var WorkspaceBrandPatchResponseSchema = z4.object({
  ok: z4.literal(true),
  workspace: z4.object({
    id: z4.string().min(1),
    name: z4.string(),
    brandKey: z4.string()
  })
});
var ActiveWorkspaceContextResponseSchema = z4.object({
  ok: z4.literal(true),
  activeWorkspaceId: z4.string().min(1),
  role: z4.string()
});

// src/billing/routeSchemas.ts
import { z as z5 } from "zod";
var isoDateTime2 = z5.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z5.string());
var BillingWorkspaceIdParamsSchema = z5.object({
  workspaceId: z5.string().trim().min(1, "Params.workspaceId is required")
});
var BillingPurchaseProviderSchema = z5.enum(["stripe", "apple", "google"]);
var BillingPurchaseIntentModeSchema = z5.enum(["purchase", "restore"]);
var BillingIntentRequestSchema = z5.object({
  planCode: z5.string().trim().min(1, "Body.planCode is required"),
  provider: BillingPurchaseProviderSchema,
  mode: z5.preprocess(
    (v) => v === "restore" ? "restore" : v === "purchase" ? "purchase" : v,
    BillingPurchaseIntentModeSchema
  ).optional()
}).strict();
var BillingIntentResponseSchema = z5.object({
  ok: z5.literal(true),
  billingIntentId: z5.string().min(1),
  workspaceId: z5.string().min(1),
  planCode: z5.string().min(1),
  provider: BillingPurchaseProviderSchema,
  mode: z5.enum(["purchase", "restore"]),
  expiresAt: isoDateTime2,
  clientReferenceId: z5.string().min(1),
  stripePricingTableId: z5.string().nullable(),
  stripePublishableKey: z5.string().nullable()
});
var BillingTierSchema = z5.enum(["free", "premium", "pro", "pro_plus"]);
var TierLimitsSchema = z5.object({
  aiEnabled: z5.boolean(),
  maxRecipesPerWorkspace: z5.number(),
  maxVersionsPerRecipe: z5.number(),
  maxVessels: z5.number(),
  maxAdaptersConnected: z5.number(),
  automationAiToolsEnabled: z5.boolean()
});
var WorkspaceBillingResponseSchema = z5.object({
  ok: z5.literal(true),
  workspaceId: z5.string().min(1),
  tier: BillingTierSchema,
  expiresAt: isoDateTime2.nullable(),
  limits: TierLimitsSchema,
  usage: z5.object({
    recipesCount: z5.number().int().nonnegative()
  })
});
var BillingConfirmRequestSchema = z5.object({
  billingIntentId: z5.string().trim().min(1, "Body.billingIntentId is required")
}).strict();
var BillingConfirmResponseSchema = z5.object({
  ok: z5.literal(true)
});

// src/ads/routeSchemas.ts
import { z as z6 } from "zod";
var isoDateTime3 = z6.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z6.string());
var optionalIsoDateTime = z6.preprocess((v) => {
  if (v === null || v === void 0 || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  return v;
}, isoDateTime3.nullable());
var AdPlacementSchema = z6.enum([
  "global_top",
  "global_bottom",
  "recipe_edit_after_fermentables",
  "recipe_edit_after_hops",
  "recipe_edit_after_yeast"
]);
var AdPlatformSchema = z6.unknown().transform((v) => v === "web" ? "web" : "web");
var AdSlotParamsSchema = z6.object({
  placement: AdPlacementSchema
});
var AdSlotQuerySchema = z6.object({
  platform: AdPlatformSchema.optional()
});
var ResolvedAdSchema = z6.object({
  id: z6.string().min(1),
  imageUrl: z6.string().min(1),
  linkUrl: z6.string().min(1),
  altText: z6.string().min(1)
});
var AdSlotResponseSchema = z6.object({
  ok: z6.literal(true),
  placement: AdPlacementSchema,
  platform: z6.literal("web"),
  disabled: z6.boolean(),
  ad: ResolvedAdSchema.nullable()
});
var PlatformAdRowSchema = z6.object({
  id: z6.string().min(1),
  placement: AdPlacementSchema,
  platform: z6.literal("web"),
  imageUrl: z6.string(),
  linkUrl: z6.string(),
  altText: z6.string(),
  isActive: z6.boolean(),
  startsAt: optionalIsoDateTime,
  endsAt: optionalIsoDateTime,
  priority: z6.number().int(),
  weight: z6.number().int(),
  createdAt: isoDateTime3,
  updatedAt: isoDateTime3
});
var PlatformAdsListResponseSchema = z6.object({
  ok: z6.literal(true),
  ads: z6.array(PlatformAdRowSchema)
});
var PlatformAdCreateRequestSchema = z6.object({
  placement: AdPlacementSchema,
  platform: AdPlatformSchema.optional(),
  imageUrl: z6.string().trim().min(1, "Body.imageUrl is required"),
  linkUrl: z6.string().trim().min(1, "Body.linkUrl is required"),
  altText: z6.string().trim().min(1, "Body.altText is required"),
  startsAt: optionalIsoDateTime.optional(),
  endsAt: optionalIsoDateTime.optional(),
  isActive: z6.boolean().optional(),
  priority: z6.number().int().optional(),
  weight: z6.number().int().optional()
});
var PlatformAdCreateResponseSchema = z6.object({
  ok: z6.literal(true),
  id: z6.string().min(1)
});
var PlatformAdIdParamsSchema = z6.object({
  id: z6.string().min(1, "Params.id is required")
});
var PlatformAdPatchRequestSchema = z6.object({
  placement: AdPlacementSchema.optional(),
  platform: AdPlatformSchema.optional(),
  imageUrl: z6.string().trim().optional(),
  linkUrl: z6.string().trim().optional(),
  altText: z6.string().trim().optional(),
  isActive: z6.boolean().optional(),
  startsAt: optionalIsoDateTime.optional(),
  endsAt: optionalIsoDateTime.optional(),
  priority: z6.number().int().optional(),
  weight: z6.number().int().optional()
}).strict();
var PlatformAdOkResponseSchema = z6.object({
  ok: z6.literal(true)
});

// src/integrations/routeSchemas.ts
import { z as z7 } from "zod";
var isoDateTime4 = z7.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z7.string());
var IntegrationKindSchema = z7.enum(["tilt", "ispindel", "rapt"]);
var IntegrationWorkspaceIdParamsSchema = z7.object({
  workspaceId: z7.string().trim().min(1, "Params.workspaceId is required")
});
var IntegrationWorkspaceKindParamsSchema = z7.object({
  workspaceId: z7.string().trim().min(1, "Params.workspaceId is required"),
  kind: z7.preprocess(
    (v) => typeof v === "string" ? v.trim().toLowerCase() : v,
    IntegrationKindSchema
  )
});
var IntegrationTokenParamsSchema = z7.object({
  token: z7.string().trim().min(1, "Params.token is required")
});
var IntegrationSummarySchema = z7.object({
  id: z7.string().min(1),
  workspaceId: z7.string().min(1),
  kind: IntegrationKindSchema,
  revokedAt: isoDateTime4.nullable(),
  createdAt: isoDateTime4,
  updatedAt: isoDateTime4
});
var IntegrationRevealResponseSchema = z7.object({
  ok: z7.literal(true),
  integrationId: z7.string().min(1),
  kind: IntegrationKindSchema,
  token: z7.string().min(1),
  publicPath: z7.string().min(1)
});
var IntegrationGetResponseSchema = z7.object({
  ok: z7.literal(true),
  integration: IntegrationSummarySchema.nullable()
});
var IntegrationCreateResponseSchema = z7.object({
  ok: z7.literal(true),
  integrationId: z7.string().min(1),
  token: z7.string().min(1),
  publicPath: z7.string().min(1)
});
var IntegrationOkResponseSchema = z7.object({
  ok: z7.literal(true)
});
var TiltIngestBodySchema = z7.record(z7.string(), z7.unknown());
var TiltIngestResponseSchema = z7.object({
  ok: z7.literal(true),
  integrationId: z7.string().min(1),
  deviceId: z7.string().min(1),
  readingId: z7.string().min(1),
  brewSessionId: z7.string().nullable()
});
var IntegrationDevicesQuerySchema = z7.object({
  includeReadings: z7.unknown().optional().transform((v) => v === true || v === "true" || v === "1"),
  readingsLimit: z7.unknown().optional().transform((v) => {
    const raw = typeof v === "string" ? v.trim() : "";
    const n = raw ? Number.parseInt(raw, 10) : 20;
    if (!Number.isFinite(n) || Number.isNaN(n)) return 20;
    return Math.max(1, Math.min(200, n));
  })
});
var IntegrationDeviceReadingSchema = z7.object({
  id: z7.string().min(1),
  brewSessionId: z7.string().nullable(),
  recordedAt: isoDateTime4.nullable(),
  receivedAt: isoDateTime4,
  temperatureC: z7.number().nullable(),
  gravitySg: z7.number().nullable(),
  rawJson: z7.record(z7.string(), z7.unknown()).optional()
});
var IntegrationBrewSessionRefSchema = z7.object({
  id: z7.string().min(1),
  code: z7.string().nullable(),
  status: z7.string(),
  createdAt: isoDateTime4,
  startedAt: isoDateTime4.nullable(),
  recipe: z7.object({
    id: z7.string().min(1),
    name: z7.string(),
    version: z7.number().int()
  })
});
var IntegrationDeviceAttachmentSchema = z7.object({
  id: z7.string().min(1),
  attachedAt: isoDateTime4,
  brewSession: IntegrationBrewSessionRefSchema
});
var IntegrationDeviceSchema = z7.object({
  id: z7.string().min(1),
  deviceKey: z7.string().min(1),
  displayName: z7.string().nullable(),
  metadataJson: z7.record(z7.string(), z7.unknown()).nullable(),
  lastSeenAt: isoDateTime4.nullable(),
  createdAt: isoDateTime4,
  activeAttachment: IntegrationDeviceAttachmentSchema.nullable(),
  lastReading: IntegrationDeviceReadingSchema.nullable(),
  recentReadings: z7.array(IntegrationDeviceReadingSchema).nullable().optional()
});
var IntegrationDevicesListResponseSchema = z7.object({
  ok: z7.literal(true),
  devices: z7.array(IntegrationDeviceSchema)
});
var IntegrationDeviceIdParamsSchema = z7.object({
  workspaceId: z7.string().trim().min(1, "Params.workspaceId is required"),
  deviceId: z7.string().trim().min(1, "Params.deviceId is required")
});
var IntegrationDeviceAttachRequestSchema = z7.object({
  brewSessionId: z7.string().trim().min(1, "Body.brewSessionId is required")
});
var IntegrationDeviceAttachResponseSchema = z7.object({
  ok: z7.literal(true),
  attachment: z7.object({
    id: z7.string().min(1),
    attachedAt: isoDateTime4,
    brewSessionId: z7.string().min(1)
  })
});
var IntegrationDeviceDetachResponseSchema = z7.object({
  ok: z7.literal(true),
  detachedCount: z7.number().int().nonnegative()
});
var BrewSessionsRecentQuerySchema = z7.object({
  limit: z7.unknown().optional().transform((v) => {
    const raw = typeof v === "string" ? v.trim() : "";
    const n = raw ? Number.parseInt(raw, 10) : 20;
    if (!Number.isFinite(n) || Number.isNaN(n)) return 20;
    return Math.max(1, Math.min(100, n));
  })
});
var BrewSessionSummarySchema = z7.object({
  id: z7.string().min(1),
  recipeId: z7.string().min(1),
  code: z7.string().nullable(),
  status: z7.string(),
  startedAt: isoDateTime4.nullable(),
  pausedAt: isoDateTime4.nullable(),
  stoppedAt: isoDateTime4.nullable(),
  scheduledDate: isoDateTime4.nullable(),
  createdAt: isoDateTime4,
  recipe: z7.object({
    id: z7.string().min(1),
    name: z7.string(),
    version: z7.number().int()
  })
});
var BrewSessionsRecentResponseSchema = z7.object({
  ok: z7.literal(true),
  brewSessions: z7.array(BrewSessionSummarySchema)
});

// src/platformAdmin/routeSchemas.ts
import { z as z8 } from "zod";
var isoDateTime5 = z8.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z8.string());
var PlatformWorkspaceRowSchema = z8.object({
  id: z8.string().min(1),
  name: z8.string()
});
var PlatformWorkspacesListResponseSchema = z8.object({
  ok: z8.literal(true),
  workspaces: z8.array(PlatformWorkspaceRowSchema)
});
var PlatformRecipesListQuerySchema = z8.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object") return raw;
    const r = raw;
    return { workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  z8.object({
    workspaceId: z8.string().trim().min(1, "Query.workspaceId is required")
  })
);
var PlatformRecipeSummarySchema = z8.object({
  id: z8.string().min(1),
  name: z8.string(),
  version: z8.number().int(),
  styleKey: z8.string().nullable().optional(),
  style: z8.unknown().nullable().optional(),
  createdAt: isoDateTime5.optional(),
  updatedAt: isoDateTime5.optional()
});
var PlatformRecipesListResponseSchema = z8.object({
  ok: z8.literal(true),
  recipes: z8.array(z8.unknown())
});
var PlatformRecipeIdParamsSchema = z8.object({
  id: z8.string().trim().min(1, "Params.id is required")
});
var PlatformRecipeExportQuerySchema = PlatformRecipesListQuerySchema;
var BeerJsonLooseSchema = z8.unknown();
var PlatformImportFormatSchema = z8.enum(["beerjson", "beerxml"]);
var workspaceIdPreprocess = z8.preprocess(
  (raw) => {
    if (raw === null || raw === void 0) return {};
    if (typeof raw !== "object") return raw;
    const r = raw;
    return { ...r, workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  z8.object({
    format: PlatformImportFormatSchema,
    content: z8.string().min(1, "Body.content is required"),
    workspaceId: z8.string().trim().min(1, "Body.workspaceId is required")
  })
);
var PlatformRecipeImportPreviewRequestSchema = workspaceIdPreprocess;
var PlatformRecipeImportPreviewResponseSchema = z8.object({
  ok: z8.literal(true),
  format: PlatformImportFormatSchema,
  preview: z8.object({
    name: z8.string(),
    notes: z8.string().nullable(),
    beerJsonRecipeJson: z8.unknown(),
    warnings: z8.array(z8.string())
  }),
  workspaceId: z8.string().min(1)
});
var PlatformRecipeImportRequestSchema = z8.preprocess(
  (raw) => {
    if (raw === null || raw === void 0) return {};
    if (typeof raw !== "object") return raw;
    const r = raw;
    return { ...r, workspaceId: r["workspaceId"] ?? r["accountId"] };
  },
  z8.object({
    format: PlatformImportFormatSchema,
    content: z8.string().min(1, "Body.content is required"),
    styleKey: z8.string().optional(),
    workspaceId: z8.string().trim().min(1, "Body.workspaceId is required"),
    recipeExtJson: z8.unknown().optional()
  })
);
var PlatformRecipeImportResponseSchema = z8.object({
  ok: z8.literal(true),
  recipe: z8.unknown(),
  warnings: z8.array(z8.string())
});
var PlatformRecipeBulkImportPreviewRequestSchema = workspaceIdPreprocess;
var PlatformRecipeBulkImportPreviewItemSchema = z8.object({
  index: z8.number().int(),
  name: z8.string(),
  notes: z8.string().nullable(),
  resolvedStyleKey: z8.string(),
  resolvedStyleName: z8.string().nullable(),
  resolvedStyleCode: z8.string().nullable(),
  warnings: z8.array(z8.string())
});
var PlatformRecipeBulkImportPreviewResponseSchema = z8.object({
  ok: z8.literal(true),
  format: PlatformImportFormatSchema,
  previewItems: z8.array(PlatformRecipeBulkImportPreviewItemSchema),
  workspaceId: z8.string().min(1)
});
var PlatformRecipeBulkImportRequestSchema = workspaceIdPreprocess;
var PlatformRecipeBulkImportResponseSchema = z8.object({
  ok: z8.literal(true),
  created: z8.array(
    z8.object({
      index: z8.number().int(),
      recipeId: z8.string().min(1),
      name: z8.string(),
      styleKey: z8.string(),
      style: z8.unknown().nullable(),
      warnings: z8.array(z8.string())
    })
  ),
  failed: z8.array(
    z8.object({
      index: z8.number().int(),
      name: z8.string(),
      error: z8.string()
    })
  )
});
var PlatformAdminOkResponseSchema = z8.object({
  ok: z8.literal(true)
});

// src/webhooks/routeSchemas.ts
import { z as z9 } from "zod";
var WebhookOkResponseSchema = z9.object({
  ok: z9.literal(true)
});
var WebhookStripeBodySchema = z9.record(z9.string(), z9.unknown());
var WebhookRevenuecatBodySchema = z9.unknown();

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
import { z as z10 } from "zod";
var AiUsageMonthlySchema = z10.object({
  tokensIn: z10.number().int().nonnegative(),
  tokensOut: z10.number().int().nonnegative(),
  costMicroUsd: z10.number().nonnegative(),
  callCount: z10.number().int().nonnegative()
});
var AiUsageDailyPointSchema = z10.object({
  day: z10.string(),
  tokensIn: z10.number().int().nonnegative(),
  tokensOut: z10.number().int().nonnegative(),
  calls: z10.number().int().nonnegative()
});
var AiUsageByUserSchema = z10.object({
  userId: z10.string().min(1),
  email: z10.string().nullable(),
  role: z10.string().nullable(),
  tokensInToday: z10.number().int().nonnegative(),
  tokensOutToday: z10.number().int().nonnegative(),
  tokensInMonth: z10.number().int().nonnegative(),
  tokensOutMonth: z10.number().int().nonnegative(),
  costMicroUsdMonth: z10.number().nonnegative(),
  callCountMonth: z10.number().int().nonnegative()
});
var AiUsageRoleAlertSchema = z10.object({
  role: z10.string(),
  used: z10.number().nonnegative(),
  limit: z10.number().nonnegative(),
  percent: z10.number().nonnegative()
});
var AiUsageUserAlertSchema = z10.object({
  userId: z10.string().min(1),
  usedToday: z10.number().nonnegative(),
  cap: z10.number().nonnegative(),
  percent: z10.number().nonnegative()
});
var WorkspaceAiUsageResponseSchema = z10.object({
  ok: z10.literal(true),
  monthly: AiUsageMonthlySchema,
  dailySeries: z10.array(AiUsageDailyPointSchema),
  roleLimits: z10.record(z10.string(), z10.number()),
  roleUsage: z10.record(z10.string(), z10.number()),
  perUserDailyCap: z10.number().int().nonnegative(),
  byUser: z10.array(AiUsageByUserSchema),
  alerts: z10.object({
    roleAlerts: z10.array(AiUsageRoleAlertSchema),
    userAlerts: z10.array(AiUsageUserAlertSchema)
  })
});
var AiToolCallRecordSchema = z10.object({
  name: z10.string(),
  argsJson: z10.string(),
  resultJson: z10.string(),
  durationMs: z10.number().nonnegative(),
  errored: z10.boolean()
});
var AiUsageLedgerEntrySchema = z10.object({
  id: z10.string().min(1),
  workspaceId: z10.string().min(1),
  userId: z10.string().min(1),
  sessionId: z10.string().nullable(),
  model: z10.string(),
  tokensIn: z10.number().int().nonnegative(),
  tokensOut: z10.number().int().nonnegative(),
  costMicroUsd: z10.number().nonnegative(),
  durationMs: z10.number().nonnegative(),
  providerRequestId: z10.string().nullable(),
  toolCalls: z10.array(AiToolCallRecordSchema),
  createdAt: z10.string()
});

// src/ai/aiSettings.ts
import { z as z11 } from "zod";
var AiProviderSchema = z11.enum(["anthropic", "openai"]);
var AiRoleLimitsSchema = z11.record(z11.string(), z11.number().nonnegative());
var WorkspaceAiSettingsSchema = z11.object({
  workspaceId: z11.string().min(1),
  provider: AiProviderSchema,
  hasKey: z11.boolean(),
  enabled: z11.boolean(),
  roleLimits: AiRoleLimitsSchema,
  perUserDailyCap: z11.number().int().nonnegative(),
  dataEgressAccepted: z11.boolean(),
  dataEgressAcceptedAt: z11.string().nullable(),
  createdAt: z11.string(),
  updatedAt: z11.string()
});
var UpdateWorkspaceAiSettingsRequestSchema = z11.object({
  provider: AiProviderSchema.optional(),
  apiKey: z11.string().optional(),
  enabled: z11.boolean().optional(),
  roleLimits: AiRoleLimitsSchema.optional(),
  perUserDailyCap: z11.number().int().nonnegative().optional(),
  dataEgressAccepted: z11.boolean().optional()
}).strict();
var WorkspaceAiSettingsResponseSchema = z11.object({
  ok: z11.literal(true),
  settings: WorkspaceAiSettingsSchema
});
var WorkspaceAiSettingsParamsSchema = z11.object({
  workspaceId: z11.string().trim().min(1, "Params.workspaceId is required")
});

// src/ai/aiChat.ts
import { z as z12 } from "zod";
var AiChatRequestBodySchema = z12.object({
  message: z12.string().trim().min(1).max(8e3),
  sessionId: z12.string().trim().min(1).max(200).optional(),
  routeId: z12.string().trim().min(1).max(128).optional()
}).strict();
var AiSseAssistantChunkEventSchema = z12.object({
  type: z12.literal("assistant_chunk"),
  text: z12.string()
});
var AiSseToolCallEventSchema = z12.object({
  type: z12.literal("tool_call"),
  name: z12.string(),
  argsJson: z12.string()
});
var AiSseToolResultEventSchema = z12.object({
  type: z12.literal("tool_result"),
  name: z12.string(),
  resultJson: z12.string(),
  durationMs: z12.number(),
  errored: z12.boolean()
});
var AiSseProposalEventSchema = z12.object({
  type: z12.literal("proposal"),
  proposalId: z12.string(),
  moduleCode: z12.string(),
  proposalType: z12.string(),
  summary: z12.string()
});
var AiSseCompleteEventSchema = z12.object({
  type: z12.literal("complete"),
  usage: z12.object({
    tokensIn: z12.number(),
    tokensOut: z12.number(),
    durationMs: z12.number(),
    model: z12.string()
  })
});
var AiSseErrorEventSchema = z12.object({
  type: z12.literal("error"),
  code: z12.string(),
  message: z12.string()
});
var AiSseEventSchema = z12.discriminatedUnion("type", [
  AiSseAssistantChunkEventSchema,
  AiSseToolCallEventSchema,
  AiSseToolResultEventSchema,
  AiSseProposalEventSchema,
  AiSseCompleteEventSchema,
  AiSseErrorEventSchema
]);

// src/ai/aiProposals.ts
import { z as z13 } from "zod";
var AiProposalStatusSchema = z13.enum(["pending", "applied", "rejected"]);
var AiProposalDtoSchema = z13.object({
  id: z13.string().uuid(),
  workspaceId: z13.string().uuid(),
  userId: z13.string().uuid(),
  moduleCode: z13.string().min(1).max(32),
  proposalType: z13.string().min(1).max(64),
  summary: z13.string().min(1).max(2e3),
  payloadJson: z13.record(z13.string(), z13.unknown()),
  status: AiProposalStatusSchema,
  createdAt: z13.string(),
  appliedAt: z13.string().nullable(),
  rejectedAt: z13.string().nullable()
}).strict();
var AiProposalListResponseSchema = z13.object({
  ok: z13.literal(true),
  items: z13.array(AiProposalDtoSchema)
}).strict();
var AiProposalIdParamsSchema = z13.object({
  id: z13.string().trim().min(1, "Params.id is required")
});
var AiProposalGetResponseSchema = z13.object({
  ok: z13.literal(true),
  proposal: AiProposalDtoSchema
}).strict();
var AiProposalActionResponseSchema = z13.object({
  ok: z13.literal(true),
  proposal: AiProposalDtoSchema,
  appliedPreviewOnly: z13.boolean().optional()
}).strict();
var MrpProposeOrderAdjustmentInputSchema = z13.object({
  productionOrderId: z13.string().uuid(),
  suggestedStartDate: z13.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  suggestedQuantity: z13.number().positive().optional(),
  rationale: z13.string().max(500).optional()
}).strict();
var MrpProposeOrderAdjustmentOutputSchema = z13.object({
  ok: z13.literal(true),
  proposalId: z13.string().uuid(),
  summary: z13.string()
}).strict();
var CrpProposeScheduleAdjustmentInputSchema = z13.object({
  resourceId: z13.string().uuid().optional(),
  suggestedDate: z13.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rationale: z13.string().max(500).optional()
}).strict();
var CrpProposeScheduleAdjustmentOutputSchema = z13.object({
  ok: z13.literal(true),
  proposalId: z13.string().uuid(),
  summary: z13.string()
}).strict();

// src/rendering/renderJobs.ts
import { z as z14 } from "zod";
var RenderKindSchema = z14.enum([
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
var RenderStatusSchema = z14.enum([
  "queued",
  "running",
  "succeeded",
  "failed"
]);
var RenderVisibilitySchema = z14.enum(["workspace", "public"]);
var RenderDeliverySchema = z14.discriminatedUnion("mode", [
  z14.object({ mode: z14.literal("stream-response") }).strict(),
  z14.object({
    mode: z14.literal("persist-to-media"),
    visibility: RenderVisibilitySchema
  }).strict(),
  z14.object({
    mode: z14.literal("email"),
    to: z14.array(z14.string().email()).min(1, "email.to required"),
    subject: z14.string().min(1, "email.subject required")
  }).strict()
]);
var RenderErrorSchema = z14.object({
  code: z14.string().min(1, "error.code required"),
  message: z14.string().min(1, "error.message required")
}).strict();
var RenderJobSubmitRequestSchema = z14.object({
  templateRef: z14.string().min(1, "templateRef required"),
  kind: RenderKindSchema.optional(),
  data: z14.unknown(),
  delivery: RenderDeliverySchema.optional()
}).strict();
var RenderJobStatusSchema = z14.object({
  id: z14.string().min(1, "job.id required"),
  templateRef: z14.string().min(1, "job.templateRef required"),
  kind: RenderKindSchema,
  status: RenderStatusSchema,
  deliveryMode: z14.string().min(1, "job.deliveryMode required"),
  requestedAt: z14.string().min(1, "job.requestedAt required"),
  startedAt: z14.string().nullable(),
  completedAt: z14.string().nullable(),
  artifactId: z14.string().nullable(),
  mediaAssetId: z14.string().nullable(),
  error: RenderErrorSchema.nullable()
}).strict();
var RenderJobSubmitResponseSchema = z14.object({
  ok: z14.literal(true),
  mode: z14.literal("async"),
  job: RenderJobStatusSchema
}).strict();
var RenderJobStatusResponseSchema = z14.object({
  ok: z14.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobCancelResponseSchema = z14.object({
  ok: z14.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobResultResponseSchema = z14.object({
  ok: z14.literal(true),
  job: RenderJobStatusSchema,
  signedUrl: z14.string().min(1, "signedUrl required"),
  expiresAt: z14.string().min(1, "expiresAt required")
}).strict();
var ErrorResponseSchema = z14.object({
  ok: z14.literal(false),
  error: RenderErrorSchema.extend({
    details: z14.record(z14.string(), z14.unknown()).optional()
  }).strict()
}).strict();
function parseRenderJobSubmitRequest(payload) {
  return RenderJobSubmitRequestSchema.parse(payload);
}
function parseRenderJobStatusResponse(payload) {
  return RenderJobStatusResponseSchema.parse(payload);
}
export {
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
};
