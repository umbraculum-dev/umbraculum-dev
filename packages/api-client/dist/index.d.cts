import { A as ApiResponse, a as ApiClient } from './client-Dia82S7S.cjs';
export { b as ApiClientCredentials, c as ApiRequestInit, d as AuthStrategy, F as FetchLike, e as FetchResponseLike, f as bearerTokenAuth, g as cookieAuth, h as createApiClient } from './client-Dia82S7S.cjs';
import { p as paths } from './platform.openapi-DFK6FUu2.cjs';
export { c as PlatformOpenApiComponents, o as PlatformOpenApiOperations } from './platform.openapi-DFK6FUu2.cjs';
export { c as BreweryOpenApiComponents, o as BreweryOpenApiOperations, p as BreweryOpenApiPaths } from './brewery.openapi-CXYEPddO.cjs';
import { AuthWebviewExchangeResponseSchema, AuthMeResponse, AuthLoginRequest, AuthLoginResponseSchema, AuthLoginNativeResponseSchema, AuthLogoutResponseSchema, AuthPreferencesPatchResponseSchema, AuthActiveWorkspaceResponseSchema, AuthSignupRequest, AuthSignupResponseSchema, WorkspaceCreateRequest, WorkspaceCreateResponseSchema, HealthResponseSchema, WorkspacesListResponseSchema, IntegrationKind, WorkspaceBillingResponseSchema, BillingIntentRequest, BillingIntentResponseSchema, WorkspaceAiSettingsResponseSchema, WorkspaceAiUsageResponseSchema, AdSlotResponse } from '@umbraculum/contracts';
export { AdSlotResponse } from '@umbraculum/contracts';
export { R as RenderJobPhase, a as RenderJobResultGet, b as RenderJobStatusGet, f as fetchRenderJobDownloadUrl, p as pollRenderJobUntilSucceeded, r as resolveArtifactDownloadUrl, c as runAsyncRenderJobExport, s as submitRenderJob, t as toWebArtifactUrl } from './rendering-GtWVoEKU.cjs';

/** Non-2xx API response from a typed facade call. */
declare class ApiClientError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(res: ApiResponse);
}

/**
 * First-tranche path → contracts parser map (OpenAPI path key → runtime parse).
 * Compile-time path types live on each facade module via PlatformOpenApiPaths / BreweryOpenApiPaths.
 */
