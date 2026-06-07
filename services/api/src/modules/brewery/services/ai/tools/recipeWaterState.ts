import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";

import { RecipeWaterSettingsService } from "../../recipeWaterSettingsService.js";

interface RecipeWaterStateInput {
  recipeId: string;
}

interface RecipeWaterStateOutput {
  recipeId: string;
  hasSettings: boolean;
  sourceWaterProfileId: string | null;
  targetWaterProfileId: string | null;
  dilutionWaterProfileId: string | null;
  tapWaterVolumeLiters: number | null;
  dilutionWaterVolumeLiters: number | null;
  /** Mash settings — null when no row exists or no value computed yet. */
  mashStartingAlkalinityPpmCaCO3: number | null;
  mashStartingPh: number | null;
  mashTargetPh: number | null;
  mashWaterVolumeLiters: number | null;
  /** Last computation results (null when never computed). */
  lastFinalAlkalinityPpmCaCO3: number | null;
  lastSulfateAddedPpm: number | null;
  lastChlorideAddedPpm: number | null;
  lastCalculatedAt: string | null;
}

export function createRecipeWaterStateTool(prisma: PrismaClient): AiTool<RecipeWaterStateInput, RecipeWaterStateOutput> {
  const water = new RecipeWaterSettingsService(prisma);

  return {
    name: "brewery.recipeWaterState",
    description:
      "Return the water profile, salt additions, and predicted mash pH for a recipe in the user's workspace.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        recipeId: { type: "string", description: "Recipe id (UUID) to fetch water settings for" },
      },
      required: ["recipeId"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const row = await water.get(ctx.userId, ctx.workspaceId, input.recipeId);
      if (!row) {
        return {
          recipeId: input.recipeId,
          hasSettings: false,
          sourceWaterProfileId: null,
          targetWaterProfileId: null,
          dilutionWaterProfileId: null,
          tapWaterVolumeLiters: null,
          dilutionWaterVolumeLiters: null,
          mashStartingAlkalinityPpmCaCO3: null,
          mashStartingPh: null,
          mashTargetPh: null,
          mashWaterVolumeLiters: null,
          lastFinalAlkalinityPpmCaCO3: null,
          lastSulfateAddedPpm: null,
          lastChlorideAddedPpm: null,
          lastCalculatedAt: null,
        };
      }
      return {
        recipeId: input.recipeId,
        hasSettings: true,
        sourceWaterProfileId: row.sourceWaterProfileId ?? null,
        targetWaterProfileId: row.targetWaterProfileId ?? null,
        dilutionWaterProfileId: row.dilutionWaterProfileId ?? null,
        tapWaterVolumeLiters: row.tapWaterVolumeLiters ?? null,
        dilutionWaterVolumeLiters: row.dilutionWaterVolumeLiters ?? null,
        mashStartingAlkalinityPpmCaCO3: row.mashStartingAlkalinityPpmCaCO3 ?? null,
        mashStartingPh: row.mashStartingPh ?? null,
        mashTargetPh: row.mashTargetPh ?? null,
        mashWaterVolumeLiters: row.mashWaterVolumeLiters ?? null,
        lastFinalAlkalinityPpmCaCO3: row.mashLastFinalAlkalinityPpmCaCO3 ?? null,
        lastSulfateAddedPpm: row.mashLastSulfateAddedPpm ?? null,
        lastChlorideAddedPpm: row.mashLastChlorideAddedPpm ?? null,
        lastCalculatedAt: row.mashLastCalculatedAt ? row.mashLastCalculatedAt.toISOString() : null,
      };
    },
  };
}
