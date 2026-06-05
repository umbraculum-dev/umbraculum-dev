import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export function mapMashFieldsFromPutBody(body: Record<string, unknown>): Partial<UpsertRecipeWaterSettingsInput> {
  return {
    sourceWaterProfileId:
      typeof body["sourceWaterProfileId"] === "string"
        ? body["sourceWaterProfileId"]
        : body["sourceWaterProfileId"] === null
          ? null
          : undefined,
    targetWaterProfileId:
      typeof body["targetWaterProfileId"] === "string"
        ? body["targetWaterProfileId"]
        : body["targetWaterProfileId"] === null
          ? null
          : undefined,
    dilutionWaterProfileId:
      typeof body["dilutionWaterProfileId"] === "string"
        ? body["dilutionWaterProfileId"]
        : body["dilutionWaterProfileId"] === null
          ? null
          : undefined,

    tapWaterVolumeLiters:
      typeof body["tapWaterVolumeLiters"] === "number"
        ? body["tapWaterVolumeLiters"]
        : body["tapWaterVolumeLiters"] === null
          ? null
          : undefined,
    dilutionWaterVolumeLiters:
      typeof body["dilutionWaterVolumeLiters"] === "number"
        ? body["dilutionWaterVolumeLiters"]
        : body["dilutionWaterVolumeLiters"] === null
          ? null
          : undefined,

    mashStartingAlkalinityPpmCaCO3:
      typeof body["mashStartingAlkalinityPpmCaCO3"] === "number"
        ? body["mashStartingAlkalinityPpmCaCO3"]
        : undefined,
    mashStartingPh: typeof body["mashStartingPh"] === "number" ? body["mashStartingPh"] : undefined,
    mashTargetPh: typeof body["mashTargetPh"] === "number" ? body["mashTargetPh"] : undefined,
    mashWaterVolumeLiters:
      typeof body["mashWaterVolumeLiters"] === "number" ? body["mashWaterVolumeLiters"] : undefined,
    mashAcidType: typeof body["mashAcidType"] === "string" ? body["mashAcidType"] : undefined,
    mashStrengthKind: typeof body["mashStrengthKind"] === "string" ? body["mashStrengthKind"] : undefined,
    mashStrengthValue:
      typeof body["mashStrengthValue"] === "number"
        ? body["mashStrengthValue"]
        : body["mashStrengthValue"] === null
          ? null
          : undefined,

    mashLastAcidRequiredMl:
      typeof body["mashLastAcidRequiredMl"] === "number"
        ? body["mashLastAcidRequiredMl"]
        : body["mashLastAcidRequiredMl"] === null
          ? null
          : undefined,
    mashLastAcidRequiredTsp:
      typeof body["mashLastAcidRequiredTsp"] === "number"
        ? body["mashLastAcidRequiredTsp"]
        : body["mashLastAcidRequiredTsp"] === null
          ? null
          : undefined,
    mashLastAcidRequiredGrams:
      typeof body["mashLastAcidRequiredGrams"] === "number"
        ? body["mashLastAcidRequiredGrams"]
        : body["mashLastAcidRequiredGrams"] === null
          ? null
          : undefined,
    mashLastAcidRequiredKg:
      typeof body["mashLastAcidRequiredKg"] === "number"
        ? body["mashLastAcidRequiredKg"]
        : body["mashLastAcidRequiredKg"] === null
          ? null
          : undefined,
    mashLastFinalAlkalinityPpmCaCO3:
      typeof body["mashLastFinalAlkalinityPpmCaCO3"] === "number"
        ? body["mashLastFinalAlkalinityPpmCaCO3"]
        : body["mashLastFinalAlkalinityPpmCaCO3"] === null
          ? null
          : undefined,
    mashLastSulfateAddedPpm:
      typeof body["mashLastSulfateAddedPpm"] === "number"
        ? body["mashLastSulfateAddedPpm"]
        : body["mashLastSulfateAddedPpm"] === null
          ? null
          : undefined,
    mashLastChlorideAddedPpm:
      typeof body["mashLastChlorideAddedPpm"] === "number"
        ? body["mashLastChlorideAddedPpm"]
        : body["mashLastChlorideAddedPpm"] === null
          ? null
          : undefined,
    mashLastCalculatedAt:
      typeof body["mashLastCalculatedAt"] === "string" ? new Date(body["mashLastCalculatedAt"]) : undefined,

    mashAcidificationMode:
      typeof body["mashAcidificationMode"] === "string" ? body["mashAcidificationMode"] : undefined,
    mashManualAcidAddedMl:
      typeof body["mashManualAcidAddedMl"] === "number"
        ? body["mashManualAcidAddedMl"]
        : body["mashManualAcidAddedMl"] === null
          ? null
          : undefined,
    mashManualAcidAddedGrams:
      typeof body["mashManualAcidAddedGrams"] === "number"
        ? body["mashManualAcidAddedGrams"]
        : body["mashManualAcidAddedGrams"] === null
          ? null
          : undefined,
    mashManualLastAchievedPh:
      typeof body["mashManualLastAchievedPh"] === "number"
        ? body["mashManualLastAchievedPh"]
        : body["mashManualLastAchievedPh"] === null
          ? null
          : undefined,
    mashManualLastFinalAlkalinityPpmCaCO3:
      typeof body["mashManualLastFinalAlkalinityPpmCaCO3"] === "number"
        ? body["mashManualLastFinalAlkalinityPpmCaCO3"]
        : body["mashManualLastFinalAlkalinityPpmCaCO3"] === null
          ? null
          : undefined,
    mashManualLastSulfateAddedPpm:
      typeof body["mashManualLastSulfateAddedPpm"] === "number"
        ? body["mashManualLastSulfateAddedPpm"]
        : body["mashManualLastSulfateAddedPpm"] === null
          ? null
          : undefined,
    mashManualLastChlorideAddedPpm:
      typeof body["mashManualLastChlorideAddedPpm"] === "number"
        ? body["mashManualLastChlorideAddedPpm"]
        : body["mashManualLastChlorideAddedPpm"] === null
          ? null
          : undefined,
    mashManualLastCalculatedAt:
      typeof body["mashManualLastCalculatedAt"] === "string" ? new Date(body["mashManualLastCalculatedAt"]) : undefined,

    mashSaltAdditionsJson:
      body["mashSaltAdditionsJson"] === null || body["mashSaltAdditionsJson"] !== undefined
        ? body["mashSaltAdditionsJson"]
        : undefined,
    mashSaltsLastResultJson:
      body["mashSaltsLastResultJson"] === null || body["mashSaltsLastResultJson"] !== undefined
        ? body["mashSaltsLastResultJson"]
        : undefined,

    mashOverallLastResultJson:
      body["mashOverallLastResultJson"] === null || body["mashOverallLastResultJson"] !== undefined
        ? body["mashOverallLastResultJson"]
        : undefined,
    mashOverallLastCalculatedAt:
      typeof body["mashOverallLastCalculatedAt"] === "string"
        ? new Date(body["mashOverallLastCalculatedAt"])
        : body["mashOverallLastCalculatedAt"] === null
          ? null
          : undefined,

    mashGristImportedJson:
      body["mashGristImportedJson"] === null || body["mashGristImportedJson"] !== undefined
        ? body["mashGristImportedJson"]
        : undefined,
    mashGristImportedAt:
      typeof body["mashGristImportedAt"] === "string"
        ? new Date(body["mashGristImportedAt"])
        : body["mashGristImportedAt"] === null
          ? null
          : undefined,
    mashGristSourceRecipeUpdatedAt:
      typeof body["mashGristSourceRecipeUpdatedAt"] === "string"
        ? new Date(body["mashGristSourceRecipeUpdatedAt"])
        : body["mashGristSourceRecipeUpdatedAt"] === null
          ? null
          : undefined,
  };
}
