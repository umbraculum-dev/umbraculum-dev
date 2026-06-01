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
  createBrewSession: () => createBrewSession,
  getRecipe: () => getRecipe,
  getRecipeWaterHubSummary: () => getRecipeWaterHubSummary,
  listBrewSessionsForRecipe: () => listBrewSessionsForRecipe,
  listRecipes: () => listRecipes
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

// src/brewery/water.ts
var import_contracts2 = require("@umbraculum/contracts");
async function getRecipeWaterHubSummary(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    import_contracts2.parseRecipeWaterHubSummaryResponse
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createBrewSession,
  getRecipe,
  getRecipeWaterHubSummary,
  listBrewSessionsForRecipe,
  listRecipes
});
