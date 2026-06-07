import {
  fetchRenderJobDownloadUrl,
  pollRenderJobUntilSucceeded,
  resolveArtifactDownloadUrl,
  runAsyncRenderJobExport,
  submitRenderJob,
  toWebArtifactUrl
} from "./chunk-PU7ET74O.js";
import {
  ApiClientError,
  deleteParsed,
  getParsed,
  patchParsed,
  postParsed,
  putParsed,
  toClientPath
} from "./chunk-EHQ6NO7O.js";

// src/auth.ts
function cookieAuth() {
  return {
    credentials: "same-origin"
  };
}
function bearerTokenAuth(getToken) {
  return {
    getHeaders: () => {
      const token = getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
  };
}

// src/client.ts
function joinPath(base, path) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return p ? `${b}/${p}` : b;
}
function createApiClient(baseUrl, auth, options) {
  const headers = () => ({
    "Content-Type": "application/json",
    ...auth.getHeaders?.()
  });
  const resolvedFetch = (() => {
    if (options?.fetch) return options.fetch;
    const f = globalThis.fetch;
    if (typeof f !== "function") {
      throw new Error("fetch is not available. Provide options.fetch when creating the API client.");
    }
    return f;
  })();
  async function request(path, init) {
    const url = joinPath(baseUrl, path);
    const creds = init.credentials ?? auth.credentials;
    const requestInit = {
      ...init,
      headers: {
        ...headers(),
        ...init.headers ?? {}
      },
      ...creds ? { credentials: creds } : {}
    };
    const res = await resolvedFetch(url, requestInit);
    const text = await res.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch {
    }
    return { ok: res.ok, status: res.status, data };
  }
  return {
    get(path) {
      return request(path, { method: "GET" });
    },
    post(path, body) {
      return request(path, {
        method: "POST",
        ...body != null ? { body: JSON.stringify(body) } : {}
      });
    },
    put(path, body) {
      return request(path, {
        method: "PUT",
        ...body != null ? { body: JSON.stringify(body) } : {}
      });
    },
    patch(path, body) {
      return request(path, {
        method: "PATCH",
        ...body != null ? { body: JSON.stringify(body) } : {}
      });
    },
    delete(path) {
      return request(path, { method: "DELETE" });
    }
  };
}

// src/facadeParserMap.ts
var PLATFORM_FACADE_PARSER_MAP = {
  "/auth/me": "parseAuthMeResponse / AuthMeResponseSchema",
  "/auth/login": "AuthLoginResponseSchema",
  "/auth/login/native": "AuthLoginNativeResponseSchema",
  "/auth/logout": "AuthLogoutResponseSchema",
  "/auth/signup": "AuthSignupResponseSchema",
  "/auth/preferences": "AuthPreferencesPatchResponseSchema",
  "/auth/webview-exchange": "AuthWebviewExchangeResponseSchema",
  "/auth/active-workspace": "AuthActiveWorkspaceResponseSchema",
  "/workspaces": "WorkspacesListResponseSchema",
  "/health": "HealthResponseSchema",
  "/workspaces/{workspaceId}/billing": "WorkspaceBillingResponseSchema",
  "/workspaces/{workspaceId}/billing/intent": "BillingIntentResponseSchema",
  "/workspaces/{workspaceId}/ai/settings": "WorkspaceAiSettingsResponseSchema",
  "/workspaces/{workspaceId}/ai/usage": "WorkspaceAiUsageResponseSchema",
  "/ads/slot/{placement}": "AdSlotResponseSchema",
  "/platform/workspaces": "PlatformWorkspacesListResponseSchema",
  "/platform/recipes/list": "PlatformRecipesListResponseSchema",
  "/platform/recipes/import/preview": "PlatformRecipeImportPreviewResponseSchema",
  "/platform/recipes/import": "PlatformRecipeImportResponseSchema",
  "/platform/recipes/import/bulk/preview": "PlatformRecipeBulkImportPreviewResponseSchema",
  "/platform/recipes/import/bulk": "PlatformRecipeBulkImportResponseSchema",
  "/platform/ads": "PlatformAdsListResponseSchema / PlatformAdCreateResponseSchema",
  "/platform/ads/{id}": "PlatformAdOkResponseSchema (PATCH/DELETE)",
  "/workspaces/{workspaceId}/integrations/{kind}": "IntegrationGetResponseSchema / IntegrationCreateResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/reveal": "IntegrationRevealResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/rotate-token": "IntegrationCreateResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/revoke": "IntegrationOkResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/devices": "IntegrationDevicesListResponseSchema",
  "/workspaces/{workspaceId}/integrations/tilt/devices/{deviceId}/attach": "IntegrationDeviceAttachResponseSchema",
  "/workspaces/{workspaceId}/integrations/tilt/devices/{deviceId}/detach": "IntegrationDeviceDetachResponseSchema",
  "/workspaces/{workspaceId}/brew-sessions/recent": "BrewSessionsRecentResponseSchema",
  "/rendering/jobs/{jobId}": "RenderJobStatusResponseSchema",
  "/rendering/jobs/{jobId}/result": "RenderJobResultResponseSchema"
};

