import { BadRequestError } from "../../../../errors.js";
import { ensureFinite, validateSaltAdditionsJson } from "./recipeWaterSettingsValidation.js";
import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export function applySpargeUpsertFields(
  data: Record<string, unknown>,
  input: UpsertRecipeWaterSettingsInput,
  inputRec: Record<string, unknown>,
): void {
  const numericFields = [
    "spargeStartingAlkalinityPpmCaCO3",
    "spargeStartingPh",
    "spargeTargetPh",
    "spargeVolumeLiters",
  ] as const;
  for (const f of numericFields) {
    const v = inputRec[f];
    if (v !== undefined) data[f] = ensureFinite(v, f);
  }

  const stringFields = ["spargeAcidType", "spargeStrengthKind"] as const;
  for (const f of stringFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
      data[f] = v;
    }
  }

  if (input.spargeStrengthValue !== undefined) {
    if (input.spargeStrengthValue === null) data["spargeStrengthValue"] = null;
    else data["spargeStrengthValue"] = ensureFinite(input.spargeStrengthValue, "spargeStrengthValue");
  }

  if (input.spargeAcidificationMode !== undefined) {
    const v = input.spargeAcidificationMode;
    if (typeof v !== "string") {
      throw new BadRequestError("invalid_string", "Body.spargeAcidificationMode must be a string");
    }
    if (v !== "targetPh" && v !== "manual") {
      throw new BadRequestError(
        "invalid_sparge_acidification_mode",
        'Body.spargeAcidificationMode must be "targetPh" or "manual"',
      );
    }
    data["spargeAcidificationMode"] = v;
  }

  const spargeManualInputFields = ["spargeManualAcidAddedMl", "spargeManualAcidAddedGrams"] as const;
  for (const f of spargeManualInputFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }

  const spargeManualSnapshotFields = [
    "spargeManualLastAchievedPh",
    "spargeManualLastFinalAlkalinityPpmCaCO3",
    "spargeManualLastSulfateAddedPpm",
    "spargeManualLastChlorideAddedPpm",
  ] as const;
  for (const f of spargeManualSnapshotFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }
  if (input.spargeManualLastCalculatedAt !== undefined) {
    data["spargeManualLastCalculatedAt"] = input.spargeManualLastCalculatedAt;
  }

  if (input.spargeSaltAdditionsJson !== undefined) {
    data["spargeSaltAdditionsJson"] = validateSaltAdditionsJson(
      input.spargeSaltAdditionsJson,
      "spargeSaltAdditionsJson",
    );
  }
  if (input.spargeSaltsLastResultJson !== undefined) {
    data["spargeSaltsLastResultJson"] = input.spargeSaltsLastResultJson;
  }
  if (input.spargeStepTemperatureC !== undefined) {
    if (input.spargeStepTemperatureC === null) data["spargeStepTemperatureC"] = null;
    else {
      const v = input.spargeStepTemperatureC;
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100) {
        throw new BadRequestError("invalid_sparge_step_temperature", "Body.spargeStepTemperatureC must be 0–100");
      }
      data["spargeStepTemperatureC"] = v;
    }
  }

  const SPARGE_METHOD_ALLOWLIST = new Set(["fly_sparge", "batch_sparge"]);
  if (input.spargeStepTimeMin !== undefined) {
    if (input.spargeStepTimeMin === null) data["spargeStepTimeMin"] = null;
    else {
      const v = input.spargeStepTimeMin;
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 600) {
        throw new BadRequestError("invalid_sparge_step_time", "Body.spargeStepTimeMin must be 0–600");
      }
      data["spargeStepTimeMin"] = v;
    }
  }
  if (input.spargeStepRampMin !== undefined) {
    if (input.spargeStepRampMin === null) data["spargeStepRampMin"] = null;
    else {
      const v = input.spargeStepRampMin;
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 120) {
        throw new BadRequestError("invalid_sparge_step_ramp", "Body.spargeStepRampMin must be 0–120");
      }
      data["spargeStepRampMin"] = v;
    }
  }
  if (input.spargeMethodType !== undefined) {
    if (input.spargeMethodType === null) data["spargeMethodType"] = null;
    else {
      const v = input.spargeMethodType;
      if (typeof v !== "string" || !SPARGE_METHOD_ALLOWLIST.has(v)) {
        throw new BadRequestError(
          "invalid_sparge_method_type",
          'Body.spargeMethodType must be "fly_sparge" or "batch_sparge"',
        );
      }
      data["spargeMethodType"] = v;
    }
  }

  const snapshotFields = [
    "spargeLastAcidRequiredMl",
    "spargeLastAcidRequiredTsp",
    "spargeLastAcidRequiredGrams",
    "spargeLastAcidRequiredKg",
    "spargeLastFinalAlkalinityPpmCaCO3",
    "spargeLastSulfateAddedPpm",
    "spargeLastChlorideAddedPpm",
  ] as const;
  for (const f of snapshotFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (v === null) data[f] = null;
      else data[f] = ensureFinite(v, f);
    }
  }
  if (input.spargeLastCalculatedAt !== undefined) {
    data["spargeLastCalculatedAt"] = input.spargeLastCalculatedAt;
  }
}

