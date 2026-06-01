import {
  OkResponseSchema,
  parseWaterProfilesResponse,
  WaterProfileCreateRequestSchema,
  WaterProfileResponseSchema,
  type WaterProfile,
  type WaterProfilesResponse,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { deleteParsed, getParsed, postParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type WaterProfilesListPath = "/water-profiles";
type WaterProfilesListGet = BreweryOpenApiPaths[WaterProfilesListPath]["get"];

type WaterProfilesCreatePath = "/water-profiles";
type WaterProfilesCreatePost = BreweryOpenApiPaths[WaterProfilesCreatePath]["post"];

type WaterProfileVerifyPath = "/water-profiles/{id}/verify";
type WaterProfileVerifyPost = BreweryOpenApiPaths[WaterProfileVerifyPath]["post"];

type WaterProfileUnverifyPath = "/water-profiles/{id}/unverify";
type WaterProfileUnverifyPost = BreweryOpenApiPaths[WaterProfileUnverifyPath]["post"];

type WaterProfileDeletePath = "/water-profiles/{id}";
type WaterProfileDeleteDelete = BreweryOpenApiPaths[WaterProfileDeletePath]["delete"];

export type {
  WaterProfilesListGet,
  WaterProfilesCreatePost,
  WaterProfileVerifyPost,
  WaterProfileUnverifyPost,
  WaterProfileDeleteDelete,
};

export type { WaterProfile, WaterProfilesResponse };

export async function listWaterProfiles(client: ApiClient): Promise<WaterProfilesResponse> {
  return getParsed(client, toClientPath("/water-profiles"), parseWaterProfilesResponse);
}

export async function createWaterProfile(
  client: ApiClient,
  body: unknown,
): Promise<{ ok: true; profile: WaterProfile }> {
  const parsedBody = WaterProfileCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/water-profiles"),
    parsedBody,
    (data) => WaterProfileResponseSchema.parse(data),
  );
}

export async function verifyWaterProfile(client: ApiClient, profileId: string): Promise<{ ok: true }> {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/verify`),
    {},
    (data) => OkResponseSchema.parse(data),
  );
}

export async function unverifyWaterProfile(client: ApiClient, profileId: string): Promise<{ ok: true }> {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/unverify`),
    {},
    (data) => OkResponseSchema.parse(data),
  );
}

export async function deleteWaterProfile(client: ApiClient, profileId: string): Promise<{ ok: true }> {
  return deleteParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}`),
    (data) => OkResponseSchema.parse(data),
  );
}
