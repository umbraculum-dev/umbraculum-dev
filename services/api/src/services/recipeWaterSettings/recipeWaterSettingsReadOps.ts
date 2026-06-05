import type { PrismaClient } from "@prisma/client";

import type { RecipesService } from "../recipesService.js";
import type { WorkspacesService } from "../workspacesService.js";

export async function getRecipeWaterSettings(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  recipes: RecipesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  await recipes.getRecipe(userId, workspaceId, recipeId);

  return prisma.recipeWaterSettings.findUnique({
    where: { recipeId },
  });
}
