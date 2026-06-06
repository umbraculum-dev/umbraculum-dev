import type { BoilComputeAndSaveInput, RecipeWaterComputeDeps } from "../recipeWaterComputeAndSaveService.js";
import { BadRequestError } from "../../errors.js";
import { ensureFinite, parseSaltAdditions } from "./recipeWaterComputeHelpers.js";
import { computeBoilSaltStage } from "./boil/recipeWaterComputeBoilSaltOps.js";
import { computeBoilAcidStage } from "./boil/recipeWaterComputeBoilAcidOps.js";
import { buildBoilOverallStage, buildBoilSettingsPatch } from "./boil/recipeWaterComputeBoilPhOps.js";

export async function computeAndSaveBoil(
  deps: RecipeWaterComputeDeps,
  userId: string,
  workspaceId: string,
  recipeId: string,
  input: BoilComputeAndSaveInput,
) {
  await deps.workspaces.assertMembership(userId, workspaceId);
  await deps.recipes.getRecipe(userId, workspaceId, recipeId);

  if (!input.boilSourceWaterProfileId) {
    throw new BadRequestError("invalid_profile_id", "Body.boilSourceWaterProfileId is required");
  }

  await deps.assertProfileAccessible(workspaceId, input.boilSourceWaterProfileId);
  if (input.boilDilutionWaterProfileId) await deps.assertProfileAccessible(workspaceId, input.boilDilutionWaterProfileId);

  const tap = ensureFinite(input.boilTapWaterVolumeLiters, "boilTapWaterVolumeLiters");
  const dil = ensureFinite(input.boilDilutionWaterVolumeLiters, "boilDilutionWaterVolumeLiters");
  const derivedVolumeLiters = Math.max(0, tap) + Math.max(0, dil);
  if (!(derivedVolumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Boil water volume must be > 0 (tap+dilution volumes).");
  }

  const nowIso = new Date().toISOString();
  const saltStage = await computeBoilSaltStage(deps, input, derivedVolumeLiters);
  const acidStage = computeBoilAcidStage(input, saltStage.salts, derivedVolumeLiters);
  const overallStage = buildBoilOverallStage(
    saltStage.salts,
    acidStage.acidResult,
    acidStage.mode,
    acidStage.startingAlkalinityPpmCaCO3,
    acidStage.startingPh,
    acidStage.targetPh,
    derivedVolumeLiters,
    nowIso,
  );

  const additions = parseSaltAdditions(input.boilSaltAdditionsJson, "boilSaltAdditionsJson");
  const patch = buildBoilSettingsPatch({
    input,
    tap: saltStage.tap,
    dil: saltStage.dil,
    derivedVolumeLiters,
    mode: acidStage.mode,
    acidType: acidStage.acidType,
    strengthKind: acidStage.strengthKind,
    strengthValue: acidStage.strengthValue,
    additions,
    salts: saltStage.salts,
    overall: overallStage.overall,
    acidResult: acidStage.acidResult,
    acidPredicted: overallStage.acidPredicted,
    startingAlkalinityPpmCaCO3: acidStage.startingAlkalinityPpmCaCO3,
    startingPh: acidStage.startingPh,
    targetPh: acidStage.targetPh,
    nowIso,
  });

  await deps.settings.upsert(userId, workspaceId, recipeId, patch);

  const { mode, acidResult, acidDerivation } = acidStage;

  return {
    settings: { recipeId },
    salts: { result: saltStage.salts, derivation: saltStage.saltsDerivation },
    acid:
      mode === "manual"
        ? { kind: "boil_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation }
        : { kind: "boil_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation },
    overall: { result: overallStage.overall, derivation: overallStage.overallDerivation },
  };
}
