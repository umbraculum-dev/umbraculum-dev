export { cookieAuth, bearerTokenAuth, type AuthStrategy } from "./auth.js";
export { createApiClient, type ApiClient, type ApiResponse } from "./client.js";
export { ApiClientError } from "./errors.js";
export { PLATFORM_FACADE_PARSER_MAP } from "./facadeParserMap.js";
export type {
  PlatformOpenApiComponents,
  PlatformOpenApiOperations,
  PlatformOpenApiPaths,
} from "./openapiTypes.js";
export type { ApiClientCredentials, ApiRequestInit, FetchLike, FetchResponseLike } from "./fetchTypes.js";
export * from "./platform/auth.js";
export * from "./platform/workspaces.js";
export * from "./platform/modules.js";
export * from "./platform/ai.js";
export * from "./platform/ads.js";
export * from "./platform/platformAdmin.js";
export {
  fetchRenderJobDownloadUrl,
  pollRenderJobUntilSucceeded,
  resolveArtifactDownloadUrl,
  runAsyncRenderJobExport,
  submitRenderJob,
  toWebArtifactUrl,
  type RenderJobPhase,
  type RenderJobResultGet,
  type RenderJobStatusGet,
} from "./platform/rendering.js";
