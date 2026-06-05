export type UpsertRecipeWaterSettingsInput = {
  sourceWaterProfileId?: string | null | undefined;
  targetWaterProfileId?: string | null | undefined;
  dilutionWaterProfileId?: string | null | undefined;

  tapWaterVolumeLiters?: number | null | undefined;
  dilutionWaterVolumeLiters?: number | null | undefined;

  mashStartingAlkalinityPpmCaCO3?: number | undefined;
  mashStartingPh?: number | undefined;
  mashTargetPh?: number | undefined;
  mashWaterVolumeLiters?: number | undefined;
  mashAcidType?: string | undefined;
  mashStrengthKind?: string | undefined;
  mashStrengthValue?: number | null | undefined;

  mashLastAcidRequiredMl?: number | null | undefined;
  mashLastAcidRequiredTsp?: number | null | undefined;
  mashLastAcidRequiredGrams?: number | null | undefined;
  mashLastAcidRequiredKg?: number | null | undefined;
  mashLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  mashLastSulfateAddedPpm?: number | null | undefined;
  mashLastChlorideAddedPpm?: number | null | undefined;
  mashLastCalculatedAt?: Date | null | undefined;

  mashAcidificationMode?: string | undefined;
  mashManualAcidAddedMl?: number | null | undefined;
  mashManualAcidAddedGrams?: number | null | undefined;
  mashManualLastAchievedPh?: number | null | undefined;
  mashManualLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  mashManualLastSulfateAddedPpm?: number | null | undefined;
  mashManualLastChlorideAddedPpm?: number | null | undefined;
  mashManualLastCalculatedAt?: Date | null | undefined;

  mashSaltAdditionsJson?: unknown | undefined;
  mashSaltsLastResultJson?: unknown | undefined;

  mashOverallLastResultJson?: unknown | undefined;
  mashOverallLastCalculatedAt?: Date | null | undefined;

  mashGristImportedJson?: unknown | undefined;
  mashGristImportedAt?: Date | null | undefined;
  mashGristSourceRecipeUpdatedAt?: Date | null | undefined;

  spargeWaterProfileId?: string | null | undefined;
  spargeStartingAlkalinityPpmCaCO3?: number | undefined;
  spargeStartingPh?: number | undefined;
  spargeTargetPh?: number | undefined;
  spargeVolumeLiters?: number | undefined;
  spargeAcidType?: string | undefined;
  spargeStrengthKind?: string | undefined;
  spargeStrengthValue?: number | null | undefined;

  spargeLastAcidRequiredMl?: number | null | undefined;
  spargeLastAcidRequiredTsp?: number | null | undefined;
  spargeLastAcidRequiredGrams?: number | null | undefined;
  spargeLastAcidRequiredKg?: number | null | undefined;
  spargeLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  spargeLastSulfateAddedPpm?: number | null | undefined;
  spargeLastChlorideAddedPpm?: number | null | undefined;
  spargeLastCalculatedAt?: Date | null | undefined;

  spargeAcidificationMode?: string | undefined;
  spargeManualAcidAddedMl?: number | null | undefined;
  spargeManualAcidAddedGrams?: number | null | undefined;
  spargeManualLastAchievedPh?: number | null | undefined;
  spargeManualLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  spargeManualLastSulfateAddedPpm?: number | null | undefined;
  spargeManualLastChlorideAddedPpm?: number | null | undefined;
  spargeManualLastCalculatedAt?: Date | null | undefined;

  spargeSaltAdditionsJson?: unknown | undefined;
  spargeSaltsLastResultJson?: unknown | undefined;

  spargeStepTemperatureC?: number | null | undefined;

  spargeStepTimeMin?: number | null | undefined;
  spargeStepRampMin?: number | null | undefined;
  spargeMethodType?: string | null | undefined;

  boilSourceWaterProfileId?: string | null | undefined;
  boilTargetWaterProfileId?: string | null | undefined;
  boilDilutionWaterProfileId?: string | null | undefined;

  boilTapWaterVolumeLiters?: number | null | undefined;
  boilDilutionWaterVolumeLiters?: number | null | undefined;

  boilStartingAlkalinityPpmCaCO3?: number | undefined;
  boilStartingPh?: number | undefined;
  boilTargetPh?: number | undefined;
  boilWaterVolumeLiters?: number | undefined;
  boilAcidType?: string | undefined;
  boilStrengthKind?: string | undefined;
  boilStrengthValue?: number | null | undefined;

  boilLastAcidRequiredMl?: number | null | undefined;
  boilLastAcidRequiredTsp?: number | null | undefined;
  boilLastAcidRequiredGrams?: number | null | undefined;
  boilLastAcidRequiredKg?: number | null | undefined;
  boilLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  boilLastSulfateAddedPpm?: number | null | undefined;
  boilLastChlorideAddedPpm?: number | null | undefined;
  boilLastCalculatedAt?: Date | null | undefined;

  boilAcidificationMode?: string | undefined;
  boilManualAcidAddedMl?: number | null | undefined;
  boilManualAcidAddedGrams?: number | null | undefined;
  boilManualLastAchievedPh?: number | null | undefined;
  boilManualLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  boilManualLastSulfateAddedPpm?: number | null | undefined;
  boilManualLastChlorideAddedPpm?: number | null | undefined;
  boilManualLastCalculatedAt?: Date | null | undefined;

  boilSaltAdditionsJson?: unknown | undefined;
  boilSaltsLastResultJson?: unknown | undefined;

  boilOverallLastResultJson?: unknown | undefined;
  boilOverallLastCalculatedAt?: Date | null | undefined;
};
