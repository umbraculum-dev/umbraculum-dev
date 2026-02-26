import { parseRecipeWaterHubSummaryResponse } from "@brewery/contracts";
import { apiFetch } from "./api";

export type { RecipeWaterHubStreamSummary, RecipeWaterHubSummary, RecipeWaterHubSummaryResponse } from "@brewery/contracts";
export { parseRecipeWaterHubSummaryResponse } from "@brewery/contracts";

export async function fetchRecipeWaterHubSummary(recipeId: string): Promise<import("@brewery/contracts").RecipeWaterHubSummaryResponse> {
  const res = await apiFetch(`/api/recipes/${recipeId}/water-hub-summary`);
  if (!res.ok) throw new Error(JSON.stringify(res.data));
  return parseRecipeWaterHubSummaryResponse(res.data);
}

