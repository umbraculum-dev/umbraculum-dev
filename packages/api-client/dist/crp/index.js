import {
  runAsyncRenderJobExport,
  submitRenderJob
} from "../chunk-PU7ET74O.js";
import {
  getParsed,
  toClientPath
} from "../chunk-EHQ6NO7O.js";

// src/crp/planning.ts
import {
  CapacityConflictListResponseSchema,
  CapacityLoadResponseSchema,
  ResourceGetResponseSchema,
  ResourceListResponseSchema,
  ScheduledOperationListResponseSchema,
  WorkCenterListResponseSchema
} from "@umbraculum/crp-contracts";
async function listResources(client) {
  return getParsed(
    client,
    toClientPath("/crp/resources"),
    (data) => ResourceListResponseSchema.parse(data)
  );
}
async function getResource(client, resourceId) {
  return getParsed(
    client,
    toClientPath(`/crp/resources/${encodeURIComponent(resourceId)}`),
    (data) => ResourceGetResponseSchema.parse(data)
  );
}
async function listWorkCenters(client) {
  return getParsed(
    client,
    toClientPath("/crp/work-centers"),
    (data) => WorkCenterListResponseSchema.parse(data)
  );
}
async function listScheduledOperations(client) {
  return getParsed(
    client,
    toClientPath("/crp/scheduled-operations"),
    (data) => ScheduledOperationListResponseSchema.parse(data)
  );
}
async function listCapacityConflicts(client) {
  return getParsed(
    client,
    toClientPath("/crp/conflicts"),
    (data) => CapacityConflictListResponseSchema.parse(data)
  );
}
async function getCapacityLoad(client) {
  return getParsed(
    client,
    toClientPath("/crp/capacity-load"),
    (data) => CapacityLoadResponseSchema.parse(data)
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
export {
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
};
