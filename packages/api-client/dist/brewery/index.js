import {
  getParsed,
  postParsed,
  toClientPath
} from "../chunk-WH3JLE2U.js";

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

// src/brewery/water.ts
import { parseRecipeWaterHubSummaryResponse } from "@umbraculum/contracts";
async function getRecipeWaterHubSummary(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    parseRecipeWaterHubSummaryResponse
  );
}
export {
  createBrewSession,
  getRecipe,
  getRecipeWaterHubSummary,
  listBrewSessionsForRecipe,
  listRecipes
};
