"use client";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterProfile } from "@umbraculum/contracts";

import { hasNonZeroSaltAdditions, useWaterSpargeSaltsLoad } from "./useWaterSpargeSaltsLoad";
import { useWaterSpargeSaltsPatch } from "./useWaterSpargeSaltsPatch";
import { useWaterSpargeSaltsSave } from "./useWaterSpargeSaltsSave";

export function useWaterSpargeSalts(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  selectedSpargeProfile: WaterProfile | null;
  volumeLiters: number;
  spargeWaterProfileId: string;
  spargeSaltAdditions: SaltAdditionRow[];
  setSpargeSaltAdditions: (rows: SaltAdditionRow[]) => void;
  refreshSpargeOverallIfPossible: () => Promise<void>;
}) {
  const load = useWaterSpargeSaltsLoad({
    spargeWaterProfileId: params.spargeWaterProfileId,
    volumeLiters: params.volumeLiters,
    spargeSaltAdditions: params.spargeSaltAdditions,
    setSpargeSaltAdditions: params.setSpargeSaltAdditions,
    selectedSpargeProfile: params.selectedSpargeProfile,
  });

  const patch = useWaterSpargeSaltsPatch({
    canCall: params.canCall,
    saveSettings: params.saveSettings,
    selectedSpargeProfile: params.selectedSpargeProfile,
    volumeLiters: params.volumeLiters,
    spargeSaltAdditions: params.spargeSaltAdditions,
    spargeSaltsResult: load.spargeSaltsResult,
    spargeSaltsInputsKey: load.spargeSaltsInputsKey,
    buildSpargeSaltsInputsKey: load.buildSpargeSaltsInputsKey,
    refreshSpargeOverallIfPossible: params.refreshSpargeOverallIfPossible,
    setSpargeSaltsError: load.setSpargeSaltsError,
    setSpargeSaltsStatus: load.setSpargeSaltsStatus,
    setSpargeSaltsCalcSaveStatus: load.setSpargeSaltsCalcSaveStatus,
    setSpargeSaltsResult: load.setSpargeSaltsResult,
    setSaltDerivation: load.setSaltDerivation,
    setSpargeSaltsInputsKey: load.setSpargeSaltsInputsKey,
    setSpargeSaltsSubmitting: load.setSpargeSaltsSubmitting,
  });

  const save = useWaterSpargeSaltsSave({
    saveSettings: params.saveSettings,
    setSavingError: params.setSavingError,
    spargeSaltAdditions: params.spargeSaltAdditions,
    setSpargeSaltsSaveStatus: load.setSpargeSaltsSaveStatus,
    setSavingSpargeSalts: load.setSavingSpargeSalts,
  });

  return {
    spargeSaltsError: load.spargeSaltsError,
    setSpargeSaltsError: load.setSpargeSaltsError,
    spargeSaltsStatus: load.spargeSaltsStatus,
    setSpargeSaltsStatus: load.setSpargeSaltsStatus,
    spargeSaltsSaveStatus: load.spargeSaltsSaveStatus,
    setSpargeSaltsSaveStatus: load.setSpargeSaltsSaveStatus,
    spargeSaltsCalcSaveStatus: load.spargeSaltsCalcSaveStatus,
    setSpargeSaltsCalcSaveStatus: load.setSpargeSaltsCalcSaveStatus,
    spargeSaltsSubmitting: load.spargeSaltsSubmitting,
    savingSpargeSalts: load.savingSpargeSalts,
    spargeSaltsResult: load.spargeSaltsResult,
    setSpargeSaltsResult: load.setSpargeSaltsResult,
    saltDerivation: load.saltDerivation,
    setSaltDerivation: load.setSaltDerivation,
    spargeSaltsInputsKey: load.spargeSaltsInputsKey,
    hasNonZeroSaltAdditions,
    buildSpargeSaltsInputsKey: load.buildSpargeSaltsInputsKey,
    hydrateSpargeSalts: load.hydrateSpargeSalts,
    onSaveSpargeSaltsInputs: save.onSaveSpargeSaltsInputs,
    ensureSpargeSaltsSnapshotForAcidification: patch.ensureSpargeSaltsSnapshotForAcidification,
    onCalculateSpargeSalts: patch.onCalculateSpargeSalts,
    applySaltsFromCompute: load.applySaltsFromCompute,
    _spargeCalciumPpm: load._spargeCalciumPpm,
    _spargeMagnesiumPpm: load._spargeMagnesiumPpm,
  };
}
