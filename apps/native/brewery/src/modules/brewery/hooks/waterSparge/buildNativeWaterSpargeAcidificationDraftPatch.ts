import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import type { NativeWaterSpargeAcidificationState } from "./useNativeWaterSpargeAcidificationState";

export function buildNativeWaterSpargeAcidificationDraftPatch(params: {
  saltAdditions: SaltAdditionRow[];
  state: NativeWaterSpargeAcidificationState;
}) {
  const { saltAdditions, state } = params;
  const {
    spargeWaterProfileId,
    startingAlk,
    startingPh,
    targetPh,
    volumeLiters,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
  } = state;

  return {
    spargeWaterProfileId: spargeWaterProfileId || null,
    spargeStartingAlkalinityPpmCaCO3: startingAlk,
    spargeStartingPh: startingPh.trim() === "" ? undefined : Number(startingPh),
    spargeTargetPh: targetPh,
    spargeVolumeLiters: volumeLiters,
    spargeAcidType: acidType,
    spargeStrengthKind: strengthKind,
    spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
    spargeAcidificationMode: acidificationMode,
    spargeManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
    spargeManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
    spargeSaltAdditionsJson: saltAdditions,
  };
}
