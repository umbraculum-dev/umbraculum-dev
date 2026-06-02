import {
  deleteParsed,
  getParsed,
  patchParsed,
  postParsed,
  toClientPath
} from "../chunk-EHQ6NO7O.js";

// src/pim/products.ts
import {
  ProductCreateRequestSchema,
  ProductGetResponseSchema,
  ProductListResponseSchema,
  VariantListResponseSchema
} from "@umbraculum/pim-contracts";
async function listProducts(client) {
  return getParsed(
    client,
    toClientPath("/pim/products"),
    (data) => ProductListResponseSchema.parse(data)
  );
}
async function createProduct(client, body) {
  const parsedBody = ProductCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/pim/products"),
    parsedBody,
    (data) => ProductGetResponseSchema.parse(data)
  );
}
async function getProduct(client, productId) {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}`),
    (data) => ProductGetResponseSchema.parse(data)
  );
}
async function listProductVariants(client, productId) {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/variants`),
    (data) => VariantListResponseSchema.parse(data)
  );
}

// src/pim/attributes.ts
import {
  AttributeCreateRequestSchema,
  AttributeGetResponseSchema,
  AttributeListResponseSchema,
  AttributeUpdateRequestSchema,
  PimDeleteResponseSchema
} from "@umbraculum/pim-contracts";
async function listAttributes(client) {
  return getParsed(
    client,
    toClientPath("/pim/attributes"),
    (data) => AttributeListResponseSchema.parse(data)
  );
}
async function createAttribute(client, body) {
  const parsedBody = AttributeCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/pim/attributes"),
    parsedBody,
    (data) => AttributeGetResponseSchema.parse(data),
    201
  );
}
async function getAttribute(client, attributeId) {
  return getParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    (data) => AttributeGetResponseSchema.parse(data)
  );
}
async function patchAttribute(client, attributeId, body) {
  const parsedBody = AttributeUpdateRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    parsedBody,
    (data) => AttributeGetResponseSchema.parse(data)
  );
}
async function deleteAttribute(client, attributeId) {
  return deleteParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    (data) => PimDeleteResponseSchema.parse(data)
  );
}

// src/pim/attributeSets.ts
import {
  AttributeSetGetResponseSchema,
  AttributeSetListResponseSchema
} from "@umbraculum/pim-contracts";
async function listAttributeSets(client) {
  return getParsed(
    client,
    toClientPath("/pim/attribute-sets"),
    (data) => AttributeSetListResponseSchema.parse(data)
  );
}
async function getAttributeSet(client, setId) {
  return getParsed(
    client,
    toClientPath(`/pim/attribute-sets/${encodeURIComponent(setId)}`),
    (data) => AttributeSetGetResponseSchema.parse(data)
  );
}

// src/pim/categories.ts
import {
  CategoryListResponseSchema
} from "@umbraculum/pim-contracts";
async function listCategories(client) {
  return getParsed(
    client,
    toClientPath("/pim/categories"),
    (data) => CategoryListResponseSchema.parse(data)
  );
}

// src/pim/mediaAssetRefs.ts
import {
  MediaAssetRefCreateRequestSchema,
  MediaAssetRefGetResponseSchema,
  MediaAssetRefListResponseSchema,
  MediaAssetRefUpdateRequestSchema,
  PimDeleteResponseSchema as PimDeleteResponseSchema2
} from "@umbraculum/pim-contracts";
async function listProductMediaAssetRefs(client, productId) {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/media-asset-refs`),
    (data) => MediaAssetRefListResponseSchema.parse(data)
  );
}
async function createProductMediaAssetRef(client, productId, body) {
  const parsedBody = MediaAssetRefCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/media-asset-refs`),
    parsedBody,
    (data) => MediaAssetRefGetResponseSchema.parse(data),
    201
  );
}
async function getMediaAssetRef(client, mediaAssetRefId) {
  return getParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    (data) => MediaAssetRefGetResponseSchema.parse(data)
  );
}
async function patchMediaAssetRef(client, mediaAssetRefId, body) {
  const parsedBody = MediaAssetRefUpdateRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    parsedBody,
    (data) => MediaAssetRefGetResponseSchema.parse(data)
  );
}
async function deleteMediaAssetRef(client, mediaAssetRefId) {
  return deleteParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    (data) => PimDeleteResponseSchema2.parse(data)
  );
}
export {
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
};
