import type { computeAndSaveMash } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import { asRecord } from "../../../../../_lib/typeGuards";
import type {
  MashOverallResult,
  SaltAdditionsResult,
  WaterAcidResult,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";

export type ComputeAndSaveMashResult = Awaited<ReturnType<typeof computeAndSaveMash>>;

export type ApplyComputeResultsState = {
  formatHints: Record<string, { decimals?: number }> | undefined;
  saltsResult: SaltAdditionsResult;
  saltsDerivation: WaterCalcDerivation;
  acidDerivation: WaterCalcDerivation;
  overallDerivation: WaterCalcDerivation;
  overallResult: MashOverallResult;
  overallStatus: string;
  mashManualResult: WaterManualCalcResult | null;
  mashManualStatus: string | null;
  mashResult: WaterAcidResult | null;
  mashStatus: string | null;
  mashCalcSaveStatus: string;
};

export function deriveApplyComputeResultsState(computed: ComputeAndSaveMashResult): ApplyComputeResultsState {
  const base = {
    formatHints: computed.formatHints as Record<string, { decimals?: number }> | undefined,
    saltsResult: computed.salts.result as unknown as SaltAdditionsResult,
    saltsDerivation: computed.salts.derivation as WaterCalcDerivation,
    acidDerivation: computed.acid.derivation,
    overallDerivation: computed.overall.derivation,
    overallResult: computed.overall.result as unknown as MashOverallResult,
    overallStatus: "Calculated.",
  };

  if (computed.acid.kind === "mash_acidification_manual") {
    return {
      ...base,
      mashManualResult: computed.acid.result,
      mashManualStatus: "Estimated (manual mode).",
      mashResult: computed.acid.result.predicted ?? null,
      mashStatus: null,
      mashCalcSaveStatus: "Estimated & saved snapshot.",
    };
  }

  return {
    ...base,
    mashManualResult: null,
    mashManualStatus: null,
    mashResult: computed.acid.result,
    mashStatus: "Calculated.",
    mashCalcSaveStatus: "Calculated & saved snapshot.",
  };
}

export function parseEstimatedMashPhFromResult(result: unknown): number | undefined {
  const resultRec = asRecord(result);
  return resultRec?.["estimatedMashPhRoomTemp"] as number;
}

export type ApplyComputeResultsSetters = {
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  applySaltsFromCompute: (result: SaltAdditionsResult, derivation: WaterCalcDerivation) => void;
  setAcidDerivation: (value: WaterCalcDerivation | null) => void;
  setOverallDerivation: (value: WaterCalcDerivation | null) => void;
  setOverallResult: (value: MashOverallResult | null) => void;
  setOverallStatus: (value: string | null) => void;
  setMashManualResult: (value: WaterManualCalcResult | null) => void;
  setMashManualStatus: (value: string | null) => void;
  setMashResult: (value: WaterAcidResult | null) => void;
  setMashStatus: (value: string | null) => void;
  setMashCalcSaveStatus: (value: string | null) => void;
};

export function applyDerivedComputeResultsState(next: ApplyComputeResultsState, set: ApplyComputeResultsSetters) {
  set.setFormatHints(next.formatHints);
  set.applySaltsFromCompute(next.saltsResult, next.saltsDerivation);
  set.setAcidDerivation(next.acidDerivation);
  set.setOverallDerivation(next.overallDerivation);
  set.setOverallResult(next.overallResult);
  set.setOverallStatus(next.overallStatus);
  set.setMashManualResult(next.mashManualResult);
  set.setMashManualStatus(next.mashManualStatus);
  set.setMashResult(next.mashResult);
  set.setMashStatus(next.mashStatus);
  set.setMashCalcSaveStatus(next.mashCalcSaveStatus);
}
