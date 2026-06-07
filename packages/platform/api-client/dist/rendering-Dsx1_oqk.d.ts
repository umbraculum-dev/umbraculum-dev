import { a as ApiClient } from './client-Dia82S7S.js';
import { p as paths } from './platform.openapi-DFK6FUu2.js';

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

export { type RenderJobPhase as R, type RenderJobResultGet as a, type RenderJobStatusGet as b, runAsyncRenderJobExport as c, fetchRenderJobDownloadUrl as f, pollRenderJobUntilSucceeded as p, resolveArtifactDownloadUrl as r, submitRenderJob as s, toWebArtifactUrl as t };
