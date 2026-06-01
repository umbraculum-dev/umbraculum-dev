import * as _umbraculum_contracts from '@umbraculum/contracts';
import { BrewSessionsListResponse, RecipesListResponse, BoilComputeAndSaveResponseV1, MashComputeAndSaveResponseV1, SpargeComputeAndSaveResponseV1, WaterProfile, WaterProfilesResponse, RecipeWaterSettingsGetResponseSchema, RecipeWaterSettingsPutResponseSchema } from '@umbraculum/contracts';
export { BoilComputeAndSaveResponseV1, BrewSessionListItem, MashComputeAndSaveResponseV1, RecipeListItem, SpargeComputeAndSaveResponseV1, WaterProfile, WaterProfilesResponse } from '@umbraculum/contracts';
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
declare function patchRecipe(client: ApiClient, recipeId: string, patch: Record<string, unknown>): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
}>;

type WaterHubSummaryPath = "/recipes/{id}/water-hub-summary";
type WaterHubSummaryGet = paths[WaterHubSummaryPath]["get"];

/** Thin wrapper — full water-calc facade family lands in a follow-on PR. */
declare function getRecipeWaterHubSummary(client: ApiClient, recipeId: string): Promise<_umbraculum_contracts.RecipeWaterHubSummaryResponse>;

type MashComputeAndSavePath = "/recipes/{id}/water-settings/mash/compute-and-save";
type MashComputeAndSavePost = paths[MashComputeAndSavePath]["post"];
type SpargeComputeAndSavePath = "/recipes/{id}/water-settings/sparge/compute-and-save";
type SpargeComputeAndSavePost = paths[SpargeComputeAndSavePath]["post"];
type BoilComputeAndSavePath = "/recipes/{id}/water-settings/boil/compute-and-save";
type BoilComputeAndSavePost = paths[BoilComputeAndSavePath]["post"];

declare function computeAndSaveMash(client: ApiClient, recipeId: string, payload: Record<string, unknown>): Promise<MashComputeAndSaveResponseV1>;
declare function computeAndSaveSparge(client: ApiClient, recipeId: string, payload: Record<string, unknown>): Promise<SpargeComputeAndSaveResponseV1>;
declare function computeAndSaveBoil(client: ApiClient, recipeId: string, payload: Record<string, unknown>): Promise<BoilComputeAndSaveResponseV1>;

type WaterProfilesListPath = "/water-profiles";
type WaterProfilesListGet = paths[WaterProfilesListPath]["get"];
type WaterProfilesCreatePath = "/water-profiles";
type WaterProfilesCreatePost = paths[WaterProfilesCreatePath]["post"];
type WaterProfileVerifyPath = "/water-profiles/{id}/verify";
type WaterProfileVerifyPost = paths[WaterProfileVerifyPath]["post"];
type WaterProfileUnverifyPath = "/water-profiles/{id}/unverify";
type WaterProfileUnverifyPost = paths[WaterProfileUnverifyPath]["post"];
type WaterProfileDeletePath = "/water-profiles/{id}";
type WaterProfileDeleteDelete = paths[WaterProfileDeletePath]["delete"];

declare function listWaterProfiles(client: ApiClient): Promise<WaterProfilesResponse>;
declare function createWaterProfile(client: ApiClient, body: unknown): Promise<{
    ok: true;
    profile: WaterProfile;
}>;
declare function verifyWaterProfile(client: ApiClient, profileId: string): Promise<{
    ok: true;
}>;
declare function unverifyWaterProfile(client: ApiClient, profileId: string): Promise<{
    ok: true;
}>;
declare function deleteWaterProfile(client: ApiClient, profileId: string): Promise<{
    ok: true;
}>;

type RecipeWaterSettingsPath = "/recipes/{id}/water-settings";
type RecipeWaterSettingsGet = paths[RecipeWaterSettingsPath]["get"];
type RecipeWaterSettingsPut = paths[RecipeWaterSettingsPath]["put"];

declare function getRecipeWaterSettings(client: ApiClient, recipeId: string): Promise<ReturnType<typeof RecipeWaterSettingsGetResponseSchema.parse>>;
declare function updateRecipeWaterSettings(client: ApiClient, recipeId: string, patch: Record<string, unknown>): Promise<ReturnType<typeof RecipeWaterSettingsPutResponseSchema.parse>>;

export { type BoilComputeAndSavePost, type BrewSessionsListGet, type MashComputeAndSavePost, type RecipeDetailGet, type RecipeWaterSettingsGet, type RecipeWaterSettingsPut, type RecipesListGet, type SpargeComputeAndSavePost, type WaterHubSummaryGet, type WaterProfileDeleteDelete, type WaterProfileUnverifyPost, type WaterProfileVerifyPost, type WaterProfilesCreatePost, type WaterProfilesListGet, computeAndSaveBoil, computeAndSaveMash, computeAndSaveSparge, createBrewSession, createWaterProfile, deleteWaterProfile, getRecipe, getRecipeWaterHubSummary, getRecipeWaterSettings, listBrewSessionsForRecipe, listRecipes, listWaterProfiles, patchRecipe, unverifyWaterProfile, updateRecipeWaterSettings, verifyWaterProfile };
