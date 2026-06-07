import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import type { NativeWaterBoilAcidificationState } from "./useNativeWaterBoilAcidificationState";

export function buildNativeWaterBoilAcidificationDraftPatch(params: {
  sourceProfileId: string;
  targetProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  saltAdditions: SaltAdditionRow[];
  state: NativeWaterBoilAcidificationState;
}) {
  const {
    sourceProfileId,
    targetProfileId,
    dilutionProfileId,
    tapVolumeLiters,
    dilutionVolumeLiters,
    saltAdditions,
    state,
  } = params;
  const {
    startingAlk,
    startingPh,
    targetPh,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
  } = state;

  return {
    boilSourceWaterProfileId: sourceProfileId || null,
    boilTargetWaterProfileId: targetProfileId || null,
    boilDilutionWaterProfileId: dilutionProfileId || null,
    boilTapWaterVolumeLiters: tapVolumeLiters,
    boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
    boilStartingAlkalinityPpmCaCO3: startingAlk,
    boilStartingPh: startingPh.trim() === "" ? undefined : Number(startingPh),
    boilTargetPh: targetPh,
    boilAcidType: acidType,
    boilStrengthKind: strengthKind,
    boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
    boilAcidificationMode: acidificationMode,
    boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
    boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
    boilSaltAdditionsJson: saltAdditions,
  };
}
