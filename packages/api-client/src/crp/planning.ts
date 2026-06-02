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

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

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
