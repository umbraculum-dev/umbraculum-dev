import type { MashComputeAndSaveInput } from "../../recipeWaterComputeAndSaveService.js";
import { spargeAcidification, type SpargeAcidificationResult } from "../../waterCalc/spargeAcidification.js";
import { mashAcidificationManual, type MashAcidificationManualResult } from "../../waterCalc/mashAcidificationManual.js";
import {
  mashAcidificationTargetMashPh,
  type MashAcidificationTargetMashPhResult,
} from "../../waterCalc/mashAcidificationTargetMashPh.js";
import { buildAcidificationDerivation } from "../../waterCalc/derivation/acidificationDerivation.js";
import { mashPhEstimate, type MashPhEstimateInput } from "../../waterCalc/mashPhEstimate.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../../waterCalc/mashPhDefaultsV1.js";
import type { WaterCalcDerivation } from "../../waterCalc/derivation/types.js";
import type { applySaltAdditions } from "../../waterCalc/saltAdditions.js";
import {
  ensureFinite,
  parseAcidType,
  parseStrength,
  parseStrengthKind,
  strengthValueOrNull,
  colorLovibondToEbc,
  mashPhModelKeyFromMaltClass,
  type Mode,
} from "../recipeWaterComputeHelpers.js";

export type MashAcidResult =
  | MashAcidificationManualResult
  | MashAcidificationTargetMashPhResult
  | SpargeAcidificationResult;

export type MashAcidStageResult = {
  mashMode: Mode;
  hasGrist: boolean;
  acidResult: MashAcidResult;
  acidDerivation: WaterCalcDerivation;
  overallPh: { kind: "target" | "estimated"; value: number };
  acidType: ReturnType<typeof parseAcidType>;
  strengthKind: ReturnType<typeof parseStrengthKind>;
  strengthValue: MashComputeAndSaveInput["mashStrengthValue"];
};

export function computeMashAcidStage(
  input: MashComputeAndSaveInput,
  salts: ReturnType<typeof applySaltAdditions>,
  derivedVolumeLiters: number,
): MashAcidStageResult {
  const acidType = parseAcidType(input.mashAcidType, "mashAcidType");
  const strengthKind = parseStrengthKind(input.mashStrengthKind, "mashStrengthKind");
  const strengthValue = input.mashStrengthValue;
  const strength = parseStrength({ strengthKind, strengthValue });

  const mashMode: Mode = input.mashAcidificationMode === "manual" ? "manual" : "targetPh";

  const startingAlkalinityPpmCaCO3 = ensureFinite(input.mashStartingAlkalinityPpmCaCO3, "mashStartingAlkalinityPpmCaCO3");
  const startingPh = ensureFinite(input.mashStartingPh, "mashStartingPh");
  const targetPh = ensureFinite(input.mashTargetPh, "mashTargetPh");
  const grist = Array.isArray(input.grist) ? input.grist : [];
  const hasGrist = grist.length > 0;

  let acidResult: MashAcidResult | null = null;
  let acidDerivation: WaterCalcDerivation | null = null;
  let overallPh: { kind: "target" | "estimated"; value: number } = { kind: "target", value: targetPh };

  if (mashMode === "manual") {
    const acidAddedMl = input.mashManualAcidAddedMl === null ? undefined : input.mashManualAcidAddedMl ?? undefined;
    const acidAddedGrams = input.mashManualAcidAddedGrams === null ? undefined : input.mashManualAcidAddedGrams ?? undefined;
    const manual = mashAcidificationManual({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters: derivedVolumeLiters,
      acidType,
      strength,
      acidAddedMl,
      acidAddedGrams,
    });
    acidResult = manual;
    acidDerivation = buildAcidificationDerivation({
      mode: "manual",
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh: manual.achievedPh,
      volumeLiters: derivedVolumeLiters,
      acidType,
      strengthKind,
      strengthValue: strengthValueOrNull(strength),
      result: manual.predicted,
    });
    if (hasGrist) {
      const mashPhEstimateGrist = grist.map((row, idx) => {
        const amountKg = ensureFinite(row.amountKg, `grist[${idx}].amountKg`);
        const modelKey = mashPhModelKeyFromMaltClass(row.maltClass);
        const colorEbc = colorLovibondToEbc(
          row.colorLovibond === null ? null : typeof row.colorLovibond === "number" ? row.colorLovibond : null,
        );
        const mashDiPh = defaultMashDiPh(modelKey) ?? null;
        const mashTaToPh57_mEqPerKg = defaultMashTaToPh57_mEqPerKg(modelKey, colorEbc) ?? null;
        return { amountKg, mashDiPh, mashTaToPh57_mEqPerKg };
      });

      const acidAdded_mEqPerL = manual.predicted.debug?.acidRequired_mEqPerL;
      const estimate = mashPhEstimate({
        volumeLiters: derivedVolumeLiters,
        alkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
        calciumPpm: salts.resultingProfile.calcium,
        magnesiumPpm: salts.resultingProfile.magnesium,
        grist: mashPhEstimateGrist,
        acidAdded_mEqPerL: typeof acidAdded_mEqPerL === "number" ? acidAdded_mEqPerL : 0,
      } satisfies MashPhEstimateInput);

      overallPh = { kind: "estimated", value: estimate.estimatedMashPhRoomTemp };
    } else {
      overallPh = { kind: "estimated", value: manual.achievedPh };
    }
  } else {
    if (hasGrist) {
      const r = mashAcidificationTargetMashPh({
        startingAlkalinityPpmCaCO3,
        startingPh,
        volumeLiters: derivedVolumeLiters,
        targetMashPh: targetPh,
        calciumPpm: salts.resultingProfile.calcium,
        magnesiumPpm: salts.resultingProfile.magnesium,
        acidType,
        strength,
        grist: grist.map((row, idx) => {
          const amountKg = ensureFinite(row.amountKg, `grist[${idx}].amountKg`);
          const colorLovibond = row.colorLovibond === null ? null : typeof row.colorLovibond === "number" ? row.colorLovibond : null;
          const maltClass = row.maltClass;
          return { amountKg, colorLovibond, maltClass };
        }),
        waterToGristRatioQtPerLbOverride: undefined,
      });
      acidResult = r;
      overallPh = { kind: "estimated", value: r.estimatedMashPhRoomTemp };
    } else {
      const r = spargeAcidification({
        startingAlkalinityPpmCaCO3,
        startingPh,
        targetPh,
        volumeLiters: derivedVolumeLiters,
        acidType,
        strength,
      });
      acidResult = r;
      overallPh = { kind: "target", value: targetPh };
    }

    acidDerivation = buildAcidificationDerivation({
      mode: "target",
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh: overallPh.value,
      volumeLiters: derivedVolumeLiters,
      acidType,
      strengthKind,
      strengthValue: strengthValueOrNull(strength),
      // Target+grist returns MashAcidificationTargetMashPhResult, target+no-grist returns
      // SpargeAcidificationResult. Both expose the fields the derivation builder reads
      // (acidRequiredMl/Grams, finalAlkalinityPpmCaCO3, sulfate/chloride). The two
      // `debug` shapes differ but the builder only inspects fields shared between them.
      result: acidResult as SpargeAcidificationResult,
    });
  }

  if (!acidResult) throw new Error("acidResult was not set");
  if (!acidDerivation) throw new Error("acidDerivation was not set");

  return {
    mashMode,
    hasGrist,
    acidResult,
    acidDerivation,
    overallPh,
    acidType,
    strengthKind,
    strengthValue,
  };
}
