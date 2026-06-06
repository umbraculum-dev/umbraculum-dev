import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import type {
  MashOverallResult,
  WaterAcidResult,
  WaterAcidificationMode,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";
import type {
  MashAdjustmentFieldsRef,
  MashGristBridgeRef,
  MashSaltsBridgeLike,
} from "./waterMashAcidificationHydration";
import { buildWaterMashAcidificationComputeMethods } from "./waterMashAcidificationComputeMethods";
import { buildWaterMashAcidificationPatchHandlers } from "./waterMashAcidificationPatchHandlers";

export type WaterMashAcidificationHandlerDeps = {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  saltsBridgeRef: MashSaltsBridgeLike;
  adjustmentFieldsRef: MashAdjustmentFieldsRef;
  gristBridgeRef: MashGristBridgeRef;
  mashStartingAlk: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: string;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  mashStrengthValue: number;
  mashAcidificationMode: WaterAcidificationMode;
  mashManualAcidAdded: number;
  saltAdditions: SaltAdditionRow[];
  setMashSaveStatus: (value: string | null) => void;
  setSavingMash: (value: boolean) => void;
  setOverallDerivation: (value: WaterCalcDerivation | null) => void;
  setMashError: (value: string | null) => void;
  setMashStatus: (value: string | null) => void;
  setMashManualStatus: (value: string | null) => void;
  setMashCalcSaveStatus: (value: string | null) => void;
  setMashResult: (value: WaterAcidResult | null) => void;
  setMashManualResult: (value: WaterManualCalcResult | null) => void;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  setMashSubmitting: (value: boolean) => void;
  setOverallError: (value: string | null) => void;
  setOverallStatus: (value: string | null) => void;
  setOverallSaveStatus: (value: string | null) => void;
  setSavingOverall: (value: boolean) => void;
  setOverallResult: (value: MashOverallResult | null) => void;
};

export function buildWaterMashAcidificationHandlerMethods(deps: WaterMashAcidificationHandlerDeps) {
  const compute = buildWaterMashAcidificationComputeMethods(deps);
  const patch = buildWaterMashAcidificationPatchHandlers(deps, compute);
  return {
    applyComputeResults: compute.applyComputeResults,
    computeAndSaveMashSnapshots: compute.computeAndSaveMashSnapshots,
    computeOverallMash: compute.computeOverallMash,
    ...patch,
    _calcMashEstimatedPh: compute._calcMashEstimatedPh,
  };
}
