import type { BrewSessionListItem, BrewSessionsListResponse, RecipeListItem, RecipesListResponse } from "@umbraculum/brewery-contracts";
import { OkResponseSchema, parseBrewSessionCreateResponse, parseBrewSessionsListResponse, parseRecipesListResponse, RecipeCreateRequestSchema, RecipeResponseSchema, RecipeVersionsResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { deleteParsed, getParsed, patchParsed, postParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "@umbraculum/api-client";

type RecipesListPath = "/recipes";
type RecipesListGet = BreweryOpenApiPaths[RecipesListPath]["get"];

type RecipeDetailPath = "/recipes/{id}";
type RecipeDetailGet = BreweryOpenApiPaths[RecipeDetailPath]["get"];

type BrewSessionsListPath = "/recipes/{recipeId}/brew-sessions";
type BrewSessionsListGet = BreweryOpenApiPaths[BrewSessionsListPath]["get"];

type RecipeVersionsPath = "/recipes/{id}/versions";
type RecipeVersionsGet = BreweryOpenApiPaths[RecipeVersionsPath]["get"];

type RecipeDuplicatePath = "/recipes/{id}/duplicate";
type RecipeDuplicatePost = BreweryOpenApiPaths[RecipeDuplicatePath]["post"];

export type { RecipesListGet, RecipeDetailGet, BrewSessionsListGet, RecipeVersionsGet, RecipeDuplicatePost };

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

export async function patchRecipe(client: ApiClient, recipeId: string, patch: Record<string, unknown>) {
  return patchParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    patch,
    (data) => RecipeResponseSchema.parse(data),
  );
}

export async function createRecipe(client: ApiClient, body: unknown) {
  const parsedBody = RecipeCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes"),
    parsedBody,
    (data) => RecipeResponseSchema.parse(data),
  );
}

export async function deleteRecipe(client: ApiClient, recipeId: string) {
  return deleteParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => OkResponseSchema.parse(data),
  );
}

export async function listRecipeVersions(client: ApiClient, recipeId: string) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/versions`),
    (data) => RecipeVersionsResponseSchema.parse(data),
  );
}

export async function createRecipeVersion(client: ApiClient, recipeId: string) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/versions`),
    {},
    (data) => RecipeResponseSchema.parse(data),
  );
}

export async function duplicateRecipe(client: ApiClient, recipeId: string) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/duplicate`),
    {},
    (data) => RecipeResponseSchema.parse(data),
  );
}

export type { BrewSessionListItem, RecipeListItem };
