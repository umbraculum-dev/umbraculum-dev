import { CapacityLoadResponse, ResourceGetResponse, CapacityConflictListResponse, ResourceListResponse, ScheduledOperationListResponse, WorkCenterListResponse } from '@umbraculum/crp-contracts';
import { RenderVisibility } from '@umbraculum/contracts';
import { a as ApiClient } from '../client-Dia82S7S.js';
import { p as paths } from '../platform.openapi-DFK6FUu2.js';

type CrpResourcesListPath = "/crp/resources";
type CrpResourcesListGet = paths[CrpResourcesListPath]["get"];
type CrpResourceDetailPath = "/crp/resources/{resourceId}";
type CrpResourceDetailGet = paths[CrpResourceDetailPath]["get"];
type CrpWorkCentersListPath = "/crp/work-centers";
type CrpWorkCentersListGet = paths[CrpWorkCentersListPath]["get"];
type CrpScheduledOperationsListPath = "/crp/scheduled-operations";
type CrpScheduledOperationsListGet = paths[CrpScheduledOperationsListPath]["get"];
type CrpConflictsListPath = "/crp/conflicts";
type CrpConflictsListGet = paths[CrpConflictsListPath]["get"];
type CrpCapacityLoadPath = "/crp/capacity-load";
type CrpCapacityLoadGet = paths[CrpCapacityLoadPath]["get"];

declare function listResources(client: ApiClient): Promise<ResourceListResponse>;
declare function getResource(client: ApiClient, resourceId: string): Promise<ResourceGetResponse>;
declare function listWorkCenters(client: ApiClient): Promise<WorkCenterListResponse>;
declare function listScheduledOperations(client: ApiClient): Promise<ScheduledOperationListResponse>;
declare function listCapacityConflicts(client: ApiClient): Promise<CapacityConflictListResponse>;
declare function getCapacityLoad(client: ApiClient): Promise<CapacityLoadResponse>;
type RenderJobBody = {
    visibility?: RenderVisibility;
};
declare function capacityLoadRenderJobsPath(resourceId?: string): string;
declare function scheduleRenderJobsPath(): string;
declare function resourcesCalendarRenderJobsPath(): string;
declare function conflictsRenderJobsPath(): string;
declare function submitCapacityLoadRenderJob(client: ApiClient, options?: {
    resourceId?: string;
    visibility?: RenderVisibility;
}): Promise<{
    jobId: string;
}>;
declare function submitScheduleRenderJob(client: ApiClient, body?: RenderJobBody): Promise<{
    jobId: string;
}>;
declare function submitResourcesCalendarRenderJob(client: ApiClient, body?: RenderJobBody): Promise<{
    jobId: string;
}>;
declare function submitConflictsRenderJob(client: ApiClient, body?: RenderJobBody): Promise<{
    jobId: string;
}>;
declare function runCapacityLoadRenderJobExport(client: ApiClient, options?: {
    resourceId?: string;
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;
declare function runScheduleRenderJobExport(client: ApiClient, options?: {
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;
declare function runResourcesCalendarRenderJobExport(client: ApiClient, options?: {
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;
declare function runConflictsRenderJobExport(client: ApiClient, options?: {
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;

export { type CrpCapacityLoadGet, type CrpConflictsListGet, type CrpResourceDetailGet, type CrpResourcesListGet, type CrpScheduledOperationsListGet, type CrpWorkCentersListGet, type RenderJobBody, capacityLoadRenderJobsPath, conflictsRenderJobsPath, getCapacityLoad, getResource, listCapacityConflicts, listResources, listScheduledOperations, listWorkCenters, resourcesCalendarRenderJobsPath, runCapacityLoadRenderJobExport, runConflictsRenderJobExport, runResourcesCalendarRenderJobExport, runScheduleRenderJobExport, scheduleRenderJobsPath, submitCapacityLoadRenderJob, submitConflictsRenderJob, submitResourcesCalendarRenderJob, submitScheduleRenderJob };
