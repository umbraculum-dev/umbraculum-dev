import {
  parseBrewSessionCreateResponse,
  parseBrewSessionsListResponse,
  parseRecipesListResponse,
  RecipeResponseSchema,
  type BrewSessionListItem,
  type BrewSessionsListResponse,
  type RecipeListItem,
  type RecipesListResponse,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, postParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type RecipesListPath = "/recipes";
type RecipesListGet = BreweryOpenApiPaths[RecipesListPath]["get"];

type RecipeDetailPath = "/recipes/{id}";
type RecipeDetailGet = BreweryOpenApiPaths[RecipeDetailPath]["get"];

type BrewSessionsListPath = "/recipes/{recipeId}/brew-sessions";
type BrewSessionsListGet = BreweryOpenApiPaths[BrewSessionsListPath]["get"];

export type { RecipesListGet, RecipeDetailGet, BrewSessionsListGet };

export async function listRecipes(client: ApiClient): Promise<RecipesListResponse> {
  return getParsed(client, toClientPath("/recipes"), parseRecipesListResponse);
}

export async function getRecipe(client: ApiClient, recipeId: string) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => RecipeResponseSchema.parse(data),
  );
}

export async function listBrewSessionsForRecipe(
  client: ApiClient,
  recipeId: string,
): Promise<BrewSessionsListResponse> {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    parseBrewSessionsListResponse,
  );
}

export async function createBrewSession(
  client: ApiClient,
  recipeId: string,
): Promise<{ brewSession: { id: string } }> {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    {},
    parseBrewSessionCreateResponse,
    200,
  );
}

export type { BrewSessionListItem, RecipeListItem };
