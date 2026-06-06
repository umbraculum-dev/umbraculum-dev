import type { MutableRefObject } from "react";

import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

import type { GristRow } from "../../../../../_lib/grist";
import type { IonProfilePpm } from "../../_lib/waterChem";
import {
  parseWaterStrengthKind,
  type MashOverallResult,
  type WaterAcidResult,
  type WaterAcidificationMode,
  type WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";

export type MixedSourceProfile = {
  name: string;
  totalVolumeLiters: number;
} & IonProfilePpm;

export type MashAdjustmentFieldsRef = MutableRefObject<{
  sourceProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  mixedSourceProfile: MixedSourceProfile | null;
  derivedMashWaterVolumeLiters: number;
}>;

export type MashGristBridgeRef = MutableRefObject<{
  gristImportedRows: GristRow[];
}>;

export type MashSaltsBridgeLike = MutableRefObject<{
  applySaltsFromCompute: (
    result: import("../../_lib/waterCalcTypes").SaltAdditionsResult,
    derivation: import("@umbraculum/contracts").WaterCalcDerivation,
  ) => void;
  ensureZeroSaltsSnapshotIfMissing: () => Promise<void>;
}>;

export type MashAcidificationHydrationState = {
  mashStartingAlk: number;
  mashStartingAlkTouched: boolean;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: string;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  mashStrengthValue: number;
  mashAcidificationMode: WaterAcidificationMode;
  mashManualAcidAdded: number;
  mashResult: WaterAcidResult | null;
  mashStatus: string | null;
  mashManualResult: WaterManualCalcResult | null;
  mashManualStatus: string | null;
  overallResult: MashOverallResult | null;
  overallStatus: string | null;
};

export type MashAcidificationHydrationSetters = {
  setMashStartingAlk: (value: number) => void;
  setMashStartingAlkTouched: (value: boolean) => void;
  setMashStartingPh: (value: number) => void;
  setMashTargetPh: (value: number) => void;
  setMashAcidType: (value: string) => void;
  setMashStrengthKind: (value: "percent" | "normality" | "molarity" | "solid") => void;
  setMashStrengthValue: (value: number) => void;
  setMashAcidificationMode: (value: WaterAcidificationMode) => void;
  setMashManualAcidAdded: (value: number) => void;
  setMashResult: (value: WaterAcidResult | null) => void;
  setMashStatus: (value: string | null) => void;
  setMashManualResult: (value: WaterManualCalcResult | null) => void;
  setMashManualStatus: (value: string | null) => void;
  setOverallResult: (value: MashOverallResult | null) => void;
  setOverallStatus: (value: string | null) => void;
};

export function deriveMashAcidificationHydrationState(s: RecipeWaterSettings): MashAcidificationHydrationState {
  const savedStartingAlk = s.mashStartingAlkalinityPpmCaCO3;
  let mashStartingAlk = 0;
  let mashStartingAlkTouched = false;
  if (typeof savedStartingAlk === "number" && Number.isFinite(savedStartingAlk)) {
    mashStartingAlk = savedStartingAlk;
    mashStartingAlkTouched = savedStartingAlk !== 0;
  }

  const savedKind = parseWaterStrengthKind(s.mashStrengthKind);

  let mashResult: WaterAcidResult | null = null;
  let mashStatus: string | null = null;
  if (s.mashLastCalculatedAt) {
    mashResult = {
      acidRequiredMl: s.mashLastAcidRequiredMl ?? null,
      acidRequiredTsp: s.mashLastAcidRequiredTsp ?? null,
      acidRequiredGrams: s.mashLastAcidRequiredGrams ?? null,
      acidRequiredKg: s.mashLastAcidRequiredKg ?? null,
      finalAlkalinityPpmCaCO3: s.mashLastFinalAlkalinityPpmCaCO3 ?? 0,
      sulfateAddedPpm: s.mashLastSulfateAddedPpm ?? 0,
      chlorideAddedPpm: s.mashLastChlorideAddedPpm ?? 0,
    };
    mashStatus = `Last calculated: ${new Date(s.mashLastCalculatedAt).toLocaleString()}`;
  }

  let mashManualResult: WaterManualCalcResult | null = null;
  let mashManualStatus: string | null = null;
  if (s.mashManualLastCalculatedAt) {
    mashManualResult = {
      achievedPh: s.mashManualLastAchievedPh ?? 0,
      predicted: {
        acidRequiredMl: null,
        acidRequiredTsp: null,
        acidRequiredGrams: null,
        acidRequiredKg: null,
        finalAlkalinityPpmCaCO3: s.mashManualLastFinalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: s.mashManualLastSulfateAddedPpm ?? 0,
        chlorideAddedPpm: s.mashManualLastChlorideAddedPpm ?? 0,
      },
      clamped: "none",
      iterations: 0,
      targetAmount: Number.NaN,
      predictedAmount: Number.NaN,
    };
    mashManualStatus = `Last calculated: ${new Date(s.mashManualLastCalculatedAt).toLocaleString()}`;
  }

  let overallResult: MashOverallResult | null = null;
  if (s.mashOverallLastResultJson && typeof s.mashOverallLastResultJson === "object") {
    overallResult = s.mashOverallLastResultJson as MashOverallResult;
  }

  let overallStatus: string | null = null;
  if (s.mashOverallLastCalculatedAt) {
    overallStatus = `Last calculated: ${new Date(s.mashOverallLastCalculatedAt).toLocaleString()}`;
  }

  return {
    mashStartingAlk,
    mashStartingAlkTouched,
    mashStartingPh: s.mashStartingPh ?? 7.0,
    mashTargetPh: s.mashTargetPh ?? DEFAULT_MASH_TARGET_PH,
    mashAcidType: s.mashAcidType ?? "lactic",
    mashStrengthKind: savedKind,
    mashStrengthValue: s.mashStrengthValue ?? 88,
    mashAcidificationMode: s.mashAcidificationMode === "manual" ? "manual" : "targetPh",
    mashManualAcidAdded:
      savedKind === "solid" ? (s.mashManualAcidAddedGrams ?? 0) : (s.mashManualAcidAddedMl ?? 0),
    mashResult,
    mashStatus,
    mashManualResult,
    mashManualStatus,
    overallResult,
    overallStatus,
  };
}

export function applyMashAcidificationHydrationState(
  h: MashAcidificationHydrationState,
  set: MashAcidificationHydrationSetters,
) {
  set.setMashStartingAlk(h.mashStartingAlk);
  set.setMashStartingAlkTouched(h.mashStartingAlkTouched);
  set.setMashStartingPh(h.mashStartingPh);
  set.setMashTargetPh(h.mashTargetPh);
  set.setMashAcidType(h.mashAcidType);
  set.setMashStrengthKind(h.mashStrengthKind);
  set.setMashStrengthValue(h.mashStrengthValue);
  set.setMashAcidificationMode(h.mashAcidificationMode);
  set.setMashManualAcidAdded(h.mashManualAcidAdded);
  set.setMashResult(h.mashResult);
  set.setMashStatus(h.mashStatus);
  set.setMashManualResult(h.mashManualResult);
  set.setMashManualStatus(h.mashManualStatus);
  set.setOverallResult(h.overallResult);
  set.setOverallStatus(h.overallStatus);
}
