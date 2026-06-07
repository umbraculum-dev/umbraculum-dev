import { Prisma, type PrismaClient } from "@prisma/client";

import { BadRequestError, ForbiddenError } from "../../../../errors.js";
import { isObject } from "../../../../lib/typeGuards.js";
import { getTierLimits } from "../../../../services/tierLimitsService.js";
import type { WorkspacesService } from "../../../../services/workspacesService.js";
import { getRecipe, getWorkspaceTier } from "./recipesReadOps.js";

export async function assertRecipeLimitForWorkspace(prisma: PrismaClient, workspaceId: string): Promise<void> {
  const tier = await getWorkspaceTier(prisma, workspaceId);
  const limits = getTierLimits(tier);
  const groups = await prisma.recipe.groupBy({
    by: ["versionGroupId"],
    where: { workspaceId },
  });
  if (groups.length >= limits.maxRecipesPerWorkspace) {
    throw new ForbiddenError("plan_limit_recipes", "Recipe limit reached. Upgrade to add more.");
  }
}

export async function createRecipeVersionFromCurrent(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);

  const source = await getRecipe(prisma, workspaces, userId, workspaceId, recipeId);
  const versionGroupId = source.versionGroupId ?? source.id ?? recipeId;
  const tier = await getWorkspaceTier(prisma, workspaceId);
  const limits = getTierLimits(tier);

  return prisma.$transaction(async (tx) => {
    const agg = await tx.recipe.aggregate({
      where: { workspaceId, versionGroupId },
      _max: { version: true },
    });

    const maxVersion = agg._max.version ?? 0;
    if (maxVersion >= limits.maxVersionsPerRecipe - 1) {
      throw new ForbiddenError("plan_limit_versions", "Version limit reached. Upgrade to add more versions.");
    }
    if (maxVersion >= 99) {
      throw new BadRequestError(
        "max_versions_reached",
        "Maximum versions reached (0–99)."
      );
    }

    const nextVersion = maxVersion + 1;
    const newRecipeId = crypto.randomUUID();

    const created = await tx.recipe.create({
      data: {
        id: newRecipeId,
        workspaceId,
        versionGroupId,
        version: nextVersion,
        name: source.name,
        style: source.style,
        styleKey: source.styleKey,
        notes: source.notes,
        beerJsonRecipeJson: source.beerJsonRecipeJson ?? Prisma.JsonNull,
        recipeExtJson: source.recipeExtJson ?? Prisma.JsonNull,
      },
    });

    const sourceWater = await tx.recipeWaterSettings.findUnique({
      where: { recipeId: source.id },
    });

    if (sourceWater) {
      const {
        id: _id,
        recipeId: _sourceRecipeId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...rest
      } = sourceWater;

      await tx.recipeWaterSettings.create({
        data: {
          ...rest,
          recipeId: newRecipeId,
          workspaceId,
        } as Prisma.RecipeWaterSettingsUncheckedCreateInput,
      });
    }

    return created;
  });
}

export async function duplicateRecipe(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  await assertRecipeLimitForWorkspace(prisma, workspaceId);

  const source = await getRecipe(prisma, workspaces, userId, workspaceId, recipeId);

  return prisma.$transaction(async (tx) => {
    const newRecipeId = crypto.randomUUID();
    const newName = ((source.name ?? "")).trim() + " - duplicated";

    const doc = source.beerJsonRecipeJson;
    const docCopy: Record<string, unknown> | null =
      isObject(doc) ? (JSON.parse(JSON.stringify(doc)) as Record<string, unknown>) : null;
    const docCopyBeerjson = isObject(docCopy?.['beerjson']) ? docCopy['beerjson'] : null;
    const docCopyRecipes = Array.isArray(docCopyBeerjson?.['recipes']) ? docCopyBeerjson['recipes'] : null;
    if (docCopyRecipes && isObject(docCopyRecipes[0])) {
      (docCopyRecipes[0])['name'] = newName;
    }

    const created = await tx.recipe.create({
      data: {
        id: newRecipeId,
        workspaceId,
        versionGroupId: newRecipeId,
        version: 0,
        name: newName,
        style: source.style,
        styleKey: source.styleKey,
        notes: source.notes,
        beerJsonRecipeJson:
          (docCopy as Prisma.InputJsonValue | undefined) ??
          (source.beerJsonRecipeJson as Prisma.InputJsonValue | null) ??
          Prisma.JsonNull,
        recipeExtJson: source.recipeExtJson ?? Prisma.JsonNull,
      },
    });

    const sourceWater = await tx.recipeWaterSettings.findUnique({
      where: { recipeId: source.id },
    });

    if (sourceWater) {
      const {
        id: _id,
        recipeId: _sourceRecipeId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...rest
      } = sourceWater;

      await tx.recipeWaterSettings.create({
        data: {
          ...rest,
          recipeId: newRecipeId,
          workspaceId,
        } as Prisma.RecipeWaterSettingsUncheckedCreateInput,
      });
    }

    return created;
  });
}
