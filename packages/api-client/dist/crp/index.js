import {
  getParsed,
  toClientPath
} from "../chunk-67WUASDX.js";

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
export {
  getCapacityLoad,
  getResource,
  listCapacityConflicts,
  listResources,
  listScheduledOperations,
  listWorkCenters
};
