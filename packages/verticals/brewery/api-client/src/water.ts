import { parseRecipeWaterHubSummaryResponse } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { getParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "@umbraculum/api-client";

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
