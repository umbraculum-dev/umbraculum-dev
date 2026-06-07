import {
  spargeAcidification as spargeAcidificationCalc,
} from "./spargeAcidification.js";
import { spargeAcidificationManual } from "./spargeAcidificationManual.js";
import { mashAcidificationManual } from "./mashAcidificationManual.js";
import { mashPhEstimate, type MashPhEstimateInput } from "./mashPhEstimate.js";
import { mashAcidificationTargetMashPh } from "./mashAcidificationTargetMashPh.js";
import { applySaltAdditions } from "./saltAdditions.js";
import { parseAcidTypeAndStrength } from "./waterCalcHelpers.js";
import type { OverallGristRow } from "./waterCalcOverallPhParseOps.js";
import type { toMashPhEstimateGrist } from "./waterCalcOverallPhParseOps.js";

export function resolveMashAcidAndPh(args: {
  body: Record<string, unknown>;
  salts: ReturnType<typeof applySaltAdditions>;
  mashMode: "manual" | "targetPh";
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  volumeLiters: number;
  grist: OverallGristRow[] | null;
  mashPhEstimateGrist: ReturnType<typeof toMashPhEstimateGrist>;
}) {
  const { acidType, strength } = parseAcidTypeAndStrength(args.body);
  const hasGrist = args.grist != null && args.grist.length > 0;

  let acid;
  let phKind: "target" | "estimated" = "target";
  let phValue = args.targetPh;

  if (hasGrist && args.mashMode !== "manual") {
    const waterToGristRatioQtPerLbOverride =
      typeof args.body["waterToGristRatioQtPerLbOverride"] === "number"
        ? args.body["waterToGristRatioQtPerLbOverride"]
        : undefined;

    const r = mashAcidificationTargetMashPh({
      startingAlkalinityPpmCaCO3: args.startingAlkalinityPpmCaCO3,
      startingPh: args.startingPh,
      volumeLiters: args.volumeLiters,
      targetMashPh: args.targetPh,
      calciumPpm: args.salts.resultingProfile.calcium,
      magnesiumPpm: args.salts.resultingProfile.magnesium,
      acidType,
      strength,
      grist: args.grist ?? [],
      waterToGristRatioQtPerLbOverride,
    });
    acid = r;
    phKind = "estimated";
    phValue = r.estimatedMashPhRoomTemp;
  } else if (args.mashMode === "manual") {
    const acidAddedMl = typeof args.body["acidAddedMl"] === "number" ? args.body["acidAddedMl"] : undefined;
    const acidAddedGrams = typeof args.body["acidAddedGrams"] === "number" ? args.body["acidAddedGrams"] : undefined;
    const r = mashAcidificationManual({
      startingAlkalinityPpmCaCO3: args.startingAlkalinityPpmCaCO3,
      startingPh: args.startingPh,
      volumeLiters: args.volumeLiters,
      acidType,
      strength,
      acidAddedMl,
      acidAddedGrams,
    });
    acid = r.predicted;
    phKind = "estimated";
    if (args.mashPhEstimateGrist && args.mashPhEstimateGrist.length) {
      const acidAdded_mEqPerL = r.predicted.debug?.acidRequired_mEqPerL;
      const estimate = mashPhEstimate({
        volumeLiters: args.volumeLiters,
        alkalinityPpmCaCO3: args.startingAlkalinityPpmCaCO3,
        calciumPpm: args.salts.resultingProfile.calcium,
        magnesiumPpm: args.salts.resultingProfile.magnesium,
        grist: args.mashPhEstimateGrist,
        acidAdded_mEqPerL: typeof acidAdded_mEqPerL === "number" ? acidAdded_mEqPerL : 0,
      } satisfies MashPhEstimateInput);
      phValue = estimate.estimatedMashPhRoomTemp;
    } else {
      // Back-compat: without grist, manual mode only models water alkalinity + acid.
      phValue = r.achievedPh;
    }
  } else {
    acid = spargeAcidificationCalc({
      startingAlkalinityPpmCaCO3: args.startingAlkalinityPpmCaCO3,
      startingPh: args.startingPh,
      targetPh: args.targetPh,
      volumeLiters: args.volumeLiters,
      acidType,
      strength,
    });
    phKind = "target";
    phValue = args.targetPh;
  }

  return { acid, phKind, phValue };
}

export function resolveSpargeBoilAcidAndPh(args: {
  body: Record<string, unknown>;
  salts: ReturnType<typeof applySaltAdditions>;
  mode: "manual" | "targetPh";
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  volumeLiters: number;
}) {
  const { acidType, strength } = parseAcidTypeAndStrength(args.body);
  const calciumPpm = args.salts.resultingProfile.calcium;
  const magnesiumPpm = args.salts.resultingProfile.magnesium;

  let acid;
  if (args.mode === "manual") {
    const acidAddedMl = typeof args.body["acidAddedMl"] === "number" ? args.body["acidAddedMl"] : undefined;
    const acidAddedGrams = typeof args.body["acidAddedGrams"] === "number" ? args.body["acidAddedGrams"] : undefined;
    const r = spargeAcidificationManual({
      startingAlkalinityPpmCaCO3: args.startingAlkalinityPpmCaCO3,
      startingPh: args.startingPh,
      volumeLiters: args.volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
      acidAddedMl,
      acidAddedGrams,
    });
    acid = { predicted: r.predicted, achievedPh: r.achievedPh };
  } else {
    const r = spargeAcidificationCalc({
      startingAlkalinityPpmCaCO3: args.startingAlkalinityPpmCaCO3,
      startingPh: args.startingPh,
      targetPh: args.targetPh,
      volumeLiters: args.volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
    });
    acid = { predicted: r, achievedPh: args.targetPh };
  }

  return {
    acid,
    phKind: args.mode === "manual" ? ("estimated" as const) : ("target" as const),
    phValue: acid.achievedPh,
  };
}
