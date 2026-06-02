import { CapacityLoadResponse, ResourceGetResponse, CapacityConflictListResponse, ResourceListResponse, ScheduledOperationListResponse, WorkCenterListResponse } from '@umbraculum/crp-contracts';
import { a as ApiClient } from '../client-Dia82S7S.cjs';
import { p as paths } from '../platform.openapi-DFK6FUu2.cjs';

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

export { type CrpCapacityLoadGet, type CrpConflictsListGet, type CrpResourceDetailGet, type CrpResourcesListGet, type CrpScheduledOperationsListGet, type CrpWorkCentersListGet, getCapacityLoad, getResource, listCapacityConflicts, listResources, listScheduledOperations, listWorkCenters };
