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

// src/crp/index.ts
var crp_exports = {};
__export(crp_exports, {
  capacityLoadRenderJobsPath: () => capacityLoadRenderJobsPath,
  conflictsRenderJobsPath: () => conflictsRenderJobsPath,
  getCapacityLoad: () => getCapacityLoad,
  getResource: () => getResource,
  listCapacityConflicts: () => listCapacityConflicts,
  listResources: () => listResources,
  listScheduledOperations: () => listScheduledOperations,
  listWorkCenters: () => listWorkCenters,
  resourcesCalendarRenderJobsPath: () => resourcesCalendarRenderJobsPath,
  runCapacityLoadRenderJobExport: () => runCapacityLoadRenderJobExport,
  runConflictsRenderJobExport: () => runConflictsRenderJobExport,
  runResourcesCalendarRenderJobExport: () => runResourcesCalendarRenderJobExport,
  runScheduleRenderJobExport: () => runScheduleRenderJobExport,
  scheduleRenderJobsPath: () => scheduleRenderJobsPath,
  submitCapacityLoadRenderJob: () => submitCapacityLoadRenderJob,
  submitConflictsRenderJob: () => submitConflictsRenderJob,
  submitResourcesCalendarRenderJob: () => submitResourcesCalendarRenderJob,
  submitScheduleRenderJob: () => submitScheduleRenderJob
});
module.exports = __toCommonJS(crp_exports);

// src/crp/planning.ts
var import_crp_contracts = require("@umbraculum/crp-contracts");

// src/internal/clientPath.ts
function toClientPath(openApiPath) {
  return `/api${openApiPath}`;
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

// src/platform/rendering.ts
var import_contracts = require("@umbraculum/contracts");
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
  const parsed = import_contracts.RenderJobSubmitResponseSchema.parse(res.data);
  return { jobId: parsed.job.id };
}
async function pollRenderJobUntilSucceeded(client, jobId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStatus = "";
  const statusPath = `/api/rendering/jobs/${encodeURIComponent(jobId)}`;
  while (Date.now() < deadline) {
    const res = await client.get(statusPath);
    assertOk(res, 200);
    const body = import_contracts.RenderJobStatusResponseSchema.parse(res.data);
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
  const body = import_contracts.RenderJobResultResponseSchema.parse(res.data);
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

// src/crp/planning.ts
async function listResources(client) {
  return getParsed(
    client,
    toClientPath("/crp/resources"),
    (data) => import_crp_contracts.ResourceListResponseSchema.parse(data)
  );
}
async function getResource(client, resourceId) {
  return getParsed(
    client,
    toClientPath(`/crp/resources/${encodeURIComponent(resourceId)}`),
    (data) => import_crp_contracts.ResourceGetResponseSchema.parse(data)
  );
}
async function listWorkCenters(client) {
  return getParsed(
    client,
    toClientPath("/crp/work-centers"),
    (data) => import_crp_contracts.WorkCenterListResponseSchema.parse(data)
  );
}
async function listScheduledOperations(client) {
  return getParsed(
    client,
    toClientPath("/crp/scheduled-operations"),
    (data) => import_crp_contracts.ScheduledOperationListResponseSchema.parse(data)
  );
}
async function listCapacityConflicts(client) {
  return getParsed(
    client,
    toClientPath("/crp/conflicts"),
    (data) => import_crp_contracts.CapacityConflictListResponseSchema.parse(data)
  );
}
async function getCapacityLoad(client) {
  return getParsed(
    client,
    toClientPath("/crp/capacity-load"),
    (data) => import_crp_contracts.CapacityLoadResponseSchema.parse(data)
  );
}
function capacityLoadRenderJobsPath(resourceId) {
  const base = toClientPath("/crp/capacity-load/render-jobs");
  if (!resourceId) return base;
  return `${base}?resourceId=${encodeURIComponent(resourceId)}`;
}
function scheduleRenderJobsPath() {
  return toClientPath("/crp/schedule/render-jobs");
}
function resourcesCalendarRenderJobsPath() {
  return toClientPath("/crp/resources/calendar/render-jobs");
}
function conflictsRenderJobsPath() {
  return toClientPath("/crp/conflicts/render-jobs");
}
async function submitCapacityLoadRenderJob(client, options) {
  const body = {};
  if (options?.visibility !== void 0) body.visibility = options.visibility;
  return submitRenderJob(client, capacityLoadRenderJobsPath(options?.resourceId), body);
}
async function submitScheduleRenderJob(client, body) {
  return submitRenderJob(client, scheduleRenderJobsPath(), body ?? {});
}
async function submitResourcesCalendarRenderJob(client, body) {
  return submitRenderJob(client, resourcesCalendarRenderJobsPath(), body ?? {});
}
async function submitConflictsRenderJob(client, body) {
  return submitRenderJob(client, conflictsRenderJobsPath(), body ?? {});
}
function renderJobExportOpts(body, options) {
  const exportOpts = {
    body
  };
  if (options?.platform !== void 0) exportOpts.platform = options.platform;
  if (options?.apiBaseUrl !== void 0) exportOpts.apiBaseUrl = options.apiBaseUrl;
  return exportOpts;
}
async function runCapacityLoadRenderJobExport(client, options) {
  const body = {};
  if (options?.visibility !== void 0) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    capacityLoadRenderJobsPath(options?.resourceId),
    renderJobExportOpts(body, options)
  );
}
async function runScheduleRenderJobExport(client, options) {
  const body = {};
  if (options?.visibility !== void 0) body.visibility = options.visibility;
  return runAsyncRenderJobExport(client, scheduleRenderJobsPath(), renderJobExportOpts(body, options));
}
async function runResourcesCalendarRenderJobExport(client, options) {
  const body = {};
  if (options?.visibility !== void 0) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    resourcesCalendarRenderJobsPath(),
    renderJobExportOpts(body, options)
  );
}
async function runConflictsRenderJobExport(client, options) {
  const body = {};
  if (options?.visibility !== void 0) body.visibility = options.visibility;
  return runAsyncRenderJobExport(client, conflictsRenderJobsPath(), renderJobExportOpts(body, options));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  capacityLoadRenderJobsPath,
  conflictsRenderJobsPath,
  getCapacityLoad,
  getResource,
  listCapacityConflicts,
  listResources,
  listScheduledOperations,
  listWorkCenters,
  resourcesCalendarRenderJobsPath,
  runCapacityLoadRenderJobExport,
  runConflictsRenderJobExport,
  runResourcesCalendarRenderJobExport,
  runScheduleRenderJobExport,
  scheduleRenderJobsPath,
  submitCapacityLoadRenderJob,
  submitConflictsRenderJob,
  submitResourcesCalendarRenderJob,
  submitScheduleRenderJob
});
