import { z } from 'zod';

/**
 * Auth /auth/me response contract.
 * Shared by web and native clients.
 *
 * v2.0 (RFC-0003 Decision A): migrated from hand-rolled parsers to Zod v4
 * schemas. The schema is the single source of truth; types are inferred
 * via `z.infer`.
 *
 * Behavior preservation: this migration intentionally preserves the
 * hand-rolled parser's soft-tolerance defaults (non-string preference
 * fields collapse to undefined; non-string `activeWorkspaceId` and `role`
 * collapse to null) via per-field preprocess transforms. This matches
 * the v1.x test contract exactly — no behavior changes ship with this
 * migration. A future PR may tighten these to strict-reject; see the
 * latent-bug-fix audit in PR 1's description.
 *
 * Backward-compat tunnel preserved: payloads using the legacy `accounts`
 * key (instead of `workspaces`) or `activeAccountId` (instead of
 * `activeWorkspaceId`) are still accepted via the top-level preprocess.
 * Both legacy keys are mapped to their canonical names at the schema
 * boundary. See Phase 4b regression-pin in `meResponse.test.ts`.
 *
 * Worked example for RFC-0003 Decision D — this file is the canonical
 * pattern that the 4 remaining `parseX.ts` files under
 * `packages/platform/contracts/src/` (per the migration handoff doc) will follow
 * in subsequent migration PRs. Pattern shape:
 *   1. Sub-schemas declared first, smallest-leaf-first.
 *   2. Top-level schema uses preprocess for any dual-key tunneling.
 *   3. Per-field preprocess for soft-tolerance fallbacks (preserving v1.x).
 *   4. Type exports via z.infer (single source of truth).
 *   5. Existing parseX(unknown): X export preserved as thin wrapper.
 */

declare const AuthMeResponseUserSchema: z.ZodPipe<z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    preferredLocale: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string, unknown>>>;
    preferredTheme: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    preferredFontScale: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    preferredDensity: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    isPlatformAdmin: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<boolean | undefined, unknown>>>;
}, z.core.$strip>, z.ZodTransform<{
    id: string;
    email: string;
    preferredLocale: string;
    preferredTheme: string | null | undefined;
    preferredFontScale: string | null | undefined;
    preferredDensity: string | null | undefined;
    isPlatformAdmin: boolean | undefined;
}, {
    id: string;
    email: string;
    preferredLocale: string;
    preferredTheme?: string | null | undefined;
    preferredFontScale?: string | null | undefined;
    preferredDensity?: string | null | undefined;
    isPlatformAdmin?: boolean | undefined;
}>>;
declare const AuthMeResponseWorkspaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    brandKey: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
}, z.core.$strip>;
declare const AuthMeResponseSchema: z.ZodPreprocess<z.ZodObject<{
    ok: z.ZodLiteral<true>;
    user: z.ZodPipe<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        preferredLocale: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string, unknown>>>;
        preferredTheme: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
        preferredFontScale: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
        preferredDensity: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
        isPlatformAdmin: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<boolean | undefined, unknown>>>;
    }, z.core.$strip>, z.ZodTransform<{
        id: string;
        email: string;
        preferredLocale: string;
        preferredTheme: string | null | undefined;
        preferredFontScale: string | null | undefined;
        preferredDensity: string | null | undefined;
        isPlatformAdmin: boolean | undefined;
    }, {
        id: string;
        email: string;
        preferredLocale: string;
        preferredTheme?: string | null | undefined;
        preferredFontScale?: string | null | undefined;
        preferredDensity?: string | null | undefined;
        isPlatformAdmin?: boolean | undefined;
    }>>;
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        brandKey: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    }, z.core.$strip>>;
    activeWorkspaceId: z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null, unknown>>;
    role: z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null, unknown>>;
}, z.core.$strip>>;
type AuthMeResponseUser = z.infer<typeof AuthMeResponseUserSchema>;
type AuthMeResponseWorkspace = z.infer<typeof AuthMeResponseWorkspaceSchema>;
type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;
/**
 * Parse and validate /auth/me response. Throws ZodError on invalid payload.
 * Thin wrapper around `AuthMeResponseSchema.parse` for call-site stability —
 * existing consumers in `apps/web` and `apps/native` continue to call
 * `parseAuthMeResponse(json)` unchanged.
 */
declare function parseAuthMeResponse(payload: unknown): AuthMeResponse;

/**
 * Platform auth route contracts (PR3 / OpenAPI platform tag).
 */

declare const PreferredLocaleSchema: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"en" | "it", unknown>>;
declare const UiThemeSchema: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"default" | "hc_dark" | "hc_light", unknown>>;
declare const UiFontScaleSchema: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"sm" | "md" | "lg" | "xl", unknown>>;
declare const UiDensitySchema: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"comfortable" | "compact", unknown>>;
declare const SafeNextPathSchema: z.ZodPreprocess<z.ZodString>;
declare const AuthSessionUserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    preferredLocale: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"en" | "it", unknown>>;
}, z.core.$strip>;
declare const AuthSignupRequestSchema: z.ZodPreprocess<z.ZodObject<{
    email: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    password: z.ZodString;
    preferredLocale: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"en" | "it", unknown>>>;
    workspaceName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
declare const AuthSignupResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        preferredLocale: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"en" | "it", unknown>>;
    }, z.core.$strip>;
    activeWorkspaceId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const AuthLoginRequestSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    password: z.ZodString;
    preferredLocale: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"en" | "it", unknown>>>;
}, z.core.$strip>;
declare const AuthLoginResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        preferredLocale: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"en" | "it", unknown>>;
    }, z.core.$strip>;
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        brandKey: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    }, z.core.$strip>>;
    activeWorkspaceId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const AuthLoginNativeResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        preferredLocale: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"en" | "it", unknown>>;
    }, z.core.$strip>;
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        brandKey: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    }, z.core.$strip>>;
    activeWorkspaceId: z.ZodNullable<z.ZodString>;
    token: z.ZodString;
}, z.core.$strip>;
declare const AuthLogoutResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
declare const AuthWebviewExchangeRequestSchema: z.ZodObject<{
    next: z.ZodPreprocess<z.ZodString>;
}, z.core.$strip>;
declare const AuthWebviewExchangeResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    code: z.ZodString;
    expiresAt: z.ZodString;
    bridgeUrl: z.ZodString;
}, z.core.$strip>;
declare const AuthWebviewBridgeQuerySchema: z.ZodObject<{
    code: z.ZodString;
    next: z.ZodPreprocess<z.ZodString>;
}, z.core.$strip>;
declare const AuthPreferencesPatchRequestSchema: z.ZodObject<{
    preferredTheme: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"default" | "hc_dark" | "hc_light", unknown>>>;
    preferredFontScale: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"sm" | "md" | "lg" | "xl", unknown>>>;
    preferredDensity: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"comfortable" | "compact", unknown>>>;
}, z.core.$strip>;
declare const AuthPreferencesPatchResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    preferences: z.ZodObject<{
        preferredTheme: z.ZodString;
        preferredFontScale: z.ZodString;
        preferredDensity: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const AuthActiveWorkspaceRequestSchema: z.ZodPreprocess<z.ZodObject<{
    workspaceId: z.ZodString;
}, z.core.$strip>>;
declare const AuthActiveWorkspaceResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    activeWorkspaceId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
type AuthSignupRequest = z.infer<typeof AuthSignupRequestSchema>;
type AuthLoginRequest = z.infer<typeof AuthLoginRequestSchema>;
type AuthActiveWorkspaceRequest = z.infer<typeof AuthActiveWorkspaceRequestSchema>;

/**
 * Platform health route contract (OpenAPI platform tag).
 */

declare const HealthResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Platform workspace route contracts (PR3 / OpenAPI platform tag).
 */

declare const ContextMeResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    userId: z.ZodString;
    activeWorkspaceId: z.ZodNullable<z.ZodString>;
    role: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const WorkspacesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        brandKey: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const WorkspaceCreateRequestSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
declare const WorkspaceRowSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    brandKey: z.ZodString;
    adsDisabled: z.ZodBoolean;
    createdAt: z.ZodPreprocess<z.ZodString>;
    updatedAt: z.ZodPreprocess<z.ZodString>;
}, z.core.$strip>;
declare const WorkspaceCreateResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    workspace: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        brandKey: z.ZodString;
        adsDisabled: z.ZodBoolean;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const WorkspaceIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