declare const PLATFORM_FACADE_PARSER_MAP: {
    readonly "/auth/me": "parseAuthMeResponse / AuthMeResponseSchema";
    readonly "/auth/login": "AuthLoginResponseSchema";
    readonly "/auth/login/native": "AuthLoginNativeResponseSchema";
    readonly "/auth/logout": "AuthLogoutResponseSchema";
    readonly "/auth/signup": "AuthSignupResponseSchema";
    readonly "/auth/preferences": "AuthPreferencesPatchResponseSchema";
    readonly "/auth/webview-exchange": "AuthWebviewExchangeResponseSchema";
    readonly "/auth/active-workspace": "AuthActiveWorkspaceResponseSchema";
    readonly "/workspaces": "WorkspacesListResponseSchema";
    readonly "/health": "HealthResponseSchema";
    readonly "/workspaces/{workspaceId}/billing": "WorkspaceBillingResponseSchema";
    readonly "/workspaces/{workspaceId}/billing/intent": "BillingIntentResponseSchema";
    readonly "/workspaces/{workspaceId}/ai/settings": "WorkspaceAiSettingsResponseSchema";
    readonly "/workspaces/{workspaceId}/ai/usage": "WorkspaceAiUsageResponseSchema";
    readonly "/ads/slot/{placement}": "AdSlotResponseSchema";
    readonly "/platform/workspaces": "PlatformWorkspacesListResponseSchema";
    readonly "/platform/recipes/list": "PlatformRecipesListResponseSchema";
    readonly "/platform/recipes/import/preview": "PlatformRecipeImportPreviewResponseSchema";
    readonly "/platform/recipes/import": "PlatformRecipeImportResponseSchema";
    readonly "/platform/recipes/import/bulk/preview": "PlatformRecipeBulkImportPreviewResponseSchema";
    readonly "/platform/recipes/import/bulk": "PlatformRecipeBulkImportResponseSchema";
    readonly "/platform/ads": "PlatformAdsListResponseSchema / PlatformAdCreateResponseSchema";
    readonly "/platform/ads/{id}": "PlatformAdOkResponseSchema (PATCH/DELETE)";
    readonly "/workspaces/{workspaceId}/integrations/{kind}": "IntegrationGetResponseSchema / IntegrationCreateResponseSchema";
    readonly "/workspaces/{workspaceId}/integrations/{kind}/reveal": "IntegrationRevealResponseSchema";
    readonly "/workspaces/{workspaceId}/integrations/{kind}/rotate-token": "IntegrationCreateResponseSchema";
    readonly "/workspaces/{workspaceId}/integrations/{kind}/revoke": "IntegrationOkResponseSchema";
    readonly "/workspaces/{workspaceId}/integrations/{kind}/devices": "IntegrationDevicesListResponseSchema";
    readonly "/workspaces/{workspaceId}/integrations/tilt/devices/{deviceId}/attach": "IntegrationDeviceAttachResponseSchema";
    readonly "/workspaces/{workspaceId}/integrations/tilt/devices/{deviceId}/detach": "IntegrationDeviceDetachResponseSchema";
    readonly "/workspaces/{workspaceId}/brew-sessions/recent": "BrewSessionsRecentResponseSchema";
    readonly "/rendering/jobs/{jobId}": "RenderJobStatusResponseSchema";
    readonly "/rendering/jobs/{jobId}/result": "RenderJobResultResponseSchema";
};
declare const BREWERY_FACADE_PARSER_MAP: {
    readonly "/recipes/{id}/export/beerjson": "BeerJsonExportResponseSchema";
    readonly "/recipes/export/beerjson": "BeerJsonExportResponseSchema";
    readonly "/admin/ingredients/sync-runs": "IngredientSyncRunsResponseSchema";
    readonly "/admin/ingredients/sync": "IngredientSyncResponseSchema";
    readonly "/recipes": "parseRecipesListResponse / RecipeResponseSchema (POST)";
    readonly "/recipes/{id}": "RecipeResponseSchema / OkResponseSchema (DELETE)";
    readonly "/recipes/{id}/versions": "RecipeVersionsResponseSchema / RecipeResponseSchema (POST)";
    readonly "/recipes/{id}/duplicate": "RecipeResponseSchema";
    readonly "/recipes/import/preview": "RecipeImportPreviewResponseSchema";
    readonly "/recipes/import": "RecipeImportResponseSchema";
    readonly "/recipes/import/bulk/preview": "RecipeBulkImportPreviewResponseSchema";
    readonly "/recipes/import/bulk": "RecipeBulkImportResponseSchema";
    readonly "/styles": "StylesListResponseSchema";
    readonly "/ingredients/fermentables": "FermentablesListResponseSchema";
    readonly "/ingredients/hops": "HopsListResponseSchema";
    readonly "/ingredients/yeasts": "YeastsListResponseSchema";
    readonly "/brew-sessions/{brewSessionId}": "BrewSessionDetailResponseSchema";
    readonly "/brew-sessions/{brewSessionId}/steps": "BrewSessionStepsResponseSchema";
    readonly "/brew-sessions/{brewSessionId}/integrations/attachments": "IntegrationAttachmentsResponseSchema";
    readonly "/brew-sessions/{brewSessionId}/integrations/readings": "IntegrationReadingsResponseSchema";
    readonly "/inventory": "InventoryListResponseSchema / InventoryItemResponseSchema";
    readonly "/inventory/{id}": "InventoryItemResponseSchema / OkResponseSchema (DELETE)";
    readonly "/equipment-profiles": "EquipmentProfilesListResponseSchema / EquipmentProfileResponseSchema";
    readonly "/equipment-profiles/{id}": "EquipmentProfileResponseSchema / OkResponseSchema (DELETE)";
    readonly "/brewday-settings": "BrewdaySettingsResponseSchema";
    readonly "/recipes/{recipeId}/brew-sessions": "parseBrewSessionsListResponse";
    readonly "/recipes/{id}/water-hub-summary": "parseRecipeWaterHubSummaryResponse";
    readonly "/water-profiles": "parseWaterProfilesResponse / WaterProfileResponseSchema";
    readonly "/water-profiles/{id}/verify": "OkResponseSchema";
    readonly "/water-profiles/{id}/unverify": "OkResponseSchema";
    readonly "/water-profiles/{id}": "OkResponseSchema (DELETE)";
    readonly "/recipes/{id}/water-settings": "RecipeWaterSettingsGetResponseSchema / RecipeWaterSettingsPutResponseSchema";
    readonly "/recipes/{id}/water-settings/mash/compute-and-save": "parseMashComputeAndSaveResponse";
    readonly "/recipes/{id}/water-settings/sparge/compute-and-save": "parseSpargeComputeAndSaveResponse";
    readonly "/recipes/{id}/water-settings/boil/compute-and-save": "parseBoilComputeAndSaveResponse";
    readonly "/water-calc/salt-additions": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/mash-ph-estimate": "WaterCalcResultOnlyResponseSchema";
    readonly "/water-calc/mash-overall": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/sparge-overall": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/boil-overall": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/sparge-acidification": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/sparge-acidification-manual": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/mash-acidification": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/mash-acidification-manual": "WaterCalcWithDerivationResponseSchema";
    readonly "/water-calc/mash-acidification-target-mash-ph": "WaterCalcResultOnlyResponseSchema";
};

