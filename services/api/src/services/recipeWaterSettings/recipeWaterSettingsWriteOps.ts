import { Prisma, type PrismaClient, type RecipeWaterSettings } from "@prisma/client";

import { BadRequestError, ForbiddenError } from "../../errors.js";
import type { RecipesService } from "../recipesService.js";
import type { WorkspacesService } from "../workspacesService.js";
import { applyBoilUpsertFields } from "./recipeWaterSettingsWriteOpsBoilFields.js";
import { applyMashUpsertFields } from "./recipeWaterSettingsWriteOpsMashFields.js";
import { applySpargeUpsertFields } from "./recipeWaterSettingsWriteOpsSpargeFields.js";
import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

function buildUpsertDataFromInput(
  workspaceId: string,
  recipeId: string,
  input: UpsertRecipeWaterSettingsInput,
  existing: RecipeWaterSettings | null,
): Record<string, unknown> {
  const data: Record<string, unknown> = { workspaceId, recipeId };
  const inputRec: Record<string, unknown> = input;

  applyMashUpsertFields(data, input, inputRec, existing);
  applySpargeUpsertFields(data, input, inputRec);
  applyBoilUpsertFields(data, input, inputRec, existing);

  return data;
}

async function assertProfileAccessible(prisma: PrismaClient, workspaceId: string, profileId: string) {
  const profile = await prisma.waterProfile.findUnique({ where: { id: profileId } });
  if (!profile) throw new BadRequestError("invalid_profile_id", "Unknown water profile id");

  const scope = profile.scope;
  if (scope === "system" || scope === "public") return;
  if (scope === "account" && profile.workspaceId === workspaceId) return;

  throw new ForbiddenError("profile_not_accessible", "Water profile is not accessible to this workspace");
}

export async function upsertRecipeWaterSettings(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  recipes: RecipesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
  input: UpsertRecipeWaterSettingsInput,
) {
  await workspaces.assertMembership(userId, workspaceId);
  await recipes.getRecipe(userId, workspaceId, recipeId);

  if (input.sourceWaterProfileId) await assertProfileAccessible(prisma, workspaceId, input.sourceWaterProfileId);
  if (input.targetWaterProfileId) await assertProfileAccessible(prisma, workspaceId, input.targetWaterProfileId);
  if (input.dilutionWaterProfileId) await assertProfileAccessible(prisma, workspaceId, input.dilutionWaterProfileId);
  if (input.spargeWaterProfileId) await assertProfileAccessible(prisma, workspaceId, input.spargeWaterProfileId);
  if (input.boilSourceWaterProfileId) await assertProfileAccessible(prisma, workspaceId, input.boilSourceWaterProfileId);
  if (input.boilTargetWaterProfileId) await assertProfileAccessible(prisma, workspaceId, input.boilTargetWaterProfileId);
  if (input.boilDilutionWaterProfileId)
    await assertProfileAccessible(prisma, workspaceId, input.boilDilutionWaterProfileId);

  const existing = await prisma.recipeWaterSettings.findUnique({ where: { recipeId } });
  const data = buildUpsertDataFromInput(workspaceId, recipeId, input, existing);

  return prisma.recipeWaterSettings.upsert({
    where: { recipeId },
    create: data as Prisma.RecipeWaterSettingsUncheckedCreateInput,
    update: data,
  });
}
