import type { MutableRefObject } from "react";

import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import {
  parseWaterStrengthKind,
  type SaltAdditionsResult,
  type WaterAcidResult,
  type WaterAcidificationMode,
  type WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

export type SpargeSaltsBridgeRef = MutableRefObject<{
  applySaltsFromCompute: (result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => void;
  buildSpargeSaltsInputsKey: () => string;
  spargeSaltsResult: SaltAdditionsResult | null;
}>;

export type SpargeAcidificationHydrationState = {
  startingAlk: number;
  startingAlkTouched: boolean;
  startingPh: string;
  targetPh: number;
  volumeLiters: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  spargeWaterProfileId: string;
  spargeAcidificationMode: WaterAcidificationMode;
  spargeManualAcidAdded: number;
  spargeResult: WaterAcidResult | null;
  spargeStatus: string | null;
  spargeManualResult: WaterManualCalcResult | null;
};

export type SpargeAcidificationHydrationSetters = {
  setStartingAlk: (value: number) => void;
  setStartingAlkTouched: (value: boolean) => void;
  setStartingPh: (value: string) => void;
  setTargetPh: (value: number) => void;
  setVolumeLiters: (value: number) => void;
  setAcidType: (value: string) => void;
  setStrengthKind: (value: "percent" | "normality" | "molarity" | "solid") => void;
  setStrengthValue: (value: number) => void;
  setSpargeWaterProfileId: (value: string) => void;
  setSpargeAcidificationMode: (value: WaterAcidificationMode) => void;
  setSpargeManualAcidAdded: (value: number) => void;
  setSpargeResult: (value: WaterAcidResult | null) => void;
  setSpargeStatus: (value: string | null) => void;
  setSpargeManualResult: (value: WaterManualCalcResult | null) => void;
};

export function deriveSpargeAcidificationHydrationState(
  s: NonNullable<RecipeWaterSettingsResponse["settings"]>,
): SpargeAcidificationHydrationState {
  const savedStartingAlk = s.spargeStartingAlkalinityPpmCaCO3;
  let startingAlk = 0;
  let startingAlkTouched = false;
  if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
    startingAlk = savedStartingAlk;
    startingAlkTouched = savedStartingAlk !== 0;
  }

  const savedStrengthKind = parseWaterStrengthKind(s.spargeStrengthKind);

  let spargeResult: WaterAcidResult | null = null;
  let spargeStatus: string | null = null;
  if (s.spargeLastCalculatedAt) {
    spargeResult = {
      acidRequiredMl: s.spargeLastAcidRequiredMl,
      acidRequiredTsp: s.spargeLastAcidRequiredTsp,
      acidRequiredGrams: s.spargeLastAcidRequiredGrams,
      acidRequiredKg: s.spargeLastAcidRequiredKg,
      finalAlkalinityPpmCaCO3: s.spargeLastFinalAlkalinityPpmCaCO3 ?? 0,
      sulfateAddedPpm: s.spargeLastSulfateAddedPpm ?? 0,
      chlorideAddedPpm: s.spargeLastChlorideAddedPpm ?? 0,
    };
    spargeStatus = `Last calculated: ${new Date(s.spargeLastCalculatedAt).toLocaleString()}`;
  }

  let spargeManualResult: WaterManualCalcResult | null = null;
  if (s.spargeManualLastCalculatedAt) {
    spargeManualResult = {
      achievedPh: s.spargeManualLastAchievedPh ?? 0,
      predicted: {
        acidRequiredMl: null,
        acidRequiredTsp: null,
        acidRequiredGrams: null,
        acidRequiredKg: null,
        finalAlkalinityPpmCaCO3: s.spargeManualLastFinalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: s.spargeManualLastSulfateAddedPpm ?? 0,
        chlorideAddedPpm: s.spargeManualLastChlorideAddedPpm ?? 0,
      },
      clamped: "none",
      iterations: 0,
      targetAmount: Number.NaN,
      predictedAmount: Number.NaN,
    };
  }

  return {
    startingAlk,
    startingAlkTouched,
    startingPh: String(s.spargeStartingPh ?? 7.0),
    targetPh: s.spargeTargetPh ?? 5.6,
    volumeLiters: s.spargeVolumeLiters ?? 20,
    acidType: s.spargeAcidType ?? "phosphoric",
    strengthKind: savedStrengthKind,
    strengthValue: s.spargeStrengthValue ?? 10,
    spargeWaterProfileId: s.spargeWaterProfileId ?? "",
    spargeAcidificationMode: s.spargeAcidificationMode === "manual" ? "manual" : "targetPh",
    spargeManualAcidAdded:
      savedStrengthKind === "solid" ? (s.spargeManualAcidAddedGrams ?? 0) : (s.spargeManualAcidAddedMl ?? 0),
    spargeResult,
    spargeStatus,
    spargeManualResult,
  };
}

export function applySpargeAcidificationHydrationState(
  h: SpargeAcidificationHydrationState,
  set: SpargeAcidificationHydrationSetters,
) {
  set.setStartingAlk(h.startingAlk);
  set.setStartingAlkTouched(h.startingAlkTouched);
  set.setStartingPh(h.startingPh);
  set.setTargetPh(h.targetPh);
  set.setVolumeLiters(h.volumeLiters);
  set.setAcidType(h.acidType);
  set.setStrengthKind(h.strengthKind);
  set.setStrengthValue(h.strengthValue);
  set.setSpargeWaterProfileId(h.spargeWaterProfileId);
  set.setSpargeAcidificationMode(h.spargeAcidificationMode);
  set.setSpargeManualAcidAdded(h.spargeManualAcidAdded);
  set.setSpargeResult(h.spargeResult);
  set.setSpargeStatus(h.spargeStatus);
  set.setSpargeManualResult(h.spargeManualResult);
}
