import { WaterCalcResultOnlyResponseSchema, WaterCalcWithDerivationResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { postParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type SaltAdditionsPath = "/water-calc/salt-additions";
type SaltAdditionsPost = BreweryOpenApiPaths[SaltAdditionsPath]["post"];

type MashPhEstimatePath = "/water-calc/mash-ph-estimate";
type MashPhEstimatePost = BreweryOpenApiPaths[MashPhEstimatePath]["post"];

type MashOverallPath = "/water-calc/mash-overall";
type MashOverallPost = BreweryOpenApiPaths[MashOverallPath]["post"];

type SpargeOverallPath = "/water-calc/sparge-overall";
type SpargeOverallPost = BreweryOpenApiPaths[SpargeOverallPath]["post"];

type BoilOverallPath = "/water-calc/boil-overall";
type BoilOverallPost = BreweryOpenApiPaths[BoilOverallPath]["post"];

type SpargeAcidificationPath = "/water-calc/sparge-acidification";
type SpargeAcidificationPost = BreweryOpenApiPaths[SpargeAcidificationPath]["post"];

type SpargeAcidificationManualPath = "/water-calc/sparge-acidification-manual";
type SpargeAcidificationManualPost = BreweryOpenApiPaths[SpargeAcidificationManualPath]["post"];

type MashAcidificationPath = "/water-calc/mash-acidification";
type MashAcidificationPost = BreweryOpenApiPaths[MashAcidificationPath]["post"];

type MashAcidificationManualPath = "/water-calc/mash-acidification-manual";
type MashAcidificationManualPost = BreweryOpenApiPaths[MashAcidificationManualPath]["post"];

type MashAcidificationTargetMashPhPath = "/water-calc/mash-acidification-target-mash-ph";
type MashAcidificationTargetMashPhPost = BreweryOpenApiPaths[MashAcidificationTargetMashPhPath]["post"];

export type WaterCalcWithDerivationResponse = ReturnType<
  typeof WaterCalcWithDerivationResponseSchema.parse
>;
export type WaterCalcResultOnlyResponse = ReturnType<typeof WaterCalcResultOnlyResponseSchema.parse>;

export type {
  SaltAdditionsPost,
  MashPhEstimatePost,
  MashOverallPost,
  SpargeOverallPost,
  BoilOverallPost,
  SpargeAcidificationPost,
  SpargeAcidificationManualPost,
  MashAcidificationPost,
  MashAcidificationManualPost,
  MashAcidificationTargetMashPhPost,
};

function postWithDerivation(
  client: ApiClient,
  path: `/${string}`,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postParsed(client, toClientPath(path), payload, (data) =>
    WaterCalcWithDerivationResponseSchema.parse(data),
  );
}

function postResultOnly(
  client: ApiClient,
  path: `/${string}`,
  payload: Record<string, unknown>,
): Promise<WaterCalcResultOnlyResponse> {
  return postParsed(client, toClientPath(path), payload, (data) =>
    WaterCalcResultOnlyResponseSchema.parse(data),
  );
}

export async function calcSaltAdditions(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/salt-additions", payload);
}

export async function estimateMashPh(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcResultOnlyResponse> {
  return postResultOnly(client, "/water-calc/mash-ph-estimate", payload);
}

export async function calcMashOverall(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/mash-overall", payload);
}

export async function calcSpargeOverall(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/sparge-overall", payload);
}

export async function calcBoilOverall(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/boil-overall", payload);
}

export async function calcSpargeAcidification(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/sparge-acidification", payload);
}

export async function calcSpargeAcidificationManual(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/sparge-acidification-manual", payload);
}

export async function calcMashAcidification(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/mash-acidification", payload);
}

export async function calcMashAcidificationManual(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcWithDerivationResponse> {
  return postWithDerivation(client, "/water-calc/mash-acidification-manual", payload);
}

export async function calcMashAcidificationTargetMashPh(
  client: ApiClient,
  payload: Record<string, unknown>,
): Promise<WaterCalcResultOnlyResponse> {
  return postResultOnly(client, "/water-calc/mash-acidification-target-mash-ph", payload);
}
