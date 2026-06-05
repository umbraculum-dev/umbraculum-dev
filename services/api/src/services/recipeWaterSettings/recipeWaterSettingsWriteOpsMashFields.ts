import type { RecipeWaterSettings } from "@prisma/client";

import { BadRequestError } from "../../errors.js";
import { ensureFinite, validateSaltAdditionsJson } from "./recipeWaterSettingsValidation.js";
import { deriveMashWaterVolume } from "./recipeWaterSettingsComputeOps.js";
import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export function applyMashUpsertFields(
  data: Record<string, unknown>,
  input: UpsertRecipeWaterSettingsInput,
  inputRec: Record<string, unknown>,
  existing: RecipeWaterSettings | null,
): void {
  if (input.sourceWaterProfileId !== undefined) data["sourceWaterProfileId"] = input.sourceWaterProfileId;
  if (input.targetWaterProfileId !== undefined) data["targetWaterProfileId"] = input.targetWaterProfileId;
  if (input.dilutionWaterProfileId !== undefined) data["dilutionWaterProfileId"] = input.dilutionWaterProfileId;
  if (input.spargeWaterProfileId !== undefined) data["spargeWaterProfileId"] = input.spargeWaterProfileId;
  if (input.boilSourceWaterProfileId !== undefined) data["boilSourceWaterProfileId"] = input.boilSourceWaterProfileId;
  if (input.boilTargetWaterProfileId !== undefined) data["boilTargetWaterProfileId"] = input.boilTargetWaterProfileId;
  if (input.boilDilutionWaterProfileId !== undefined)
    data["boilDilutionWaterProfileId"] = input.boilDilutionWaterProfileId;

  const mixingNumericFields = ["tapWaterVolumeLiters", "dilutionWaterVolumeLiters"] as const;
  for (const f of mixingNumericFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }

  const { derivedMashVolume, hasMixingUpdate } = deriveMashWaterVolume(input, existing);
  if (derivedMashVolume > 0 || hasMixingUpdate) {
    data["mashWaterVolumeLiters"] = ensureFinite(derivedMashVolume, "mashWaterVolumeLiters");
  }

  const mashNumericFields = ["mashStartingAlkalinityPpmCaCO3", "mashStartingPh", "mashTargetPh"] as const;
  for (const f of mashNumericFields) {
    const v = inputRec[f];
    if (v !== undefined) data[f] = ensureFinite(v, f);
  }

  if (derivedMashVolume <= 0 && !hasMixingUpdate && input.mashWaterVolumeLiters !== undefined) {
    data["mashWaterVolumeLiters"] = ensureFinite(input.mashWaterVolumeLiters, "mashWaterVolumeLiters");
  }

  const mashStringFields = ["mashAcidType", "mashStrengthKind"] as const;
  for (const f of mashStringFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
      data[f] = v;
    }
  }

  if (input.mashStrengthValue !== undefined) {
    if (input.mashStrengthValue === null) data["mashStrengthValue"] = null;
    else data["mashStrengthValue"] = ensureFinite(input.mashStrengthValue, "mashStrengthValue");
  }

  const mashSnapshotFields = [
    "mashLastAcidRequiredMl",
    "mashLastAcidRequiredTsp",
    "mashLastAcidRequiredGrams",
    "mashLastAcidRequiredKg",
    "mashLastFinalAlkalinityPpmCaCO3",
    "mashLastSulfateAddedPpm",
    "mashLastChlorideAddedPpm",
  ] as const;
  for (const f of mashSnapshotFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }
  if (input.mashLastCalculatedAt !== undefined) {
    data["mashLastCalculatedAt"] = input.mashLastCalculatedAt;
  }

  if (input.mashAcidificationMode !== undefined) {
    const v = input.mashAcidificationMode;
    if (typeof v !== "string") {
      throw new BadRequestError("invalid_string", "Body.mashAcidificationMode must be a string");
    }
    if (v !== "targetPh" && v !== "manual") {
      throw new BadRequestError(
        "invalid_mash_acidification_mode",
        'Body.mashAcidificationMode must be "targetPh" or "manual"',
      );
    }
    data["mashAcidificationMode"] = v;
  }

  const mashManualInputFields = ["mashManualAcidAddedMl", "mashManualAcidAddedGrams"] as const;
  for (const f of mashManualInputFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }

  const mashManualSnapshotFields = [
    "mashManualLastAchievedPh",
    "mashManualLastFinalAlkalinityPpmCaCO3",
    "mashManualLastSulfateAddedPpm",
    "mashManualLastChlorideAddedPpm",
  ] as const;
  for (const f of mashManualSnapshotFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }
  if (input.mashManualLastCalculatedAt !== undefined) {
    data["mashManualLastCalculatedAt"] = input.mashManualLastCalculatedAt;
  }

  if (input.mashSaltAdditionsJson !== undefined) {
    data["mashSaltAdditionsJson"] = validateSaltAdditionsJson(input.mashSaltAdditionsJson, "mashSaltAdditionsJson");
  }
  if (input.mashSaltsLastResultJson !== undefined) {
    data["mashSaltsLastResultJson"] = input.mashSaltsLastResultJson;
  }

  if (input.mashOverallLastResultJson !== undefined) {
    data["mashOverallLastResultJson"] = input.mashOverallLastResultJson;
  }
  if (input.mashOverallLastCalculatedAt !== undefined) {
    data["mashOverallLastCalculatedAt"] = input.mashOverallLastCalculatedAt;
  }

  if (input.mashGristImportedJson !== undefined) {
    data["mashGristImportedJson"] = input.mashGristImportedJson;
  }
  if (input.mashGristImportedAt !== undefined) {
    data["mashGristImportedAt"] = input.mashGristImportedAt;
  }
  if (input.mashGristSourceRecipeUpdatedAt !== undefined) {
    data["mashGristSourceRecipeUpdatedAt"] = input.mashGristSourceRecipeUpdatedAt;
  }
}

