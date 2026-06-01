import {
  parseBoilComputeAndSaveResponse,
  parseMashComputeAndSaveResponse,
  parseSpargeComputeAndSaveResponse,
  type BoilComputeAndSaveResponseV1,
  type MashComputeAndSaveResponseV1,
  type SpargeComputeAndSaveResponseV1,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { postParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type MashComputeAndSavePath = "/recipes/{id}/water-settings/mash/compute-and-save";
type MashComputeAndSavePost = BreweryOpenApiPaths[MashComputeAndSavePath]["post"];

type SpargeComputeAndSavePath = "/recipes/{id}/water-settings/sparge/compute-and-save";
type SpargeComputeAndSavePost = BreweryOpenApiPaths[SpargeComputeAndSavePath]["post"];

type BoilComputeAndSavePath = "/recipes/{id}/water-settings/boil/compute-and-save";
type BoilComputeAndSavePost = BreweryOpenApiPaths[BoilComputeAndSavePath]["post"];

export type {
  MashComputeAndSavePost,
  SpargeComputeAndSavePost,
  BoilComputeAndSavePost,
  BoilComputeAndSaveResponseV1,
  MashComputeAndSaveResponseV1,
  SpargeComputeAndSaveResponseV1,
};

export async function computeAndSaveMash(
  client: ApiClient,
  recipeId: string,
  payload: Record<string, unknown>,
): Promise<MashComputeAndSaveResponseV1> {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/mash/compute-and-save`),
    payload,
    parseMashComputeAndSaveResponse,
  );
}

export async function computeAndSaveSparge(
  client: ApiClient,
  recipeId: string,
  payload: Record<string, unknown>,
): Promise<SpargeComputeAndSaveResponseV1> {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/sparge/compute-and-save`),
    payload,
    parseSpargeComputeAndSaveResponse,
  );
}

export async function computeAndSaveBoil(
  client: ApiClient,
  recipeId: string,
  payload: Record<string, unknown>,
): Promise<BoilComputeAndSaveResponseV1> {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/boil/compute-and-save`),
    payload,
    parseBoilComputeAndSaveResponse,
  );
}