declare const WorkspaceBrandPatchRequestSchema: z.ZodObject<{
    brandKey: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"default" | "acme" | "forest", unknown>>;
}, z.core.$strip>;
declare const WorkspaceBrandPatchResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    workspace: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        brandKey: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const ActiveWorkspaceContextResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    activeWorkspaceId: z.ZodString;
    role: z.ZodString;
}, z.core.$strip>;
type WorkspaceCreateRequest = z.infer<typeof WorkspaceCreateRequestSchema>;

/**
 * Platform billing route contracts (OpenAPI billing tag).
 */

declare const BillingWorkspaceIdParamsSchema: z.ZodObject<{
    workspaceId: z.ZodString;
}, z.core.$strip>;
declare const BillingPurchaseProviderSchema: z.ZodEnum<{
    stripe: "stripe";
    apple: "apple";
    google: "google";
}>;
declare const BillingPurchaseIntentModeSchema: z.ZodEnum<{
    purchase: "purchase";
    restore: "restore";
}>;
declare const BillingIntentRequestSchema: z.ZodObject<{
    planCode: z.ZodString;
    provider: z.ZodEnum<{
        stripe: "stripe";
        apple: "apple";
        google: "google";
    }>;
    mode: z.ZodOptional<z.ZodPreprocess<z.ZodEnum<{
        purchase: "purchase";
        restore: "restore";
    }>>>;
}, z.core.$strict>;
declare const BillingIntentResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    billingIntentId: z.ZodString;
    workspaceId: z.ZodString;
    planCode: z.ZodString;
    provider: z.ZodEnum<{
        stripe: "stripe";
        apple: "apple";
        google: "google";
    }>;
    mode: z.ZodEnum<{
        purchase: "purchase";
        restore: "restore";
    }>;
    expiresAt: z.ZodPreprocess<z.ZodString>;
    clientReferenceId: z.ZodString;
    stripePricingTableId: z.ZodNullable<z.ZodString>;
    stripePublishableKey: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const BillingTierSchema: z.ZodEnum<{
    free: "free";
    premium: "premium";
    pro: "pro";
    pro_plus: "pro_plus";
}>;
declare const TierLimitsSchema: z.ZodObject<{
    aiEnabled: z.ZodBoolean;
    maxRecipesPerWorkspace: z.ZodNumber;
    maxVersionsPerRecipe: z.ZodNumber;
    maxVessels: z.ZodNumber;
    maxAdaptersConnected: z.ZodNumber;
    automationAiToolsEnabled: z.ZodBoolean;
}, z.core.$strip>;
declare const WorkspaceBillingResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    workspaceId: z.ZodString;
    tier: z.ZodEnum<{
        free: "free";
        premium: "premium";
        pro: "pro";
        pro_plus: "pro_plus";
    }>;
    expiresAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    limits: z.ZodObject<{
        aiEnabled: z.ZodBoolean;
        maxRecipesPerWorkspace: z.ZodNumber;
        maxVersionsPerRecipe: z.ZodNumber;
        maxVessels: z.ZodNumber;
        maxAdaptersConnected: z.ZodNumber;
        automationAiToolsEnabled: z.ZodBoolean;
    }, z.core.$strip>;
    usage: z.ZodObject<{
        recipesCount: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const BillingConfirmRequestSchema: z.ZodObject<{
    billingIntentId: z.ZodString;
}, z.core.$strict>;
declare const BillingConfirmResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
type BillingIntentRequest = z.infer<typeof BillingIntentRequestSchema>;
type BillingIntentResponse = z.infer<typeof BillingIntentResponseSchema>;
type WorkspaceBillingResponse = z.infer<typeof WorkspaceBillingResponseSchema>;
type BillingConfirmRequest = z.infer<typeof BillingConfirmRequestSchema>;

/**
 * Platform ads route contracts (OpenAPI ads + platform-admin tags).
 */

declare const AdPlacementSchema: z.ZodEnum<{
    global_top: "global_top";
    global_bottom: "global_bottom";
    recipe_edit_after_fermentables: "recipe_edit_after_fermentables";
    recipe_edit_after_hops: "recipe_edit_after_hops";
    recipe_edit_after_yeast: "recipe_edit_after_yeast";
}>;
declare const AdPlatformSchema: z.ZodPipe<z.ZodUnknown, z.ZodTransform<"web", unknown>>;
declare const AdSlotParamsSchema: z.ZodObject<{
    placement: z.ZodEnum<{
        global_top: "global_top";
        global_bottom: "global_bottom";
        recipe_edit_after_fermentables: "recipe_edit_after_fermentables";
        recipe_edit_after_hops: "recipe_edit_after_hops";
        recipe_edit_after_yeast: "recipe_edit_after_yeast";
    }>;
}, z.core.$strip>;
declare const AdSlotQuerySchema: z.ZodObject<{
    platform: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"web", unknown>>>;
}, z.core.$strip>;
declare const ResolvedAdSchema: z.ZodObject<{
    id: z.ZodString;
    imageUrl: z.ZodString;
    linkUrl: z.ZodString;
    altText: z.ZodString;
}, z.core.$strip>;
declare const AdSlotResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    placement: z.ZodEnum<{
        global_top: "global_top";
        global_bottom: "global_bottom";
        recipe_edit_after_fermentables: "recipe_edit_after_fermentables";
        recipe_edit_after_hops: "recipe_edit_after_hops";
        recipe_edit_after_yeast: "recipe_edit_after_yeast";
    }>;
    platform: z.ZodLiteral<"web">;
    disabled: z.ZodBoolean;
    ad: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        imageUrl: z.ZodString;
        linkUrl: z.ZodString;
        altText: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
/** platform-admin: GET /platform/ads */
declare const PlatformAdRowSchema: z.ZodObject<{
    id: z.ZodString;
    placement: z.ZodEnum<{
        global_top: "global_top";
        global_bottom: "global_bottom";
        recipe_edit_after_fermentables: "recipe_edit_after_fermentables";
        recipe_edit_after_hops: "recipe_edit_after_hops";
        recipe_edit_after_yeast: "recipe_edit_after_yeast";
    }>;
    platform: z.ZodLiteral<"web">;
    imageUrl: z.ZodString;
    linkUrl: z.ZodString;
    altText: z.ZodString;
    isActive: z.ZodBoolean;
    startsAt: z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>;
    endsAt: z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>;
    priority: z.ZodNumber;
    weight: z.ZodNumber;
    createdAt: z.ZodPreprocess<z.ZodString>;
    updatedAt: z.ZodPreprocess<z.ZodString>;
}, z.core.$strip>;
declare const PlatformAdsListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    ads: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        placement: z.ZodEnum<{
            global_top: "global_top";
            global_bottom: "global_bottom";
            recipe_edit_after_fermentables: "recipe_edit_after_fermentables";
            recipe_edit_after_hops: "recipe_edit_after_hops";
            recipe_edit_after_yeast: "recipe_edit_after_yeast";
        }>;
        platform: z.ZodLiteral<"web">;
        imageUrl: z.ZodString;
        linkUrl: z.ZodString;
        altText: z.ZodString;
        isActive: z.ZodBoolean;
        startsAt: z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>;
        endsAt: z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>;
        priority: z.ZodNumber;
        weight: z.ZodNumber;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const PlatformAdCreateRequestSchema: z.ZodObject<{
    placement: z.ZodEnum<{
        global_top: "global_top";
        global_bottom: "global_bottom";
        recipe_edit_after_fermentables: "recipe_edit_after_fermentables";
        recipe_edit_after_hops: "recipe_edit_after_hops";
        recipe_edit_after_yeast: "recipe_edit_after_yeast";
    }>;
    platform: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"web", unknown>>>;
    imageUrl: z.ZodString;
    linkUrl: z.ZodString;
    altText: z.ZodString;
    startsAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>>;
    endsAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
declare const PlatformAdCreateResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    id: z.ZodString;
}, z.core.$strip>;
declare const PlatformAdIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
declare const PlatformAdPatchRequestSchema: z.ZodObject<{
    placement: z.ZodOptional<z.ZodEnum<{
        global_top: "global_top";
        global_bottom: "global_bottom";
        recipe_edit_after_fermentables: "recipe_edit_after_fermentables";
        recipe_edit_after_hops: "recipe_edit_after_hops";
        recipe_edit_after_yeast: "recipe_edit_after_yeast";
    }>>;
    platform: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<"web", unknown>>>;
    imageUrl: z.ZodOptional<z.ZodString>;
    linkUrl: z.ZodOptional<z.ZodString>;
    altText: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    startsAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>>;
    endsAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodPreprocess<z.ZodString>>>>;
    priority: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
declare const PlatformAdOkResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
type AdSlotResponse = z.infer<typeof AdSlotResponseSchema>;
type PlatformAdRow = z.infer<typeof PlatformAdRowSchema>;

/**
 * Platform integrations route contracts (OpenAPI integrations tag).
 */

declare const IntegrationKindSchema: z.ZodEnum<{
    tilt: "tilt";
    ispindel: "ispindel";
    rapt: "rapt";
}>;
declare const IntegrationWorkspaceIdParamsSchema: z.ZodObject<{
    workspaceId: z.ZodString;
}, z.core.$strip>;
declare const IntegrationWorkspaceKindParamsSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    kind: z.ZodPreprocess<z.ZodEnum<{
        tilt: "tilt";
        ispindel: "ispindel";
        rapt: "rapt";
    }>>;
}, z.core.$strip>;
declare const IntegrationTokenParamsSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
declare const IntegrationSummarySchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    kind: z.ZodEnum<{
        tilt: "tilt";
        ispindel: "ispindel";
        rapt: "rapt";
    }>;
    revokedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    createdAt: z.ZodPreprocess<z.ZodString>;
    updatedAt: z.ZodPreprocess<z.ZodString>;
}, z.core.$strip>;
declare const IntegrationRevealResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    integrationId: z.ZodString;
    kind: z.ZodEnum<{
        tilt: "tilt";
        ispindel: "ispindel";
        rapt: "rapt";
    }>;
    token: z.ZodString;
    publicPath: z.ZodString;
}, z.core.$strip>;
declare const IntegrationGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    integration: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        kind: z.ZodEnum<{
            tilt: "tilt";
            ispindel: "ispindel";
            rapt: "rapt";
        }>;
        revokedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const IntegrationCreateResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    integrationId: z.ZodString;
    token: z.ZodString;
    publicPath: z.ZodString;
}, z.core.$strip>;
declare const IntegrationOkResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
/** Tilt webhook ingest — body keys vary by firmware; validate structure loosely. */
declare const TiltIngestBodySchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const TiltIngestResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    integrationId: z.ZodString;
    deviceId: z.ZodString;
    readingId: z.ZodString;
    brewSessionId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const IntegrationDevicesQuerySchema: z.ZodObject<{
    includeReadings: z.ZodPipe<z.ZodOptional<z.ZodUnknown>, z.ZodTransform<boolean, unknown>>;
    readingsLimit: z.ZodPipe<z.ZodOptional<z.ZodUnknown>, z.ZodTransform<number, unknown>>;
}, z.core.$strip>;
declare const IntegrationDeviceReadingSchema: z.ZodObject<{
    id: z.ZodString;
    brewSessionId: z.ZodNullable<z.ZodString>;
    recordedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    receivedAt: z.ZodPreprocess<z.ZodString>;
    temperatureC: z.ZodNullable<z.ZodNumber>;
    gravitySg: z.ZodNullable<z.ZodNumber>;
    rawJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const IntegrationBrewSessionRefSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodNullable<z.ZodString>;
    status: z.ZodString;
    createdAt: z.ZodPreprocess<z.ZodString>;
    startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    recipe: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const IntegrationDeviceAttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    attachedAt: z.ZodPreprocess<z.ZodString>;
    brewSession: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodNullable<z.ZodString>;
        status: z.ZodString;
        createdAt: z.ZodPreprocess<z.ZodString>;
        startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        recipe: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const IntegrationDeviceSchema: z.ZodObject<{
    id: z.ZodString;
    deviceKey: z.ZodString;
    displayName: z.ZodNullable<z.ZodString>;
    metadataJson: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    lastSeenAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    createdAt: z.ZodPreprocess<z.ZodString>;
    activeAttachment: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        attachedAt: z.ZodPreprocess<z.ZodString>;
        brewSession: z.ZodObject<{
            id: z.ZodString;
            code: z.ZodNullable<z.ZodString>;
            status: z.ZodString;
            createdAt: z.ZodPreprocess<z.ZodString>;
            startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            recipe: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    lastReading: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        brewSessionId: z.ZodNullable<z.ZodString>;
        recordedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        receivedAt: z.ZodPreprocess<z.ZodString>;
        temperatureC: z.ZodNullable<z.ZodNumber>;
        gravitySg: z.ZodNullable<z.ZodNumber>;
        rawJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
    recentReadings: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        brewSessionId: z.ZodNullable<z.ZodString>;
        recordedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        receivedAt: z.ZodPreprocess<z.ZodString>;
        temperatureC: z.ZodNullable<z.ZodNumber>;
        gravitySg: z.ZodNullable<z.ZodNumber>;
        rawJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
declare const IntegrationDevicesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    devices: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        deviceKey: z.ZodString;
        displayName: z.ZodNullable<z.ZodString>;
        metadataJson: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        lastSeenAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        activeAttachment: z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            attachedAt: z.ZodPreprocess<z.ZodString>;
            brewSession: z.ZodObject<{
                id: z.ZodString;
                code: z.ZodNullable<z.ZodString>;
                status: z.ZodString;
                createdAt: z.ZodPreprocess<z.ZodString>;
                startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
                recipe: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strip>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        lastReading: z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            brewSessionId: z.ZodNullable<z.ZodString>;
            recordedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            receivedAt: z.ZodPreprocess<z.ZodString>;
            temperatureC: z.ZodNullable<z.ZodNumber>;
            gravitySg: z.ZodNullable<z.ZodNumber>;
            rawJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        recentReadings: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            brewSessionId: z.ZodNullable<z.ZodString>;
            recordedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            receivedAt: z.ZodPreprocess<z.ZodString>;
            temperatureC: z.ZodNullable<z.ZodNumber>;
            gravitySg: z.ZodNullable<z.ZodNumber>;
            rawJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const IntegrationDeviceIdParamsSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    deviceId: z.ZodString;
}, z.core.$strip>;
declare const IntegrationDeviceAttachRequestSchema: z.ZodObject<{
    brewSessionId: z.ZodString;
}, z.core.$strip>;
declare const IntegrationDeviceAttachResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    attachment: z.ZodObject<{
        id: z.ZodString;
        attachedAt: z.ZodPreprocess<z.ZodString>;
        brewSessionId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const IntegrationDeviceDetachResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    detachedCount: z.ZodNumber;
}, z.core.$strip>;
declare const BrewSessionsRecentQuerySchema: z.ZodObject<{
    limit: z.ZodPipe<z.ZodOptional<z.ZodUnknown>, z.ZodTransform<number, unknown>>;
}, z.core.$strip>;
declare const BrewSessionSummarySchema: z.ZodObject<{
    id: z.ZodString;
    recipeId: z.ZodString;
    code: z.ZodNullable<z.ZodString>;
    status: z.ZodString;
    startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    pausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    stoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    createdAt: z.ZodPreprocess<z.ZodString>;
    recipe: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const BrewSessionsRecentResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    brewSessions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        recipeId: z.ZodString;
        code: z.ZodNullable<z.ZodString>;
        status: z.ZodString;
        startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        pausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        stoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        scheduledDate: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        recipe: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type IntegrationKind = z.infer<typeof IntegrationKindSchema>;
type IntegrationRevealResponse = z.infer<typeof IntegrationRevealResponseSchema>;

/**
 * Platform-admin recipe route contracts (OpenAPI platform-admin tag).
 * BeerJSON bodies use z.unknown() — strict validation happens in import services.
 */

declare const PlatformWorkspaceRowSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
declare const PlatformWorkspacesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const PlatformRecipesListQuerySchema: z.ZodPreprocess<z.ZodObject<{
    workspaceId: z.ZodString;
}, z.core.$strip>>;
declare const PlatformRecipeSummarySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodNumber;
    styleKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    style: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
    createdAt: z.ZodOptional<z.ZodPreprocess<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodPreprocess<z.ZodString>>;
}, z.core.$strip>;
declare const PlatformRecipesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    recipes: z.ZodArray<z.ZodUnknown>;
}, z.core.$strip>;
declare const PlatformRecipeIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
declare const PlatformRecipeExportQuerySchema: z.ZodPreprocess<z.ZodObject<{
    workspaceId: z.ZodString;
}, z.core.$strip>>;
/** Loose BeerJSON export — edge validation in beerjson/strictExport. */
declare const BeerJsonLooseSchema: z.ZodUnknown;
declare const PlatformImportFormatSchema: z.ZodEnum<{
    beerjson: "beerjson";
    beerxml: "beerxml";
}>;
declare const PlatformRecipeImportPreviewRequestSchema: z.ZodPreprocess<z.ZodObject<{
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    content: z.ZodString;
    workspaceId: z.ZodString;
}, z.core.$strip>>;
declare const PlatformRecipeImportPreviewResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    preview: z.ZodObject<{
        name: z.ZodString;
        notes: z.ZodNullable<z.ZodString>;
        beerJsonRecipeJson: z.ZodUnknown;
        warnings: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    workspaceId: z.ZodString;
}, z.core.$strip>;
declare const PlatformRecipeImportRequestSchema: z.ZodPreprocess<z.ZodObject<{
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    content: z.ZodString;
    styleKey: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    recipeExtJson: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>>;
declare const PlatformRecipeImportResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    recipe: z.ZodUnknown;
    warnings: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const PlatformRecipeBulkImportPreviewRequestSchema: z.ZodPreprocess<z.ZodObject<{
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    content: z.ZodString;
    workspaceId: z.ZodString;
}, z.core.$strip>>;
declare const PlatformRecipeBulkImportPreviewItemSchema: z.ZodObject<{
    index: z.ZodNumber;
    name: z.ZodString;
    notes: z.ZodNullable<z.ZodString>;
    resolvedStyleKey: z.ZodString;
    resolvedStyleName: z.ZodNullable<z.ZodString>;
    resolvedStyleCode: z.ZodNullable<z.ZodString>;
    warnings: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const PlatformRecipeBulkImportPreviewResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    previewItems: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        name: z.ZodString;
        notes: z.ZodNullable<z.ZodString>;
        resolvedStyleKey: z.ZodString;
        resolvedStyleName: z.ZodNullable<z.ZodString>;
        resolvedStyleCode: z.ZodNullable<z.ZodString>;
        warnings: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    workspaceId: z.ZodString;
}, z.core.$strip>;
declare const PlatformRecipeBulkImportRequestSchema: z.ZodPreprocess<z.ZodObject<{
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    content: z.ZodString;
    workspaceId: z.ZodString;
}, z.core.$strip>>;
declare const PlatformRecipeBulkImportResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    created: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        recipeId: z.ZodString;
        name: z.ZodString;
        styleKey: z.ZodString;
        style: z.ZodNullable<z.ZodUnknown>;
        warnings: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    failed: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        name: z.ZodString;
        error: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const PlatformAdminOkResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;

/**
 * Webhook route contracts (OpenAPI webhooks tag).
 * Provider payloads are validated loosely — signature verification is route-level.
 */

declare const WebhookOkResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
declare const WebhookStripeBodySchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const WebhookRevenuecatBodySchema: z.ZodUnknown;

type NumberFormatUnit = "pH" | "ppm" | "ppm_as_CaCO3" | "L" | "mL" | "g" | "kg" | "gal" | "qt" | "pt" | "fl_oz" | "lb" | "oz" | "percent" | "sg" | "ibu" | "srm" | "min";
interface NumberFormatHintV1 {
    version: 1;
    style: "fixed" | "significant";
    decimals: number;
    unit?: NumberFormatUnit | undefined;
    clamp?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
}

declare const waterFormatHints: Record<string, NumberFormatHintV1>;
declare const analysisFormatHints: Record<string, NumberFormatHintV1>;

/**
 * AI usage dashboard — wire shape for `GET /workspaces/:id/ai/usage`.
 */

declare const AiUsageMonthlySchema: z.ZodObject<{
    tokensIn: z.ZodNumber;
    tokensOut: z.ZodNumber;
    costMicroUsd: z.ZodNumber;
    callCount: z.ZodNumber;
}, z.core.$strip>;
declare const AiUsageDailyPointSchema: z.ZodObject<{
    day: z.ZodString;
    tokensIn: z.ZodNumber;
    tokensOut: z.ZodNumber;
    calls: z.ZodNumber;
}, z.core.$strip>;
declare const AiUsageByUserSchema: z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    role: z.ZodNullable<z.ZodString>;
    tokensInToday: z.ZodNumber;
    tokensOutToday: z.ZodNumber;
    tokensInMonth: z.ZodNumber;
    tokensOutMonth: z.ZodNumber;
    costMicroUsdMonth: z.ZodNumber;
    callCountMonth: z.ZodNumber;
}, z.core.$strip>;
declare const AiUsageRoleAlertSchema: z.ZodObject<{
    role: z.ZodString;
    used: z.ZodNumber;
    limit: z.ZodNumber;
    percent: z.ZodNumber;
}, z.core.$strip>;
declare const AiUsageUserAlertSchema: z.ZodObject<{
    userId: z.ZodString;
    usedToday: z.ZodNumber;
    cap: z.ZodNumber;
    percent: z.ZodNumber;
}, z.core.$strip>;
declare const WorkspaceAiUsageResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    monthly: z.ZodObject<{
        tokensIn: z.ZodNumber;
        tokensOut: z.ZodNumber;
        costMicroUsd: z.ZodNumber;
        callCount: z.ZodNumber;
    }, z.core.$strip>;
    dailySeries: z.ZodArray<z.ZodObject<{
        day: z.ZodString;
        tokensIn: z.ZodNumber;
        tokensOut: z.ZodNumber;
        calls: z.ZodNumber;
    }, z.core.$strip>>;
    roleLimits: z.ZodRecord<z.ZodString, z.ZodNumber>;
    roleUsage: z.ZodRecord<z.ZodString, z.ZodNumber>;
    perUserDailyCap: z.ZodNumber;
    byUser: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        email: z.ZodNullable<z.ZodString>;
        role: z.ZodNullable<z.ZodString>;
        tokensInToday: z.ZodNumber;
        tokensOutToday: z.ZodNumber;
        tokensInMonth: z.ZodNumber;
        tokensOutMonth: z.ZodNumber;
        costMicroUsdMonth: z.ZodNumber;
        callCountMonth: z.ZodNumber;
    }, z.core.$strip>>;
    alerts: z.ZodObject<{
        roleAlerts: z.ZodArray<z.ZodObject<{
            role: z.ZodString;
            used: z.ZodNumber;
            limit: z.ZodNumber;
            percent: z.ZodNumber;
        }, z.core.$strip>>;
        userAlerts: z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            usedToday: z.ZodNumber;
            cap: z.ZodNumber;
            percent: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/** One recorded entry per AI chat turn (audit/analytics). */
declare const AiToolCallRecordSchema: z.ZodObject<{
    name: z.ZodString;
    argsJson: z.ZodString;
    resultJson: z.ZodString;
    durationMs: z.ZodNumber;
    errored: z.ZodBoolean;
}, z.core.$strip>;
declare const AiUsageLedgerEntrySchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    userId: z.ZodString;
    sessionId: z.ZodNullable<z.ZodString>;
    model: z.ZodString;
    tokensIn: z.ZodNumber;
    tokensOut: z.ZodNumber;
    costMicroUsd: z.ZodNumber;
    durationMs: z.ZodNumber;
    providerRequestId: z.ZodNullable<z.ZodString>;
    toolCalls: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        argsJson: z.ZodString;
        resultJson: z.ZodString;
        durationMs: z.ZodNumber;
        errored: z.ZodBoolean;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
}, z.core.$strip>;
type AiUsageLedgerEntry = z.infer<typeof AiUsageLedgerEntrySchema>;
type AiToolCallRecord = z.infer<typeof AiToolCallRecordSchema>;
type WorkspaceAiUsageResponse = z.infer<typeof WorkspaceAiUsageResponseSchema>;

/**
 * Workspace AI settings — wire shape for `GET/PUT /workspaces/:id/ai/settings`.
 *
 * Security invariant: the encrypted provider key MUST never be returned
 * to clients. The DTO exposes only `hasKey: boolean`.
 */

declare const AiProviderSchema: z.ZodEnum<{
    anthropic: "anthropic";
    openai: "openai";
}>;
declare const AiRoleLimitsSchema: z.ZodRecord<z.ZodString, z.ZodNumber>;
declare const WorkspaceAiSettingsSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    provider: z.ZodEnum<{
        anthropic: "anthropic";
        openai: "openai";
    }>;
    hasKey: z.ZodBoolean;
    enabled: z.ZodBoolean;
    roleLimits: z.ZodRecord<z.ZodString, z.ZodNumber>;
    perUserDailyCap: z.ZodNumber;
    dataEgressAccepted: z.ZodBoolean;
    dataEgressAcceptedAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const UpdateWorkspaceAiSettingsRequestSchema: z.ZodObject<{
    provider: z.ZodOptional<z.ZodEnum<{
        anthropic: "anthropic";
        openai: "openai";
    }>>;
    apiKey: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    roleLimits: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    perUserDailyCap: z.ZodOptional<z.ZodNumber>;
    dataEgressAccepted: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
declare const WorkspaceAiSettingsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    settings: z.ZodObject<{
        workspaceId: z.ZodString;
        provider: z.ZodEnum<{
            anthropic: "anthropic";
            openai: "openai";
        }>;
        hasKey: z.ZodBoolean;
        enabled: z.ZodBoolean;
        roleLimits: z.ZodRecord<z.ZodString, z.ZodNumber>;
        perUserDailyCap: z.ZodNumber;
        dataEgressAccepted: z.ZodBoolean;
        dataEgressAcceptedAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const WorkspaceAiSettingsParamsSchema: z.ZodObject<{
    workspaceId: z.ZodString;
}, z.core.$strip>;
type AiProvider = z.infer<typeof AiProviderSchema>;
type AiRoleLimits = z.infer<typeof AiRoleLimitsSchema>;
type WorkspaceAiSettings = z.infer<typeof WorkspaceAiSettingsSchema>;
type UpdateWorkspaceAiSettingsRequest = z.infer<typeof UpdateWorkspaceAiSettingsRequestSchema>;

/**
 * `POST /ai/chat` request body.
 *
 * `routeId` is an optional hint from `@umbraculum/navigation` RouteId strings.
 * Unknown route ids are ignored by the orchestrator (forward compatibility).
 */
declare const AiChatRequestBodySchema: z.ZodObject<{
    message: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    routeId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type AiChatRequestBody = z.infer<typeof AiChatRequestBodySchema>;
/** SSE wire events from `services/api/src/services/ai/orchestrator.ts` `AiSseEvent`. */
declare const AiSseAssistantChunkEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"assistant_chunk">;
    text: z.ZodString;
}, z.core.$strip>;
declare const AiSseToolCallEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"tool_call">;
    name: z.ZodString;
    argsJson: z.ZodString;
}, z.core.$strip>;
declare const AiSseToolResultEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"tool_result">;
    name: z.ZodString;
    resultJson: z.ZodString;
    durationMs: z.ZodNumber;
    errored: z.ZodBoolean;
}, z.core.$strip>;
declare const AiSseProposalEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"proposal">;
    proposalId: z.ZodString;
    moduleCode: z.ZodString;
    proposalType: z.ZodString;
    summary: z.ZodString;
}, z.core.$strip>;
declare const AiSseCompleteEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"complete">;
    usage: z.ZodObject<{
        tokensIn: z.ZodNumber;
        tokensOut: z.ZodNumber;
        durationMs: z.ZodNumber;
        model: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const AiSseErrorEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"error">;
    code: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
declare const AiSseEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"assistant_chunk">;
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"tool_call">;
    name: z.ZodString;
    argsJson: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"tool_result">;
    name: z.ZodString;
    resultJson: z.ZodString;
    durationMs: z.ZodNumber;
    errored: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"proposal">;
    proposalId: z.ZodString;
    moduleCode: z.ZodString;
    proposalType: z.ZodString;
    summary: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"complete">;
    usage: z.ZodObject<{
        tokensIn: z.ZodNumber;
        tokensOut: z.ZodNumber;
        durationMs: z.ZodNumber;
        model: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    code: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>], "type">;
type AiSseEvent = z.infer<typeof AiSseEventSchema>;

declare const AiProposalStatusSchema: z.ZodEnum<{
    pending: "pending";
    applied: "applied";
    rejected: "rejected";
}>;
type AiProposalStatus = z.infer<typeof AiProposalStatusSchema>;
declare const AiProposalDtoSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    userId: z.ZodString;
    moduleCode: z.ZodString;
    proposalType: z.ZodString;
    summary: z.ZodString;
    payloadJson: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    status: z.ZodEnum<{
        pending: "pending";
        applied: "applied";
        rejected: "rejected";
    }>;
    createdAt: z.ZodString;
    appliedAt: z.ZodNullable<z.ZodString>;
    rejectedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
type AiProposalDto = z.infer<typeof AiProposalDtoSchema>;
declare const AiProposalListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        userId: z.ZodString;
        moduleCode: z.ZodString;
        proposalType: z.ZodString;
        summary: z.ZodString;
        payloadJson: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        status: z.ZodEnum<{
            pending: "pending";
            applied: "applied";
            rejected: "rejected";
        }>;
        createdAt: z.ZodString;
        appliedAt: z.ZodNullable<z.ZodString>;
        rejectedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const AiProposalIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
declare const AiProposalGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    proposal: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        userId: z.ZodString;
        moduleCode: z.ZodString;
        proposalType: z.ZodString;
        summary: z.ZodString;
        payloadJson: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        status: z.ZodEnum<{
            pending: "pending";
            applied: "applied";
            rejected: "rejected";
        }>;
        createdAt: z.ZodString;
        appliedAt: z.ZodNullable<z.ZodString>;
        rejectedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const AiProposalActionResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    proposal: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        userId: z.ZodString;
        moduleCode: z.ZodString;
        proposalType: z.ZodString;
        summary: z.ZodString;
        payloadJson: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        status: z.ZodEnum<{
            pending: "pending";
            applied: "applied";
            rejected: "rejected";
        }>;
        createdAt: z.ZodString;
        appliedAt: z.ZodNullable<z.ZodString>;
        rejectedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    appliedPreviewOnly: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
declare const MrpProposeOrderAdjustmentInputSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
    suggestedStartDate: z.ZodOptional<z.ZodString>;
    suggestedQuantity: z.ZodOptional<z.ZodNumber>;
    rationale: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
declare const MrpProposeOrderAdjustmentOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    proposalId: z.ZodString;
    summary: z.ZodString;
}, z.core.$strict>;
declare const CrpProposeScheduleAdjustmentInputSchema: z.ZodObject<{
    resourceId: z.ZodOptional<z.ZodString>;
    suggestedDate: z.ZodOptional<z.ZodString>;
    rationale: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
declare const CrpProposeScheduleAdjustmentOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    proposalId: z.ZodString;
    summary: z.ZodString;
}, z.core.$strict>;
type MrpProposeOrderAdjustmentInput = z.infer<typeof MrpProposeOrderAdjustmentInputSchema>;
type MrpProposeOrderAdjustmentOutput = z.infer<typeof MrpProposeOrderAdjustmentOutputSchema>;
type CrpProposeScheduleAdjustmentInput = z.infer<typeof CrpProposeScheduleAdjustmentInputSchema>;
type CrpProposeScheduleAdjustmentOutput = z.infer<typeof CrpProposeScheduleAdjustmentOutputSchema>;

