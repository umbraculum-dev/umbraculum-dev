import type { MashComputeAndSaveInput } from "../../recipeWaterComputeAndSaveService.js";
import { alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult, combineAfterSaltsAndAcid } from "../../../domain/waterCalc/overall.js";
import type { SpargeAcidificationResult } from "../../../domain/waterCalc/spargeAcidification.js";
import type { MashAcidificationTargetMashPhResult } from "../../../domain/waterCalc/mashAcidificationTargetMashPh.js";
import type { WaterCalcDerivation } from "../../../domain/waterCalc/derivation/types.js";
import type { applySaltAdditions } from "../../../domain/waterCalc/saltAdditions.js";
import {
  ensureFinite,
  parseAcidType,
  parseSaltAdditions,
  parseStrengthKind,
  type Mode,
} from "../recipeWaterComputeHelpers.js";
import type { MashAcidResult } from "./recipeWaterComputeMashAcidOps.js";

export type MashOverallStageResult = {
  overall: {
    calculatedAt: string;
    ionsPpm: ReturnType<typeof combineAfterSaltsAndAcid>;
    finalAlkalinityPpmCaCO3: number;
    ph: { kind: "target" | "estimated"; value: number };
    debug: Record<string, unknown>;
  };
  overallDerivation: WaterCalcDerivation;
  acidPredicted: SpargeAcidificationResult | MashAcidificationTargetMashPhResult;
};

export function buildMashOverallStage(
  input: MashComputeAndSaveInput,
  salts: ReturnType<typeof applySaltAdditions>,
  acidResult: MashAcidResult,
  overallPh: { kind: "target" | "estimated"; value: number },
  mashMode: Mode,
  derivedVolumeLiters: number,
  nowIso: string,
): MashOverallStageResult {
  const startingAlkalinityPpmCaCO3 = ensureFinite(input.mashStartingAlkalinityPpmCaCO3, "mashStartingAlkalinityPpmCaCO3");
  const startingPh = ensureFinite(input.mashStartingPh, "mashStartingPh");

  const acidPredicted: SpargeAcidificationResult | MashAcidificationTargetMashPhResult =
    "predicted" in acidResult ? acidResult.predicted : acidResult;
  const ionsPpm = combineAfterSaltsAndAcid({ afterSalts: salts.resultingProfile, acidResult: acidPredicted });
  const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);

  const overall = {
    calculatedAt: nowIso,
    ionsPpm,
    finalAlkalinityPpmCaCO3: acidPredicted.finalAlkalinityPpmCaCO3,
    ph: overallPh,
    debug: {
      startingAlkalinityPpmCaCO3,
      startingAlkalinityAfterSaltsPpmCaCO3: alkalinityAfterSaltsPpmCaCO3,
      saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
      acidSulfateAddedPpm: acidPredicted.sulfateAddedPpm,
      acidChlorideAddedPpm: acidPredicted.chlorideAddedPpm,
      mashMode,
    },
  };

  const overallDerivation: WaterCalcDerivation = {
    kind: "mash_overall",
    version: 1,
    formulaId: "water.mash_overall.v1",
    inputs: [
      { id: "volumeLiters", value: { kind: "number", value: derivedVolumeLiters, unit: "L" } },
      { id: "startingAlk", value: { kind: "number", value: startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "startingPh", value: { kind: "number", value: startingPh, unit: "pH" } },
      { id: "targetPh", value: { kind: "number", value: overallPh.value, unit: "pH" } },
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

export function buildMashSettingsPatch(params: {
  input: MashComputeAndSaveInput;
  tap: number;
  dil: number;
  derivedVolumeLiters: number;
  mashMode: Mode;
  acidType: ReturnType<typeof parseAcidType>;
  strengthKind: ReturnType<typeof parseStrengthKind>;
  strengthValue: MashComputeAndSaveInput["mashStrengthValue"];
  additions: ReturnType<typeof parseSaltAdditions>;
  salts: ReturnType<typeof applySaltAdditions>;
  overall: MashOverallStageResult["overall"];
  acidResult: MashAcidResult;
  nowIso: string;
}): Record<string, unknown> {
  const {
    input,
    tap,
    dil,
    derivedVolumeLiters,
    mashMode,
    acidType,
    strengthKind,
    strengthValue,
    additions,
    salts,
    overall,
    acidResult,
    nowIso,
  } = params;

  const startingAlkalinityPpmCaCO3 = ensureFinite(input.mashStartingAlkalinityPpmCaCO3, "mashStartingAlkalinityPpmCaCO3");
  const startingPh = ensureFinite(input.mashStartingPh, "mashStartingPh");
  const targetPh = ensureFinite(input.mashTargetPh, "mashTargetPh");

  const patch: Record<string, unknown> = {
    sourceWaterProfileId: input.sourceWaterProfileId,
    dilutionWaterProfileId: input.dilutionWaterProfileId,
    tapWaterVolumeLiters: tap,
    dilutionWaterVolumeLiters: dil,

    mashStartingAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
    mashStartingPh: startingPh,
    mashTargetPh: targetPh,
    mashWaterVolumeLiters: derivedVolumeLiters,
    mashAcidType: acidType,
    mashStrengthKind: strengthKind,
    mashStrengthValue: strengthKind === "solid" ? null : strengthValue,
    mashAcidificationMode: mashMode,
    mashManualAcidAddedMl: strengthKind === "solid" ? null : input.mashManualAcidAddedMl,
    mashManualAcidAddedGrams: strengthKind === "solid" ? input.mashManualAcidAddedGrams : null,

    mashSaltAdditionsJson: additions,
    mashSaltsLastResultJson: { calculatedAt: nowIso, result: salts },

    mashOverallLastResultJson: overall,
    mashOverallLastCalculatedAt: nowIso,
  };

  if (mashMode === "manual" && "predicted" in acidResult) {
    patch["mashManualLastAchievedPh"] = acidResult.achievedPh;
    patch["mashManualLastFinalAlkalinityPpmCaCO3"] = acidResult.predicted.finalAlkalinityPpmCaCO3;
    patch["mashManualLastSulfateAddedPpm"] = acidResult.predicted.sulfateAddedPpm;
    patch["mashManualLastChlorideAddedPpm"] = acidResult.predicted.chlorideAddedPpm;
    patch["mashManualLastCalculatedAt"] = nowIso;

    patch["mashLastFinalAlkalinityPpmCaCO3"] = acidResult.predicted.finalAlkalinityPpmCaCO3;
    patch["mashLastSulfateAddedPpm"] = acidResult.predicted.sulfateAddedPpm;
    patch["mashLastChlorideAddedPpm"] = acidResult.predicted.chlorideAddedPpm;
    patch["mashLastCalculatedAt"] = nowIso;
  } else if (mashMode !== "manual") {
    const r = acidResult as MashAcidificationTargetMashPhResult | SpargeAcidificationResult;
    patch["mashLastAcidRequiredMl"] = r.acidRequiredMl ?? null;
    patch["mashLastAcidRequiredTsp"] = r.acidRequiredTsp ?? null;
    patch["mashLastAcidRequiredGrams"] = r.acidRequiredGrams ?? null;
    patch["mashLastAcidRequiredKg"] = r.acidRequiredKg ?? null;
    patch["mashLastFinalAlkalinityPpmCaCO3"] = r.finalAlkalinityPpmCaCO3 ?? null;
    patch["mashLastSulfateAddedPpm"] = r.sulfateAddedPpm ?? null;
    patch["mashLastChlorideAddedPpm"] = r.chlorideAddedPpm ?? null;
    patch["mashLastCalculatedAt"] = nowIso;
  }

  return patch;
}
