import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import {
  SPARGE_ACID_TYPE_OPTIONS,
  SPARGE_STRENGTH_KIND_OPTIONS,
} from "../waterSparge/nativeWaterAcidificationOptions";
import { useNativeWaterBoilAcidificationState } from "./useNativeWaterBoilAcidificationState";
import { useNativeWaterBoilAcidificationSubmit } from "./useNativeWaterBoilAcidificationSubmit";

export function useNativeWaterBoilAcidification(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSettings: (s: Record<string, unknown>) => void;
  setError: (value: string | null) => void;
  setSaving: (value: boolean) => void;
  setSaveStatus: (value: string | null) => void;
  sourceProfileId: string;
  targetProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  derivedBoilWaterVolumeLiters: number;
  derivedStartingAlkPpmCaCO3: number | null;
  saltAdditions: SaltAdditionRow[];
}) {
  const state = useNativeWaterBoilAcidificationState({
    derivedStartingAlkPpmCaCO3: params.derivedStartingAlkPpmCaCO3,
  });

  const submit = useNativeWaterBoilAcidificationSubmit({
    ...params,
    state,
  });

  return {
    startingAlk: state.startingAlk,
    setStartingAlk: state.setStartingAlk,
    startingAlkTouched: state.startingAlkTouched,
    setStartingAlkTouched: state.setStartingAlkTouched,
    startingPh: state.startingPh,
    setStartingPh: state.setStartingPh,
    targetPh: state.targetPh,
    setTargetPh: state.setTargetPh,
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
    acidResult: state.acidResult,
    manualResult: state.manualResult,
    calcSaveStatus: state.calcSaveStatus,
    submitting: state.submitting,
    hydrateBoilAcidification: state.hydrateBoilAcidification,
    onSaveDraft: submit.onSaveDraft,
    onCalculateAndSave: submit.onCalculateAndSave,
    acidTypeOptions: SPARGE_ACID_TYPE_OPTIONS,
    strengthKindOptions: SPARGE_STRENGTH_KIND_OPTIONS,
  };
}
