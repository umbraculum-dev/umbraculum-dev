import {
  AttributeCreateRequestSchema,
  AttributeGetResponseSchema,
  AttributeListResponseSchema,
  AttributeUpdateRequestSchema,
  PimDeleteResponseSchema,
  type AttributeCreateRequest,
  type AttributeGetResponse,
  type AttributeListResponse,
  type AttributeUpdateRequest,
  type PimDeleteResponse,
} from "@umbraculum/pim-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { deleteParsed, getParsed, patchParsed, postParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type PimAttributesListPath = "/pim/attributes";
type PimAttributesListGet = PlatformOpenApiPaths[PimAttributesListPath]["get"];
type PimAttributesCreatePost = PlatformOpenApiPaths[PimAttributesListPath]["post"];

type PimAttributeDetailPath = "/pim/attributes/{attributeId}";
type PimAttributeDetailGet = PlatformOpenApiPaths[PimAttributeDetailPath]["get"];

export type {
  PimAttributesListGet,
  PimAttributesCreatePost,
  PimAttributeDetailGet,
  AttributeCreateRequest,
  AttributeGetResponse,
  AttributeListResponse,
  AttributeUpdateRequest,
  PimDeleteResponse,
};

export async function listAttributes(client: ApiClient): Promise<AttributeListResponse> {
  return getParsed(client, toClientPath("/pim/attributes"), (data) =>
    AttributeListResponseSchema.parse(data),
  );
}

export async function createAttribute(
  client: ApiClient,
  body: AttributeCreateRequest,
): Promise<AttributeGetResponse> {
  const parsedBody = AttributeCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/pim/attributes"),
    parsedBody,
    (data) => AttributeGetResponseSchema.parse(data),
    201,
  );
}

export async function getAttribute(
  client: ApiClient,
  attributeId: string,
): Promise<AttributeGetResponse> {
  return getParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    (data) => AttributeGetResponseSchema.parse(data),
  );
}

export async function patchAttribute(
  client: ApiClient,
  attributeId: string,
  body: AttributeUpdateRequest,
): Promise<AttributeGetResponse> {
  const parsedBody = AttributeUpdateRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    parsedBody,
    (data) => AttributeGetResponseSchema.parse(data),
  );
}

export async function deleteAttribute(
  client: ApiClient,
  attributeId: string,
): Promise<PimDeleteResponse> {
  return deleteParsed(
    client,
    toClientPath(`/pim/attributes/${encodeURIComponent(attributeId)}`),
    (data) => PimDeleteResponseSchema.parse(data),
  );
}
