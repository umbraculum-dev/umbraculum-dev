import { parseRecipeWaterHubSummaryResponse } from "@umbraculum/contracts";
import { apiFetch } from "./api";

export type { RecipeWaterHubStreamSummary, RecipeWaterHubSummary, RecipeWaterHubSummaryResponse } from "@umbraculum/contracts";
export { parseRecipeWaterHubSummaryResponse } from "@umbraculum/contracts";

export async function fetchRecipeWaterHubSummary(recipeId: string): Promise<import("@umbraculum/contracts").RecipeWaterHubSummaryResponse> {
  const res = await apiFetch(`/api/recipes/${recipeId}/water-hub-summary`);
  if (!res.ok) throw new Error(JSON.stringify(res.data));
  return parseRecipeWaterHubSummaryResponse(res.data);
}

