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

// src/mrp/index.ts
var mrp_exports = {};
__export(mrp_exports, {
  getProductionOrder: () => getProductionOrder,
  listMaterialRequirements: () => listMaterialRequirements,
  listProductionOrders: () => listProductionOrders
});
module.exports = __toCommonJS(mrp_exports);

// src/mrp/productionOrders.ts
var import_mrp_contracts = require("@umbraculum/mrp-contracts");

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

// src/mrp/productionOrders.ts
async function listProductionOrders(client) {
  return getParsed(
    client,
    toClientPath("/mrp/production-orders"),
    (data) => import_mrp_contracts.ProductionOrderListResponseSchema.parse(data)
  );
}
async function getProductionOrder(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}`),
    (data) => import_mrp_contracts.ProductionOrderGetResponseSchema.parse(data)
  );
}
async function listMaterialRequirements(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}/material-requirements`),
    (data) => import_mrp_contracts.MaterialRequirementListResponseSchema.parse(data)
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getProductionOrder,
  listMaterialRequirements,
  listProductionOrders
});
