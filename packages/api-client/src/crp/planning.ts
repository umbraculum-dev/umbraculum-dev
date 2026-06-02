import {
  CapacityConflictListResponseSchema,
  CapacityLoadResponseSchema,
  ResourceGetResponseSchema,
  ResourceListResponseSchema,
  ScheduledOperationListResponseSchema,
  WorkCenterListResponseSchema,
  type CapacityConflictListResponse,
  type CapacityLoadResponse,
  type ResourceGetResponse,
  type ResourceListResponse,
  type ScheduledOperationListResponse,
  type WorkCenterListResponse,
} from "@umbraculum/crp-contracts";

import type { RenderVisibility } from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";
import { runAsyncRenderJobExport, submitRenderJob } from "../platform/rendering.js";

type CrpResourcesListPath = "/crp/resources";
type CrpResourcesListGet = PlatformOpenApiPaths[CrpResourcesListPath]["get"];

type CrpResourceDetailPath = "/crp/resources/{resourceId}";
type CrpResourceDetailGet = PlatformOpenApiPaths[CrpResourceDetailPath]["get"];

type CrpWorkCentersListPath = "/crp/work-centers";
type CrpWorkCentersListGet = PlatformOpenApiPaths[CrpWorkCentersListPath]["get"];

type CrpScheduledOperationsListPath = "/crp/scheduled-operations";
type CrpScheduledOperationsListGet = PlatformOpenApiPaths[CrpScheduledOperationsListPath]["get"];

type CrpConflictsListPath = "/crp/conflicts";
type CrpConflictsListGet = PlatformOpenApiPaths[CrpConflictsListPath]["get"];

type CrpCapacityLoadPath = "/crp/capacity-load";
type CrpCapacityLoadGet = PlatformOpenApiPaths[CrpCapacityLoadPath]["get"];

export type {
  CrpResourcesListGet,
  CrpResourceDetailGet,
  CrpWorkCentersListGet,
  CrpScheduledOperationsListGet,
  CrpConflictsListGet,
  CrpCapacityLoadGet,
};

export async function listResources(client: ApiClient): Promise<ResourceListResponse> {
  return getParsed(client, toClientPath("/crp/resources"), (data) =>
    ResourceListResponseSchema.parse(data),
  );
}

export async function getResource(client: ApiClient, resourceId: string): Promise<ResourceGetResponse> {
  return getParsed(
    client,
    toClientPath(`/crp/resources/${encodeURIComponent(resourceId)}`),
    (data) => ResourceGetResponseSchema.parse(data),
  );
}

export async function listWorkCenters(client: ApiClient): Promise<WorkCenterListResponse> {
  return getParsed(client, toClientPath("/crp/work-centers"), (data) =>
    WorkCenterListResponseSchema.parse(data),
  );
}

export async function listScheduledOperations(
  client: ApiClient,
): Promise<ScheduledOperationListResponse> {
  return getParsed(client, toClientPath("/crp/scheduled-operations"), (data) =>
    ScheduledOperationListResponseSchema.parse(data),
  );
}

export async function listCapacityConflicts(
  client: ApiClient,
): Promise<CapacityConflictListResponse> {
  return getParsed(client, toClientPath("/crp/conflicts"), (data) =>
    CapacityConflictListResponseSchema.parse(data),
  );
}

export async function getCapacityLoad(client: ApiClient): Promise<CapacityLoadResponse> {
  return getParsed(client, toClientPath("/crp/capacity-load"), (data) =>
    CapacityLoadResponseSchema.parse(data),
  );
}

type CrpCapacityLoadRenderJobsPath = "/crp/capacity-load/render-jobs";
type CrpScheduleRenderJobsPath = "/crp/schedule/render-jobs";
type CrpResourcesCalendarRenderJobsPath = "/crp/resources/calendar/render-jobs";
type CrpConflictsRenderJobsPath = "/crp/conflicts/render-jobs";

