import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export function mapSpargeFieldsFromPutBody(body: Record<string, unknown>): Partial<UpsertRecipeWaterSettingsInput> {
  return {
    spargeWaterProfileId:
      typeof body["spargeWaterProfileId"] === "string"
        ? body["spargeWaterProfileId"]
        : body["spargeWaterProfileId"] === null
          ? null
          : undefined,
    spargeStartingAlkalinityPpmCaCO3:
      typeof body["spargeStartingAlkalinityPpmCaCO3"] === "number"
        ? body["spargeStartingAlkalinityPpmCaCO3"]
        : undefined,
    spargeStartingPh: typeof body["spargeStartingPh"] === "number" ? body["spargeStartingPh"] : undefined,
    spargeTargetPh: typeof body["spargeTargetPh"] === "number" ? body["spargeTargetPh"] : undefined,
    spargeVolumeLiters: typeof body["spargeVolumeLiters"] === "number" ? body["spargeVolumeLiters"] : undefined,
    spargeAcidType: typeof body["spargeAcidType"] === "string" ? body["spargeAcidType"] : undefined,
    spargeStrengthKind: typeof body["spargeStrengthKind"] === "string" ? body["spargeStrengthKind"] : undefined,
    spargeStrengthValue:
      typeof body["spargeStrengthValue"] === "number"
        ? body["spargeStrengthValue"]
        : body["spargeStrengthValue"] === null
          ? null
          : undefined,

    spargeAcidificationMode:
      typeof body["spargeAcidificationMode"] === "string" ? body["spargeAcidificationMode"] : undefined,
    spargeManualAcidAddedMl:
      typeof body["spargeManualAcidAddedMl"] === "number"
        ? body["spargeManualAcidAddedMl"]
        : body["spargeManualAcidAddedMl"] === null
          ? null
          : undefined,
    spargeManualAcidAddedGrams:
      typeof body["spargeManualAcidAddedGrams"] === "number"
        ? body["spargeManualAcidAddedGrams"]
        : body["spargeManualAcidAddedGrams"] === null
          ? null
          : undefined,
    spargeManualLastAchievedPh:
      typeof body["spargeManualLastAchievedPh"] === "number"
        ? body["spargeManualLastAchievedPh"]
        : body["spargeManualLastAchievedPh"] === null
          ? null
          : undefined,
    spargeManualLastFinalAlkalinityPpmCaCO3:
      typeof body["spargeManualLastFinalAlkalinityPpmCaCO3"] === "number"
        ? body["spargeManualLastFinalAlkalinityPpmCaCO3"]
        : body["spargeManualLastFinalAlkalinityPpmCaCO3"] === null
          ? null
          : undefined,
    spargeManualLastSulfateAddedPpm:
      typeof body["spargeManualLastSulfateAddedPpm"] === "number"
        ? body["spargeManualLastSulfateAddedPpm"]
        : body["spargeManualLastSulfateAddedPpm"] === null
          ? null
          : undefined,
    spargeManualLastChlorideAddedPpm:
      typeof body["spargeManualLastChlorideAddedPpm"] === "number"
        ? body["spargeManualLastChlorideAddedPpm"]
        : body["spargeManualLastChlorideAddedPpm"] === null
          ? null
          : undefined,
    spargeManualLastCalculatedAt:
      typeof body["spargeManualLastCalculatedAt"] === "string"
        ? new Date(body["spargeManualLastCalculatedAt"])
        : body["spargeManualLastCalculatedAt"] === null
          ? null
          : undefined,

    spargeSaltAdditionsJson: body["spargeSaltAdditionsJson"] !== undefined ? body["spargeSaltAdditionsJson"] : undefined,
    spargeSaltsLastResultJson: body["spargeSaltsLastResultJson"] !== undefined ? body["spargeSaltsLastResultJson"] : undefined,
    spargeStepTemperatureC:
      typeof body["spargeStepTemperatureC"] === "number"
        ? body["spargeStepTemperatureC"]
        : body["spargeStepTemperatureC"] === null
          ? null
          : undefined,
    spargeStepTimeMin:
      typeof body["spargeStepTimeMin"] === "number"
        ? body["spargeStepTimeMin"]
        : body["spargeStepTimeMin"] === null
          ? null
          : undefined,
    spargeStepRampMin:
      typeof body["spargeStepRampMin"] === "number"
        ? body["spargeStepRampMin"]
        : body["spargeStepRampMin"] === null
          ? null
          : undefined,
    spargeMethodType:
      typeof body["spargeMethodType"] === "string"
        ? body["spargeMethodType"]
        : body["spargeMethodType"] === null
          ? null
          : undefined,

    spargeLastAcidRequiredMl:
      typeof body["spargeLastAcidRequiredMl"] === "number"
        ? body["spargeLastAcidRequiredMl"]
        : body["spargeLastAcidRequiredMl"] === null
          ? null
          : undefined,
    spargeLastAcidRequiredTsp:
      typeof body["spargeLastAcidRequiredTsp"] === "number"
        ? body["spargeLastAcidRequiredTsp"]
        : body["spargeLastAcidRequiredTsp"] === null
          ? null
          : undefined,
    spargeLastAcidRequiredGrams:
      typeof body["spargeLastAcidRequiredGrams"] === "number"
        ? body["spargeLastAcidRequiredGrams"]
        : body["spargeLastAcidRequiredGrams"] === null
          ? null
          : undefined,
    spargeLastAcidRequiredKg:
      typeof body["spargeLastAcidRequiredKg"] === "number"
        ? body["spargeLastAcidRequiredKg"]
        : body["spargeLastAcidRequiredKg"] === null
          ? null
          : undefined,
    spargeLastFinalAlkalinityPpmCaCO3:
      typeof body["spargeLastFinalAlkalinityPpmCaCO3"] === "number"
        ? body["spargeLastFinalAlkalinityPpmCaCO3"]
        : body["spargeLastFinalAlkalinityPpmCaCO3"] === null
          ? null
          : undefined,
    spargeLastSulfateAddedPpm:
      typeof body["spargeLastSulfateAddedPpm"] === "number"
        ? body["spargeLastSulfateAddedPpm"]
        : body["spargeLastSulfateAddedPpm"] === null
          ? null
          : undefined,
    spargeLastChlorideAddedPpm:
      typeof body["spargeLastChlorideAddedPpm"] === "number"
        ? body["spargeLastChlorideAddedPpm"]
        : body["spargeLastChlorideAddedPpm"] === null
          ? null
          : undefined,
    spargeLastCalculatedAt:
      typeof body["spargeLastCalculatedAt"] === "string" ? new Date(body["spargeLastCalculatedAt"]) : undefined,
  };
}
