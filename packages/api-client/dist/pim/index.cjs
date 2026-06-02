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

// src/pim/index.ts
var pim_exports = {};
__export(pim_exports, {
  createProduct: () => createProduct,
  getAttributeSet: () => getAttributeSet,
  getProduct: () => getProduct,
  listAttributeSets: () => listAttributeSets,
  listCategories: () => listCategories,
  listProductVariants: () => listProductVariants,
  listProducts: () => listProducts
});
module.exports = __toCommonJS(pim_exports);

// src/pim/products.ts
var import_pim_contracts = require("@umbraculum/pim-contracts");

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
async function postParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.post(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

// src/pim/products.ts
async function listProducts(client) {
  return getParsed(
    client,
    toClientPath("/pim/products"),
    (data) => import_pim_contracts.ProductListResponseSchema.parse(data)
  );
}
async function createProduct(client, body) {
  const parsedBody = import_pim_contracts.ProductCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/pim/products"),
    parsedBody,
    (data) => import_pim_contracts.ProductGetResponseSchema.parse(data)
  );
}
async function getProduct(client, productId) {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}`),
    (data) => import_pim_contracts.ProductGetResponseSchema.parse(data)
  );
}
async function listProductVariants(client, productId) {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/variants`),
    (data) => import_pim_contracts.VariantListResponseSchema.parse(data)
  );
}

// src/pim/attributeSets.ts
var import_pim_contracts2 = require("@umbraculum/pim-contracts");
async function listAttributeSets(client) {
  return getParsed(
    client,
    toClientPath("/pim/attribute-sets"),
    (data) => import_pim_contracts2.AttributeSetListResponseSchema.parse(data)
  );
}
async function getAttributeSet(client, setId) {
  return getParsed(
    client,
    toClientPath(`/pim/attribute-sets/${encodeURIComponent(setId)}`),
    (data) => import_pim_contracts2.AttributeSetGetResponseSchema.parse(data)
  );
}

// src/pim/categories.ts
var import_pim_contracts3 = require("@umbraculum/pim-contracts");
async function listCategories(client) {
  return getParsed(
    client,
    toClientPath("/pim/categories"),
    (data) => import_pim_contracts3.CategoryListResponseSchema.parse(data)
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createProduct,
  getAttributeSet,
  getProduct,
  listAttributeSets,
  listCategories,
  listProductVariants,
  listProducts
});