// src/platform/auth.ts
import {
  AuthActiveWorkspaceRequestSchema,
  AuthActiveWorkspaceResponseSchema,
  AuthLoginNativeResponseSchema,
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
  AuthLogoutResponseSchema,
  AuthMeResponseSchema,
  AuthPreferencesPatchRequestSchema,
  AuthPreferencesPatchResponseSchema,
  AuthSignupRequestSchema,
  AuthSignupResponseSchema,
  AuthWebviewExchangeRequestSchema,
  AuthWebviewExchangeResponseSchema
} from "@umbraculum/contracts";
async function getAuthMe(client) {
  return getParsed(client, toClientPath("/auth/me"), (data) => AuthMeResponseSchema.parse(data));
}
async function login(client, body) {
  const parsedBody = AuthLoginRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/auth/login"),
    parsedBody,
    (data) => AuthLoginResponseSchema.parse(data)
  );
}
async function loginNative(client, body) {
  const parsedBody = AuthLoginRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/auth/login/native"),
    parsedBody,
    (data) => AuthLoginNativeResponseSchema.parse(data)
  );
}
async function logout(client) {
  return postParsed(
    client,
    toClientPath("/auth/logout"),
    {},
    (data) => AuthLogoutResponseSchema.parse(data)
  );
}
async function setActiveWorkspace(client, body) {
  const parsedBody = AuthActiveWorkspaceRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/auth/active-workspace"),
    parsedBody,
    (data) => AuthActiveWorkspaceResponseSchema.parse(data)
  );
}
async function signup(client, body) {
  const parsedBody = AuthSignupRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/auth/signup"),
    parsedBody,
    (data) => AuthSignupResponseSchema.parse(data)
  );
}
async function patchAuthPreferences(client, body) {
  const parsedBody = AuthPreferencesPatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath("/auth/preferences"),
    parsedBody,
    (data) => AuthPreferencesPatchResponseSchema.parse(data)
  );
}
async function exchangeWebviewToken(client, body) {
  const parsedBody = AuthWebviewExchangeRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/auth/webview-exchange"),
    parsedBody,
    (data) => AuthWebviewExchangeResponseSchema.parse(data)
  );
}

// src/platform/workspaces.ts
import {
  HealthResponseSchema,
  WorkspacesListResponseSchema,
  WorkspaceCreateRequestSchema,
  WorkspaceCreateResponseSchema
} from "@umbraculum/contracts";
async function listWorkspaces(client) {
  return getParsed(
    client,
    toClientPath("/workspaces"),
    (data) => WorkspacesListResponseSchema.parse(data)
  );
}
async function createWorkspace(client, body) {
  const parsedBody = WorkspaceCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/workspaces"),
    parsedBody,
    (data) => WorkspaceCreateResponseSchema.parse(data)
  );
}
async function getHealth(client) {
  return getParsed(client, toClientPath("/health"), (data) => HealthResponseSchema.parse(data));
}

