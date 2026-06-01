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

// src/brewery/routeSchemas.ts
import { z as z10 } from "zod";
var isoDateTime6 = z10.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z10.string());
var OkResponseSchema = z10.object({
  ok: z10.literal(true)
});
var IdParamsSchema = z10.object({
  id: z10.string().min(1, "id required")
});
var InventoryCategoryQuerySchema = z10.object({
  category: z10.string().optional()
});
var BeerStyleSchema = z10.object({
  key: z10.string(),
  name: z10.string(),
  source: z10.string(),
  version: z10.number(),
  code: z10.string().nullable(),
  category: z10.string().nullable(),
  categoryId: z10.string().nullable(),
  sortOrder: z10.number()
});
var StylesListResponseSchema = z10.object({
  ok: z10.literal(true),
  styles: z10.array(BeerStyleSchema)
});
var EquipmentProfilePayloadSchema = z10.object({
  id: z10.string(),
  workspaceId: z10.string(),
  name: z10.string(),
  equipment: z10.record(z10.string(), z10.unknown()),
  createdAt: isoDateTime6,
  updatedAt: isoDateTime6
});
var EquipmentProfilesListResponseSchema = z10.object({
  ok: z10.literal(true),
  profiles: z10.array(EquipmentProfilePayloadSchema)
});
var EquipmentProfileResponseSchema = z10.object({
  ok: z10.literal(true),
  profile: EquipmentProfilePayloadSchema
});
var EquipmentProfileCreateRequestSchema = z10.record(z10.string(), z10.unknown());
var EquipmentProfilePatchRequestSchema = z10.record(z10.string(), z10.unknown());
var InventoryItemPayloadSchema = z10.object({
  id: z10.string(),
  workspaceId: z10.string(),
  category: z10.string(),
  ingredientId: z10.string().nullable(),
  name: z10.string(),
  quantity: z10.number(),
  unit: z10.string(),
  metadataJson: z10.unknown().nullable(),
  createdAt: isoDateTime6,
  updatedAt: isoDateTime6
});
var InventoryListResponseSchema = z10.object({
  ok: z10.literal(true),
  items: z10.array(InventoryItemPayloadSchema)
});
var InventoryItemResponseSchema = z10.object({
  ok: z10.literal(true),
  item: InventoryItemPayloadSchema
});
var InventoryCreateRequestSchema = z10.record(z10.string(), z10.unknown());
var InventoryPatchRequestSchema = z10.record(z10.string(), z10.unknown());
var BrewdaySettingsPayloadSchema = z10.record(z10.string(), z10.unknown());
var BrewdaySettingsResponseSchema = z10.object({
  ok: z10.literal(true),
  settings: BrewdaySettingsPayloadSchema.nullable()
});
var BrewdaySettingsPatchRequestSchema = z10.record(z10.string(), z10.unknown());
var RecipePayloadSchema = z10.record(z10.string(), z10.unknown());
var RecipeListResponseSchema = z10.object({
  ok: z10.literal(true),
  recipes: z10.array(z10.record(z10.string(), z10.unknown()))
});
var RecipeResponseSchema = z10.object({
  ok: z10.literal(true),
  recipe: RecipePayloadSchema
});
var RecipeCreateRequestSchema = z10.object({
  name: z10.string(),
  styleKey: z10.string().optional(),
  notes: z10.string().nullable().optional(),
  beerJsonRecipeJson: z10.unknown().optional(),
  recipeExtJson: z10.unknown().optional()
});
var RecipePatchRequestSchema = z10.object({
  name: z10.string().optional(),
  styleKey: z10.string().optional(),
  notes: z10.string().optional(),
  beerJsonRecipeJson: z10.unknown().optional(),
  recipeExtJson: z10.unknown().optional()
});
var RecipeVersionsResponseSchema = z10.object({
  ok: z10.literal(true),
  versions: z10.array(z10.record(z10.string(), z10.unknown()))
});
var BeerJsonExportResponseSchema = z10.custom(
  (data) => data instanceof Buffer,
  { message: "Expected binary export body" }
);
var RecipeIdParamsSchema = z10.object({
  recipeId: z10.string().min(1, "recipeId required")
});
var BrewSessionIdParamsSchema = z10.object({
  brewSessionId: z10.string().min(1, "brewSessionId required")
});
var BrewSessionStepParamsSchema = z10.object({
  brewSessionId: z10.string().min(1, "brewSessionId required"),
  stepId: z10.string().min(1, "stepId required")
});
var IngredientsSearchQuerySchema = z10.object({
  query: z10.string().optional(),
  offset: z10.coerce.number().int().nonnegative().optional(),
  limit: z10.coerce.number().int().positive().optional()
});
var IntegrationReadingsQuerySchema = z10.object({
  kind: z10.enum(["tilt", "ispindel", "rapt"]),
  limit: z10.coerce.number().int().positive().optional()
});
var FermentableItemSchema = z10.record(z10.string(), z10.unknown());
var FermentablesListResponseSchema = z10.object({
  ok: z10.literal(true),
  items: z10.array(FermentableItemSchema),
  total: z10.number(),
  offset: z10.number(),
  limit: z10.number()
});
var HopItemSchema = z10.record(z10.string(), z10.unknown());
var HopsListResponseSchema = z10.object({
  ok: z10.literal(true),
  items: z10.array(HopItemSchema),
  total: z10.number(),
  offset: z10.number(),
  limit: z10.number()
});
var YeastItemSchema = z10.record(z10.string(), z10.unknown());
var YeastsListResponseSchema = z10.object({
  ok: z10.literal(true),
  items: z10.array(YeastItemSchema)
});
var IngredientSyncRunSchema = z10.record(z10.string(), z10.unknown());
var IngredientSyncRunsResponseSchema = z10.object({
  ok: z10.literal(true),
  runs: z10.array(IngredientSyncRunSchema)
});
var IngredientSyncResultSchema = z10.record(z10.string(), z10.unknown());
var IngredientSyncResponseSchema = z10.object({
  ok: z10.literal(true),
  result: IngredientSyncResultSchema
});
var RecipeImportFormatSchema = z10.enum(["beerjson", "beerxml"]);
var RecipeImportWarningSchema = z10.object({
  code: z10.string(),
  message: z10.string()
});
var RecipeImportRequestSchema = z10.object({
  format: RecipeImportFormatSchema,
  content: z10.string().min(1),
  styleKey: z10.string().optional()
});
var RecipeBulkImportRequestSchema = z10.object({
  format: RecipeImportFormatSchema,
  content: z10.string().min(1)
});
var RecipeImportPreviewPayloadSchema = z10.record(z10.string(), z10.unknown());
var RecipeImportPreviewResponseSchema = z10.object({
  ok: z10.literal(true),
  format: RecipeImportFormatSchema,
  preview: RecipeImportPreviewPayloadSchema,
  workspaceId: z10.string()
});
var RecipeImportResponseSchema = z10.object({
  ok: z10.literal(true),
  recipe: RecipePayloadSchema,
  warnings: z10.array(RecipeImportWarningSchema).optional()
});
var RecipeBulkImportPreviewItemSchema = z10.record(z10.string(), z10.unknown());
var RecipeBulkImportPreviewResponseSchema = z10.object({
  ok: z10.literal(true),
  format: RecipeImportFormatSchema,
  previewItems: z10.array(RecipeBulkImportPreviewItemSchema),
  workspaceId: z10.string()
});
var RecipeBulkImportCreatedItemSchema = z10.record(z10.string(), z10.unknown());
var RecipeBulkImportFailedItemSchema = z10.object({
  index: z10.number(),
  name: z10.string(),
  error: z10.string()
});
var RecipeBulkImportResponseSchema = z10.object({
  ok: z10.literal(true),
  created: z10.array(RecipeBulkImportCreatedItemSchema),
  failed: z10.array(RecipeBulkImportFailedItemSchema)
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
import { z as z11 } from "zod";
var recordBody = z11.record(z11.string(), z11.unknown());
var recordResult = z11.record(z11.string(), z11.unknown());
var RecipeWaterHubSummaryResponseSchema = z11.custom(
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
var WaterProfilesListResponseSchema = z11.custom(
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
var WaterProfileItemSchema = z11.custom(
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
var WaterProfileResponseSchema = z11.object({
  ok: z11.literal(true),
  profile: WaterProfileItemSchema
});
var ionField = z11.union([z11.number(), z11.string(), z11.null()]).optional();
var WaterProfileCreateRequestSchema = z11.object({
  scope: z11.enum(["system", "account", "public"]).optional(),
  type: z11.enum(["water", "dilution"]).optional(),
  name: z11.string().optional(),
  ph: ionField,
  calcium: ionField,
  magnesium: ionField,
  sodium: ionField,
  sulfate: ionField,
  chloride: ionField,
  bicarbonate: ionField
});
var WaterProfilePatchRequestSchema = WaterProfileCreateRequestSchema.extend({
  verificationStatus: z11.enum(["verified", "unverified"]).optional()
});
var RecipeWaterSettingsPayloadSchema = z11.record(z11.string(), z11.unknown());
var RecipeWaterSettingsGetResponseSchema = z11.object({
  ok: z11.literal(true),
  settings: RecipeWaterSettingsPayloadSchema.nullable()
});
var RecipeWaterSettingsPutRequestSchema = z11.record(z11.string(), z11.unknown());
var RecipeWaterSettingsPutResponseSchema = z11.object({
  ok: z11.literal(true),
  settings: RecipeWaterSettingsPayloadSchema
});
var emptyObjectBody = (schema) => z11.preprocess((raw) => raw === null || raw === void 0 ? {} : raw, schema);
var MashComputeAndSaveRequestSchema = emptyObjectBody(z11.record(z11.string(), z11.unknown()));
var MashComputeAndSaveResponseSchema = z11.custom(
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
var SpargeComputeAndSaveRequestSchema = emptyObjectBody(z11.record(z11.string(), z11.unknown()));
var SpargeComputeAndSaveResponseSchema = z11.custom(
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
var BoilComputeAndSaveRequestSchema = emptyObjectBody(z11.record(z11.string(), z11.unknown()));
var BoilComputeAndSaveResponseSchema = z11.custom(
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
var WaterCalcWithDerivationResponseSchema = z11.object({
  ok: z11.literal(true),
  result: recordResult,
  derivation: recordResult
});
var WaterCalcResultOnlyResponseSchema = z11.object({
  ok: z11.literal(true),
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
import { z as z12 } from "zod";
var AiUsageMonthlySchema = z12.object({
  tokensIn: z12.number().int().nonnegative(),
  tokensOut: z12.number().int().nonnegative(),
  costMicroUsd: z12.number().nonnegative(),
  callCount: z12.number().int().nonnegative()
});
var AiUsageDailyPointSchema = z12.object({
  day: z12.string(),
  tokensIn: z12.number().int().nonnegative(),
  tokensOut: z12.number().int().nonnegative(),
  calls: z12.number().int().nonnegative()
});
var AiUsageByUserSchema = z12.object({
  userId: z12.string().min(1),
  email: z12.string().nullable(),
  role: z12.string().nullable(),
  tokensInToday: z12.number().int().nonnegative(),
  tokensOutToday: z12.number().int().nonnegative(),
  tokensInMonth: z12.number().int().nonnegative(),
  tokensOutMonth: z12.number().int().nonnegative(),
  costMicroUsdMonth: z12.number().nonnegative(),
  callCountMonth: z12.number().int().nonnegative()
});
var AiUsageRoleAlertSchema = z12.object({
  role: z12.string(),
  used: z12.number().nonnegative(),
  limit: z12.number().nonnegative(),
  percent: z12.number().nonnegative()
});
var AiUsageUserAlertSchema = z12.object({
  userId: z12.string().min(1),
  usedToday: z12.number().nonnegative(),
  cap: z12.number().nonnegative(),
  percent: z12.number().nonnegative()
});
var WorkspaceAiUsageResponseSchema = z12.object({
  ok: z12.literal(true),
  monthly: AiUsageMonthlySchema,
  dailySeries: z12.array(AiUsageDailyPointSchema),
  roleLimits: z12.record(z12.string(), z12.number()),
  roleUsage: z12.record(z12.string(), z12.number()),
  perUserDailyCap: z12.number().int().nonnegative(),
  byUser: z12.array(AiUsageByUserSchema),
  alerts: z12.object({
    roleAlerts: z12.array(AiUsageRoleAlertSchema),
    userAlerts: z12.array(AiUsageUserAlertSchema)
  })
});
var AiToolCallRecordSchema = z12.object({
  name: z12.string(),
  argsJson: z12.string(),
  resultJson: z12.string(),
  durationMs: z12.number().nonnegative(),
  errored: z12.boolean()
});
var AiUsageLedgerEntrySchema = z12.object({
  id: z12.string().min(1),
  workspaceId: z12.string().min(1),
  userId: z12.string().min(1),
  sessionId: z12.string().nullable(),
  model: z12.string(),
  tokensIn: z12.number().int().nonnegative(),
  tokensOut: z12.number().int().nonnegative(),
  costMicroUsd: z12.number().nonnegative(),
  durationMs: z12.number().nonnegative(),
  providerRequestId: z12.string().nullable(),
  toolCalls: z12.array(AiToolCallRecordSchema),
  createdAt: z12.string()
});

// src/ai/aiSettings.ts
import { z as z13 } from "zod";
var AiProviderSchema = z13.enum(["anthropic", "openai"]);
var AiRoleLimitsSchema = z13.record(z13.string(), z13.number().nonnegative());
var WorkspaceAiSettingsSchema = z13.object({
  workspaceId: z13.string().min(1),
  provider: AiProviderSchema,
  hasKey: z13.boolean(),
  enabled: z13.boolean(),
  roleLimits: AiRoleLimitsSchema,
  perUserDailyCap: z13.number().int().nonnegative(),
  dataEgressAccepted: z13.boolean(),
  dataEgressAcceptedAt: z13.string().nullable(),
  createdAt: z13.string(),
  updatedAt: z13.string()
});
var UpdateWorkspaceAiSettingsRequestSchema = z13.object({
  provider: AiProviderSchema.optional(),
  apiKey: z13.string().optional(),
  enabled: z13.boolean().optional(),
  roleLimits: AiRoleLimitsSchema.optional(),
  perUserDailyCap: z13.number().int().nonnegative().optional(),
  dataEgressAccepted: z13.boolean().optional()
}).strict();
var WorkspaceAiSettingsResponseSchema = z13.object({
  ok: z13.literal(true),
  settings: WorkspaceAiSettingsSchema
});
var WorkspaceAiSettingsParamsSchema = z13.object({
  workspaceId: z13.string().trim().min(1, "Params.workspaceId is required")
});

// src/ai/aiChat.ts
import { z as z14 } from "zod";
var AiChatRequestBodySchema = z14.object({
  message: z14.string().trim().min(1).max(8e3),
  sessionId: z14.string().trim().min(1).max(200).optional(),
  routeId: z14.string().trim().min(1).max(128).optional()
}).strict();
var AiSseAssistantChunkEventSchema = z14.object({
  type: z14.literal("assistant_chunk"),
  text: z14.string()
});
var AiSseToolCallEventSchema = z14.object({
  type: z14.literal("tool_call"),
  name: z14.string(),
  argsJson: z14.string()
});
var AiSseToolResultEventSchema = z14.object({
  type: z14.literal("tool_result"),
  name: z14.string(),
  resultJson: z14.string(),
  durationMs: z14.number(),
  errored: z14.boolean()
});
var AiSseProposalEventSchema = z14.object({
  type: z14.literal("proposal"),
  proposalId: z14.string(),
  moduleCode: z14.string(),
  proposalType: z14.string(),
  summary: z14.string()
});
var AiSseCompleteEventSchema = z14.object({
  type: z14.literal("complete"),
  usage: z14.object({
    tokensIn: z14.number(),
    tokensOut: z14.number(),
    durationMs: z14.number(),
    model: z14.string()
  })
});
var AiSseErrorEventSchema = z14.object({
  type: z14.literal("error"),
  code: z14.string(),
  message: z14.string()
});
var AiSseEventSchema = z14.discriminatedUnion("type", [
  AiSseAssistantChunkEventSchema,
  AiSseToolCallEventSchema,
  AiSseToolResultEventSchema,
  AiSseProposalEventSchema,
  AiSseCompleteEventSchema,
  AiSseErrorEventSchema
]);

// src/ai/aiProposals.ts
import { z as z15 } from "zod";
var AiProposalStatusSchema = z15.enum(["pending", "applied", "rejected"]);
var AiProposalDtoSchema = z15.object({
  id: z15.string().uuid(),
  workspaceId: z15.string().uuid(),
  userId: z15.string().uuid(),
  moduleCode: z15.string().min(1).max(32),
  proposalType: z15.string().min(1).max(64),
  summary: z15.string().min(1).max(2e3),
  payloadJson: z15.record(z15.string(), z15.unknown()),
  status: AiProposalStatusSchema,
  createdAt: z15.string(),
  appliedAt: z15.string().nullable(),
  rejectedAt: z15.string().nullable()
}).strict();
var AiProposalListResponseSchema = z15.object({
  ok: z15.literal(true),
  items: z15.array(AiProposalDtoSchema)
}).strict();
var AiProposalIdParamsSchema = z15.object({
  id: z15.string().trim().min(1, "Params.id is required")
});
var AiProposalGetResponseSchema = z15.object({
  ok: z15.literal(true),
  proposal: AiProposalDtoSchema
}).strict();
var AiProposalActionResponseSchema = z15.object({
  ok: z15.literal(true),
  proposal: AiProposalDtoSchema,
  appliedPreviewOnly: z15.boolean().optional()
}).strict();
var MrpProposeOrderAdjustmentInputSchema = z15.object({
  productionOrderId: z15.string().uuid(),
  suggestedStartDate: z15.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  suggestedQuantity: z15.number().positive().optional(),
  rationale: z15.string().max(500).optional()
}).strict();
var MrpProposeOrderAdjustmentOutputSchema = z15.object({
  ok: z15.literal(true),
  proposalId: z15.string().uuid(),
  summary: z15.string()
}).strict();
var CrpProposeScheduleAdjustmentInputSchema = z15.object({
  resourceId: z15.string().uuid().optional(),
  suggestedDate: z15.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rationale: z15.string().max(500).optional()
}).strict();
var CrpProposeScheduleAdjustmentOutputSchema = z15.object({
  ok: z15.literal(true),
  proposalId: z15.string().uuid(),
  summary: z15.string()
}).strict();

// src/rendering/renderJobs.ts
import { z as z16 } from "zod";
var RenderKindSchema = z16.enum([
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
var RenderStatusSchema = z16.enum([
  "queued",
  "running",
  "succeeded",
  "failed"
]);
var RenderVisibilitySchema = z16.enum(["workspace", "public"]);
var RenderDeliverySchema = z16.discriminatedUnion("mode", [
  z16.object({ mode: z16.literal("stream-response") }).strict(),
  z16.object({
    mode: z16.literal("persist-to-media"),
    visibility: RenderVisibilitySchema
  }).strict(),
  z16.object({
    mode: z16.literal("email"),
    to: z16.array(z16.string().email()).min(1, "email.to required"),
    subject: z16.string().min(1, "email.subject required")
  }).strict()
]);
var RenderErrorSchema = z16.object({
  code: z16.string().min(1, "error.code required"),
  message: z16.string().min(1, "error.message required")
}).strict();
var RenderJobSubmitRequestSchema = z16.object({
  templateRef: z16.string().min(1, "templateRef required"),
  kind: RenderKindSchema.optional(),
  data: z16.unknown(),
  delivery: RenderDeliverySchema.optional()
}).strict();
var RenderJobStatusSchema = z16.object({
  id: z16.string().min(1, "job.id required"),
  templateRef: z16.string().min(1, "job.templateRef required"),
  kind: RenderKindSchema,
  status: RenderStatusSchema,
  deliveryMode: z16.string().min(1, "job.deliveryMode required"),
  requestedAt: z16.string().min(1, "job.requestedAt required"),
  startedAt: z16.string().nullable(),
  completedAt: z16.string().nullable(),
  artifactId: z16.string().nullable(),
  mediaAssetId: z16.string().nullable(),
  error: RenderErrorSchema.nullable()
}).strict();
var RenderJobSubmitResponseSchema = z16.object({
  ok: z16.literal(true),
  mode: z16.literal("async"),
  job: RenderJobStatusSchema
}).strict();
var RenderJobStatusResponseSchema = z16.object({
  ok: z16.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobCancelResponseSchema = z16.object({
  ok: z16.literal(true),
  job: RenderJobStatusSchema
}).strict();
var RenderJobResultResponseSchema = z16.object({
  ok: z16.literal(true),
  job: RenderJobStatusSchema,
  signedUrl: z16.string().min(1, "signedUrl required"),
  expiresAt: z16.string().min(1, "expiresAt required")
}).strict();
var ErrorResponseSchema = z16.object({
  ok: z16.literal(false),
  error: RenderErrorSchema.extend({
    details: z16.record(z16.string(), z16.unknown()).optional()
  }).strict()
}).strict();
function parseRenderJobSubmitRequest(payload) {
  return RenderJobSubmitRequestSchema.parse(payload);
}
function parseRenderJobStatusResponse(payload) {
  return RenderJobStatusResponseSchema.parse(payload);
}

// src/brewery/listResponses.ts
import { z as z17 } from "zod";
var RecipeListItemSchema = z17.object({
  id: z17.string(),
  accountId: z17.string().optional(),
  name: z17.string(),
  styleKey: z17.string().optional(),
  style: z17.string().nullable().optional(),
  version: z17.number().optional()
});
var RecipesListResponseSchema = z17.object({
  ok: z17.literal(true),
  recipes: z17.array(RecipeListItemSchema)
});
function parseRecipesListResponse(payload) {
  return RecipesListResponseSchema.parse(payload);
}
var isoDateTime7 = z17.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z17.string());
var BrewSessionListItemSchema = z17.object({
  id: z17.string(),
  code: z17.string(),
  status: z17.string(),
  createdAt: isoDateTime7,
  startedAt: z17.preprocess((v) => v instanceof Date ? v.toISOString() : v, z17.string().nullable()).optional(),
  stoppedAt: z17.preprocess((v) => v instanceof Date ? v.toISOString() : v, z17.string().nullable()).optional()
});
var BrewSessionsListResponseSchema = z17.object({
  ok: z17.literal(true),
  brewSessions: z17.array(BrewSessionListItemSchema)
});
function parseBrewSessionsListResponse(payload) {
  return BrewSessionsListResponseSchema.parse(payload);
}
var BrewSessionRecipeRefSchema = z17.object({
  id: z17.string().min(1),
  name: z17.string(),
  version: z17.number().int()
});
var BrewSessionLogSchema = z17.object({
  id: z17.string().min(1),
  brewSessionId: z17.string().min(1),
  kind: z17.string(),
  message: z17.string(),
  createdAt: isoDateTime7,
  stepId: z17.string().nullable(),
  payloadJson: z17.record(z17.string(), z17.unknown()).nullable().optional()
}).passthrough();
var BrewSessionStepSchema = z17.object({
  id: z17.string().min(1),
  brewSessionId: z17.string().min(1),
  name: z17.string(),
  status: z17.string(),
  sortOrder: z17.number().int(),
  sectionId: z17.string(),
  sectionName: z17.string().nullable(),
  createdAt: isoDateTime7,
  updatedAt: isoDateTime7,
  isDisabled: z17.boolean(),
  customTimerEnabled: z17.boolean(),
  note: z17.string().nullable(),
  minutesPlanned: z17.number().nullable(),
  offsetMinutesFromEnd: z17.number().nullable(),
  relativeToStepId: z17.string().nullable(),
  timerAccumulatedSeconds: z17.number(),
  timerLastStartedAt: isoDateTime7.nullable(),
  timerPausedAt: isoDateTime7.nullable(),
  timerStartedAt: isoDateTime7.nullable(),
  timerState: z17.string(),
  timerStoppedAt: isoDateTime7.nullable()
}).passthrough();
var BrewSessionPayloadSchema = z17.object({
  id: z17.string().min(1),
  workspaceId: z17.string().min(1),
  recipeId: z17.string().min(1),
  code: z17.string().nullable(),
  status: z17.string(),
  createdAt: isoDateTime7,
  updatedAt: isoDateTime7,
  startedAt: isoDateTime7.nullable(),
  pausedAt: isoDateTime7.nullable(),
  stoppedAt: isoDateTime7.nullable(),
  scheduledDate: isoDateTime7.nullable(),
  recipe: BrewSessionRecipeRefSchema.optional(),
  steps: z17.array(BrewSessionStepSchema).optional(),
  logs: z17.array(BrewSessionLogSchema).optional()
}).passthrough();
var BrewSessionDetailResponseSchema = z17.object({
  ok: z17.literal(true),
  brewSession: BrewSessionPayloadSchema
});
var BrewSessionCreateResponseSchema = z17.object({
  ok: z17.literal(true),
  brewSession: BrewSessionPayloadSchema,
  steps: z17.array(BrewSessionStepSchema)
});
var BrewSessionStepResponseSchema = z17.object({
  ok: z17.literal(true),
  step: BrewSessionStepSchema
});
var BrewSessionStepsResponseSchema = z17.object({
  ok: z17.literal(true),
  steps: z17.array(BrewSessionStepSchema)
});
var BrewSessionPatchRequestSchema = z17.object({
  scheduledDate: z17.string().nullable().optional()
});
var BrewSessionStepsPatchRequestSchema = z17.object({
  steps: z17.array(z17.record(z17.string(), z17.unknown()))
});
var BrewSessionStepTimerPatchRequestSchema = z17.object({
  customTimerEnabled: z17.boolean()
});
var BrewSessionStopRequestSchema = z17.preprocess(
  (raw) => raw === null || raw === void 0 ? {} : raw,
  z17.object({
    reason: z17.enum(["auto", "manual"]).optional()
  })
);
var BrewSessionStepLogRequestSchema = z17.object({
  status: z17.enum(["pending", "in_progress", "done", "skipped", "not_applicable"]),
  note: z17.string().nullable().optional(),
  name: z17.string().optional(),
  isDisabled: z17.boolean().optional()
});
var IntegrationAttachmentDeviceSchema = z17.record(z17.string(), z17.unknown());
var IntegrationAttachmentSchema = z17.object({
  id: z17.string(),
  attachedAt: isoDateTime7,
  device: IntegrationAttachmentDeviceSchema
});
var IntegrationAttachmentsResponseSchema = z17.object({
  ok: z17.literal(true),
  attachments: z17.array(IntegrationAttachmentSchema)
});
var IntegrationAttachRequestSchema = z17.object({
  kind: z17.enum(["tilt", "ispindel", "rapt"]),
  deviceId: z17.string().min(1)
});
var IntegrationAttachResponseSchema = z17.object({
  ok: z17.literal(true),
  attachment: z17.record(z17.string(), z17.unknown())
});
var IntegrationDetachRequestSchema = z17.object({
  deviceId: z17.string().min(1)
});
var IntegrationDetachResponseSchema = z17.object({
  ok: z17.literal(true),
  detachedCount: z17.number()
});
var IntegrationReadingSchema = z17.record(z17.string(), z17.unknown());
var IntegrationReadingsResponseSchema = z17.object({
  ok: z17.literal(true),
  readings: z17.array(IntegrationReadingSchema)
});
function parseBrewSessionCreateResponse(payload) {
  const parsed = BrewSessionCreateResponseSchema.parse(payload);
  const brewSession = parsed.brewSession;
  return { brewSession: { id: typeof brewSession.id === "string" ? brewSession.id : "" } };
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
};
