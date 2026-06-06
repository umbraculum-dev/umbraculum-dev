import type { MutableRefObject } from "react";

import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import type { IonProfilePpm } from "../../_lib/waterChem";
import {
  parseWaterStrengthKind,
  type BoilOverallResultV0,
  type SaltAdditionsResult,
  type WaterAcidResult,
  type WaterAcidificationMode,
  type WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

export type MixedSourceProfile = {
  name: string;
  totalVolumeLiters: number;
} & IonProfilePpm;

export type BoilAdjustmentFieldsRef = MutableRefObject<{
  sourceProfileId: string;
  targetProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  mixedSourceProfile: MixedSourceProfile | null;
  derivedBoilWaterVolumeLiters: number;
}>;

export type BoilSaltsBridgeRef = MutableRefObject<{
  applySaltsFromCompute: (result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => void;
  ensureZeroSaltsSnapshotIfMissing: () => Promise<void>;
}>;

export type BoilAcidificationHydrationState = {
  startingAlk: number;
  startingAlkTouched: boolean;
  startingPh: string;
  targetPh: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  acidificationMode: WaterAcidificationMode;
  manualAcidAdded: number;
  acidResult: WaterAcidResult | null;
  boilStatus: string | null;
  manualResult: WaterManualCalcResult | null;
  overallResult: BoilOverallResultV0 | null;
  overallStatus: string | null;
};

export type BoilAcidificationHydrationSetters = {
  setStartingAlk: (value: number) => void;
  setStartingAlkTouched: (value: boolean) => void;
  setStartingPh: (value: string) => void;
  setTargetPh: (value: number) => void;
  setAcidType: (value: string) => void;
  setStrengthKind: (value: "percent" | "normality" | "molarity" | "solid") => void;
  setStrengthValue: (value: number) => void;
  setAcidificationMode: (value: WaterAcidificationMode) => void;
  setManualAcidAdded: (value: number) => void;
  setAcidResult: (value: WaterAcidResult | null) => void;
  setBoilStatus: (value: string | null) => void;
  setManualResult: (value: WaterManualCalcResult | null) => void;
  setOverallResult: (value: BoilOverallResultV0 | null) => void;
  setOverallStatus: (value: string | null) => void;
};

export function deriveBoilAcidificationHydrationState(
  s: NonNullable<RecipeWaterSettingsResponse["settings"]>,
): BoilAcidificationHydrationState {
  const savedStartingAlk = s.boilStartingAlkalinityPpmCaCO3;
  let startingAlk = 0;
  let startingAlkTouched = false;
  if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
    startingAlk = savedStartingAlk;
    startingAlkTouched = savedStartingAlk !== 0;
  }

  const savedKind = parseWaterStrengthKind(s.boilStrengthKind);

  let acidResult: WaterAcidResult | null = null;
  let boilStatus: string | null = null;
  if (s.boilLastCalculatedAt) {
    acidResult = {
      acidRequiredMl: s.boilLastAcidRequiredMl ?? null,
      acidRequiredTsp: s.boilLastAcidRequiredTsp ?? null,
      acidRequiredGrams: s.boilLastAcidRequiredGrams ?? null,
      acidRequiredKg: s.boilLastAcidRequiredKg ?? null,
      finalAlkalinityPpmCaCO3: s.boilLastFinalAlkalinityPpmCaCO3 ?? 0,
      sulfateAddedPpm: s.boilLastSulfateAddedPpm ?? 0,
      chlorideAddedPpm: s.boilLastChlorideAddedPpm ?? 0,
    };
    boilStatus = `Last calculated: ${new Date(s.boilLastCalculatedAt).toLocaleString()}`;
  }

  let manualResult: WaterManualCalcResult | null = null;
  if (s.boilManualLastCalculatedAt) {
    manualResult = {
      achievedPh: s.boilManualLastAchievedPh ?? 0,
      predicted: {
        acidRequiredMl: null,
        acidRequiredTsp: null,
        acidRequiredGrams: null,
        acidRequiredKg: null,
        finalAlkalinityPpmCaCO3: s.boilManualLastFinalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: s.boilManualLastSulfateAddedPpm ?? 0,
        chlorideAddedPpm: s.boilManualLastChlorideAddedPpm ?? 0,
      },
      clamped: "none",
      iterations: 0,
      targetAmount: Number.NaN,
      predictedAmount: Number.NaN,
    };
  }

  let overallResult: BoilOverallResultV0 | null = null;
  if (s.boilOverallLastResultJson && typeof s.boilOverallLastResultJson === "object") {
    overallResult = s.boilOverallLastResultJson as BoilOverallResultV0;
  }

  let overallStatus: string | null = null;
  if (s.boilOverallLastCalculatedAt) {
    overallStatus = `Last calculated: ${new Date(s.boilOverallLastCalculatedAt).toLocaleString()}`;
  }

  return {
    startingAlk,
    startingAlkTouched,
    startingPh: String(s.boilStartingPh ?? 7.0),
    targetPh: s.boilTargetPh ?? 5.6,
    acidType: s.boilAcidType ?? "phosphoric",
    strengthKind: savedKind,
    strengthValue: s.boilStrengthValue ?? 10,
    acidificationMode: s.boilAcidificationMode === "manual" ? "manual" : "targetPh",
    manualAcidAdded: savedKind === "solid" ? (s.boilManualAcidAddedGrams ?? 0) : (s.boilManualAcidAddedMl ?? 0),
    acidResult,
    boilStatus,
    manualResult,
    overallResult,
    overallStatus,
  };
}

export function applyBoilAcidificationHydrationState(
  h: BoilAcidificationHydrationState,
  set: BoilAcidificationHydrationSetters,
) {
  set.setStartingAlk(h.startingAlk);
  set.setStartingAlkTouched(h.startingAlkTouched);
  set.setStartingPh(h.startingPh);
  set.setTargetPh(h.targetPh);
  set.setAcidType(h.acidType);
  set.setStrengthKind(h.strengthKind);
  set.setStrengthValue(h.strengthValue);
  set.setAcidificationMode(h.acidificationMode);
  set.setManualAcidAdded(h.manualAcidAdded);
  set.setAcidResult(h.acidResult);
  set.setBoilStatus(h.boilStatus);
  set.setManualResult(h.manualResult);
  set.setOverallResult(h.overallResult);
  set.setOverallStatus(h.overallStatus);
}

export function displayAlkalinityPpmCaCO3(v: number) {
  if (v < 0 && v > -1) return 0;
  return v;
}
