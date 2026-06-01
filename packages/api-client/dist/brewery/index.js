import {
  deleteParsed,
  getParsed,
  patchParsed,
  postParsed,
  putParsed,
  toClientPath
} from "../chunk-67WUASDX.js";

// src/brewery/recipes.ts
import {
  parseBrewSessionCreateResponse,
  parseBrewSessionsListResponse,
  parseRecipesListResponse,
  RecipeResponseSchema
} from "@umbraculum/contracts";
async function listRecipes(client) {
  return getParsed(client, toClientPath("/recipes"), parseRecipesListResponse);
}
async function getRecipe(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => RecipeResponseSchema.parse(data)
  );
}
async function listBrewSessionsForRecipe(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    parseBrewSessionsListResponse
  );
}
async function createBrewSession(client, recipeId) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    {},
    parseBrewSessionCreateResponse,
    200
  );
}
async function patchRecipe(client, recipeId, patch) {
  return patchParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    patch,
    (data) => RecipeResponseSchema.parse(data)
  );
}

// src/brewery/water.ts
import { parseRecipeWaterHubSummaryResponse } from "@umbraculum/contracts";
async function getRecipeWaterHubSummary(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    parseRecipeWaterHubSummaryResponse
  );
}

// src/brewery/waterCalc.ts
import {
  WaterCalcResultOnlyResponseSchema,
  WaterCalcWithDerivationResponseSchema
} from "@umbraculum/contracts";
function postWithDerivation(client, path, payload) {
  return postParsed(
    client,
    toClientPath(path),
    payload,
    (data) => WaterCalcWithDerivationResponseSchema.parse(data)
  );
}
function postResultOnly(client, path, payload) {
  return postParsed(
    client,
    toClientPath(path),
    payload,
    (data) => WaterCalcResultOnlyResponseSchema.parse(data)
  );
}
async function calcSaltAdditions(client, payload) {
  return postWithDerivation(client, "/water-calc/salt-additions", payload);
}
async function estimateMashPh(client, payload) {
  return postResultOnly(client, "/water-calc/mash-ph-estimate", payload);
}
async function calcMashOverall(client, payload) {
  return postWithDerivation(client, "/water-calc/mash-overall", payload);
}
async function calcSpargeOverall(client, payload) {
  return postWithDerivation(client, "/water-calc/sparge-overall", payload);
}
async function calcBoilOverall(client, payload) {
  return postWithDerivation(client, "/water-calc/boil-overall", payload);
}
async function calcSpargeAcidification(client, payload) {
  return postWithDerivation(client, "/water-calc/sparge-acidification", payload);
}
async function calcSpargeAcidificationManual(client, payload) {
  return postWithDerivation(client, "/water-calc/sparge-acidification-manual", payload);
}
async function calcMashAcidification(client, payload) {
  return postWithDerivation(client, "/water-calc/mash-acidification", payload);
}
async function calcMashAcidificationManual(client, payload) {
  return postWithDerivation(client, "/water-calc/mash-acidification-manual", payload);
}
async function calcMashAcidificationTargetMashPh(client, payload) {
  return postResultOnly(client, "/water-calc/mash-acidification-target-mash-ph", payload);
}

// src/brewery/waterCompute.ts
import {
  parseBoilComputeAndSaveResponse,
  parseMashComputeAndSaveResponse,
  parseSpargeComputeAndSaveResponse
} from "@umbraculum/contracts";
async function computeAndSaveMash(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/mash/compute-and-save`),
    payload,
    parseMashComputeAndSaveResponse
  );
}
async function computeAndSaveSparge(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/sparge/compute-and-save`),
    payload,
    parseSpargeComputeAndSaveResponse
  );
}
async function computeAndSaveBoil(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/boil/compute-and-save`),
    payload,
    parseBoilComputeAndSaveResponse
  );
}

// src/brewery/waterProfiles.ts
import {
  OkResponseSchema,
  parseWaterProfilesResponse,
  WaterProfileCreateRequestSchema,
  WaterProfileResponseSchema
} from "@umbraculum/contracts";
async function listWaterProfiles(client) {
  return getParsed(client, toClientPath("/water-profiles"), parseWaterProfilesResponse);
}
async function createWaterProfile(client, body) {
  const parsedBody = WaterProfileCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/water-profiles"),
    parsedBody,
    (data) => WaterProfileResponseSchema.parse(data)
  );
}
async function verifyWaterProfile(client, profileId) {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/verify`),
    {},
    (data) => OkResponseSchema.parse(data)
  );
}
async function unverifyWaterProfile(client, profileId) {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/unverify`),
    {},
    (data) => OkResponseSchema.parse(data)
  );
}
async function deleteWaterProfile(client, profileId) {
  return deleteParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}`),
    (data) => OkResponseSchema.parse(data)
  );
}

// src/brewery/waterSettings.ts
import {
  RecipeWaterSettingsGetResponseSchema,
  RecipeWaterSettingsPutResponseSchema
} from "@umbraculum/contracts";
async function getRecipeWaterSettings(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    (data) => RecipeWaterSettingsGetResponseSchema.parse(data)
  );
}
async function updateRecipeWaterSettings(client, recipeId, patch) {
  return putParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    patch,
    (data) => RecipeWaterSettingsPutResponseSchema.parse(data)
  );
}
export {
  calcBoilOverall,
  calcMashAcidification,
  calcMashAcidificationManual,
  calcMashAcidificationTargetMashPh,
  calcMashOverall,
  calcSaltAdditions,
  calcSpargeAcidification,
  calcSpargeAcidificationManual,
  calcSpargeOverall,
  computeAndSaveBoil,
  computeAndSaveMash,
  computeAndSaveSparge,
  createBrewSession,
  createWaterProfile,
  deleteWaterProfile,
  estimateMashPh,
  getRecipe,
  getRecipeWaterHubSummary,
  getRecipeWaterSettings,
  listBrewSessionsForRecipe,
  listRecipes,
  listWaterProfiles,
  patchRecipe,
  unverifyWaterProfile,
  updateRecipeWaterSettings,
  verifyWaterProfile
};
