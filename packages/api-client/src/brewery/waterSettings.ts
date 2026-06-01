import {
  RecipeWaterSettingsGetResponseSchema,
  RecipeWaterSettingsPutResponseSchema,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, putParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type RecipeWaterSettingsPath = "/recipes/{id}/water-settings";
type RecipeWaterSettingsGet = BreweryOpenApiPaths[RecipeWaterSettingsPath]["get"];
type RecipeWaterSettingsPut = BreweryOpenApiPaths[RecipeWaterSettingsPath]["put"];

export type { RecipeWaterSettingsGet, RecipeWaterSettingsPut };

export async function getRecipeWaterSettings(
  client: ApiClient,
  recipeId: string,
): Promise<ReturnType<typeof RecipeWaterSettingsGetResponseSchema.parse>> {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    (data) => RecipeWaterSettingsGetResponseSchema.parse(data),
  );
}

export async function updateRecipeWaterSettings(
  client: ApiClient,
  recipeId: string,
  patch: Record<string, unknown>,
): Promise<ReturnType<typeof RecipeWaterSettingsPutResponseSchema.parse>> {
  return putParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    patch,
    (data) => RecipeWaterSettingsPutResponseSchema.parse(data),
  );
}
