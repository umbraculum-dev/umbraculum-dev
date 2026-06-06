import type { MashComputeAndSaveInput, RecipeWaterComputeDeps } from "../recipeWaterComputeAndSaveService.js";
import { BadRequestError } from "../../errors.js";
import { ensureFinite, parseSaltAdditions } from "./recipeWaterComputeHelpers.js";
import { computeMashSaltStage } from "./mash/recipeWaterComputeMashSaltOps.js";
import { computeMashAcidStage } from "./mash/recipeWaterComputeMashAcidOps.js";
import { buildMashOverallStage, buildMashSettingsPatch } from "./mash/recipeWaterComputeMashPhOps.js";

export async function computeAndSaveMash(
  deps: RecipeWaterComputeDeps,
  userId: string,
  workspaceId: string,
  recipeId: string,
  input: MashComputeAndSaveInput,
) {
  await deps.workspaces.assertMembership(userId, workspaceId);
  await deps.recipes.getRecipe(userId, workspaceId, recipeId);

  if (!input.sourceWaterProfileId) {
    throw new BadRequestError("invalid_profile_id", "Body.sourceWaterProfileId is required");
  }

  await deps.assertProfileAccessible(workspaceId, input.sourceWaterProfileId);
  if (input.dilutionWaterProfileId) await deps.assertProfileAccessible(workspaceId, input.dilutionWaterProfileId);

  const tap = ensureFinite(input.tapWaterVolumeLiters, "tapWaterVolumeLiters");
  const dil = ensureFinite(input.dilutionWaterVolumeLiters, "dilutionWaterVolumeLiters");
  const derivedVolumeLiters = Math.max(0, tap) + Math.max(0, dil);
  if (!(derivedVolumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Mash water volume must be > 0 (tap+dilution volumes).");
  }

  const nowIso = new Date().toISOString();
  const saltStage = await computeMashSaltStage(deps, input, derivedVolumeLiters);
  const acidStage = computeMashAcidStage(input, saltStage.salts, derivedVolumeLiters);
  const overallStage = buildMashOverallStage(
    input,
    saltStage.salts,
    acidStage.acidResult,
    acidStage.overallPh,
    acidStage.mashMode,
    derivedVolumeLiters,
    nowIso,
  );

  const additions = parseSaltAdditions(input.mashSaltAdditionsJson, "mashSaltAdditionsJson");
  const patch = buildMashSettingsPatch({
    input,
    tap: saltStage.tap,
    dil: saltStage.dil,
    derivedVolumeLiters,
    mashMode: acidStage.mashMode,
    acidType: acidStage.acidType,
    strengthKind: acidStage.strengthKind,
    strengthValue: acidStage.strengthValue,
    additions,
    salts: saltStage.salts,
    overall: overallStage.overall,
    acidResult: acidStage.acidResult,
    nowIso,
  });

  await deps.settings.upsert(userId, workspaceId, recipeId, patch);

  const { mashMode, hasGrist, acidResult, acidDerivation } = acidStage;

  return {
    settings: { recipeId },
    salts: { result: saltStage.salts, derivation: saltStage.saltsDerivation },
    acid:
      mashMode === "manual"
        ? { kind: "mash_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation }
        : hasGrist
          ? { kind: "mash_acidification_target_mash_ph", mode: "targetPh", result: acidResult, derivation: acidDerivation }
          : { kind: "mash_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation },
    overall: { result: overallStage.overall, derivation: overallStage.overallDerivation },
  };
}
