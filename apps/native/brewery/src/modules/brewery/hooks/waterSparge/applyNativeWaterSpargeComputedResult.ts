import type { computeAndSaveSparge } from "@umbraculum/brewery-api-client";

import type { NativeWaterSpargeAcidificationState } from "./useNativeWaterSpargeAcidificationState";

type Computed = Awaited<ReturnType<typeof computeAndSaveSparge>>;

export function applyNativeWaterSpargeComputedResult(
  computed: Computed,
  state: Pick<
    NativeWaterSpargeAcidificationState,
    "setSpargeResult" | "setSpargeManualResult" | "setCalcSaveStatus"
  >,
) {
  state.setSpargeManualResult(null);
  state.setSpargeResult(null);
  if (computed.acid.kind === "sparge_acidification_manual") {
    const r = computed.acid.result;
    state.setSpargeManualResult({
      achievedPh: r.achievedPh ?? 0,
      predicted: {
        finalAlkalinityPpmCaCO3: r.predicted?.finalAlkalinityPpmCaCO3 ?? 0,
        sulfateAddedPpm: r.predicted?.sulfateAddedPpm ?? 0,
        chlorideAddedPpm: r.predicted?.chlorideAddedPpm ?? 0,
      },
    });
    state.setSpargeResult(r.predicted ?? null);
    state.setCalcSaveStatus("Estimated & saved snapshot.");
  } else {
    const r = computed.acid.result;
    state.setSpargeResult({
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
