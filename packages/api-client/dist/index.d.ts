type ApiClientCredentials = "omit" | "include" | "same-origin";
interface FetchResponseLike {
    ok: boolean;
    status: number;
    text(): Promise<string>;
}
interface ApiRequestInit {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    credentials?: ApiClientCredentials;
}
type FetchLike = (url: string, init: ApiRequestInit) => Promise<FetchResponseLike>;

/**
 * Auth strategies for API client.
 * - Cookie: browser sends session cookie automatically (credentials: same-origin).
 * - Bearer: native apps send Authorization: Bearer <token>.
 */

interface AuthStrategy {
    getHeaders?: () => Record<string, string>;
    credentials?: ApiClientCredentials;
}
/**
 * Cookie-based auth for web. Browser sends sid cookie automatically.
 */
declare function cookieAuth(): AuthStrategy;
/**
 * Bearer token auth for native apps.
 * @param getToken - Returns the current token (e.g. from secure storage).
 */
declare function bearerTokenAuth(getToken: () => string | null): AuthStrategy;

/**
 * Typed API client with pluggable auth.
 */

interface ApiResponse<T = unknown> {
    ok: boolean;
    status: number;
    data: T;
}
interface ApiClient {
    get(path: string): Promise<ApiResponse>;
    post(path: string, body?: unknown): Promise<ApiResponse>;
    put(path: string, body?: unknown): Promise<ApiResponse>;
    patch(path: string, body?: unknown): Promise<ApiResponse>;
    delete(path: string): Promise<ApiResponse>;
}
/**
 * Create an API client with the given base URL and auth strategy.
 */
declare function createApiClient(baseUrl: string, auth: AuthStrategy, options?: {
    fetch?: FetchLike;
}): ApiClient;

type RenderJobPhase = "idle" | "submitting" | "polling" | "ready" | "error";
/** Prefix relative artifact paths for Next.js `/api` proxy (web). */
declare function toWebArtifactUrl(signedUrl: string, apiBaseUrl?: string): string;
/** Resolve download URL for native (absolute) or web (proxied). */
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
/** Submit async render job, poll to success, return download URL. */
declare function runAsyncRenderJobExport(client: ApiClient, postUrl: string, options?: {
    body?: Record<string, unknown>;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;

export { type ApiClient, type ApiClientCredentials, type ApiRequestInit, type ApiResponse, type AuthStrategy, type FetchLike, type FetchResponseLike, type RenderJobPhase, bearerTokenAuth, cookieAuth, createApiClient, fetchRenderJobDownloadUrl, pollRenderJobUntilSucceeded, resolveArtifactDownloadUrl, runAsyncRenderJobExport, submitRenderJob, toWebArtifactUrl };
