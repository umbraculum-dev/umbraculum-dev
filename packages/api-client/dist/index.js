import {
  ApiClientError,
  assertOk,
  getParsed,
  postParsed,
  toClientPath
} from "./chunk-67WUASDX.js";

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
  "/workspaces": "WorkspacesListResponseSchema",
  "/health": "HealthResponseSchema",
  "/workspaces/{workspaceId}/billing": "WorkspaceBillingResponseSchema",
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
var BREWERY_FACADE_PARSER_MAP = {
  "/recipes": "parseRecipesListResponse / RecipeResponseSchema (POST)",
  "/recipes/{id}": "RecipeResponseSchema / OkResponseSchema (DELETE)",
  "/recipes/{id}/versions": "RecipeVersionsResponseSchema / RecipeResponseSchema (POST)",
  "/recipes/{id}/duplicate": "RecipeResponseSchema",
  "/recipes/import/preview": "RecipeImportPreviewResponseSchema",
  "/recipes/import": "RecipeImportResponseSchema",
  "/recipes/import/bulk/preview": "RecipeBulkImportPreviewResponseSchema",
  "/recipes/import/bulk": "RecipeBulkImportResponseSchema",
  "/styles": "StylesListResponseSchema",
  "/ingredients/fermentables": "FermentablesListResponseSchema",
  "/ingredients/hops": "HopsListResponseSchema",
  "/ingredients/yeasts": "YeastsListResponseSchema",
  "/brew-sessions/{brewSessionId}": "BrewSessionDetailResponseSchema",
  "/brew-sessions/{brewSessionId}/steps": "BrewSessionStepsResponseSchema",
  "/brew-sessions/{brewSessionId}/integrations/attachments": "IntegrationAttachmentsResponseSchema",
  "/brew-sessions/{brewSessionId}/integrations/readings": "IntegrationReadingsResponseSchema",
  "/inventory": "InventoryListResponseSchema / InventoryItemResponseSchema",
  "/inventory/{id}": "InventoryItemResponseSchema / OkResponseSchema (DELETE)",
  "/equipment-profiles": "EquipmentProfilesListResponseSchema / EquipmentProfileResponseSchema",
  "/equipment-profiles/{id}": "EquipmentProfileResponseSchema / OkResponseSchema (DELETE)",
  "/brewday-settings": "BrewdaySettingsResponseSchema",
  "/recipes/{recipeId}/brew-sessions": "parseBrewSessionsListResponse",
  "/recipes/{id}/water-hub-summary": "parseRecipeWaterHubSummaryResponse",
  "/water-profiles": "parseWaterProfilesResponse / WaterProfileResponseSchema",
  "/water-profiles/{id}/verify": "OkResponseSchema",
  "/water-profiles/{id}/unverify": "OkResponseSchema",
  "/water-profiles/{id}": "OkResponseSchema (DELETE)",
  "/recipes/{id}/water-settings": "RecipeWaterSettingsGetResponseSchema / RecipeWaterSettingsPutResponseSchema",
  "/recipes/{id}/water-settings/mash/compute-and-save": "parseMashComputeAndSaveResponse",
  "/recipes/{id}/water-settings/sparge/compute-and-save": "parseSpargeComputeAndSaveResponse",
  "/recipes/{id}/water-settings/boil/compute-and-save": "parseBoilComputeAndSaveResponse",
  "/water-calc/salt-additions": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-ph-estimate": "WaterCalcResultOnlyResponseSchema",
  "/water-calc/mash-overall": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/sparge-overall": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/boil-overall": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/sparge-acidification": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/sparge-acidification-manual": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-acidification": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-acidification-manual": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-acidification-target-mash-ph": "WaterCalcResultOnlyResponseSchema"
};

// src/platform/auth.ts
import {
  AuthLoginNativeResponseSchema,
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
  AuthMeResponseSchema
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

// src/platform/rendering.ts
import {
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitResponseSchema
} from "@umbraculum/contracts";
var POLL_INTERVAL_MS = 50;
var POLL_TIMEOUT_MS = 15e3;
function toWebArtifactUrl(signedUrl, apiBaseUrl) {
  if (signedUrl.startsWith("/api/")) return signedUrl;
  if (signedUrl.startsWith("/rendering/")) return `/api${signedUrl}`;
  if (signedUrl.startsWith("/") && apiBaseUrl) {
    const base = apiBaseUrl.replace(/\/+$/, "");
    return `${base}${signedUrl.startsWith("/api") ? signedUrl : `/api${signedUrl}`}`;
  }
  return signedUrl;
}
function resolveArtifactDownloadUrl(signedUrl, options) {
  if (options?.platform === "web") {
    return toWebArtifactUrl(signedUrl);
  }
  if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
    return signedUrl;
  }
  const base = options?.apiBaseUrl?.replace(/\/+$/, "") ?? "";
  if (!base) return signedUrl;
  if (signedUrl.startsWith("/api/")) return `${base}${signedUrl.slice(4)}`;
  if (signedUrl.startsWith("/")) return `${base}${signedUrl}`;
  return signedUrl;
}
async function submitRenderJob(client, postUrl, body) {
  const res = await client.post(postUrl, body ?? {});
  assertOk(res, 202);
  const parsed = RenderJobSubmitResponseSchema.parse(res.data);
  return { jobId: parsed.job.id };
}
async function pollRenderJobUntilSucceeded(client, jobId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStatus = "";
  const statusPath = `/api/rendering/jobs/${encodeURIComponent(jobId)}`;
  while (Date.now() < deadline) {
    const res = await client.get(statusPath);
    assertOk(res, 200);
    const body = RenderJobStatusResponseSchema.parse(res.data);
    lastStatus = body.job.status;
    if (body.job.status === "succeeded") return;
    if (body.job.status === "failed") {
      throw new Error(body.job.error?.code ?? "render_job_failed");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`Render job timed out (last status=${lastStatus})`);
}
async function fetchRenderJobDownloadUrl(client, jobId, options) {
  const res = await client.get(`/api/rendering/jobs/${encodeURIComponent(jobId)}/result`);
  assertOk(res, 200);
  const body = RenderJobResultResponseSchema.parse(res.data);
  return resolveArtifactDownloadUrl(body.signedUrl, options);
}
async function runAsyncRenderJobExport(client, postUrl, options) {
  const { jobId } = await submitRenderJob(client, postUrl, options?.body);
  await pollRenderJobUntilSucceeded(client, jobId);
  const downloadOpts = {};
  if (options?.platform !== void 0) downloadOpts.platform = options.platform;
  if (options?.apiBaseUrl !== void 0) downloadOpts.apiBaseUrl = options.apiBaseUrl;
  return fetchRenderJobDownloadUrl(client, jobId, downloadOpts);
}
export {
  ApiClientError,
  BREWERY_FACADE_PARSER_MAP,
  PLATFORM_FACADE_PARSER_MAP,
  attachTiltDevice,
  bearerTokenAuth,
  cookieAuth,
  createApiClient,
  createWorkspace,
  createWorkspaceIntegration,
  detachTiltDevice,
  fetchRenderJobDownloadUrl,
  getAuthMe,
  getHealth,
  getWorkspaceBilling,
  getWorkspaceIntegration,
  listIntegrationDevices,
  listRecentBrewSessions,
  listWorkspaces,
  login,
  loginNative,
  pollRenderJobUntilSucceeded,
  resolveArtifactDownloadUrl,
  revealIntegrationToken,
  revokeIntegration,
  rotateIntegrationToken,
  runAsyncRenderJobExport,
  submitRenderJob,
  toWebArtifactUrl
};
