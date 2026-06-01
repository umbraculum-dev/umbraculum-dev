import * as _umbraculum_contracts from '@umbraculum/contracts';
import { BrewSessionsListResponse, RecipesListResponse } from '@umbraculum/contracts';
export { BrewSessionListItem, RecipeListItem } from '@umbraculum/contracts';
import { p as paths, a as ApiClient } from '../brewery.openapi-BgnnB0s0.js';

type RecipesListPath = "/recipes";
type RecipesListGet = paths[RecipesListPath]["get"];
type RecipeDetailPath = "/recipes/{id}";
type RecipeDetailGet = paths[RecipeDetailPath]["get"];
type BrewSessionsListPath = "/recipes/{recipeId}/brew-sessions";
type BrewSessionsListGet = paths[BrewSessionsListPath]["get"];

declare function listRecipes(client: ApiClient): Promise<RecipesListResponse>;
declare function getRecipe(client: ApiClient, recipeId: string): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
}>;
declare function listBrewSessionsForRecipe(client: ApiClient, recipeId: string): Promise<BrewSessionsListResponse>;
declare function createBrewSession(client: ApiClient, recipeId: string): Promise<{
    brewSession: {
        id: string;
    };
}>;

type WaterHubSummaryPath = "/recipes/{id}/water-hub-summary";
type WaterHubSummaryGet = paths[WaterHubSummaryPath]["get"];

/** Thin wrapper — full water-calc facade family lands in a follow-on PR. */
declare function getRecipeWaterHubSummary(client: ApiClient, recipeId: string): Promise<_umbraculum_contracts.RecipeWaterHubSummaryResponse>;

export { type BrewSessionsListGet, type RecipeDetailGet, type RecipesListGet, type WaterHubSummaryGet, createBrewSession, getRecipe, getRecipeWaterHubSummary, listBrewSessionsForRecipe, listRecipes };
