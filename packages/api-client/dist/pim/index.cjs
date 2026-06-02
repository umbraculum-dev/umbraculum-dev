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
  createAttribute: () => createAttribute,
  createProduct: () => createProduct,
  createProductMediaAssetRef: () => createProductMediaAssetRef,
  deleteAttribute: () => deleteAttribute,
  deleteMediaAssetRef: () => deleteMediaAssetRef,
  getAttribute: () => getAttribute,
  getAttributeSet: () => getAttributeSet,
  getMediaAssetRef: () => getMediaAssetRef,
  getProduct: () => getProduct,
  listAttributeSets: () => listAttributeSets,
  listAttributes: () => listAttributes,
  listCategories: () => listCategories,
  listProductMediaAssetRefs: () => listProductMediaAssetRefs,
  listProductVariants: () => listProductVariants,
  listProducts: () => listProducts,
  patchAttribute: () => patchAttribute,
  patchMediaAssetRef: () => patchMediaAssetRef
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
async function patchParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.patch(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function deleteParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.delete(path);
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

// src/pim/attributes.ts
var import_pim_contracts2 = require("@umbraculum/pim-contracts");
async function listAttributes(client) {
  return getParsed(
    client,
    toClientPath("/pim/attributes"),
    (data) => import_pim_contracts2.AttributeListResponseSchema.parse(data)
  );
}
async function createAttribute(client, body) {
  const parsedBody = import_pim_contracts2.AttributeCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/pim/attributes"),
    parsedBody,
    (data) => import_pim_contracts2.AttributeGetResponseSchema.parse(data),
    201
  );
}
async function getAttribute(client, attributeId) {
  return getParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    (data) => import_pim_contracts2.AttributeGetResponseSchema.parse(data)
  );
}
async function patchAttribute(client, attributeId, body) {
  const parsedBody = import_pim_contracts2.AttributeUpdateRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    parsedBody,
    (data) => import_pim_contracts2.AttributeGetResponseSchema.parse(data)
  );
}
async function deleteAttribute(client, attributeId) {
  return deleteParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    (data) => import_pim_contracts2.PimDeleteResponseSchema.parse(data)
  );
}

// src/pim/attributeSets.ts
var import_pim_contracts3 = require("@umbraculum/pim-contracts");
async function listAttributeSets(client) {
  return getParsed(
    client,
    toClientPath("/pim/attribute-sets"),
    (data) => import_pim_contracts3.AttributeSetListResponseSchema.parse(data)
  );
}
async function getAttributeSet(client, setId) {
  return getParsed(
    client,
    toClientPath(`/pim/attribute-sets/${encodeURIComponent(setId)}`),
    (data) => import_pim_contracts3.AttributeSetGetResponseSchema.parse(data)
  );
}

// src/pim/categories.ts
var import_pim_contracts4 = require("@umbraculum/pim-contracts");
async function listCategories(client) {
  return getParsed(
    client,
    toClientPath("/pim/categories"),
    (data) => import_pim_contracts4.CategoryListResponseSchema.parse(data)
  );
}

// src/pim/mediaAssetRefs.ts
var import_pim_contracts5 = require("@umbraculum/pim-contracts");
async function listProductMediaAssetRefs(client, productId) {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/media-asset-refs`),
    (data) => import_pim_contracts5.MediaAssetRefListResponseSchema.parse(data)
  );
}
async function createProductMediaAssetRef(client, productId, body) {
  const parsedBody = import_pim_contracts5.MediaAssetRefCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/media-asset-refs`),
    parsedBody,
    (data) => import_pim_contracts5.MediaAssetRefGetResponseSchema.parse(data),
    201
  );
}
async function getMediaAssetRef(client, mediaAssetRefId) {
  return getParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    (data) => import_pim_contracts5.MediaAssetRefGetResponseSchema.parse(data)
  );
}
async function patchMediaAssetRef(client, mediaAssetRefId, body) {
  const parsedBody = import_pim_contracts5.MediaAssetRefUpdateRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    parsedBody,
    (data) => import_pim_contracts5.MediaAssetRefGetResponseSchema.parse(data)
  );
}
async function deleteMediaAssetRef(client, mediaAssetRefId) {
  return deleteParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    (data) => import_pim_contracts5.PimDeleteResponseSchema.parse(data)
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAttribute,
  createProduct,
  createProductMediaAssetRef,
  deleteAttribute,
  deleteMediaAssetRef,
  getAttribute,
  getAttributeSet,
  getMediaAssetRef,
  getProduct,
  listAttributeSets,
  listAttributes,
  listCategories,
  listProductMediaAssetRefs,
  listProductVariants,
  listProducts,
  patchAttribute,
  patchMediaAssetRef
});
