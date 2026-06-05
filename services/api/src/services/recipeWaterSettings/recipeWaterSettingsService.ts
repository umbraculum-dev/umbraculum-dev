import type { PrismaClient } from "@prisma/client";

import { RecipesService } from "../recipesService.js";
import { WorkspacesService } from "../workspacesService.js";
import { getRecipeWaterSettings } from "./recipeWaterSettingsReadOps.js";
import { toUpsertInputFromPutBody } from "./recipeWaterSettingsMapper.js";
import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";
import { upsertRecipeWaterSettings } from "./recipeWaterSettingsWriteOps.js";

export type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export class RecipeWaterSettingsService {
  private readonly workspaces: WorkspacesService;
  private readonly recipes: RecipesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.recipes = new RecipesService(prisma);
  }

  toUpsertInputFromPutBody(body: Record<string, unknown>) {
    return toUpsertInputFromPutBody(body);
  }

  async get(userId: string, workspaceId: string, recipeId: string) {
    return getRecipeWaterSettings(this.prisma, this.workspaces, this.recipes, userId, workspaceId, recipeId);
  }

  async upsert(userId: string, workspaceId: string, recipeId: string, input: UpsertRecipeWaterSettingsInput) {
    return upsertRecipeWaterSettings(
      this.prisma,
      this.workspaces,
      this.recipes,
      userId,
      workspaceId,
      recipeId,
      input,
    );
  }
}