type AuthLoginResponse = ReturnType<typeof AuthLoginResponseSchema.parse>;
type AuthLoginNativeResponse = ReturnType<typeof AuthLoginNativeResponseSchema.parse>;
type AuthMePath = "/auth/me";
type AuthMeGet = paths[AuthMePath]["get"];
type AuthLoginPath = "/auth/login";
type AuthLoginPost = paths[AuthLoginPath]["post"];
type AuthLoginNativePath = "/auth/login/native";
type AuthLoginNativePost = paths[AuthLoginNativePath]["post"];

declare function getAuthMe(client: ApiClient): Promise<AuthMeResponse>;
declare function login(client: ApiClient, body: AuthLoginRequest): Promise<AuthLoginResponse>;
declare function loginNative(client: ApiClient, body: AuthLoginRequest): Promise<AuthLoginNativeResponse>;
type AuthLogoutResponse = ReturnType<typeof AuthLogoutResponseSchema.parse>;
type AuthActiveWorkspaceResponse = ReturnType<typeof AuthActiveWorkspaceResponseSchema.parse>;
declare function logout(client: ApiClient): Promise<AuthLogoutResponse>;
declare function setActiveWorkspace(client: ApiClient, body: unknown): Promise<AuthActiveWorkspaceResponse>;
type AuthSignupResponse = ReturnType<typeof AuthSignupResponseSchema.parse>;
type AuthPreferencesPatchResponse = ReturnType<typeof AuthPreferencesPatchResponseSchema.parse>;
type AuthWebviewExchangeResponse = ReturnType<typeof AuthWebviewExchangeResponseSchema.parse>;
declare function signup(client: ApiClient, body: AuthSignupRequest): Promise<AuthSignupResponse>;
declare function patchAuthPreferences(client: ApiClient, body: unknown): Promise<AuthPreferencesPatchResponse>;
declare function exchangeWebviewToken(client: ApiClient, body: unknown): Promise<AuthWebviewExchangeResponse>;

type WorkspacesListResponse = ReturnType<typeof WorkspacesListResponseSchema.parse>;
type WorkspaceCreateResponse = ReturnType<typeof WorkspaceCreateResponseSchema.parse>;
type HealthResponse = ReturnType<typeof HealthResponseSchema.parse>;
type WorkspacesListPath = "/workspaces";
type WorkspacesListGet = paths[WorkspacesListPath]["get"];
type WorkspacesCreatePost = paths[WorkspacesListPath]["post"];
type HealthPath = "/health";
type HealthGet = paths[HealthPath]["get"];

declare function listWorkspaces(client: ApiClient): Promise<WorkspacesListResponse>;
declare function createWorkspace(client: ApiClient, body: WorkspaceCreateRequest): Promise<WorkspaceCreateResponse>;
declare function getHealth(client: ApiClient): Promise<HealthResponse>;

type IntegrationGetPath = "/workspaces/{workspaceId}/integrations/{kind}";
type IntegrationGetGet = paths[IntegrationGetPath]["get"];
type IntegrationDevicesPath = "/workspaces/{workspaceId}/integrations/{kind}/devices";
type IntegrationDevicesGet = paths[IntegrationDevicesPath]["get"];
type BrewSessionsRecentPath = "/workspaces/{workspaceId}/brew-sessions/recent";
type BrewSessionsRecentGet = paths[BrewSessionsRecentPath]["get"];

