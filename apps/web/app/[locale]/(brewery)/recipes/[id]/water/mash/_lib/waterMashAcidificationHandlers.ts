import type { FormEvent } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import type {
  MashOverallResult,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";
import type { ComputeAndSaveMashResult } from "./waterMashAcidificationComputeState";
export {
  applyDerivedComputeResultsState,
  deriveApplyComputeResultsState,
  parseEstimatedMashPhFromResult,
  type ApplyComputeResultsSetters,
  type ApplyComputeResultsState,
  type ComputeAndSaveMashResult,
} from "./waterMashAcidificationComputeState";
export { createWaterMashAcidificationHandlers } from "./waterMashAcidificationHandlerFactory";

export type WaterMashAcidificationModel = {
  mashStartingAlk: number;
  setMashStartingAlk: (value: number) => void;
  mashStartingAlkTouched: boolean;
  setMashStartingAlkTouched: (value: boolean) => void;
  mashStartingPh: number;
  setMashStartingPh: (value: number) => void;
  mashTargetPh: number;
  setMashTargetPh: (value: number) => void;
  mashAcidType: string;
  setMashAcidType: (value: string) => void;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  setMashStrengthKind: (value: "percent" | "normality" | "molarity" | "solid") => void;
  mashStrengthValue: number;
  setMashStrengthValue: (value: number) => void;
  mashAcidificationMode: WaterAcidificationMode;
  setMashAcidificationMode: (value: WaterAcidificationMode) => void;
  mashManualAcidAdded: number;
  setMashManualAcidAdded: (value: number) => void;
  saltAdditions: SaltAdditionRow[];
  setSaltAdditions: (value: SaltAdditionRow[]) => void;
  mashError: string | null;
  setMashError: (value: string | null) => void;
  _mashStatus: string | null;
  setMashStatus: (value: string | null) => void;
  _mashManualStatus: string | null;
  setMashManualStatus: (value: string | null) => void;
  mashSaveStatus: string | null;
  setMashSaveStatus: (value: string | null) => void;
  mashCalcSaveStatus: string | null;
  setMashCalcSaveStatus: (value: string | null) => void;
  mashSubmitting: boolean;
  setMashSubmitting: (value: boolean) => void;
  savingMash: boolean;
  setSavingMash: (value: boolean) => void;
  mashResult: WaterAcidResult | null;
  setMashResult: (value: WaterAcidResult | null) => void;
  mashManualResult: WaterManualCalcResult | null;
  setMashManualResult: (value: WaterManualCalcResult | null) => void;
  acidDerivation: WaterCalcDerivation | null;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  overallError: string | null;
  setOverallError: (value: string | null) => void;
  overallStatus: string | null;
  setOverallStatus: (value: string | null) => void;
  overallSaveStatus: string | null;
  setOverallSaveStatus: (value: string | null) => void;
  savingOverall: boolean;
  setSavingOverall: (value: boolean) => void;
  overallResult: MashOverallResult | null;
  setOverallResult: (value: MashOverallResult | null) => void;
  overallDerivation: WaterCalcDerivation | null;
  setOverallDerivation: (value: WaterCalcDerivation | null) => void;
  hydrateMashAcidification: (s: RecipeWaterSettings) => void;
  onSaveMashInputs: () => Promise<void>;
  computeAndSaveMashSnapshots: () => Promise<ComputeAndSaveMashResult>;
  computeOverallMash: () => Promise<MashOverallResult>;
  onCalculateOverall: (saveAlso: boolean) => Promise<void>;
  onSubmitMash: (e: FormEvent) => Promise<void>;
  _calcMashEstimatedPh: (args: {
    volumeLiters: number;
    alkalinityPpmCaCO3: number;
    calciumPpm?: number;
    magnesiumPpm?: number;
    grist: Array<{
      amountKg: number;
      colorLovibond: number | null;
      maltClass: "base" | "crystal" | "roast" | "acid";
      mashDiPh?: number | null;
      mashTaToPh57_mEqPerKg?: number | null;
    }>;
    acidAdded_mEqPerL?: number;
  }) => Promise<number | null>;
};

export function buildWaterMashAcidificationModel(model: WaterMashAcidificationModel) {
  return model;
}
