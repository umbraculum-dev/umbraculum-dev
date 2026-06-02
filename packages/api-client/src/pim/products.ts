import {
  ProductCreateRequestSchema,
  ProductGetResponseSchema,
  ProductListResponseSchema,
  VariantListResponseSchema,
  type ProductCreateRequest,
  type ProductGetResponse,
  type ProductListResponse,
  type VariantListResponse,
} from "@umbraculum/pim-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, postParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type PimProductsListPath = "/pim/products";
type PimProductsListGet = PlatformOpenApiPaths[PimProductsListPath]["get"];
type PimProductsCreatePost = PlatformOpenApiPaths[PimProductsListPath]["post"];

type PimProductDetailPath = "/pim/products/{productId}";
type PimProductDetailGet = PlatformOpenApiPaths[PimProductDetailPath]["get"];

type PimProductVariantsPath = "/pim/products/{productId}/variants";
type PimProductVariantsListGet = PlatformOpenApiPaths[PimProductVariantsPath]["get"];

export type {
  PimProductsListGet,
  PimProductsCreatePost,
  PimProductDetailGet,
  PimProductVariantsListGet,
};

export async function listProducts(client: ApiClient): Promise<ProductListResponse> {
  return getParsed(client, toClientPath("/pim/products"), (data) =>
    ProductListResponseSchema.parse(data),
  );
}

export async function createProduct(
  client: ApiClient,
  body: ProductCreateRequest,
): Promise<ProductGetResponse> {
  const parsedBody = ProductCreateRequestSchema.parse(body);
  return postParsed(client, toClientPath("/pim/products"), parsedBody, (data) =>
    ProductGetResponseSchema.parse(data),
  );
}

export async function getProduct(client: ApiClient, productId: string): Promise<ProductGetResponse> {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}`),
    (data) => ProductGetResponseSchema.parse(data),
  );
}

export async function listProductVariants(
  client: ApiClient,
  productId: string,
): Promise<VariantListResponse> {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/variants`),
    (data) => VariantListResponseSchema.parse(data),
  );
}
