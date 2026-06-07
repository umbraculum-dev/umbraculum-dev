import { getRecipeWaterHubSummary } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";

export type { RecipeWaterHubStreamSummary, RecipeWaterHubSummary, RecipeWaterHubSummaryResponse } from "@umbraculum/brewery-contracts";

export async function fetchRecipeWaterHubSummary(recipeId: string) {
  return getRecipeWaterHubSummary(webBreweryApiClient(), recipeId);
}
