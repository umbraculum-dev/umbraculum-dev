import { computeAndSaveSparge } from "@umbraculum/brewery-api-client";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import type { WaterAcidResult, WaterManualCalcResult } from "../../_lib/waterCalcTypes";

export type ComputeAndSaveSpargeResult = Awaited<ReturnType<typeof computeAndSaveSparge>>;

export type ApplySpargeComputeResultsState = {
  formatHints: Record<string, { decimals?: number }> | undefined;
  acidDerivation: WaterCalcDerivation;
  spargeManualResult: WaterManualCalcResult | null;
  spargeResult: WaterAcidResult | null;
  spargeStatus: string;
  calcSaveStatus: string;
};

export function deriveApplySpargeComputeResultsState(computed: ComputeAndSaveSpargeResult): ApplySpargeComputeResultsState {
  if (computed.acid.kind === "sparge_acidification_manual") {
    return {
      formatHints: computed.formatHints as Record<string, { decimals?: number }> | undefined,
      acidDerivation: computed.acid.derivation,
      spargeManualResult: computed.acid.result,
      spargeResult: computed.acid.result.predicted ?? null,
      spargeStatus: "Estimated (manual mode).",
      calcSaveStatus: "Estimated & saved snapshot.",
    };
  }

  return {
    formatHints: computed.formatHints as Record<string, { decimals?: number }> | undefined,
    acidDerivation: computed.acid.derivation,
    spargeManualResult: null,
    spargeResult: computed.acid.result,
    spargeStatus: "Calculated.",
    calcSaveStatus: "Calculated & saved snapshot.",
  };
}

export function applySpargeComputeResultsState(
  next: ApplySpargeComputeResultsState,
  set: {
    setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
    setAcidDerivation: (value: WaterCalcDerivation | null) => void;
    setSpargeManualResult: (value: WaterManualCalcResult | null) => void;
    setSpargeResult: (value: WaterAcidResult | null) => void;
    setSpargeStatus: (value: string | null) => void;
    setCalcSaveStatus: (value: string | null) => void;
  },
) {
  set.setFormatHints(next.formatHints);
  set.setAcidDerivation(next.acidDerivation);
  set.setSpargeManualResult(next.spargeManualResult);
  set.setSpargeResult(next.spargeResult);
  set.setSpargeStatus(next.spargeStatus);
  set.setCalcSaveStatus(next.calcSaveStatus);
}
