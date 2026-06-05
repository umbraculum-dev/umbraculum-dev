import type { RecipeWaterSettings } from "@prisma/client";

import { BadRequestError } from "../../errors.js";
import { ensureFinite, validateSaltAdditionsJson } from "./recipeWaterSettingsValidation.js";
import { deriveBoilWaterVolume } from "./recipeWaterSettingsComputeOps.js";
import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export function applyBoilUpsertFields(
  data: Record<string, unknown>,
  input: UpsertRecipeWaterSettingsInput,
  inputRec: Record<string, unknown>,
  existing: RecipeWaterSettings | null,
): void {
  const boilMixingNumericFields = ["boilTapWaterVolumeLiters", "boilDilutionWaterVolumeLiters"] as const;
  for (const f of boilMixingNumericFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }

  const { derivedBoilVolume, hasBoilMixingUpdate } = deriveBoilWaterVolume(input, existing);
  if (derivedBoilVolume > 0 || hasBoilMixingUpdate) {
    data["boilWaterVolumeLiters"] = ensureFinite(derivedBoilVolume, "boilWaterVolumeLiters");
  }

  const boilNumericFields = ["boilStartingAlkalinityPpmCaCO3", "boilStartingPh", "boilTargetPh"] as const;
  for (const f of boilNumericFields) {
    const v = inputRec[f];
    if (v !== undefined) data[f] = ensureFinite(v, f);
  }

  if (!hasBoilMixingUpdate && input.boilWaterVolumeLiters !== undefined) {
    data["boilWaterVolumeLiters"] = ensureFinite(input.boilWaterVolumeLiters, "boilWaterVolumeLiters");
  }

  const boilStringFields = ["boilAcidType", "boilStrengthKind"] as const;
  for (const f of boilStringFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
      data[f] = v;
    }
  }
  if (input.boilStrengthValue !== undefined) {
    if (input.boilStrengthValue === null) data["boilStrengthValue"] = null;
    else data["boilStrengthValue"] = ensureFinite(input.boilStrengthValue, "boilStrengthValue");
  }

  if (input.boilAcidificationMode !== undefined) {
    const v = input.boilAcidificationMode;
    if (typeof v !== "string") {
      throw new BadRequestError("invalid_string", "Body.boilAcidificationMode must be a string");
    }
    if (v !== "targetPh" && v !== "manual") {
      throw new BadRequestError(
        "invalid_boil_acidification_mode",
        'Body.boilAcidificationMode must be "targetPh" or "manual"',
      );
    }
    data["boilAcidificationMode"] = v;
  }

  const boilManualInputFields = ["boilManualAcidAddedMl", "boilManualAcidAddedGrams"] as const;
  for (const f of boilManualInputFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }

  const boilManualSnapshotFields = [
    "boilManualLastAchievedPh",
    "boilManualLastFinalAlkalinityPpmCaCO3",
    "boilManualLastSulfateAddedPpm",
    "boilManualLastChlorideAddedPpm",
  ] as const;
  for (const f of boilManualSnapshotFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }
  if (input.boilManualLastCalculatedAt !== undefined) data["boilManualLastCalculatedAt"] = input.boilManualLastCalculatedAt;

  if (input.boilSaltAdditionsJson !== undefined) {
    data["boilSaltAdditionsJson"] = validateSaltAdditionsJson(input.boilSaltAdditionsJson, "boilSaltAdditionsJson");
  }
  if (input.boilSaltsLastResultJson !== undefined) {
    data["boilSaltsLastResultJson"] = input.boilSaltsLastResultJson;
  }

  const boilSnapshotFields = [
    "boilLastAcidRequiredMl",
    "boilLastAcidRequiredTsp",
    "boilLastAcidRequiredGrams",
    "boilLastAcidRequiredKg",
    "boilLastFinalAlkalinityPpmCaCO3",
    "boilLastSulfateAddedPpm",
    "boilLastChlorideAddedPpm",
  ] as const;
  for (const f of boilSnapshotFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }
  if (input.boilLastCalculatedAt !== undefined) data["boilLastCalculatedAt"] = input.boilLastCalculatedAt;

  if (input.boilOverallLastResultJson !== undefined) {
    data["boilOverallLastResultJson"] = input.boilOverallLastResultJson;
  }
  if (input.boilOverallLastCalculatedAt !== undefined) data["boilOverallLastCalculatedAt"] = input.boilOverallLastCalculatedAt;
}

