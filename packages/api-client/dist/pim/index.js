import {
  getParsed,
  postParsed,
  toClientPath
} from "../chunk-67WUASDX.js";

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
export {
  createProduct,
  getAttributeSet,
  getProduct,
  listAttributeSets,
  listCategories,
  listProductVariants,
  listProducts
};
