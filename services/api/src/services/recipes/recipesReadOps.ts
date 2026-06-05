import type { BillingTier, PrismaClient } from "@prisma/client";

import { BadRequestError, NotFoundError } from "../../errors.js";
import { computeRecipeGravityAnalysis } from "../../domain/recipeAnalysis/gravityAnalysis.js";
import type { WorkspacesService } from "../workspacesService.js";

export async function getWorkspaceTier(prisma: PrismaClient, workspaceId: string): Promise<BillingTier> {
  const rec = await prisma.workspaceBilling.findUnique({
    where: { workspaceId },
    select: { tier: true },
  });
  return rec?.tier ?? "free";
}

export async function listLatestVersionsForWorkspace(prisma: PrismaClient, workspaceId: string) {
  const groups = await prisma.recipe.groupBy({
    by: ["versionGroupId"],
    where: { workspaceId },
    _max: { version: true },
  });

  const latestKeys = groups.map((g) => ({
    workspaceId,
    versionGroupId: g.versionGroupId,
    version: g._max.version ?? 0,
  }));

  if (latestKeys.length === 0) return [];

  return prisma.recipe.findMany({
    where: { OR: latestKeys },
    orderBy: { updatedAt: "desc" },
  });
}

export async function resolveStyleKey(prisma: PrismaClient, styleKeyRaw: string) {
  const styleKey = styleKeyRaw.trim();
  if (!styleKey) throw new BadRequestError("invalid_style_key", "Body.styleKey is required");
  const style = await prisma.beerStyle.findUnique({
    where: { key: styleKey },
    select: { key: true, name: true, isActive: true },
  });
  if (!style) throw new BadRequestError("style_not_found", "Style not found");
  if (!style.isActive) throw new BadRequestError("style_inactive", "Style is not active");
  return style;
}

export async function listRecipes(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);

  return listLatestVersionsForWorkspace(prisma, workspaceId);
}

export async function getRecipe(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);

  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, workspaceId },
  });
  if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
  return recipe;
}

export async function getRecipeWithAnalysis(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  const recipe = await getRecipe(prisma, workspaces, userId, workspaceId, recipeId);
  const waterSettings = await prisma.recipeWaterSettings.findUnique({
    where: { recipeId: recipe.id },
  });
  const analysis = computeRecipeGravityAnalysis({
    beerJsonRecipeJson: recipe.beerJsonRecipeJson,
    recipeExtJson: recipe.recipeExtJson,
    recipeWaterSettings: waterSettings,
  });
  return { ...recipe, analysis };
}

export async function listRecipeVersions(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);

  const recipe = await getRecipe(prisma, workspaces, userId, workspaceId, recipeId);
  const versionGroupId = recipe.versionGroupId ?? recipe.id ?? recipeId;

  return prisma.recipe.findMany({
    where: { workspaceId, versionGroupId },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getRecipeForWorkspace(prisma: PrismaClient, recipeId: string, workspaceId: string) {
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, workspaceId },
  });
  if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
  return recipe;
}

export async function listRecipesForWorkspace(prisma: PrismaClient, workspaceId: string) {
  return listLatestVersionsForWorkspace(prisma, workspaceId);
}