// src/platform/modules.ts
import { WorkspaceBillingResponseSchema } from "@umbraculum/contracts";

// src/platform/integrations.ts
import {
  BrewSessionsRecentQuerySchema,
  BrewSessionsRecentResponseSchema,
  IntegrationCreateResponseSchema,
  IntegrationDeviceAttachRequestSchema,
  IntegrationDeviceAttachResponseSchema,
  IntegrationDeviceDetachResponseSchema,
  IntegrationDevicesListResponseSchema,
  IntegrationGetResponseSchema,
  IntegrationKindSchema,
  IntegrationOkResponseSchema,
  IntegrationRevealResponseSchema
} from "@umbraculum/contracts";
function workspaceIntegrationPath(workspaceId, kind) {
  const parsedKind = IntegrationKindSchema.parse(kind);
  return toClientPath(
    `/workspaces/${encodeURIComponent(workspaceId)}/integrations/${encodeURIComponent(parsedKind)}`
  );
}
async function getWorkspaceIntegration(client, workspaceId, kind) {
  return getParsed(
    client,
    workspaceIntegrationPath(workspaceId, kind),
    (data) => IntegrationGetResponseSchema.parse(data)
  );
}
async function createWorkspaceIntegration(client, workspaceId, kind) {
  return postParsed(
    client,
    workspaceIntegrationPath(workspaceId, kind),
    {},
    (data) => IntegrationCreateResponseSchema.parse(data)
  );
}
async function revealIntegrationToken(client, workspaceId, kind) {
  return getParsed(
    client,
    `${workspaceIntegrationPath(workspaceId, kind)}/reveal`,
    (data) => IntegrationRevealResponseSchema.parse(data)
  );
}
async function rotateIntegrationToken(client, workspaceId, kind) {
  return postParsed(
    client,
    `${workspaceIntegrationPath(workspaceId, kind)}/rotate-token`,
    {},
    (data) => IntegrationCreateResponseSchema.parse(data)
  );
}
async function revokeIntegration(client, workspaceId, kind) {
  return postParsed(
    client,
    `${workspaceIntegrationPath(workspaceId, kind)}/revoke`,
    {},
    (data) => IntegrationOkResponseSchema.parse(data)
  );
}
async function listIntegrationDevices(client, workspaceId, kind, options) {
  const sp = new URLSearchParams();
  if (options?.includeReadings) sp.set("includeReadings", "true");
  if (options?.readingsLimit !== void 0) sp.set("readingsLimit", String(options.readingsLimit));
  const query = sp.toString();
  const path = `${workspaceIntegrationPath(workspaceId, kind)}/devices${query ? `?${query}` : ""}`;
  return getParsed(client, path, (data) => IntegrationDevicesListResponseSchema.parse(data));
}
async function attachTiltDevice(client, workspaceId, deviceId, body) {
  const parsedBody = IntegrationDeviceAttachRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath(
      `/workspaces/${encodeURIComponent(workspaceId)}/integrations/tilt/devices/${encodeURIComponent(deviceId)}/attach`
    ),
    parsedBody,
    (data) => IntegrationDeviceAttachResponseSchema.parse(data)
  );
}
async function detachTiltDevice(client, workspaceId, deviceId) {
  return postParsed(
    client,
    toClientPath(
      `/workspaces/${encodeURIComponent(workspaceId)}/integrations/tilt/devices/${encodeURIComponent(deviceId)}/detach`
    ),
    {},
    (data) => IntegrationDeviceDetachResponseSchema.parse(data)
  );
}
async function listRecentBrewSessions(client, workspaceId, params) {
  const parsed = BrewSessionsRecentQuerySchema.parse(params ?? {});
  const sp = new URLSearchParams();
  if (parsed.limit !== void 0) sp.set("limit", String(parsed.limit));
  const query = sp.toString();
  return getParsed(
    client,
    `${toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/brew-sessions/recent`)}${query ? `?${query}` : ""}`,
    (data) => BrewSessionsRecentResponseSchema.parse(data)
  );
}

// src/platform/modules.ts
async function getWorkspaceBilling(client, workspaceId) {
  return getParsed(
    client,
    toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/billing`),
    (data) => WorkspaceBillingResponseSchema.parse(data)
  );
}

