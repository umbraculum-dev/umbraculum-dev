import type { BoilComputeAndSaveInput } from "../../recipeWaterComputeAndSaveService.js";
import {
  spargeAcidification,
  type SpargeAcidificationResult,
} from "../../waterCalc/spargeAcidification.js";
import {
  spargeAcidificationManual,
  type SpargeAcidificationManualResult,
} from "../../waterCalc/spargeAcidificationManual.js";
import { buildAcidificationDerivation } from "../../waterCalc/derivation/acidificationDerivation.js";
import type { WaterCalcDerivation } from "../../waterCalc/derivation/types.js";
import type { applySaltAdditions } from "../../waterCalc/saltAdditions.js";
import {
  ensureFinite,
  parseAcidType,
  parseStrength,
  parseStrengthKind,
  strengthValueOrNull,
  type Mode,
} from "../recipeWaterComputeHelpers.js";

export type BoilAcidResult = SpargeAcidificationManualResult | SpargeAcidificationResult;

export type BoilAcidStageResult = {
  mode: Mode;
  acidResult: BoilAcidResult;
  acidDerivation: WaterCalcDerivation;
  acidType: ReturnType<typeof parseAcidType>;
  strengthKind: ReturnType<typeof parseStrengthKind>;
  strengthValue: BoilComputeAndSaveInput["boilStrengthValue"];
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
};

export function computeBoilAcidStage(
  input: BoilComputeAndSaveInput,
  salts: ReturnType<typeof applySaltAdditions>,
  derivedVolumeLiters: number,
): BoilAcidStageResult {
  const acidType = parseAcidType(input.boilAcidType, "boilAcidType");
  const strengthKind = parseStrengthKind(input.boilStrengthKind, "boilStrengthKind");
  const strengthValue = input.boilStrengthValue;
  const strength = parseStrength({ strengthKind, strengthValue });

  const startingAlkalinityPpmCaCO3 = ensureFinite(input.boilStartingAlkalinityPpmCaCO3, "boilStartingAlkalinityPpmCaCO3");
  const startingPh = ensureFinite(input.boilStartingPh, "boilStartingPh");
  const targetPh = ensureFinite(input.boilTargetPh, "boilTargetPh");

  const mode: Mode = input.boilAcidificationMode === "manual" ? "manual" : "targetPh";

  const calciumPpm = salts.resultingProfile.calcium;
  const magnesiumPpm = salts.resultingProfile.magnesium;

  let acidResult: BoilAcidResult | null = null;
  let acidDerivation: WaterCalcDerivation | null = null;

  if (mode === "manual") {
    const acidAddedMl = input.boilManualAcidAddedMl === null ? undefined : input.boilManualAcidAddedMl ?? undefined;
    const acidAddedGrams = input.boilManualAcidAddedGrams === null ? undefined : input.boilManualAcidAddedGrams ?? undefined;
    const manual = spargeAcidificationManual({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters: derivedVolumeLiters,
      calciumPpm,
      magnesiumPpm,
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
  } else {
    const r = spargeAcidification({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters: derivedVolumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
    });
    acidResult = r;
    acidDerivation = buildAcidificationDerivation({
      mode: "target",
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters: derivedVolumeLiters,
      acidType,
      strengthKind,
      strengthValue: strengthValueOrNull(strength),
      result: r,
    });
  }

  if (!acidResult) throw new Error("acidResult was not set");
  if (!acidDerivation) throw new Error("acidDerivation was not set");

  return {
    mode,
    acidResult,
    acidDerivation,
    acidType,
    strengthKind,
    strengthValue,
    startingAlkalinityPpmCaCO3,
    startingPh,
    targetPh,
  };
}
