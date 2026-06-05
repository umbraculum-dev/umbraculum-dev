import type { PrismaClient } from "@prisma/client";

import { NotFoundError } from "../../errors.js";
import type { WorkspacesService } from "../workspacesService.js";

async function assertRecipeInWorkspace(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, workspaceId },
    select: { id: true, name: true, version: true },
  });
  if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
  return recipe;
}

export async function listSessionsForRecipe(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await assertRecipeInWorkspace(prisma, workspaces, userId, workspaceId, recipeId);
  return prisma.brewSession.findMany({
    where: { workspaceId, recipeId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSessionDetail(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const session = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
    include: {
      steps: { orderBy: { sortOrder: "asc" } },
      logs: { orderBy: { createdAt: "desc" }, take: 200 },
      recipe: { select: { id: true, name: true, version: true } },
    },
  });
  if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
  return session;
}
