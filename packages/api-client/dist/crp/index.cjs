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
  getCapacityLoad: () => getCapacityLoad,
  getResource: () => getResource,
  listCapacityConflicts: () => listCapacityConflicts,
  listResources: () => listResources,
  listScheduledOperations: () => listScheduledOperations,
  listWorkCenters: () => listWorkCenters
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCapacityLoad,
  getResource,
  listCapacityConflicts,
  listResources,
  listScheduledOperations,
  listWorkCenters
});
