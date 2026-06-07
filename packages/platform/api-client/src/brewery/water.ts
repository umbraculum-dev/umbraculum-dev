import { parseRecipeWaterHubSummaryResponse } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type WaterHubSummaryPath = "/recipes/{id}/water-hub-summary";
type WaterHubSummaryGet = BreweryOpenApiPaths[WaterHubSummaryPath]["get"];

export type { WaterHubSummaryGet };

/** Recipe water hub summary for native/web water hub screens. */
export async function getRecipeWaterHubSummary(client: ApiClient, recipeId: string) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    parseRecipeWaterHubSummaryResponse,
  );
}
