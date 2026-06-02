import { A as ApiResponse, a as ApiClient } from './client-Dia82S7S.js';
export { b as ApiClientCredentials, c as ApiRequestInit, d as AuthStrategy, F as FetchLike, e as FetchResponseLike, f as bearerTokenAuth, g as cookieAuth, h as createApiClient } from './client-Dia82S7S.js';
import { p as paths } from './platform.openapi-DFK6FUu2.js';
export { c as PlatformOpenApiComponents, o as PlatformOpenApiOperations } from './platform.openapi-DFK6FUu2.js';
export { c as BreweryOpenApiComponents, o as BreweryOpenApiOperations, p as BreweryOpenApiPaths } from './brewery.openapi-CXYEPddO.js';
import { AuthMeResponse, AuthLoginRequest, AuthLoginResponseSchema, AuthLoginNativeResponseSchema, WorkspaceCreateRequest, WorkspaceCreateResponseSchema, HealthResponseSchema, WorkspacesListResponseSchema, WorkspaceBillingResponseSchema, IntegrationKind, IntegrationDevicesListResponseSchema } from '@umbraculum/contracts';

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
    readonly "/workspaces": "WorkspacesListResponseSchema";
    readonly "/health": "HealthResponseSchema";
    readonly "/workspaces/{workspaceId}/billing": "WorkspaceBillingResponseSchema";
    readonly "/workspaces/{workspaceId}/integrations/{kind}/devices": "IntegrationDevicesListResponseSchema";
    readonly "/rendering/jobs/{jobId}": "RenderJobStatusResponseSchema";
    readonly "/rendering/jobs/{jobId}/result": "RenderJobResultResponseSchema";
};
declare const BREWERY_FACADE_PARSER_MAP: {
    readonly "/recipes": "parseRecipesListResponse";
    readonly "/recipes/{id}": "RecipeResponseSchema";
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

type WorkspaceBillingResponse = ReturnType<typeof WorkspaceBillingResponseSchema.parse>;
type IntegrationDevicesListResponse = ReturnType<typeof IntegrationDevicesListResponseSchema.parse>;
type BillingStatusPath = "/workspaces/{workspaceId}/billing";
type BillingStatusGet = paths[BillingStatusPath]["get"];
type IntegrationDevicesPath = "/workspaces/{workspaceId}/integrations/{kind}/devices";
type IntegrationDevicesGet = paths[IntegrationDevicesPath]["get"];

declare function getWorkspaceBilling(client: ApiClient, workspaceId: string): Promise<WorkspaceBillingResponse>;
declare function listIntegrationDevices(client: ApiClient, workspaceId: string, kind: IntegrationKind): Promise<IntegrationDevicesListResponse>;

type RenderJobStatusPath = "/rendering/jobs/{jobId}";
type RenderJobResultPath = "/rendering/jobs/{jobId}/result";
type RenderJobPhase = "idle" | "submitting" | "polling" | "ready" | "error";

/** Prefix relative artifact paths for Next.js `/api` proxy (web). */
declare function toWebArtifactUrl(signedUrl: string, apiBaseUrl?: string): string;
declare function resolveArtifactDownloadUrl(signedUrl: string, options?: {
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): string;
declare function submitRenderJob(client: ApiClient, postUrl: string, body?: Record<string, unknown>): Promise<{
    jobId: string;
}>;
declare function pollRenderJobUntilSucceeded(client: ApiClient, jobId: string): Promise<void>;
declare function fetchRenderJobDownloadUrl(client: ApiClient, jobId: string, options?: {
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;
declare function runAsyncRenderJobExport(client: ApiClient, postUrl: string, options?: {
    body?: Record<string, unknown>;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;
/** Compile-time anchor tying status polling to OpenAPI path shape. */
type RenderJobStatusGet = paths[RenderJobStatusPath]["get"];
type RenderJobResultGet = paths[RenderJobResultPath]["get"];

export { ApiClient, ApiClientError, ApiResponse, type AuthLoginNativePost, type AuthLoginPost, type AuthMeGet, BREWERY_FACADE_PARSER_MAP, type BillingStatusGet, type HealthGet, type IntegrationDevicesGet, PLATFORM_FACADE_PARSER_MAP, paths as PlatformOpenApiPaths, type RenderJobPhase, type RenderJobResultGet, type RenderJobStatusGet, type WorkspacesCreatePost, type WorkspacesListGet, createWorkspace, fetchRenderJobDownloadUrl, getAuthMe, getHealth, getWorkspaceBilling, listIntegrationDevices, listWorkspaces, login, loginNative, pollRenderJobUntilSucceeded, resolveArtifactDownloadUrl, runAsyncRenderJobExport, submitRenderJob, toWebArtifactUrl };
