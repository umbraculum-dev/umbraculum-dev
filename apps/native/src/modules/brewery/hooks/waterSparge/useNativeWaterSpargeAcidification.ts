import type { WaterProfile } from "@umbraculum/contracts";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import {
  SPARGE_ACID_TYPE_OPTIONS,
  SPARGE_STRENGTH_KIND_OPTIONS,
} from "./nativeWaterAcidificationOptions";

export { SPARGE_ACID_TYPE_OPTIONS, SPARGE_STRENGTH_KIND_OPTIONS } from "./nativeWaterAcidificationOptions";
import { useNativeWaterSpargeAcidificationState } from "./useNativeWaterSpargeAcidificationState";
import { useNativeWaterSpargeAcidificationSubmit } from "./useNativeWaterSpargeAcidificationSubmit";

export function useNativeWaterSpargeAcidification(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSettings: (s: Record<string, unknown>) => void;
  setError: (value: string | null) => void;
  waterProfiles: WaterProfile[];
  saltAdditions: SaltAdditionRow[];
  setSaving: (value: boolean) => void;
  setSaveStatus: (value: string | null) => void;
}) {
  const state = useNativeWaterSpargeAcidificationState({
    waterProfiles: params.waterProfiles,
  });

  const submit = useNativeWaterSpargeAcidificationSubmit({
    ...params,
    state,
  });

  return {
    spargeWaterProfileId: state.spargeWaterProfileId,
    setSpargeWaterProfileId: state.setSpargeWaterProfileId,
    startingAlk: state.startingAlk,
    setStartingAlk: state.setStartingAlk,
    startingAlkTouched: state.startingAlkTouched,
    setStartingAlkTouched: state.setStartingAlkTouched,
    startingPh: state.startingPh,
    setStartingPh: state.setStartingPh,
    targetPh: state.targetPh,
    setTargetPh: state.setTargetPh,
    volumeLiters: state.volumeLiters,
    setVolumeLiters: state.setVolumeLiters,
    acidType: state.acidType,
    setAcidType: state.setAcidType,
    strengthKind: state.strengthKind,
    setStrengthKind: state.setStrengthKind,
    strengthValue: state.strengthValue,
    setStrengthValue: state.setStrengthValue,
    acidificationMode: state.acidificationMode,
    setAcidificationMode: state.setAcidificationMode,
    manualAcidAdded: state.manualAcidAdded,
    setManualAcidAdded: state.setManualAcidAdded,
    spargeResult: state.spargeResult,
    spargeManualResult: state.spargeManualResult,
    calcSaveStatus: state.calcSaveStatus,
    submitting: state.submitting,
    selectedProfile: state.selectedProfile,
    derivedStartingAlkPpmCaCO3: state.derivedStartingAlkPpmCaCO3,
    hydrateSpargeAcidification: state.hydrateSpargeAcidification,
    onSaveDraft: submit.onSaveDraft,
    onCalculateAndSave: submit.onCalculateAndSave,
    acidTypeOptions: SPARGE_ACID_TYPE_OPTIONS,
    strengthKindOptions: SPARGE_STRENGTH_KIND_OPTIONS,
  };
}
