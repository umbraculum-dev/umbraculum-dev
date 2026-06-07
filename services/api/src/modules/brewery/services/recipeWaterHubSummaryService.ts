import type { PrismaClient } from "@prisma/client";
import type { RecipeWaterHubSummary } from "@umbraculum/brewery-contracts";
import { WorkspacesService } from "../../../services/workspacesService.js";
import { RecipesService } from "../../../services/recipesService.js";
import { buildBoilStreamSummary } from "./recipeWaterHub/recipeWaterHubBoilSummary.js";
import { buildFinalRecap, mergeStreamSummaries } from "./recipeWaterHub/recipeWaterHubMergedSummary.js";
import {
  buildMashStreamContext,
  buildMashStreamSummary,
} from "./recipeWaterHub/recipeWaterHubMashSummary.js";
import { buildSpargeStreamSummary } from "./recipeWaterHub/recipeWaterHubSpargeSummary.js";
import { inferExpectedRa } from "./recipeWaterHub/recipeWaterHubSummaryTypes.js";

export class RecipeWaterHubSummaryService {
  private readonly workspaces: WorkspacesService;
  private readonly recipes: RecipesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.recipes = new RecipesService(prisma);
  }

  async get(userId: string, workspaceId: string, recipeId: string): Promise<RecipeWaterHubSummary> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const recipe = await this.recipes.getRecipe(userId, workspaceId, recipeId);

    const settings = await this.prisma.recipeWaterSettings.findUnique({ where: { recipeId } });

    const styleKey = recipe.styleKey;
    const style =
      typeof styleKey === "string" && styleKey && styleKey !== "custom"
        ? await this.prisma.beerStyle.findUnique({ where: { key: styleKey } })
        : null;
    const expectedRa = style ? inferExpectedRa({ name: style.name, category: style.category }) : null;

    const mashCtx = buildMashStreamContext(settings);
    const streams = [
      buildMashStreamSummary(settings, mashCtx),
      buildSpargeStreamSummary(settings),
      buildBoilStreamSummary(settings),
    ];

    const merged = mergeStreamSummaries(streams);

    return {
      version: 1,
      status: {
        mashAcidificationMode: settings?.mashAcidificationMode ?? null,
        spargeAcidificationMode: settings?.spargeAcidificationMode ?? null,
        boilAcidificationMode: settings?.boilAcidificationMode ?? null,
        mashLastCalculatedAt: settings?.mashLastCalculatedAt ? settings.mashLastCalculatedAt.toISOString() : null,
        spargeLastCalculatedAt: settings?.spargeLastCalculatedAt ? settings.spargeLastCalculatedAt.toISOString() : null,
        boilLastCalculatedAt: settings?.boilLastCalculatedAt ? settings.boilLastCalculatedAt.toISOString() : null,
        mashOverallSnapshot: mashCtx.mashOverall
          ? {
              ph: mashCtx.mashOverall.ph,
              finalAlkalinityPpmCaCO3: mashCtx.mashOverall.finalAlkalinityPpmCaCO3,
            }
          : null,
      },
      streams,
      merged,
      finalRecap: buildFinalRecap({
        mashOverall: mashCtx.mashOverall,
        mergedFinalAlk: merged.finalAlkalinityPpmCaCO3,
        mergedIons: merged.ionsPpm,
        expectedRa,
      }),
    };
  }
}
