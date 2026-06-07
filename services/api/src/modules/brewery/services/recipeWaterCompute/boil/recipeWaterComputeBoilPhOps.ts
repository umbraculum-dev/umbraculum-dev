import type { BoilComputeAndSaveInput } from "../../recipeWaterComputeAndSaveService.js";
import {
  alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult,
  combineAfterSaltsAndAcid,
} from "../../waterCalc/overall.js";
import type { SpargeAcidificationResult } from "../../waterCalc/spargeAcidification.js";
import type { WaterCalcDerivation } from "../../waterCalc/derivation/types.js";
import type { applySaltAdditions } from "../../waterCalc/saltAdditions.js";
import { parseAcidType, parseSaltAdditions, parseStrengthKind, type Mode } from "../recipeWaterComputeHelpers.js";
import type { BoilAcidResult } from "./recipeWaterComputeBoilAcidOps.js";

export type BoilOverallStageResult = {
  overall: {
    calculatedAt: string;
    ionsPpm: ReturnType<typeof combineAfterSaltsAndAcid>;
    finalAlkalinityPpmCaCO3: number;
    ph: { kind: "target" | "estimated"; value: number };
    debug: Record<string, unknown>;
  };
  overallDerivation: WaterCalcDerivation;
  acidPredicted: SpargeAcidificationResult;
};