// src/platform/ai.ts
import {
  BillingIntentRequestSchema,
  BillingIntentResponseSchema,
  UpdateWorkspaceAiSettingsRequestSchema,
  WorkspaceAiSettingsResponseSchema,
  WorkspaceAiUsageResponseSchema
} from "@umbraculum/contracts";
function workspaceAiSettingsPath(workspaceId) {
  return toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/ai/settings`);
}
function workspaceAiUsagePath(workspaceId) {
  return toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/ai/usage`);
}
function workspaceBillingIntentPath(workspaceId) {
  return toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/billing/intent`);
}
async function getWorkspaceAiSettings(client, workspaceId) {
  return getParsed(
    client,
    workspaceAiSettingsPath(workspaceId),
    (data) => WorkspaceAiSettingsResponseSchema.parse(data)
  );
}
async function patchWorkspaceAiSettings(client, workspaceId, body) {
  const parsedBody = UpdateWorkspaceAiSettingsRequestSchema.parse(body);
  return putParsed(
    client,
    workspaceAiSettingsPath(workspaceId),
    parsedBody,
    (data) => WorkspaceAiSettingsResponseSchema.parse(data)
  );
}
async function getWorkspaceAiUsage(client, workspaceId) {
  return getParsed(
    client,
    workspaceAiUsagePath(workspaceId),
    (data) => WorkspaceAiUsageResponseSchema.parse(data)
  );
}
async function createAiUpgradeBillingIntent(client, workspaceId, body) {
  const parsedBody = BillingIntentRequestSchema.parse(body);
  return postParsed(
    client,
    workspaceBillingIntentPath(workspaceId),
    parsedBody,
    (data) => BillingIntentResponseSchema.parse(data)
  );
}

// src/platform/ads.ts
import {
  AdSlotParamsSchema,
  AdSlotQuerySchema,
  AdSlotResponseSchema
} from "@umbraculum/contracts";
async function getAdSlot(client, placement, options = {}) {
  const parsedPlacement = AdSlotParamsSchema.parse({ placement }).placement;
  const query = AdSlotQuerySchema.parse(options);
  const qs = query.platform ? `?platform=${encodeURIComponent(query.platform)}` : "";
  return getParsed(
    client,
    `${toClientPath(`/ads/slot/${encodeURIComponent(parsedPlacement)}`)}${qs}`,
    (data) => AdSlotResponseSchema.parse(data)
  );
}

// src/platform/platformAdmin.ts
import {
  PlatformAdCreateRequestSchema,
  PlatformAdCreateResponseSchema,
  PlatformAdOkResponseSchema,
  PlatformAdPatchRequestSchema,
  PlatformAdsListResponseSchema,
  PlatformRecipeBulkImportPreviewRequestSchema,
  PlatformRecipeBulkImportPreviewResponseSchema,
  PlatformRecipeBulkImportRequestSchema,
  PlatformRecipeBulkImportResponseSchema,
  PlatformRecipeImportPreviewRequestSchema,
  PlatformRecipeImportPreviewResponseSchema,
  PlatformRecipeImportRequestSchema,
  PlatformRecipeImportResponseSchema,
  PlatformRecipesListQuerySchema,
  PlatformRecipesListResponseSchema,
  PlatformWorkspacesListResponseSchema
} from "@umbraculum/contracts";
async function listPlatformWorkspaces(client) {
  return getParsed(
    client,
    toClientPath("/platform/workspaces"),
    (data) => PlatformWorkspacesListResponseSchema.parse(data)
  );
}
async function listPlatformRecipes(client, workspaceId) {
  const query = PlatformRecipesListQuerySchema.parse({ workspaceId });
  const qs = `?workspaceId=${encodeURIComponent(query.workspaceId)}`;
  return getParsed(
    client,
    `${toClientPath("/platform/recipes/list")}${qs}`,
    (data) => PlatformRecipesListResponseSchema.parse(data)
  );
}
async function previewPlatformRecipeImport(client, body) {
  const parsedBody = PlatformRecipeImportPreviewRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/recipes/import/preview"),
    parsedBody,
    (data) => PlatformRecipeImportPreviewResponseSchema.parse(data)
  );
}
async function importPlatformRecipe(client, body) {
  const parsedBody = PlatformRecipeImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/recipes/import"),
    parsedBody,
    (data) => PlatformRecipeImportResponseSchema.parse(data)
  );
}
async function previewPlatformBulkRecipeImport(client, body) {
  const parsedBody = PlatformRecipeBulkImportPreviewRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/recipes/import/bulk/preview"),
    parsedBody,
    (data) => PlatformRecipeBulkImportPreviewResponseSchema.parse(data)
  );
}
async function importPlatformRecipesBulk(client, body) {
  const parsedBody = PlatformRecipeBulkImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/recipes/import/bulk"),
    parsedBody,
    (data) => PlatformRecipeBulkImportResponseSchema.parse(data)
  );
}
async function listPlatformAds(client) {
  return getParsed(
    client,
    toClientPath("/platform/ads"),
    (data) => PlatformAdsListResponseSchema.parse(data)
  );
}
async function createPlatformAd(client, body) {
  const parsedBody = PlatformAdCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/ads"),
    parsedBody,
    (data) => PlatformAdCreateResponseSchema.parse(data)
  );
}
async function patchPlatformAd(client, adId, body) {
  const parsedBody = PlatformAdPatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/platform/ads/${encodeURIComponent(adId)}`),
    parsedBody,
    (data) => PlatformAdOkResponseSchema.parse(data)
  );
}
async function deletePlatformAd(client, adId) {
  return deleteParsed(
    client,
    toClientPath(`/platform/ads/${encodeURIComponent(adId)}`),
    (data) => PlatformAdOkResponseSchema.parse(data)
  );
}
export {
  ApiClientError,
  PLATFORM_FACADE_PARSER_MAP,
  attachTiltDevice,
  bearerTokenAuth,
  cookieAuth,
  createAiUpgradeBillingIntent,
  createApiClient,
  createPlatformAd,
  createWorkspace,
  createWorkspaceIntegration,
  deletePlatformAd,
  detachTiltDevice,
  exchangeWebviewToken,
  fetchRenderJobDownloadUrl,
  getAdSlot,
  getAuthMe,
  getHealth,
  getWorkspaceAiSettings,
  getWorkspaceAiUsage,
  getWorkspaceBilling,
  getWorkspaceIntegration,
  importPlatformRecipe,
  importPlatformRecipesBulk,
  listIntegrationDevices,
  listPlatformAds,
  listPlatformRecipes,
  listPlatformWorkspaces,
  listRecentBrewSessions,
  listWorkspaces,
  login,
  loginNative,
  logout,
  patchAuthPreferences,
  patchPlatformAd,
  patchWorkspaceAiSettings,
  pollRenderJobUntilSucceeded,
  previewPlatformBulkRecipeImport,
  previewPlatformRecipeImport,
  resolveArtifactDownloadUrl,
  revealIntegrationToken,
  revokeIntegration,
  rotateIntegrationToken,
  runAsyncRenderJobExport,
  setActiveWorkspace,
  signup,
  submitRenderJob,
  toWebArtifactUrl
};
