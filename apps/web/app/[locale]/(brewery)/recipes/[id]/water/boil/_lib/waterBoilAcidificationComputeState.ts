import { computeAndSaveBoil } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import type {
  BoilOverallResultV0,
  WaterAcidResult,
  WaterManualCalcResult,
} from "../../_lib/waterCalcTypes";

export type ComputeAndSaveBoilResult = Awaited<ReturnType<typeof computeAndSaveBoil>>;

export type ApplyBoilComputeResultsState = {
  formatHints: Record<string, { decimals?: number }> | undefined;
  acidDerivation: WaterCalcDerivation;
  overallDerivation: WaterCalcDerivation;
  overallResult: BoilOverallResultV0;
  overallStatus: string;
  manualResult: WaterManualCalcResult | null;
  acidResult: WaterAcidResult | null;
  boilStatus: string;
  calcSaveStatus: string;
};

export function deriveApplyBoilComputeResultsState(computed: ComputeAndSaveBoilResult): ApplyBoilComputeResultsState {
  const base = {
    formatHints: computed.formatHints as Record<string, { decimals?: number }> | undefined,
    acidDerivation: computed.acid.derivation,
    overallDerivation: computed.overall.derivation,
    overallResult: computed.overall.result as unknown as BoilOverallResultV0,
    overallStatus: "Calculated.",
  };

  if (computed.acid.kind === "boil_acidification_manual") {
    return {
      ...base,
      manualResult: computed.acid.result,
      acidResult: computed.acid.result.predicted ?? null,
      boilStatus: "Estimated (manual mode).",
      calcSaveStatus: "Estimated & saved snapshot.",
    };
  }

  return {
    ...base,
    manualResult: null,
    acidResult: computed.acid.result,
    boilStatus: "Calculated.",
    calcSaveStatus: "Calculated & saved snapshot.",
  };
}