export function buildBoilOverallStage(
  salts: ReturnType<typeof applySaltAdditions>,
  acidResult: BoilAcidResult,
  mode: Mode,
  startingAlkalinityPpmCaCO3: number,
  startingPh: number,
  targetPh: number,
  derivedVolumeLiters: number,
  nowIso: string,
): BoilOverallStageResult {
  const acidPredicted: SpargeAcidificationResult =
    "predicted" in acidResult ? acidResult.predicted : acidResult;
  const achievedPh: number | null =
    "achievedPh" in acidResult ? acidResult.achievedPh : null;
  const ionsPpm = combineAfterSaltsAndAcid({ afterSalts: salts.resultingProfile, acidResult: acidPredicted });
  const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);

  const overall = {
    calculatedAt: nowIso,
    ionsPpm,
    finalAlkalinityPpmCaCO3: acidPredicted.finalAlkalinityPpmCaCO3,
    ph: {
      kind: mode === "manual" ? ("estimated" as const) : ("target" as const),
      value: mode === "manual" && achievedPh !== null ? achievedPh : targetPh,
    },
    debug: {
      startingAlkalinityPpmCaCO3,
      startingAlkalinityAfterSaltsPpmCaCO3: alkalinityAfterSaltsPpmCaCO3,
      saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
      acidSulfateAddedPpm: acidPredicted.sulfateAddedPpm,
      acidChlorideAddedPpm: acidPredicted.chlorideAddedPpm,
      boilMode: mode,
    },
  };

  const overallDerivation: WaterCalcDerivation = {
    kind: "boil_overall",
    version: 1,
    formulaId: "water.boil_overall.v1",
    inputs: [
      { id: "volumeLiters", value: { kind: "number", value: derivedVolumeLiters, unit: "L" } },
      { id: "startingAlk", value: { kind: "number", value: startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "startingPh", value: { kind: "number", value: startingPh, unit: "pH" } },
      { id: "targetPh", value: { kind: "number", value: mode === "manual" && achievedPh !== null ? achievedPh : targetPh, unit: "pH" } },
    ],
    intermediates: [
      { id: "alkAfterSalts", value: { kind: "number", value: alkalinityAfterSaltsPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "acidSulfateAddedPpm", value: { kind: "number", value: acidPredicted.sulfateAddedPpm, unit: "ppm" } },
      { id: "acidChlorideAddedPpm", value: { kind: "number", value: acidPredicted.chlorideAddedPpm, unit: "ppm" } },
    ],
    notes: ["counter_ions_only_for_sulfuric_or_hydrochloric"],
    breakdowns: [
      {
        id: "saltBreakdown",
        rows: salts.breakdown.map((b) => ({
          saltKey: { kind: "string", value: b.saltKey },
          grams: { kind: "number", value: b.grams, unit: "g" },
          calciumPpm: { kind: "number", value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
          magnesiumPpm: { kind: "number", value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
          sodiumPpm: { kind: "number", value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
          sulfatePpm: { kind: "number", value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
          chloridePpm: { kind: "number", value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
          bicarbonatePpm: { kind: "number", value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
        })),
      },
    ],
  };

  return { overall, overallDerivation, acidPredicted };
}

export function buildBoilSettingsPatch(params: {
  input: BoilComputeAndSaveInput;
  tap: number;
  dil: number;
  derivedVolumeLiters: number;
  mode: Mode;
  acidType: ReturnType<typeof parseAcidType>;
  strengthKind: ReturnType<typeof parseStrengthKind>;
  strengthValue: BoilComputeAndSaveInput["boilStrengthValue"];
  additions: ReturnType<typeof parseSaltAdditions>;
  salts: ReturnType<typeof applySaltAdditions>;
  overall: BoilOverallStageResult["overall"];
  acidResult: BoilAcidResult;
  acidPredicted: SpargeAcidificationResult;
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  nowIso: string;
}): Record<string, unknown> {
  const {
    input,
    tap,
    dil,
    derivedVolumeLiters,
    mode,
    acidType,
    strengthKind,
    strengthValue,
    additions,
    salts,
    overall,
    acidResult,
    acidPredicted,
    startingAlkalinityPpmCaCO3,
    startingPh,
    targetPh,
    nowIso,
  } = params;

  const patch: Record<string, unknown> = {
    boilSourceWaterProfileId: input.boilSourceWaterProfileId,
    boilDilutionWaterProfileId: input.boilDilutionWaterProfileId,
    boilTapWaterVolumeLiters: tap,
    boilDilutionWaterVolumeLiters: dil,

    boilStartingAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
    boilStartingPh: startingPh,
    boilTargetPh: targetPh,
    boilWaterVolumeLiters: derivedVolumeLiters,
    boilAcidType: acidType,
    boilStrengthKind: strengthKind,
    boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
    boilAcidificationMode: mode,
    boilManualAcidAddedMl: strengthKind === "solid" ? null : input.boilManualAcidAddedMl,
    boilManualAcidAddedGrams: strengthKind === "solid" ? input.boilManualAcidAddedGrams : null,

    boilSaltAdditionsJson: additions,
    boilSaltsLastResultJson: { calculatedAt: nowIso, result: salts },

    boilOverallLastResultJson: overall,
    boilOverallLastCalculatedAt: nowIso,
  };

  if (mode === "manual" && "predicted" in acidResult) {
    patch["boilLastAcidRequiredMl"] = acidPredicted.acidRequiredMl ?? null;
    patch["boilLastAcidRequiredTsp"] = acidPredicted.acidRequiredTsp ?? null;
    patch["boilLastAcidRequiredGrams"] = acidPredicted.acidRequiredGrams ?? null;
    patch["boilLastAcidRequiredKg"] = acidPredicted.acidRequiredKg ?? null;
    patch["boilLastFinalAlkalinityPpmCaCO3"] = acidPredicted.finalAlkalinityPpmCaCO3;
    patch["boilLastSulfateAddedPpm"] = acidPredicted.sulfateAddedPpm;
    patch["boilLastChlorideAddedPpm"] = acidPredicted.chlorideAddedPpm;
    patch["boilLastCalculatedAt"] = nowIso;

    patch["boilManualLastAchievedPh"] = acidResult.achievedPh;
    patch["boilManualLastFinalAlkalinityPpmCaCO3"] = acidPredicted.finalAlkalinityPpmCaCO3;
    patch["boilManualLastSulfateAddedPpm"] = acidPredicted.sulfateAddedPpm;
    patch["boilManualLastChlorideAddedPpm"] = acidPredicted.chlorideAddedPpm;
    patch["boilManualLastCalculatedAt"] = nowIso;
  } else if (mode !== "manual") {
    const r = acidResult as SpargeAcidificationResult;
    patch["boilLastAcidRequiredMl"] = r.acidRequiredMl ?? null;
    patch["boilLastAcidRequiredTsp"] = r.acidRequiredTsp ?? null;
    patch["boilLastAcidRequiredGrams"] = r.acidRequiredGrams ?? null;
    patch["boilLastAcidRequiredKg"] = r.acidRequiredKg ?? null;
    patch["boilLastFinalAlkalinityPpmCaCO3"] = r.finalAlkalinityPpmCaCO3 ?? null;
    patch["boilLastSulfateAddedPpm"] = r.sulfateAddedPpm ?? null;
    patch["boilLastChlorideAddedPpm"] = r.chlorideAddedPpm ?? null;
    patch["boilLastCalculatedAt"] = nowIso;
  }

  return patch;
}
