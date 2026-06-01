"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ApiClientError: () => ApiClientError,
  BREWERY_FACADE_PARSER_MAP: () => BREWERY_FACADE_PARSER_MAP,
  PLATFORM_FACADE_PARSER_MAP: () => PLATFORM_FACADE_PARSER_MAP,
  bearerTokenAuth: () => bearerTokenAuth,
  cookieAuth: () => cookieAuth,
  createApiClient: () => createApiClient,
  createWorkspace: () => createWorkspace,
  fetchRenderJobDownloadUrl: () => fetchRenderJobDownloadUrl,
  getAuthMe: () => getAuthMe,
  getHealth: () => getHealth,
  getWorkspaceBilling: () => getWorkspaceBilling,
  listIntegrationDevices: () => listIntegrationDevices,
  listWorkspaces: () => listWorkspaces,
  login: () => login,
  loginNative: () => loginNative,
  pollRenderJobUntilSucceeded: () => pollRenderJobUntilSucceeded,
  resolveArtifactDownloadUrl: () => resolveArtifactDownloadUrl,
  runAsyncRenderJobExport: () => runAsyncRenderJobExport,
  submitRenderJob: () => submitRenderJob,
  toWebArtifactUrl: () => toWebArtifactUrl
});
module.exports = __toCommonJS(index_exports);

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

// src/errors.ts
var ApiClientError = class extends Error {
  status;
  body;
  constructor(res) {
    const detail = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    super(detail || `API request failed (${res.status})`);
    this.name = "ApiClientError";
    this.status = res.status;
    this.body = res.data;
  }
};

// src/facadeParserMap.ts
var PLATFORM_FACADE_PARSER_MAP = {
  "/auth/me": "parseAuthMeResponse / AuthMeResponseSchema",
  "/auth/login": "AuthLoginResponseSchema",
  "/auth/login/native": "AuthLoginNativeResponseSchema",
  "/workspaces": "WorkspacesListResponseSchema",
  "/health": "HealthResponseSchema",
  "/workspaces/{workspaceId}/billing": "WorkspaceBillingResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/devices": "IntegrationDevicesListResponseSchema",
  "/rendering/jobs/{jobId}": "RenderJobStatusResponseSchema",
  "/rendering/jobs/{jobId}/result": "RenderJobResultResponseSchema"
};
var BREWERY_FACADE_PARSER_MAP = {
  "/recipes": "parseRecipesListResponse",
  "/recipes/{id}": "RecipeResponseSchema",
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
var import_contracts = require("@umbraculum/contracts");

// src/internal/clientPath.ts
function toClientPath(openApiPath) {
  return `/api${openApiPath}`;
}

// src/internal/httpJson.ts
function assertOk(res, expectedStatus = 200) {
  if (res.status !== expectedStatus || !res.ok) {
    throw new ApiClientError(res);
  }
}
async function getParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.get(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function postParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.post(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

// src/platform/auth.ts
async function getAuthMe(client) {
  return getParsed(client, toClientPath("/auth/me"), (data) => import_contracts.AuthMeResponseSchema.parse(data));
}
async function login(client, body) {
  const parsedBody = import_contracts.AuthLoginRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/auth/login"),
    parsedBody,
    (data) => import_contracts.AuthLoginResponseSchema.parse(data)
  );
}
async function loginNative(client, body) {
  const parsedBody = import_contracts.AuthLoginRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/auth/login/native"),
    parsedBody,
    (data) => import_contracts.AuthLoginNativeResponseSchema.parse(data)
  );
}

// src/platform/workspaces.ts
var import_contracts2 = require("@umbraculum/contracts");
async function listWorkspaces(client) {
  return getParsed(
    client,
    toClientPath("/workspaces"),
    (data) => import_contracts2.WorkspacesListResponseSchema.parse(data)
  );
}
async function createWorkspace(client, body) {
  const parsedBody = import_contracts2.WorkspaceCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/workspaces"),
    parsedBody,
    (data) => import_contracts2.WorkspaceCreateResponseSchema.parse(data)
  );
}
async function getHealth(client) {
  return getParsed(client, toClientPath("/health"), (data) => import_contracts2.HealthResponseSchema.parse(data));
}

// src/platform/modules.ts
var import_contracts3 = require("@umbraculum/contracts");
async function getWorkspaceBilling(client, workspaceId) {
  return getParsed(
    client,
    toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/billing`),
    (data) => import_contracts3.WorkspaceBillingResponseSchema.parse(data)
  );
}
async function listIntegrationDevices(client, workspaceId, kind) {
  return getParsed(
    client,
    toClientPath(
      `/workspaces/${encodeURIComponent(workspaceId)}/integrations/${encodeURIComponent(kind)}/devices`
    ),
    (data) => import_contracts3.IntegrationDevicesListResponseSchema.parse(data)
  );
}

// src/platform/rendering.ts
var import_contracts4 = require("@umbraculum/contracts");
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
  const parsed = import_contracts4.RenderJobSubmitResponseSchema.parse(res.data);
  return { jobId: parsed.job.id };
}
async function pollRenderJobUntilSucceeded(client, jobId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStatus = "";
  const statusPath = `/api/rendering/jobs/${encodeURIComponent(jobId)}`;
  while (Date.now() < deadline) {
    const res = await client.get(statusPath);
    assertOk(res, 200);
    const body = import_contracts4.RenderJobStatusResponseSchema.parse(res.data);
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
  const body = import_contracts4.RenderJobResultResponseSchema.parse(res.data);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiClientError,
  BREWERY_FACADE_PARSER_MAP,
  PLATFORM_FACADE_PARSER_MAP,
  bearerTokenAuth,
  cookieAuth,
  createApiClient,
  createWorkspace,
  fetchRenderJobDownloadUrl,
  getAuthMe,
  getHealth,
  getWorkspaceBilling,
  listIntegrationDevices,
  listWorkspaces,
  login,
  loginNative,
  pollRenderJobUntilSucceeded,
  resolveArtifactDownloadUrl,
  runAsyncRenderJobExport,
  submitRenderJob,
  toWebArtifactUrl
});