declare const RenderKindSchema: z.ZodEnum<{
    pdf: "pdf";
    xlsx: "xlsx";
    csv: "csv";
    docx: "docx";
    odt: "odt";
    html: "html";
    json: "json";
    xml: "xml";
    barcode: "barcode";
    qr: "qr";
}>;
declare const RenderStatusSchema: z.ZodEnum<{
    failed: "failed";
    queued: "queued";
    running: "running";
    succeeded: "succeeded";
}>;
declare const RenderVisibilitySchema: z.ZodEnum<{
    workspace: "workspace";
    public: "public";
}>;
declare const RenderDeliverySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"stream-response">;
}, z.core.$strict>, z.ZodObject<{
    mode: z.ZodLiteral<"persist-to-media">;
    visibility: z.ZodEnum<{
        workspace: "workspace";
        public: "public";
    }>;
}, z.core.$strict>, z.ZodObject<{
    mode: z.ZodLiteral<"email">;
    to: z.ZodArray<z.ZodString>;
    subject: z.ZodString;
}, z.core.$strict>], "mode">;
declare const RenderErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
}, z.core.$strict>;
declare const RenderJobSubmitRequestSchema: z.ZodObject<{
    templateRef: z.ZodString;
    kind: z.ZodOptional<z.ZodEnum<{
        pdf: "pdf";
        xlsx: "xlsx";
        csv: "csv";
        docx: "docx";
        odt: "odt";
        html: "html";
        json: "json";
        xml: "xml";
        barcode: "barcode";
        qr: "qr";
    }>>;
    data: z.ZodUnknown;
    delivery: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"stream-response">;
    }, z.core.$strict>, z.ZodObject<{
        mode: z.ZodLiteral<"persist-to-media">;
        visibility: z.ZodEnum<{
            workspace: "workspace";
            public: "public";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        mode: z.ZodLiteral<"email">;
        to: z.ZodArray<z.ZodString>;
        subject: z.ZodString;
    }, z.core.$strict>], "mode">>;
}, z.core.$strict>;
declare const RenderJobStatusSchema: z.ZodObject<{
    id: z.ZodString;
    templateRef: z.ZodString;
    kind: z.ZodEnum<{
        pdf: "pdf";
        xlsx: "xlsx";
        csv: "csv";
        docx: "docx";
        odt: "odt";
        html: "html";
        json: "json";
        xml: "xml";
        barcode: "barcode";
        qr: "qr";
    }>;
    status: z.ZodEnum<{
        failed: "failed";
        queued: "queued";
        running: "running";
        succeeded: "succeeded";
    }>;
    deliveryMode: z.ZodString;
    requestedAt: z.ZodString;
    startedAt: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
    artifactId: z.ZodNullable<z.ZodString>;
    mediaAssetId: z.ZodNullable<z.ZodString>;
    error: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const RenderJobSubmitResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    mode: z.ZodLiteral<"async">;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            failed: "failed";
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const RenderJobStatusResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            failed: "failed";
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const RenderJobCancelResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            failed: "failed";
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const RenderJobResultResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            failed: "failed";
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    signedUrl: z.ZodString;
    expiresAt: z.ZodString;
}, z.core.$strict>;
declare const ErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strict>;
}, z.core.$strict>;
type RenderKind = z.infer<typeof RenderKindSchema>;
type RenderStatus = z.infer<typeof RenderStatusSchema>;
type RenderVisibility = z.infer<typeof RenderVisibilitySchema>;
type RenderDelivery = z.infer<typeof RenderDeliverySchema>;
type RenderError = z.infer<typeof RenderErrorSchema>;
type RenderJobSubmitRequest = z.infer<typeof RenderJobSubmitRequestSchema>;
type RenderJobStatus = z.infer<typeof RenderJobStatusSchema>;
type RenderJobSubmitResponse = z.infer<typeof RenderJobSubmitResponseSchema>;
type RenderJobStatusResponse = z.infer<typeof RenderJobStatusResponseSchema>;
type RenderJobCancelResponse = z.infer<typeof RenderJobCancelResponseSchema>;
type RenderJobResultResponse = z.infer<typeof RenderJobResultResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
declare function parseRenderJobSubmitRequest(payload: unknown): RenderJobSubmitRequest;
declare function parseRenderJobStatusResponse(payload: unknown): RenderJobStatusResponse;

