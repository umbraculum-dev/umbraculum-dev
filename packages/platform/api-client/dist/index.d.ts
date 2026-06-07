import { A as ApiResponse, a as ApiClient } from './client-Dia82S7S.js';
export { b as ApiClientCredentials, c as ApiRequestInit, d as AuthStrategy, F as FetchLike, e as FetchResponseLike, f as bearerTokenAuth, g as cookieAuth, h as createApiClient } from './client-Dia82S7S.js';
import { p as paths$1 } from './platform.openapi-DFK6FUu2.js';
export { c as PlatformOpenApiComponents, o as PlatformOpenApiOperations } from './platform.openapi-DFK6FUu2.js';
import { AuthWebviewExchangeResponseSchema, AuthMeResponse, AuthLoginRequest, AuthLoginResponseSchema, AuthLoginNativeResponseSchema, AuthLogoutResponseSchema, AuthPreferencesPatchResponseSchema, AuthActiveWorkspaceResponseSchema, AuthSignupRequest, AuthSignupResponseSchema, WorkspaceCreateRequest, WorkspaceCreateResponseSchema, HealthResponseSchema, WorkspacesListResponseSchema, IntegrationKind, WorkspaceBillingResponseSchema, BillingIntentRequest, BillingIntentResponseSchema, WorkspaceAiSettingsResponseSchema, WorkspaceAiUsageResponseSchema, AdSlotResponse } from '@umbraculum/contracts';
export { AdSlotResponse } from '@umbraculum/contracts';
export { R as RenderJobPhase, a as RenderJobResultGet, b as RenderJobStatusGet, f as fetchRenderJobDownloadUrl, p as pollRenderJobUntilSucceeded, r as resolveArtifactDownloadUrl, c as runAsyncRenderJobExport, s as submitRenderJob, t as toWebArtifactUrl } from './rendering-Dsx1_oqk.js';

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

