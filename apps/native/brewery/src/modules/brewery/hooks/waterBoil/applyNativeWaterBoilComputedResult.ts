import type { computeAndSaveBoil } from "@umbraculum/api-client/brewery";

import type { NativeWaterBoilAcidificationState } from "./useNativeWaterBoilAcidificationState";

type Computed = Awaited<ReturnType<typeof computeAndSaveBoil>>;

export function applyNativeWaterBoilComputedResult(
  computed: Computed,
  state: Pick<
    NativeWaterBoilAcidificationState,
    "setManualResult" | "setAcidResult" | "setCalcSaveStatus"
  >,
) {
  state.setManualResult(null);
  state.setAcidResult(null);
  if (computed.acid.kind === "boil_acidification_manual") {
    const r = computed.acid.result;
    state.setManualResult({
      achievedPh: r.achievedPh ?? 0,
      predicted: {
        finalAlkalinityPpmCaCO3: r.predicted?.finalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: r.predicted?.sulfateAddedPpm ?? 0,
        chlorideAddedPpm: r.predicted?.chlorideAddedPpm ?? 0,
      },
    });
    state.setAcidResult(r.predicted ?? null);
    state.setCalcSaveStatus("Estimated & saved snapshot.");
  } else {
    const r = computed.acid.result;
    state.setAcidResult({
      acidRequiredMl: r.acidRequiredMl ?? null,
      acidRequiredTsp: r.acidRequiredTsp ?? null,
      acidRequiredGrams: r.acidRequiredGrams ?? null,
      acidRequiredKg: r.acidRequiredKg ?? null,
      finalAlkalinityPpmCaCO3: r.finalAlkalinityPpmCaCO3 ?? 0,
      sulfateAddedPpm: r.sulfateAddedPpm ?? 0,
      chlorideAddedPpm: r.chlorideAddedPpm ?? 0,
    });
    state.setCalcSaveStatus("Calculated & saved snapshot.");
  }
}