type ListIntegrationDevicesOptions = {
    includeReadings?: boolean;
    readingsLimit?: number;
};
declare function getWorkspaceIntegration(client: ApiClient, workspaceId: string, kind: IntegrationKind): Promise<{
    ok: true;
    integration: {
        id: string;
        workspaceId: string;
        kind: "tilt" | "ispindel" | "rapt";
        revokedAt: string | null;
        createdAt: string;
        updatedAt: string;
    } | null;
}>;
declare function createWorkspaceIntegration(client: ApiClient, workspaceId: string, kind: IntegrationKind): Promise<{
    ok: true;
    integrationId: string;
    token: string;
    publicPath: string;
}>;
declare function revealIntegrationToken(client: ApiClient, workspaceId: string, kind: IntegrationKind): Promise<{
    ok: true;
    integrationId: string;
    kind: "tilt" | "ispindel" | "rapt";
    token: string;
    publicPath: string;
}>;
declare function rotateIntegrationToken(client: ApiClient, workspaceId: string, kind: IntegrationKind): Promise<{
    ok: true;
    integrationId: string;
    token: string;
    publicPath: string;
}>;
declare function revokeIntegration(client: ApiClient, workspaceId: string, kind: IntegrationKind): Promise<{
    ok: true;
}>;
declare function listIntegrationDevices(client: ApiClient, workspaceId: string, kind: IntegrationKind, options?: ListIntegrationDevicesOptions): Promise<{
    ok: true;
    devices: {
        id: string;
        deviceKey: string;
        displayName: string | null;
        metadataJson: Record<string, unknown> | null;
        lastSeenAt: string | null;
        createdAt: string;
        activeAttachment: {
            id: string;
            attachedAt: string;
            brewSession: {
                id: string;
                code: string | null;
                status: string;
                createdAt: string;
                startedAt: string | null;
                recipe: {
                    id: string;
                    name: string;
                    version: number;
                };
            };
        } | null;
        lastReading: {
            id: string;
            brewSessionId: string | null;
            recordedAt: string | null;
            receivedAt: string;
            temperatureC: number | null;
            gravitySg: number | null;
            rawJson?: Record<string, unknown> | undefined;
        } | null;
        recentReadings?: {
            id: string;
            brewSessionId: string | null;
            recordedAt: string | null;
            receivedAt: string;
            temperatureC: number | null;
            gravitySg: number | null;
            rawJson?: Record<string, unknown> | undefined;
        }[] | null | undefined;
    }[];
}>;
declare function attachTiltDevice(client: ApiClient, workspaceId: string, deviceId: string, body: unknown): Promise<{
    ok: true;
    attachment: {
        id: string;
        attachedAt: string;
        brewSessionId: string;
    };
}>;
declare function detachTiltDevice(client: ApiClient, workspaceId: string, deviceId: string): Promise<{
    ok: true;
    detachedCount: number;
}>;
declare function listRecentBrewSessions(client: ApiClient, workspaceId: string, params?: {
    limit?: number;
}): Promise<{
    ok: true;
    brewSessions: {
        id: string;
        recipeId: string;
        code: string | null;
        status: string;
        startedAt: string | null;
        pausedAt: string | null;
        stoppedAt: string | null;
        scheduledDate: string | null;
        createdAt: string;
        recipe: {
            id: string;
            name: string;
            version: number;
        };
    }[];
}>;

type WorkspaceBillingResponse = ReturnType<typeof WorkspaceBillingResponseSchema.parse>;
type BillingStatusPath = "/workspaces/{workspaceId}/billing";
type BillingStatusGet = paths[BillingStatusPath]["get"];

declare function getWorkspaceBilling(client: ApiClient, workspaceId: string): Promise<WorkspaceBillingResponse>;

type WorkspaceAiSettingsResponse = ReturnType<typeof WorkspaceAiSettingsResponseSchema.parse>;
type WorkspaceAiUsageResponse = ReturnType<typeof WorkspaceAiUsageResponseSchema.parse>;
type BillingIntentResponse = ReturnType<typeof BillingIntentResponseSchema.parse>;
type WorkspaceAiSettingsPath = "/workspaces/{workspaceId}/ai/settings";
type WorkspaceAiSettingsGet = paths[WorkspaceAiSettingsPath]["get"];
type WorkspaceAiSettingsPut = paths[WorkspaceAiSettingsPath]["put"];
type WorkspaceAiUsagePath = "/workspaces/{workspaceId}/ai/usage";
type WorkspaceAiUsageGet = paths[WorkspaceAiUsagePath]["get"];
type BillingIntentPath = "/workspaces/{workspaceId}/billing/intent";
type BillingIntentPost = paths[BillingIntentPath]["post"];

declare function getWorkspaceAiSettings(client: ApiClient, workspaceId: string): Promise<WorkspaceAiSettingsResponse>;
declare function patchWorkspaceAiSettings(client: ApiClient, workspaceId: string, body: unknown): Promise<WorkspaceAiSettingsResponse>;
declare function getWorkspaceAiUsage(client: ApiClient, workspaceId: string): Promise<WorkspaceAiUsageResponse>;
declare function createAiUpgradeBillingIntent(client: ApiClient, workspaceId: string, body: BillingIntentRequest): Promise<BillingIntentResponse>;