/** Generated by `npm run openapi:codegen` in @umbraculum/api-client — do not edit. */
type paths = {
    "/recipes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            recipes: {
                                [key: string]: unknown;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        styleKey?: string;
                        notes?: string | null;
                        beerJsonRecipeJson?: unknown;
                        recipeExtJson?: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            recipe: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            recipe: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name?: string;
                        styleKey?: string;
                        notes?: string;
                        beerJsonRecipeJson?: unknown;
                        recipeExtJson?: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            recipe: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/recipes/{id}/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            versions: {
                                [key: string]: unknown;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            recipe: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}/duplicate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            recipe: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/import/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        format: "beerjson" | "beerxml";
                        content: string;
                        styleKey?: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            /** @enum {string} */
                            format: "beerjson" | "beerxml";
                            preview: {
                                [key: string]: unknown;
                            };
                            workspaceId: string;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        format: "beerjson" | "beerxml";
                        content: string;
                        styleKey?: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            recipe: {
                                [key: string]: unknown;
                            };
                            warnings?: {
                                code: string;
                                message: string;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/import/bulk/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        format: "beerjson" | "beerxml";
                        content: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            /** @enum {string} */
                            format: "beerjson" | "beerxml";
                            previewItems: {
                                [key: string]: unknown;
                            }[];
                            workspaceId: string;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/import/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        format: "beerjson" | "beerxml";
                        content: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            created: {
                                [key: string]: unknown;
                            }[];
                            failed: {
                                index: number;
                                name: string;
                                error: string;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}/export/beerjson": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/export/beerjson": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/styles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            styles: {
                                key: string;
                                name: string;
                                source: string;
                                version: number;
                                code: string | null;
                                category: string | null;
                                categoryId: string | null;
                                sortOrder: number;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-profiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        scope?: "system" | "account" | "public";
                        /** @enum {string} */
                        type?: "water" | "dilution";
                        name?: string;
                        ph?: number | string | (null);
                        calcium?: number | string | (null);
                        magnesium?: number | string | (null);
                        sodium?: number | string | (null);
                        sulfate?: number | string | (null);
                        chloride?: number | string | (null);
                        bicarbonate?: number | string | (null);
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            profile: unknown;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-profiles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        scope?: "system" | "account" | "public";
                        /** @enum {string} */
                        type?: "water" | "dilution";
                        name?: string;
                        ph?: number | string | (null);
                        calcium?: number | string | (null);
                        magnesium?: number | string | (null);
                        sodium?: number | string | (null);
                        sulfate?: number | string | (null);
                        chloride?: number | string | (null);
                        bicarbonate?: number | string | (null);
                        /** @enum {string} */
                        verificationStatus?: "verified" | "unverified";
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            profile: unknown;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/water-profiles/{id}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            profile: unknown;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-profiles/{id}/unverify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            profile: unknown;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/equipment-profiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            profiles: {
                                id: string;
                                workspaceId: string;
                                name: string;
                                equipment: {
                                    [key: string]: unknown;
                                };
                                createdAt: string;
                                updatedAt: string;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            profile: {
                                id: string;
                                workspaceId: string;
                                name: string;
                                equipment: {
                                    [key: string]: unknown;
                                };
                                createdAt: string;
                                updatedAt: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/equipment-profiles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            profile: {
                                id: string;
                                workspaceId: string;
                                name: string;
                                equipment: {
                                    [key: string]: unknown;
                                };
                                createdAt: string;
                                updatedAt: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/water-calc/sparge-acidification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/sparge-acidification-manual": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/mash-acidification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/mash-acidification-manual": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/mash-ph-estimate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/mash-acidification-target-mash-ph": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/salt-additions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/mash-overall": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/sparge-overall": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/water-calc/boil-overall": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                            derivation: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}/water-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            settings: {
                                [key: string]: unknown;
                            } | null;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            settings: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}/water-hub-summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}/water-settings/mash/compute-and-save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}/water-settings/sparge/compute-and-save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recipes/{id}/water-settings/boil/compute-and-save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingredients/fermentables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    query?: string;
                    offset?: number;
                    limit?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            items: {
                                [key: string]: unknown;
                            }[];
                            total: number;
                            offset: number;
                            limit: number;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingredients/hops": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    query?: string;
                    offset?: number;
                    limit?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            items: {
                                [key: string]: unknown;
                            }[];
                            total: number;
                            offset: number;
                            limit: number;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingredients/yeasts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    query?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            items: {
                                [key: string]: unknown;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/ingredients/sync-runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            runs: {
                                [key: string]: unknown;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/ingredients/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            result: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brewday-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            settings: {
                                [key: string]: unknown;
                            } | null;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            settings: {
                                [key: string]: unknown;
                            } | null;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/recipes/{recipeId}/brew-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    recipeId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            brewSessions: {
                                id: string;
                                code: string;
                                status: string;
                                createdAt: string;
                                startedAt?: string | null;
                                stoppedAt?: string | null;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    recipeId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            brewSession: {
                                id: string;
                                workspaceId: string;
                                recipeId: string;
                                code: string | null;
                                status: string;
                                createdAt: string;
                                updatedAt: string;
                                startedAt: string | null;
                                pausedAt: string | null;
                                stoppedAt: string | null;
                                scheduledDate: string | null;
                                recipe?: {
                                    id: string;
                                    name: string;
                                    version: number;
                                };
                                steps?: ({
                                    id: string;
                                    brewSessionId: string;
                                    name: string;
                                    status: string;
                                    sortOrder: number;
                                    sectionId: string;
                                    sectionName: string | null;
                                    createdAt: string;
                                    updatedAt: string;
                                    isDisabled: boolean;
                                    customTimerEnabled: boolean;
                                    note: string | null;
                                    minutesPlanned: number | null;
                                    offsetMinutesFromEnd: number | null;
                                    relativeToStepId: string | null;
                                    timerAccumulatedSeconds: number;
                                    timerLastStartedAt: string | null;
                                    timerPausedAt: string | null;
                                    timerStartedAt: string | null;
                                    timerState: string;
                                    timerStoppedAt: string | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                                logs?: ({
                                    id: string;
                                    brewSessionId: string;
                                    kind: string;
                                    message: string;
                                    createdAt: string;
                                    stepId: string | null;
                                    payloadJson?: {
                                        [key: string]: unknown;
                                    } | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                            } & {
                                [key: string]: unknown;
                            };
                            steps: ({
                                id: string;
                                brewSessionId: string;
                                name: string;
                                status: string;
                                sortOrder: number;
                                sectionId: string;
                                sectionName: string | null;
                                createdAt: string;
                                updatedAt: string;
                                isDisabled: boolean;
                                customTimerEnabled: boolean;
                                note: string | null;
                                minutesPlanned: number | null;
                                offsetMinutesFromEnd: number | null;
                                relativeToStepId: string | null;
                                timerAccumulatedSeconds: number;
                                timerLastStartedAt: string | null;
                                timerPausedAt: string | null;
                                timerStartedAt: string | null;
                                timerState: string;
                                timerStoppedAt: string | null;
                            } & {
                                [key: string]: unknown;
                            })[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            brewSession: {
                                id: string;
                                workspaceId: string;
                                recipeId: string;
                                code: string | null;
                                status: string;
                                createdAt: string;
                                updatedAt: string;
                                startedAt: string | null;
                                pausedAt: string | null;
                                stoppedAt: string | null;
                                scheduledDate: string | null;
                                recipe?: {
                                    id: string;
                                    name: string;
                                    version: number;
                                };
                                steps?: ({
                                    id: string;
                                    brewSessionId: string;
                                    name: string;
                                    status: string;
                                    sortOrder: number;
                                    sectionId: string;
                                    sectionName: string | null;
                                    createdAt: string;
                                    updatedAt: string;
                                    isDisabled: boolean;
                                    customTimerEnabled: boolean;
                                    note: string | null;
                                    minutesPlanned: number | null;
                                    offsetMinutesFromEnd: number | null;
                                    relativeToStepId: string | null;
                                    timerAccumulatedSeconds: number;
                                    timerLastStartedAt: string | null;
                                    timerPausedAt: string | null;
                                    timerStartedAt: string | null;
                                    timerState: string;
                                    timerStoppedAt: string | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                                logs?: ({
                                    id: string;
                                    brewSessionId: string;
                                    kind: string;
                                    message: string;
                                    createdAt: string;
                                    stepId: string | null;
                                    payloadJson?: {
                                        [key: string]: unknown;
                                    } | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        scheduledDate?: string | null;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            brewSession: {
                                id: string;
                                workspaceId: string;
                                recipeId: string;
                                code: string | null;
                                status: string;
                                createdAt: string;
                                updatedAt: string;
                                startedAt: string | null;
                                pausedAt: string | null;
                                stoppedAt: string | null;
                                scheduledDate: string | null;
                                recipe?: {
                                    id: string;
                                    name: string;
                                    version: number;
                                };
                                steps?: ({
                                    id: string;
                                    brewSessionId: string;
                                    name: string;
                                    status: string;
                                    sortOrder: number;
                                    sectionId: string;
                                    sectionName: string | null;
                                    createdAt: string;
                                    updatedAt: string;
                                    isDisabled: boolean;
                                    customTimerEnabled: boolean;
                                    note: string | null;
                                    minutesPlanned: number | null;
                                    offsetMinutesFromEnd: number | null;
                                    relativeToStepId: string | null;
                                    timerAccumulatedSeconds: number;
                                    timerLastStartedAt: string | null;
                                    timerPausedAt: string | null;
                                    timerStartedAt: string | null;
                                    timerState: string;
                                    timerStoppedAt: string | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                                logs?: ({
                                    id: string;
                                    brewSessionId: string;
                                    kind: string;
                                    message: string;
                                    createdAt: string;
                                    stepId: string | null;
                                    payloadJson?: {
                                        [key: string]: unknown;
                                    } | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/integrations/attachments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            attachments: {
                                id: string;
                                attachedAt: string;
                                device: {
                                    [key: string]: unknown;
                                };
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/integrations/attach": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        kind: "tilt" | "ispindel" | "rapt";
                        deviceId: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            attachment: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/integrations/detach": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        deviceId: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            detachedCount: number;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/integrations/readings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    kind: "tilt" | "ispindel" | "rapt";
                    limit?: number;
                };
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            readings: {
                                [key: string]: unknown;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/steps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        steps: {
                            [key: string]: unknown;
                        }[];
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            steps: ({
                                id: string;
                                brewSessionId: string;
                                name: string;
                                status: string;
                                sortOrder: number;
                                sectionId: string;
                                sectionName: string | null;
                                createdAt: string;
                                updatedAt: string;
                                isDisabled: boolean;
                                customTimerEnabled: boolean;
                                note: string | null;
                                minutesPlanned: number | null;
                                offsetMinutesFromEnd: number | null;
                                relativeToStepId: string | null;
                                timerAccumulatedSeconds: number;
                                timerLastStartedAt: string | null;
                                timerPausedAt: string | null;
                                timerStartedAt: string | null;
                                timerState: string;
                                timerStoppedAt: string | null;
                            } & {
                                [key: string]: unknown;
                            })[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/steps/{stepId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                    stepId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        customTimerEnabled: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            step: {
                                id: string;
                                brewSessionId: string;
                                name: string;
                                status: string;
                                sortOrder: number;
                                sectionId: string;
                                sectionName: string | null;
                                createdAt: string;
                                updatedAt: string;
                                isDisabled: boolean;
                                customTimerEnabled: boolean;
                                note: string | null;
                                minutesPlanned: number | null;
                                offsetMinutesFromEnd: number | null;
                                relativeToStepId: string | null;
                                timerAccumulatedSeconds: number;
                                timerLastStartedAt: string | null;
                                timerPausedAt: string | null;
                                timerStartedAt: string | null;
                                timerState: string;
                                timerStoppedAt: string | null;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            brewSession: {
                                id: string;
                                workspaceId: string;
                                recipeId: string;
                                code: string | null;
                                status: string;
                                createdAt: string;
                                updatedAt: string;
                                startedAt: string | null;
                                pausedAt: string | null;
                                stoppedAt: string | null;
                                scheduledDate: string | null;
                                recipe?: {
                                    id: string;
                                    name: string;
                                    version: number;
                                };
                                steps?: ({
                                    id: string;
                                    brewSessionId: string;
                                    name: string;
                                    status: string;
                                    sortOrder: number;
                                    sectionId: string;
                                    sectionName: string | null;
                                    createdAt: string;
                                    updatedAt: string;
                                    isDisabled: boolean;
                                    customTimerEnabled: boolean;
                                    note: string | null;
                                    minutesPlanned: number | null;
                                    offsetMinutesFromEnd: number | null;
                                    relativeToStepId: string | null;
                                    timerAccumulatedSeconds: number;
                                    timerLastStartedAt: string | null;
                                    timerPausedAt: string | null;
                                    timerStartedAt: string | null;
                                    timerState: string;
                                    timerStoppedAt: string | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                                logs?: ({
                                    id: string;
                                    brewSessionId: string;
                                    kind: string;
                                    message: string;
                                    createdAt: string;
                                    stepId: string | null;
                                    payloadJson?: {
                                        [key: string]: unknown;
                                    } | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/pause": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            brewSession: {
                                id: string;
                                workspaceId: string;
                                recipeId: string;
                                code: string | null;
                                status: string;
                                createdAt: string;
                                updatedAt: string;
                                startedAt: string | null;
                                pausedAt: string | null;
                                stoppedAt: string | null;
                                scheduledDate: string | null;
                                recipe?: {
                                    id: string;
                                    name: string;
                                    version: number;
                                };
                                steps?: ({
                                    id: string;
                                    brewSessionId: string;
                                    name: string;
                                    status: string;
                                    sortOrder: number;
                                    sectionId: string;
                                    sectionName: string | null;
                                    createdAt: string;
                                    updatedAt: string;
                                    isDisabled: boolean;
                                    customTimerEnabled: boolean;
                                    note: string | null;
                                    minutesPlanned: number | null;
                                    offsetMinutesFromEnd: number | null;
                                    relativeToStepId: string | null;
                                    timerAccumulatedSeconds: number;
                                    timerLastStartedAt: string | null;
                                    timerPausedAt: string | null;
                                    timerStartedAt: string | null;
                                    timerState: string;
                                    timerStoppedAt: string | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                                logs?: ({
                                    id: string;
                                    brewSessionId: string;
                                    kind: string;
                                    message: string;
                                    createdAt: string;
                                    stepId: string | null;
                                    payloadJson?: {
                                        [key: string]: unknown;
                                    } | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/stop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        reason?: "auto" | "manual";
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            brewSession: {
                                id: string;
                                workspaceId: string;
                                recipeId: string;
                                code: string | null;
                                status: string;
                                createdAt: string;
                                updatedAt: string;
                                startedAt: string | null;
                                pausedAt: string | null;
                                stoppedAt: string | null;
                                scheduledDate: string | null;
                                recipe?: {
                                    id: string;
                                    name: string;
                                    version: number;
                                };
                                steps?: ({
                                    id: string;
                                    brewSessionId: string;
                                    name: string;
                                    status: string;
                                    sortOrder: number;
                                    sectionId: string;
                                    sectionName: string | null;
                                    createdAt: string;
                                    updatedAt: string;
                                    isDisabled: boolean;
                                    customTimerEnabled: boolean;
                                    note: string | null;
                                    minutesPlanned: number | null;
                                    offsetMinutesFromEnd: number | null;
                                    relativeToStepId: string | null;
                                    timerAccumulatedSeconds: number;
                                    timerLastStartedAt: string | null;
                                    timerPausedAt: string | null;
                                    timerStartedAt: string | null;
                                    timerState: string;
                                    timerStoppedAt: string | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                                logs?: ({
                                    id: string;
                                    brewSessionId: string;
                                    kind: string;
                                    message: string;
                                    createdAt: string;
                                    stepId: string | null;
                                    payloadJson?: {
                                        [key: string]: unknown;
                                    } | null;
                                } & {
                                    [key: string]: unknown;
                                })[];
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/steps/{stepId}/log": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                    stepId: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        status: "pending" | "in_progress" | "done" | "skipped" | "not_applicable";
                        note?: string | null;
                        name?: string;
                        isDisabled?: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            step: {
                                id: string;
                                brewSessionId: string;
                                name: string;
                                status: string;
                                sortOrder: number;
                                sectionId: string;
                                sectionName: string | null;
                                createdAt: string;
                                updatedAt: string;
                                isDisabled: boolean;
                                customTimerEnabled: boolean;
                                note: string | null;
                                minutesPlanned: number | null;
                                offsetMinutesFromEnd: number | null;
                                relativeToStepId: string | null;
                                timerAccumulatedSeconds: number;
                                timerLastStartedAt: string | null;
                                timerPausedAt: string | null;
                                timerStartedAt: string | null;
                                timerState: string;
                                timerStoppedAt: string | null;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/steps/{stepId}/timer/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                    stepId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            step: {
                                id: string;
                                brewSessionId: string;
                                name: string;
                                status: string;
                                sortOrder: number;
                                sectionId: string;
                                sectionName: string | null;
                                createdAt: string;
                                updatedAt: string;
                                isDisabled: boolean;
                                customTimerEnabled: boolean;
                                note: string | null;
                                minutesPlanned: number | null;
                                offsetMinutesFromEnd: number | null;
                                relativeToStepId: string | null;
                                timerAccumulatedSeconds: number;
                                timerLastStartedAt: string | null;
                                timerPausedAt: string | null;
                                timerStartedAt: string | null;
                                timerState: string;
                                timerStoppedAt: string | null;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/steps/{stepId}/timer/pause": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                    stepId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            step: {
                                id: string;
                                brewSessionId: string;
                                name: string;
                                status: string;
                                sortOrder: number;
                                sectionId: string;
                                sectionName: string | null;
                                createdAt: string;
                                updatedAt: string;
                                isDisabled: boolean;
                                customTimerEnabled: boolean;
                                note: string | null;
                                minutesPlanned: number | null;
                                offsetMinutesFromEnd: number | null;
                                relativeToStepId: string | null;
                                timerAccumulatedSeconds: number;
                                timerLastStartedAt: string | null;
                                timerPausedAt: string | null;
                                timerStartedAt: string | null;
                                timerState: string;
                                timerStoppedAt: string | null;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brew-sessions/{brewSessionId}/steps/{stepId}/timer/stop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    brewSessionId: string;
                    stepId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            step: {
                                id: string;
                                brewSessionId: string;
                                name: string;
                                status: string;
                                sortOrder: number;
                                sectionId: string;
                                sectionName: string | null;
                                createdAt: string;
                                updatedAt: string;
                                isDisabled: boolean;
                                customTimerEnabled: boolean;
                                note: string | null;
                                minutesPlanned: number | null;
                                offsetMinutesFromEnd: number | null;
                                relativeToStepId: string | null;
                                timerAccumulatedSeconds: number;
                                timerLastStartedAt: string | null;
                                timerPausedAt: string | null;
                                timerStartedAt: string | null;
                                timerState: string;
                                timerStoppedAt: string | null;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    category?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            items: {
                                id: string;
                                workspaceId: string;
                                category: string;
                                ingredientId: string | null;
                                name: string;
                                quantity: number;
                                unit: string;
                                metadataJson: unknown;
                                createdAt: string;
                                updatedAt: string;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            item: {
                                id: string;
                                workspaceId: string;
                                category: string;
                                ingredientId: string | null;
                                name: string;
                                quantity: number;
                                unit: string;
                                metadataJson: unknown;
                                createdAt: string;
                                updatedAt: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/inventory/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: true;
                            item: {
                                id: string;
                                workspaceId: string;
                                category: string;
                                ingredientId: string | null;
                                name: string;
                                quantity: number;
                                unit: string;
                                metadataJson: unknown;
                                createdAt: string;
                                updatedAt: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            ok: false;
                            error: {
                                code: string;
                                message: string;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
};
type components = {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
type operations = Record<string, never>;

type AuthLoginResponse = ReturnType<typeof AuthLoginResponseSchema.parse>;
type AuthLoginNativeResponse = ReturnType<typeof AuthLoginNativeResponseSchema.parse>;
type AuthMePath = "/auth/me";
type AuthMeGet = paths$1[AuthMePath]["get"];
type AuthLoginPath = "/auth/login";
type AuthLoginPost = paths$1[AuthLoginPath]["post"];
type AuthLoginNativePath = "/auth/login/native";
type AuthLoginNativePost = paths$1[AuthLoginNativePath]["post"];

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
type WorkspacesListGet = paths$1[WorkspacesListPath]["get"];
type WorkspacesCreatePost = paths$1[WorkspacesListPath]["post"];
type HealthPath = "/health";
type HealthGet = paths$1[HealthPath]["get"];

declare function listWorkspaces(client: ApiClient): Promise<WorkspacesListResponse>;
declare function createWorkspace(client: ApiClient, body: WorkspaceCreateRequest): Promise<WorkspaceCreateResponse>;
declare function getHealth(client: ApiClient): Promise<HealthResponse>;

type IntegrationGetPath = "/workspaces/{workspaceId}/integrations/{kind}";
type IntegrationGetGet = paths$1[IntegrationGetPath]["get"];
type IntegrationDevicesPath = "/workspaces/{workspaceId}/integrations/{kind}/devices";
type IntegrationDevicesGet = paths$1[IntegrationDevicesPath]["get"];
type BrewSessionsRecentPath = "/workspaces/{workspaceId}/brew-sessions/recent";
type BrewSessionsRecentGet = paths$1[BrewSessionsRecentPath]["get"];

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
type BillingStatusGet = paths$1[BillingStatusPath]["get"];

declare function getWorkspaceBilling(client: ApiClient, workspaceId: string): Promise<WorkspaceBillingResponse>;

type WorkspaceAiSettingsResponse = ReturnType<typeof WorkspaceAiSettingsResponseSchema.parse>;
type WorkspaceAiUsageResponse = ReturnType<typeof WorkspaceAiUsageResponseSchema.parse>;
type BillingIntentResponse = ReturnType<typeof BillingIntentResponseSchema.parse>;
type WorkspaceAiSettingsPath = "/workspaces/{workspaceId}/ai/settings";
type WorkspaceAiSettingsGet = paths$1[WorkspaceAiSettingsPath]["get"];
type WorkspaceAiSettingsPut = paths$1[WorkspaceAiSettingsPath]["put"];
type WorkspaceAiUsagePath = "/workspaces/{workspaceId}/ai/usage";
type WorkspaceAiUsageGet = paths$1[WorkspaceAiUsagePath]["get"];
type BillingIntentPath = "/workspaces/{workspaceId}/billing/intent";
type BillingIntentPost = paths$1[BillingIntentPath]["post"];

declare function getWorkspaceAiSettings(client: ApiClient, workspaceId: string): Promise<WorkspaceAiSettingsResponse>;
declare function patchWorkspaceAiSettings(client: ApiClient, workspaceId: string, body: unknown): Promise<WorkspaceAiSettingsResponse>;
declare function getWorkspaceAiUsage(client: ApiClient, workspaceId: string): Promise<WorkspaceAiUsageResponse>;
declare function createAiUpgradeBillingIntent(client: ApiClient, workspaceId: string, body: BillingIntentRequest): Promise<BillingIntentResponse>;

type AdSlotPath = "/ads/slot/{placement}";
type AdSlotGet = paths$1[AdSlotPath]["get"];

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

export { type AdSlotGet, ApiClient, ApiClientError, ApiResponse, type AuthLoginNativePost, type AuthLoginPost, type AuthMeGet, BREWERY_FACADE_PARSER_MAP, type BillingIntentPost, type BillingStatusGet, type BrewSessionsRecentGet, type components as BreweryOpenApiComponents, type operations as BreweryOpenApiOperations, type paths as BreweryOpenApiPaths, type GetAdSlotOptions, type HealthGet, type IntegrationDevicesGet, type IntegrationGetGet, type ListIntegrationDevicesOptions, PLATFORM_FACADE_PARSER_MAP, paths$1 as PlatformOpenApiPaths, type WorkspaceAiSettingsGet, type WorkspaceAiSettingsPut, type WorkspaceAiUsageGet, type WorkspacesCreatePost, type WorkspacesListGet, attachTiltDevice, createAiUpgradeBillingIntent, createPlatformAd, createWorkspace, createWorkspaceIntegration, deletePlatformAd, detachTiltDevice, exchangeWebviewToken, getAdSlot, getAuthMe, getHealth, getWorkspaceAiSettings, getWorkspaceAiUsage, getWorkspaceBilling, getWorkspaceIntegration, importPlatformRecipe, importPlatformRecipesBulk, listIntegrationDevices, listPlatformAds, listPlatformRecipes, listPlatformWorkspaces, listRecentBrewSessions, listWorkspaces, login, loginNative, logout, patchAuthPreferences, patchPlatformAd, patchWorkspaceAiSettings, previewPlatformBulkRecipeImport, previewPlatformRecipeImport, revealIntegrationToken, revokeIntegration, rotateIntegrationToken, setActiveWorkspace, signup };
