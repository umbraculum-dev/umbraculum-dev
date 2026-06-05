import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export function mapBoilFieldsFromPutBody(body: Record<string, unknown>): Partial<UpsertRecipeWaterSettingsInput> {
  return {
    boilSourceWaterProfileId:
      typeof body["boilSourceWaterProfileId"] === "string"
        ? body["boilSourceWaterProfileId"]
        : body["boilSourceWaterProfileId"] === null
          ? null
          : undefined,
    boilTargetWaterProfileId:
      typeof body["boilTargetWaterProfileId"] === "string"
        ? body["boilTargetWaterProfileId"]
        : body["boilTargetWaterProfileId"] === null
          ? null
          : undefined,
    boilDilutionWaterProfileId:
      typeof body["boilDilutionWaterProfileId"] === "string"
        ? body["boilDilutionWaterProfileId"]
        : body["boilDilutionWaterProfileId"] === null
          ? null
          : undefined,

    boilTapWaterVolumeLiters:
      typeof body["boilTapWaterVolumeLiters"] === "number"
        ? body["boilTapWaterVolumeLiters"]
        : body["boilTapWaterVolumeLiters"] === null
          ? null
          : undefined,
    boilDilutionWaterVolumeLiters:
      typeof body["boilDilutionWaterVolumeLiters"] === "number"
        ? body["boilDilutionWaterVolumeLiters"]
        : body["boilDilutionWaterVolumeLiters"] === null
          ? null
          : undefined,

    boilStartingAlkalinityPpmCaCO3:
      typeof body["boilStartingAlkalinityPpmCaCO3"] === "number"
        ? body["boilStartingAlkalinityPpmCaCO3"]
        : undefined,
    boilStartingPh: typeof body["boilStartingPh"] === "number" ? body["boilStartingPh"] : undefined,
    boilTargetPh: typeof body["boilTargetPh"] === "number" ? body["boilTargetPh"] : undefined,
    boilWaterVolumeLiters:
      typeof body["boilWaterVolumeLiters"] === "number" ? body["boilWaterVolumeLiters"] : undefined,
    boilAcidType: typeof body["boilAcidType"] === "string" ? body["boilAcidType"] : undefined,
    boilStrengthKind: typeof body["boilStrengthKind"] === "string" ? body["boilStrengthKind"] : undefined,
    boilStrengthValue:
      typeof body["boilStrengthValue"] === "number"
        ? body["boilStrengthValue"]
        : body["boilStrengthValue"] === null
          ? null
          : undefined,

    boilAcidificationMode:
      typeof body["boilAcidificationMode"] === "string" ? body["boilAcidificationMode"] : undefined,
    boilManualAcidAddedMl:
      typeof body["boilManualAcidAddedMl"] === "number"
        ? body["boilManualAcidAddedMl"]
        : body["boilManualAcidAddedMl"] === null
          ? null
          : undefined,
    boilManualAcidAddedGrams:
      typeof body["boilManualAcidAddedGrams"] === "number"
        ? body["boilManualAcidAddedGrams"]
        : body["boilManualAcidAddedGrams"] === null
          ? null
          : undefined,
    boilManualLastAchievedPh:
      typeof body["boilManualLastAchievedPh"] === "number"
        ? body["boilManualLastAchievedPh"]
        : body["boilManualLastAchievedPh"] === null
          ? null
          : undefined,
    boilManualLastFinalAlkalinityPpmCaCO3:
      typeof body["boilManualLastFinalAlkalinityPpmCaCO3"] === "number"
        ? body["boilManualLastFinalAlkalinityPpmCaCO3"]
        : body["boilManualLastFinalAlkalinityPpmCaCO3"] === null
          ? null
          : undefined,
    boilManualLastSulfateAddedPpm:
      typeof body["boilManualLastSulfateAddedPpm"] === "number"
        ? body["boilManualLastSulfateAddedPpm"]
        : body["boilManualLastSulfateAddedPpm"] === null
          ? null
          : undefined,
    boilManualLastChlorideAddedPpm:
      typeof body["boilManualLastChlorideAddedPpm"] === "number"
        ? body["boilManualLastChlorideAddedPpm"]
        : body["boilManualLastChlorideAddedPpm"] === null
          ? null
          : undefined,
    boilManualLastCalculatedAt:
      typeof body["boilManualLastCalculatedAt"] === "string"
        ? new Date(body["boilManualLastCalculatedAt"])
        : body["boilManualLastCalculatedAt"] === null
          ? null
          : undefined,

    boilSaltAdditionsJson: body["boilSaltAdditionsJson"] !== undefined ? body["boilSaltAdditionsJson"] : undefined,
    boilSaltsLastResultJson: body["boilSaltsLastResultJson"] !== undefined ? body["boilSaltsLastResultJson"] : undefined,

    boilLastAcidRequiredMl:
      typeof body["boilLastAcidRequiredMl"] === "number"
        ? body["boilLastAcidRequiredMl"]
        : body["boilLastAcidRequiredMl"] === null
          ? null
          : undefined,
    boilLastAcidRequiredTsp:
      typeof body["boilLastAcidRequiredTsp"] === "number"
        ? body["boilLastAcidRequiredTsp"]
        : body["boilLastAcidRequiredTsp"] === null
          ? null
          : undefined,
    boilLastAcidRequiredGrams:
      typeof body["boilLastAcidRequiredGrams"] === "number"
        ? body["boilLastAcidRequiredGrams"]
        : body["boilLastAcidRequiredGrams"] === null
          ? null
          : undefined,
    boilLastAcidRequiredKg:
      typeof body["boilLastAcidRequiredKg"] === "number"
        ? body["boilLastAcidRequiredKg"]
        : body["boilLastAcidRequiredKg"] === null
          ? null
          : undefined,
    boilLastFinalAlkalinityPpmCaCO3:
      typeof body["boilLastFinalAlkalinityPpmCaCO3"] === "number"
        ? body["boilLastFinalAlkalinityPpmCaCO3"]
        : body["boilLastFinalAlkalinityPpmCaCO3"] === null
          ? null
          : undefined,
    boilLastSulfateAddedPpm:
      typeof body["boilLastSulfateAddedPpm"] === "number"
        ? body["boilLastSulfateAddedPpm"]
        : body["boilLastSulfateAddedPpm"] === null
          ? null
          : undefined,
    boilLastChlorideAddedPpm:
      typeof body["boilLastChlorideAddedPpm"] === "number"
        ? body["boilLastChlorideAddedPpm"]
        : body["boilLastChlorideAddedPpm"] === null
          ? null
          : undefined,
    boilLastCalculatedAt:
      typeof body["boilLastCalculatedAt"] === "string" ? new Date(body["boilLastCalculatedAt"]) : undefined,

    boilOverallLastResultJson: body["boilOverallLastResultJson"] !== undefined ? body["boilOverallLastResultJson"] : undefined,
    boilOverallLastCalculatedAt:
      typeof body["boilOverallLastCalculatedAt"] === "string" ? new Date(body["boilOverallLastCalculatedAt"]) : undefined,
  };
}