export { ActiveWorkspaceContextResponseSchema, AdPlacementSchema, AdPlatformSchema, AdSlotParamsSchema, AdSlotQuerySchema, type AdSlotResponse, AdSlotResponseSchema, type AiChatRequestBody, AiChatRequestBodySchema, AiProposalActionResponseSchema, type AiProposalDto, AiProposalDtoSchema, AiProposalGetResponseSchema, AiProposalIdParamsSchema, AiProposalListResponseSchema, type AiProposalStatus, AiProposalStatusSchema, type AiProvider, AiProviderSchema, type AiRoleLimits, AiRoleLimitsSchema, AiSseAssistantChunkEventSchema, AiSseCompleteEventSchema, AiSseErrorEventSchema, type AiSseEvent, AiSseEventSchema, AiSseProposalEventSchema, AiSseToolCallEventSchema, AiSseToolResultEventSchema, type AiToolCallRecord, AiToolCallRecordSchema, AiUsageByUserSchema, AiUsageDailyPointSchema, type AiUsageLedgerEntry, AiUsageLedgerEntrySchema, AiUsageMonthlySchema, AiUsageRoleAlertSchema, AiUsageUserAlertSchema, type AuthActiveWorkspaceRequest, AuthActiveWorkspaceRequestSchema, AuthActiveWorkspaceResponseSchema, AuthLoginNativeResponseSchema, type AuthLoginRequest, AuthLoginRequestSchema, AuthLoginResponseSchema, AuthLogoutResponseSchema, type AuthMeResponse, AuthMeResponseSchema, type AuthMeResponseUser, AuthMeResponseUserSchema, type AuthMeResponseWorkspace, AuthMeResponseWorkspaceSchema, AuthPreferencesPatchRequestSchema, AuthPreferencesPatchResponseSchema, AuthSessionUserSchema, type AuthSignupRequest, AuthSignupRequestSchema, AuthSignupResponseSchema, AuthWebviewBridgeQuerySchema, AuthWebviewExchangeRequestSchema, AuthWebviewExchangeResponseSchema, BeerJsonLooseSchema, type BillingConfirmRequest, BillingConfirmRequestSchema, BillingConfirmResponseSchema, type BillingIntentRequest, BillingIntentRequestSchema, type BillingIntentResponse, BillingIntentResponseSchema, BillingPurchaseIntentModeSchema, BillingPurchaseProviderSchema, BillingTierSchema, BillingWorkspaceIdParamsSchema, BrewSessionSummarySchema, BrewSessionsRecentQuerySchema, BrewSessionsRecentResponseSchema, ContextMeResponseSchema, type CrpProposeScheduleAdjustmentInput, CrpProposeScheduleAdjustmentInputSchema, type CrpProposeScheduleAdjustmentOutput, CrpProposeScheduleAdjustmentOutputSchema, type ErrorResponse, ErrorResponseSchema, type HealthResponse, HealthResponseSchema, IntegrationBrewSessionRefSchema, IntegrationCreateResponseSchema, IntegrationDeviceAttachRequestSchema, IntegrationDeviceAttachResponseSchema, IntegrationDeviceAttachmentSchema, IntegrationDeviceDetachResponseSchema, IntegrationDeviceIdParamsSchema, IntegrationDeviceReadingSchema, IntegrationDeviceSchema, IntegrationDevicesListResponseSchema, IntegrationDevicesQuerySchema, IntegrationGetResponseSchema, type IntegrationKind, IntegrationKindSchema, IntegrationOkResponseSchema, type IntegrationRevealResponse, IntegrationRevealResponseSchema, IntegrationSummarySchema, IntegrationTokenParamsSchema, IntegrationWorkspaceIdParamsSchema, IntegrationWorkspaceKindParamsSchema, type MrpProposeOrderAdjustmentInput, MrpProposeOrderAdjustmentInputSchema, type MrpProposeOrderAdjustmentOutput, MrpProposeOrderAdjustmentOutputSchema, type NumberFormatHintV1, type NumberFormatUnit, PlatformAdCreateRequestSchema, PlatformAdCreateResponseSchema, PlatformAdIdParamsSchema, PlatformAdOkResponseSchema, PlatformAdPatchRequestSchema, type PlatformAdRow, PlatformAdRowSchema, PlatformAdminOkResponseSchema, PlatformAdsListResponseSchema, PlatformImportFormatSchema, PlatformRecipeBulkImportPreviewItemSchema, PlatformRecipeBulkImportPreviewRequestSchema, PlatformRecipeBulkImportPreviewResponseSchema, PlatformRecipeBulkImportRequestSchema, PlatformRecipeBulkImportResponseSchema, PlatformRecipeExportQuerySchema, PlatformRecipeIdParamsSchema, PlatformRecipeImportPreviewRequestSchema, PlatformRecipeImportPreviewResponseSchema, PlatformRecipeImportRequestSchema, PlatformRecipeImportResponseSchema, PlatformRecipeSummarySchema, PlatformRecipesListQuerySchema, PlatformRecipesListResponseSchema, PlatformWorkspaceRowSchema, PlatformWorkspacesListResponseSchema, PreferredLocaleSchema, type RenderDelivery, RenderDeliverySchema, type RenderError, RenderErrorSchema, type RenderJobCancelResponse, RenderJobCancelResponseSchema, type RenderJobResultResponse, RenderJobResultResponseSchema, type RenderJobStatus, type RenderJobStatusResponse, RenderJobStatusResponseSchema, RenderJobStatusSchema, type RenderJobSubmitRequest, RenderJobSubmitRequestSchema, type RenderJobSubmitResponse, RenderJobSubmitResponseSchema, type RenderKind, RenderKindSchema, type RenderStatus, RenderStatusSchema, type RenderVisibility, RenderVisibilitySchema, ResolvedAdSchema, SafeNextPathSchema, TierLimitsSchema, TiltIngestBodySchema, TiltIngestResponseSchema, UiDensitySchema, UiFontScaleSchema, UiThemeSchema, type UpdateWorkspaceAiSettingsRequest, UpdateWorkspaceAiSettingsRequestSchema, WebhookOkResponseSchema, WebhookRevenuecatBodySchema, WebhookStripeBodySchema, type WorkspaceAiSettings, WorkspaceAiSettingsParamsSchema, WorkspaceAiSettingsResponseSchema, WorkspaceAiSettingsSchema, type WorkspaceAiUsageResponse, WorkspaceAiUsageResponseSchema, type WorkspaceBillingResponse, WorkspaceBillingResponseSchema, WorkspaceBrandPatchRequestSchema, WorkspaceBrandPatchResponseSchema, type WorkspaceCreateRequest, WorkspaceCreateRequestSchema, WorkspaceCreateResponseSchema, WorkspaceIdParamsSchema, WorkspaceRowSchema, WorkspacesListResponseSchema, analysisFormatHints, parseAuthMeResponse, parseRenderJobStatusResponse, parseRenderJobSubmitRequest, waterFormatHints };