export type RenderJobBody = { visibility?: RenderVisibility };

export function capacityLoadRenderJobsPath(resourceId?: string): string {
  const base = toClientPath("/crp/capacity-load/render-jobs");
  if (!resourceId) return base;
  return `${base}?resourceId=${encodeURIComponent(resourceId)}`;
}

export function scheduleRenderJobsPath(): string {
  return toClientPath("/crp/schedule/render-jobs");
}

export function resourcesCalendarRenderJobsPath(): string {
  return toClientPath("/crp/resources/calendar/render-jobs");
}

export function conflictsRenderJobsPath(): string {
  return toClientPath("/crp/conflicts/render-jobs");
}

export async function submitCapacityLoadRenderJob(
  client: ApiClient,
  options?: { resourceId?: string; visibility?: RenderVisibility },
): Promise<{ jobId: string }> {
  const body: RenderJobBody = {};
  if (options?.visibility !== undefined) body.visibility = options.visibility;
  return submitRenderJob(client, capacityLoadRenderJobsPath(options?.resourceId), body);
}

export async function submitScheduleRenderJob(
  client: ApiClient,
  body?: RenderJobBody,
): Promise<{ jobId: string }> {
  return submitRenderJob(client, scheduleRenderJobsPath(), body ?? {});
}

export async function submitResourcesCalendarRenderJob(
  client: ApiClient,
  body?: RenderJobBody,
): Promise<{ jobId: string }> {
  return submitRenderJob(client, resourcesCalendarRenderJobsPath(), body ?? {});
}

export async function submitConflictsRenderJob(
  client: ApiClient,
  body?: RenderJobBody,
): Promise<{ jobId: string }> {
  return submitRenderJob(client, conflictsRenderJobsPath(), body ?? {});
}

function renderJobExportOpts(
  body: RenderJobBody,
  options?: { platform?: "web" | "native"; apiBaseUrl?: string },
): { body: RenderJobBody; platform?: "web" | "native"; apiBaseUrl?: string } {
  const exportOpts: { body: RenderJobBody; platform?: "web" | "native"; apiBaseUrl?: string } = {
    body,
  };
  if (options?.platform !== undefined) exportOpts.platform = options.platform;
  if (options?.apiBaseUrl !== undefined) exportOpts.apiBaseUrl = options.apiBaseUrl;
  return exportOpts;
}

export async function runCapacityLoadRenderJobExport(
  client: ApiClient,
  options?: {
    resourceId?: string;
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
  },
): Promise<string> {
  const body: RenderJobBody = {};
  if (options?.visibility !== undefined) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    capacityLoadRenderJobsPath(options?.resourceId),
    renderJobExportOpts(body, options),
  );
}

export async function runScheduleRenderJobExport(
  client: ApiClient,
  options?: { visibility?: RenderVisibility; platform?: "web" | "native"; apiBaseUrl?: string },
): Promise<string> {
  const body: RenderJobBody = {};
  if (options?.visibility !== undefined) body.visibility = options.visibility;
  return runAsyncRenderJobExport(client, scheduleRenderJobsPath(), renderJobExportOpts(body, options));
}

export async function runResourcesCalendarRenderJobExport(
  client: ApiClient,
  options?: { visibility?: RenderVisibility; platform?: "web" | "native"; apiBaseUrl?: string },
): Promise<string> {
  const body: RenderJobBody = {};
  if (options?.visibility !== undefined) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    resourcesCalendarRenderJobsPath(),
    renderJobExportOpts(body, options),
  );
}

export async function runConflictsRenderJobExport(
  client: ApiClient,
  options?: { visibility?: RenderVisibility; platform?: "web" | "native"; apiBaseUrl?: string },
): Promise<string> {
  const body: RenderJobBody = {};
  if (options?.visibility !== undefined) body.visibility = options.visibility;
  return runAsyncRenderJobExport(client, conflictsRenderJobsPath(), renderJobExportOpts(body, options));
}