type AdSlotPath = "/ads/slot/{placement}";
type AdSlotGet = paths[AdSlotPath]["get"];

type GetAdSlotOptions = {
    platform?: "web";
};
declare function getAdSlot(client: ApiClient, placement: string, options?: GetAdSlotOptions): Promise<AdSlotResponse>;

declare function listPlatformWorkspaces(client: ApiClient): Promise<{
    ok: true;
    workspaces: {
        id: string;
        name: string;
    }[];
}>;
declare function listPlatformRecipes(client: ApiClient, workspaceId: string): Promise<{
    ok: true;
    recipes: unknown[];
}>;
declare function previewPlatformRecipeImport(client: ApiClient, body: unknown): Promise<{
    ok: true;
    format: "beerjson" | "beerxml";
    preview: {
        name: string;
        notes: string | null;
        beerJsonRecipeJson: unknown;
        warnings: string[];
    };
    workspaceId: string;
}>;
declare function importPlatformRecipe(client: ApiClient, body: unknown): Promise<{
    ok: true;
    recipe: unknown;
    warnings: string[];
}>;
declare function previewPlatformBulkRecipeImport(client: ApiClient, body: unknown): Promise<{
    ok: true;
    format: "beerjson" | "beerxml";
    previewItems: {
        index: number;
        name: string;
        notes: string | null;
        resolvedStyleKey: string;
        resolvedStyleName: string | null;
        resolvedStyleCode: string | null;
        warnings: string[];
    }[];
    workspaceId: string;
}>;
declare function importPlatformRecipesBulk(client: ApiClient, body: unknown): Promise<{
    ok: true;
    created: {
        index: number;
        recipeId: string;
        name: string;
        styleKey: string;
        style: unknown;
        warnings: string[];
    }[];
    failed: {
        index: number;
        name: string;
        error: string;
    }[];
}>;
declare function listPlatformAds(client: ApiClient): Promise<{
    ok: true;
    ads: {
        id: string;
        placement: "global_top" | "global_bottom" | "recipe_edit_after_fermentables" | "recipe_edit_after_hops" | "recipe_edit_after_yeast";
        platform: "web";
        imageUrl: string;
        linkUrl: string;
        altText: string;
        isActive: boolean;
        startsAt: string | null;
        endsAt: string | null;
        priority: number;
        weight: number;
        createdAt: string;
        updatedAt: string;
    }[];
}>;
declare function createPlatformAd(client: ApiClient, body: unknown): Promise<{
    ok: true;
    id: string;
}>;
declare function patchPlatformAd(client: ApiClient, adId: string, body: unknown): Promise<{
    ok: true;
}>;
declare function deletePlatformAd(client: ApiClient, adId: string): Promise<{
    ok: true;
}>;

export { type AdSlotGet, ApiClient, ApiClientError, ApiResponse, type AuthLoginNativePost, type AuthLoginPost, type AuthMeGet, BREWERY_FACADE_PARSER_MAP, type BillingIntentPost, type BillingStatusGet, type BrewSessionsRecentGet, type GetAdSlotOptions, type HealthGet, type IntegrationDevicesGet, type IntegrationGetGet, type ListIntegrationDevicesOptions, PLATFORM_FACADE_PARSER_MAP, paths as PlatformOpenApiPaths, type WorkspaceAiSettingsGet, type WorkspaceAiSettingsPut, type WorkspaceAiUsageGet, type WorkspacesCreatePost, type WorkspacesListGet, attachTiltDevice, createAiUpgradeBillingIntent, createPlatformAd, createWorkspace, createWorkspaceIntegration, deletePlatformAd, detachTiltDevice, exchangeWebviewToken, getAdSlot, getAuthMe, getHealth, getWorkspaceAiSettings, getWorkspaceAiUsage, getWorkspaceBilling, getWorkspaceIntegration, importPlatformRecipe, importPlatformRecipesBulk, listIntegrationDevices, listPlatformAds, listPlatformRecipes, listPlatformWorkspaces, listRecentBrewSessions, listWorkspaces, login, loginNative, logout, patchAuthPreferences, patchPlatformAd, patchWorkspaceAiSettings, previewPlatformBulkRecipeImport, previewPlatformRecipeImport, revealIntegrationToken, revokeIntegration, rotateIntegrationToken, setActiveWorkspace, signup };
