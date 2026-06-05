import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

import { BadRequestError } from "../../../../errors.js";
import {
  spargeAcidification as spargeAcidificationCalc,
} from "../../../../domain/waterCalc/spargeAcidification.js";
import { spargeAcidificationManual } from "../../../../domain/waterCalc/spargeAcidificationManual.js";
import { mashAcidificationManual } from "../../../../domain/waterCalc/mashAcidificationManual.js";
import { mashPhEstimate, type MashPhEstimateInput } from "../../../../domain/waterCalc/mashPhEstimate.js";
import { mashAcidificationTargetMashPh } from "../../../../domain/waterCalc/mashAcidificationTargetMashPh.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../../../../domain/waterCalc/mashPhDefaultsV1.js";
import { applySaltAdditions } from "../../../../domain/waterCalc/saltAdditions.js";
import {
  colorLovibondToEbc,
  mashPhModelKeyFromMaltClass,
  parseAcidTypeAndStrength,
} from "./waterCalcHelpers.js";

export function parseMashOverallInputs(body: Record<string, unknown>): {
  mashMode: "manual" | "targetPh";
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  volumeLiters: number;
} {
  const mashMode: "manual" | "targetPh" = body["mashMode"] === "manual" ? "manual" : "targetPh";
  const startingAlkalinityPpmCaCO3 =
    typeof body["mashStartingAlkalinityPpmCaCO3"] === "number"
      ? body["mashStartingAlkalinityPpmCaCO3"]
      : typeof body["startingAlkalinityPpmCaCO3"] === "number"
        ? body["startingAlkalinityPpmCaCO3"]
        : 0;
  const startingPh =
    typeof body["mashStartingPh"] === "number"
      ? body["mashStartingPh"]
      : typeof body["startingPh"] === "number"
        ? body["startingPh"]
        : 7.0;
  const targetPh =
    typeof body["mashTargetPh"] === "number"
      ? body["mashTargetPh"]
      : typeof body["targetPh"] === "number"
        ? body["targetPh"]
        : DEFAULT_MASH_TARGET_PH;
  const volumeLiters =
    typeof body["mashWaterVolumeLiters"] === "number"
      ? body["mashWaterVolumeLiters"]
      : typeof body["volumeLiters"] === "number"
        ? body["volumeLiters"]
        : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.mashWaterVolumeLiters must be > 0");
  }

  return { mashMode, startingAlkalinityPpmCaCO3, startingPh, targetPh, volumeLiters };
}

export function parseSpargeBoilOverallInputs(
  body: Record<string, unknown>,
  modeKey: "spargeMode" | "boilMode",
  alkalinityKeys: [string, string],
): {
  mode: "manual" | "targetPh";
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  volumeLiters: number;
} {
  const mode: "manual" | "targetPh" = body[modeKey] === "manual" ? "manual" : "targetPh";
  const startingAlkalinityPpmCaCO3 =
    typeof body[alkalinityKeys[0]] === "number"
      ? (body[alkalinityKeys[0]] as number)
      : typeof body[alkalinityKeys[1]] === "number"
        ? (body[alkalinityKeys[1]] as number)
        : 0;
  const startingPh = typeof body["startingPh"] === "number" ? body["startingPh"] : 7.0;
  const targetPh = typeof body["targetPh"] === "number" ? body["targetPh"] : DEFAULT_MASH_TARGET_PH;
  const volumeLiters = typeof body["volumeLiters"] === "number" ? body["volumeLiters"] : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
  }

  return { mode, startingAlkalinityPpmCaCO3, startingPh, targetPh, volumeLiters };
}

export type OverallGristRow = {
  amountKg: number;
  colorLovibond: number | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
  mashDiPh?: number | null | undefined;
  mashTaToPh57_mEqPerKg?: number | null | undefined;
};

export function parseOverallGrist(body: Record<string, unknown>): OverallGristRow[] | null {
  const gristRaw = body["grist"];
  const hasGrist = Array.isArray(gristRaw) && gristRaw.length > 0;
  if (!hasGrist) return null;

  return (gristRaw as unknown[]).map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const amountKg = typeof o["amountKg"] === "number" ? o["amountKg"] : NaN;
    if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
      throw new BadRequestError("invalid_grist_row_amount", `Body.grist[${idx}].amountKg must be a number > 0`);
    }
    const colorRaw = o["colorLovibond"];
    const colorLovibond =
      colorRaw === null || colorRaw === undefined ? null : typeof colorRaw === "number" ? colorRaw : NaN;
    if (typeof colorLovibond === "number" && (!Number.isFinite(colorLovibond) || colorLovibond < 0)) {
      throw new BadRequestError("invalid_grist_row_color", `Body.grist[${idx}].colorLovibond must be null or a number >= 0`);
    }
    const maltClassRaw = o["maltClass"];
    const maltClass =
      maltClassRaw === "base" || maltClassRaw === "crystal" || maltClassRaw === "roast" || maltClassRaw === "acid"
        ? maltClassRaw
        : "base";
    const mashDiPh = typeof o["mashDiPh"] === "number" ? o["mashDiPh"] : o["mashDiPh"] === null ? null : undefined;
    const mashTaToPh57_mEqPerKg =
      typeof o["mashTaToPh57_mEqPerKg"] === "number"
        ? o["mashTaToPh57_mEqPerKg"]
        : o["mashTaToPh57_mEqPerKg"] === null
          ? null
          : undefined;
    return { amountKg, colorLovibond, maltClass, mashDiPh, mashTaToPh57_mEqPerKg };
  });
}

export function toMashPhEstimateGrist(grist: OverallGristRow[] | null) {
  return (
    grist?.map((r) => {
      const modelKey = mashPhModelKeyFromMaltClass(r.maltClass);
      const colorEbc = colorLovibondToEbc(r.colorLovibond);
      const mashDiPh = typeof r.mashDiPh === "number" ? r.mashDiPh : defaultMashDiPh(modelKey) ?? null;
      const mashTaToPh57_mEqPerKg =
        typeof r.mashTaToPh57_mEqPerKg === "number"
          ? r.mashTaToPh57_mEqPerKg
          : defaultMashTaToPh57_mEqPerKg(modelKey, colorEbc) ?? null;
      return { amountKg: r.amountKg, mashDiPh, mashTaToPh57_mEqPerKg };
    }) ?? null
  );
}

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
