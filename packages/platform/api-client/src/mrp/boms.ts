import {
  BomGetResponseSchema,
  BomListResponseSchema,
  MrpDeleteResponseSchema,
  type Bom,
  type BomGetResponse,
  type BomLine,
  type BomListResponse,
  type MrpDeleteResponse,
} from "@umbraculum/mrp-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { deleteParsed, getParsed, patchParsed, postParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type MrpBomsListPath = "/mrp/boms";
type MrpBomsListGet = PlatformOpenApiPaths[MrpBomsListPath]["get"];

type MrpBomDetailPath = "/mrp/boms/{bomId}";
type MrpBomDetailGet = PlatformOpenApiPaths[MrpBomDetailPath]["get"];

export type BomCreateRequest = {
  code: string;
  name: string;
  ownerModule: string | null;
  sourceRefId: string | null;
  lines: Array<Omit<BomLine, "id" | "bomId">>;
};

export type BomUpdateRequest = Partial<{
  code: string;
  name: string;
  ownerModule: string | null;
  sourceRefId: string | null;
  lines: Array<Omit<BomLine, "id" | "bomId">>;
}>;

export type { MrpBomsListGet, MrpBomDetailGet, Bom, BomGetResponse, BomListResponse, MrpDeleteResponse };

export async function listBoms(client: ApiClient): Promise<BomListResponse> {
  return getParsed(client, toClientPath("/mrp/boms"), (data) => BomListResponseSchema.parse(data));
}

export async function createBom(client: ApiClient, body: BomCreateRequest): Promise<BomGetResponse> {
  return postParsed(client, toClientPath("/mrp/boms"), body, (data) => BomGetResponseSchema.parse(data));
}

export async function getBom(client: ApiClient, bomId: string): Promise<BomGetResponse> {
  return getParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    (data) => BomGetResponseSchema.parse(data),
  );
}

export async function patchBom(
  client: ApiClient,
  bomId: string,
  body: BomUpdateRequest,
): Promise<BomGetResponse> {
  return patchParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    body,
    (data) => BomGetResponseSchema.parse(data),
  );
}

export async function deleteBom(client: ApiClient, bomId: string): Promise<MrpDeleteResponse> {
  return deleteParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    (data) => MrpDeleteResponseSchema.parse(data),
  );
}
