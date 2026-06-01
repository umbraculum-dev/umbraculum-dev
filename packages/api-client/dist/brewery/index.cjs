"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/brewery/index.ts
var brewery_exports = {};
__export(brewery_exports, {
  computeAndSaveBoil: () => computeAndSaveBoil,
  computeAndSaveMash: () => computeAndSaveMash,
  computeAndSaveSparge: () => computeAndSaveSparge,
  createBrewSession: () => createBrewSession,
  createWaterProfile: () => createWaterProfile,
  deleteWaterProfile: () => deleteWaterProfile,
  getRecipe: () => getRecipe,
  getRecipeWaterHubSummary: () => getRecipeWaterHubSummary,
  getRecipeWaterSettings: () => getRecipeWaterSettings,
  listBrewSessionsForRecipe: () => listBrewSessionsForRecipe,
  listRecipes: () => listRecipes,
  listWaterProfiles: () => listWaterProfiles,
  patchRecipe: () => patchRecipe,
  unverifyWaterProfile: () => unverifyWaterProfile,
  updateRecipeWaterSettings: () => updateRecipeWaterSettings,
  verifyWaterProfile: () => verifyWaterProfile
});
module.exports = __toCommonJS(brewery_exports);

// src/brewery/recipes.ts
var import_contracts = require("@umbraculum/contracts");

// src/internal/clientPath.ts
function toClientPath(openApiPath) {
  return `/api${openApiPath}`;
}

// src/errors.ts
var ApiClientError = class extends Error {
  status;
  body;
  constructor(res) {
    const detail = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    super(detail || `API request failed (${res.status})`);
    this.name = "ApiClientError";
    this.status = res.status;
    this.body = res.data;
  }
};

// src/internal/httpJson.ts
function assertOk(res, expectedStatus = 200) {
  if (res.status !== expectedStatus || !res.ok) {
    throw new ApiClientError(res);
  }
}
async function getParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.get(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function postParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.post(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function putParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.put(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function patchParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.patch(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function deleteParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.delete(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

// src/brewery/recipes.ts
async function listRecipes(client) {
  return getParsed(client, toClientPath("/recipes"), import_contracts.parseRecipesListResponse);
}
async function getRecipe(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => import_contracts.RecipeResponseSchema.parse(data)
  );
}
async function listBrewSessionsForRecipe(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    import_contracts.parseBrewSessionsListResponse
  );
}
async function createBrewSession(client, recipeId) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    {},
    import_contracts.parseBrewSessionCreateResponse,
    200
  );
}
async function patchRecipe(client, recipeId, patch) {
  return patchParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    patch,
    (data) => import_contracts.RecipeResponseSchema.parse(data)
  );
}

// src/brewery/water.ts
var import_contracts2 = require("@umbraculum/contracts");
async function getRecipeWaterHubSummary(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    import_contracts2.parseRecipeWaterHubSummaryResponse
  );
}

// src/brewery/waterCompute.ts
var import_contracts3 = require("@umbraculum/contracts");
async function computeAndSaveMash(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/mash/compute-and-save`),
    payload,
    import_contracts3.parseMashComputeAndSaveResponse
  );
}
async function computeAndSaveSparge(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/sparge/compute-and-save`),
    payload,
    import_contracts3.parseSpargeComputeAndSaveResponse
  );
}
async function computeAndSaveBoil(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/boil/compute-and-save`),
    payload,
    import_contracts3.parseBoilComputeAndSaveResponse
  );
}

// src/brewery/waterProfiles.ts
var import_contracts4 = require("@umbraculum/contracts");
async function listWaterProfiles(client) {
  return getParsed(client, toClientPath("/water-profiles"), import_contracts4.parseWaterProfilesResponse);
}
async function createWaterProfile(client, body) {
  const parsedBody = import_contracts4.WaterProfileCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/water-profiles"),
    parsedBody,
    (data) => import_contracts4.WaterProfileResponseSchema.parse(data)
  );
}
async function verifyWaterProfile(client, profileId) {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/verify`),
    {},
    (data) => import_contracts4.OkResponseSchema.parse(data)
  );
}
async function unverifyWaterProfile(client, profileId) {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/unverify`),
    {},
    (data) => import_contracts4.OkResponseSchema.parse(data)
  );
}
async function deleteWaterProfile(client, profileId) {
  return deleteParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}`),
    (data) => import_contracts4.OkResponseSchema.parse(data)
  );
}

// src/brewery/waterSettings.ts
var import_contracts5 = require("@umbraculum/contracts");
async function getRecipeWaterSettings(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    (data) => import_contracts5.RecipeWaterSettingsGetResponseSchema.parse(data)
  );
}
async function updateRecipeWaterSettings(client, recipeId, patch) {
  return putParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    patch,
    (data) => import_contracts5.RecipeWaterSettingsPutResponseSchema.parse(data)
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  computeAndSaveBoil,
  computeAndSaveMash,
  computeAndSaveSparge,
  createBrewSession,
  createWaterProfile,
  deleteWaterProfile,
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
});
