"use client";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import type { IonProfilePpm } from "../../_lib/waterChem";
import type { SaltAdditionsResult } from "../../_lib/waterCalcTypes";

import { hasNonZeroSaltAdditions, useWaterMashSaltsLoad } from "./useWaterMashSaltsLoad";
import { useWaterMashSaltsPatch } from "./useWaterMashSaltsPatch";
import { useWaterMashSaltsSave } from "./useWaterMashSaltsSave";

type MixedSourceProfile = {
  name: string;
  totalVolumeLiters: number;
} & IonProfilePpm;

export function useWaterMashSalts(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  mixedSourceProfile: MixedSourceProfile | null;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  derivedMashWaterVolumeLiters: number;
  selectedSource: { id: string } | null;
  selectedDilution: { id: string } | null;
  saltAdditions: SaltAdditionRow[];
  setSaltAdditions: (rows: SaltAdditionRow[]) => void;
}) {
  const load = useWaterMashSaltsLoad({
    setSaltAdditions: params.setSaltAdditions,
    derivedMashWaterVolumeLiters: params.derivedMashWaterVolumeLiters,
  });

  const patch = useWaterMashSaltsPatch({
    canCall: params.canCall,
    saveSettings: params.saveSettings,
    mixedSourceProfile: params.mixedSourceProfile,
    tapVolumeLiters: params.tapVolumeLiters,
    dilutionVolumeLiters: params.dilutionVolumeLiters,
    selectedSource: params.selectedSource,
    selectedDilution: params.selectedDilution,
    saltAdditions: params.saltAdditions,
    saltsResult: load.saltsResult,
    setSaltsError: load.setSaltsError,
    setSaltsStatus: load.setSaltsStatus,
    setSaltsCalcSaveStatus: load.setSaltsCalcSaveStatus,
    setSaltsResult: load.setSaltsResult,
    setSaltsDerivation: load.setSaltsDerivation,
    setSaltsSubmitting: load.setSaltsSubmitting,
  });

  const save = useWaterMashSaltsSave({
    saveSettings: params.saveSettings,
    setSavingError: params.setSavingError,
    saltAdditions: params.saltAdditions,
    setSaltsSaveStatus: load.setSaltsSaveStatus,
    setSavingSalts: load.setSavingSalts,
  });

  return {
    saltsError: load.saltsError,
    setSaltsError: load.setSaltsError,
    saltsStatus: load.saltsStatus,
    setSaltsStatus: load.setSaltsStatus,
    saltsSaveStatus: load.saltsSaveStatus,
    setSaltsSaveStatus: load.setSaltsSaveStatus,
    saltsCalcSaveStatus: load.saltsCalcSaveStatus,
    setSaltsCalcSaveStatus: load.setSaltsCalcSaveStatus,
    saltsSubmitting: load.saltsSubmitting,
    setSaltsSubmitting: load.setSaltsSubmitting,
    savingSalts: load.savingSalts,
    setSavingSalts: load.setSavingSalts,
    saltsResult: load.saltsResult,
    setSaltsResult: load.setSaltsResult,
    saltsDerivation: load.saltsDerivation,
    setSaltsDerivation: load.setSaltsDerivation,
    hydrateMashSalts: load.hydrateMashSalts,
    onSaveSaltAdditions: save.onSaveSaltAdditions,
    onCalcSalts: patch.onCalcSalts,
    hasNonZeroSaltAdditions,
    ensureZeroSaltsSnapshotIfMissing: patch.ensureZeroSaltsSnapshotIfMissing,
    applySaltsFromCompute: load.applySaltsFromCompute,
    saltDerivationForMath: load.saltDerivationForMath,
  };
}

export type MashSaltsBridgeRef = {
  current: {
    applySaltsFromCompute: (result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => void;
    ensureZeroSaltsSnapshotIfMissing: () => Promise<void>;
  };
};
