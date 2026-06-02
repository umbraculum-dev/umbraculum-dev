import {
  MediaAssetRefCreateRequestSchema,
  MediaAssetRefGetResponseSchema,
  MediaAssetRefListResponseSchema,
  MediaAssetRefUpdateRequestSchema,
  PimDeleteResponseSchema,
  type MediaAssetRefCreateRequest,
  type MediaAssetRefGetResponse,
  type MediaAssetRefListResponse,
  type MediaAssetRefUpdateRequest,
  type PimDeleteResponse,
} from "@umbraculum/pim-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { deleteParsed, getParsed, patchParsed, postParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type PimProductMediaRefsPath = "/pim/products/{productId}/media-asset-refs";
type PimProductMediaRefsListGet = PlatformOpenApiPaths[PimProductMediaRefsPath]["get"];
type PimProductMediaRefsCreatePost = PlatformOpenApiPaths[PimProductMediaRefsPath]["post"];

type PimMediaAssetRefDetailPath = "/pim/media-asset-refs/{mediaAssetRefId}";
type PimMediaAssetRefDetailGet = PlatformOpenApiPaths[PimMediaAssetRefDetailPath]["get"];

export type {
  PimProductMediaRefsListGet,
  PimProductMediaRefsCreatePost,
  PimMediaAssetRefDetailGet,
  MediaAssetRefCreateRequest,
  MediaAssetRefGetResponse,
  MediaAssetRefListResponse,
  MediaAssetRefUpdateRequest,
  PimDeleteResponse,
};

export async function listProductMediaAssetRefs(
  client: ApiClient,
  productId: string,
): Promise<MediaAssetRefListResponse> {
  return getParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/media-asset-refs`),
    (data) => MediaAssetRefListResponseSchema.parse(data),
  );
}

export async function createProductMediaAssetRef(
  client: ApiClient,
  productId: string,
  body: MediaAssetRefCreateRequest,
): Promise<MediaAssetRefGetResponse> {
  const parsedBody = MediaAssetRefCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath(`/pim/products/${encodeURIComponent(productId)}/media-asset-refs`),
    parsedBody,
    (data) => MediaAssetRefGetResponseSchema.parse(data),
    201,
  );
}

export async function getMediaAssetRef(
  client: ApiClient,
  mediaAssetRefId: string,
): Promise<MediaAssetRefGetResponse> {
  return getParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    (data) => MediaAssetRefGetResponseSchema.parse(data),
  );
}

export async function patchMediaAssetRef(
  client: ApiClient,
  mediaAssetRefId: string,
  body: MediaAssetRefUpdateRequest,
): Promise<MediaAssetRefGetResponse> {
  const parsedBody = MediaAssetRefUpdateRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    parsedBody,
    (data) => MediaAssetRefGetResponseSchema.parse(data),
  );
}

export async function deleteMediaAssetRef(
  client: ApiClient,
  mediaAssetRefId: string,
): Promise<PimDeleteResponse> {
  return deleteParsed(
    client,
    toClientPath(`/pim/media-asset-refs/${encodeURIComponent(mediaAssetRefId)}`),
    (data) => PimDeleteResponseSchema.parse(data),
  );
}
