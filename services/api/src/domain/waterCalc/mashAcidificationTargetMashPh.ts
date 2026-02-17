import type { AcidStrength, SpargeAcidType, SpargeAcidificationResult } from "./spargeAcidification.js";
import { mashAcidificationManual } from "./mashAcidificationManual.js";
import { mashPhEstimate, type MashPhEstimateResult } from "./mashPhEstimate.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "./mashPhDefaultsV1.js";

export type MashAcidificationTargetMashPhGristRow = {
  amountKg: number;
  // Back-compat / defaults driving:
  colorLovibond: number | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
  // Optional explicit v1 overrides:
  mashDiPh?: number | null;
  mashTaToPh57_mEqPerKg?: number | null;
};

export type MashAcidificationTargetMashPhInput = {
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  volumeLiters: number;
  targetMashPh: number;
  /** Optional Ca (mg/L) for RA-like effective alkalinity adjustment in the mash pH estimator. */
  calciumPpm?: number;
  /** Optional Mg (mg/L) for RA-like effective alkalinity adjustment in the mash pH estimator. */
  magnesiumPpm?: number;
  acidType: SpargeAcidType;
  strength: AcidStrength;
  grist: MashAcidificationTargetMashPhGristRow[];
  waterToGristRatioQtPerLbOverride?: number;
};

export type MashAcidificationTargetMashPhResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
  estimatedMashPhRoomTemp: number;
  debug: {
    clamped: "none" | "low" | "high";
    iterations: number;
    amountUnits: "ml" | "grams";
    bracket: { low: number; high: number };
    estimateAtZero: MashPhEstimateResult;
    estimateAtSolution: MashPhEstimateResult;
  };
};

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

function amountUnits(strength: AcidStrength): "ml" | "grams" {
  return strength.kind === "solid" ? "grams" : "ml";
}

function withAmount(
  strength: AcidStrength,
  amount: number,
): Pick<import("./mashAcidificationManual.js").MashAcidificationManualInput, "acidAddedMl" | "acidAddedGrams"> {
  return strength.kind === "solid" ? { acidAddedGrams: amount } : { acidAddedMl: amount };
}

function colorLovibondToEbc(colorLovibond: number | null): number | null {
  if (colorLovibond === null) return null;
  if (!Number.isFinite(colorLovibond) || colorLovibond < 0) return null;
  return colorLovibond * 1.97;
}

function modelKeyFromMaltClass(maltClass: MashAcidificationTargetMashPhGristRow["maltClass"]) {
  if (maltClass === "base") return "base_pale";
  if (maltClass === "crystal") return "crystal";
  if (maltClass === "roast") return "roasted";
  if (maltClass === "acid") return "acidulated";
  return "base_pale";
}

function toV1Grist(rows: MashAcidificationTargetMashPhGristRow[]) {
  return rows.map((r) => {
    const modelKey = modelKeyFromMaltClass(r.maltClass);
    const colorEbc = colorLovibondToEbc(r.colorLovibond);
    const mashDiPh = typeof r.mashDiPh === "number" ? r.mashDiPh : defaultMashDiPh(modelKey) ?? null;
    const mashTaToPh57_mEqPerKg =
      typeof r.mashTaToPh57_mEqPerKg === "number"
        ? r.mashTaToPh57_mEqPerKg
        : defaultMashTaToPh57_mEqPerKg(modelKey, colorEbc) ?? null;
    return { amountKg: r.amountKg, mashDiPh, mashTaToPh57_mEqPerKg };
  });
}

function estimateMashPh(args: {
  volumeLiters: number;
  alkalinityPpmCaCO3: number;
  calciumPpm: number;
  magnesiumPpm: number;
  grist: MashAcidificationTargetMashPhGristRow[];
  waterToGristRatioQtPerLbOverride?: number;
  acidAdded_mEqPerL?: number;
}) {
  return mashPhEstimate({
    volumeLiters: args.volumeLiters,
    alkalinityPpmCaCO3: args.alkalinityPpmCaCO3,
    calciumPpm: args.calciumPpm,
    magnesiumPpm: args.magnesiumPpm,
    grist: toV1Grist(args.grist),
    waterToGristRatioQtPerLbOverride: args.waterToGristRatioQtPerLbOverride,
    acidAdded_mEqPerL: args.acidAdded_mEqPerL,
  });
}

type PredictedAtAmount = {
  amount: number;
  predicted: SpargeAcidificationResult;
  estimate: MashPhEstimateResult;
};

/**
 * Solve for acid amount that achieves a target **estimated mash pH**.
 *
 * Approach:
 * - Use water acidification manual model to map acid amount -> mEq/L added.
 * - Feed acidAdded_mEqPerL into the mash pH estimator.
 * - Bisection over acid amount (monotonic in typical regions).
 */
export function mashAcidificationTargetMashPh(
  input: MashAcidificationTargetMashPhInput,
): MashAcidificationTargetMashPhResult {
  const {
    startingAlkalinityPpmCaCO3,
    startingPh,
    volumeLiters,
    targetMashPh,
    calciumPpm: calciumPpmRaw,
    magnesiumPpm: magnesiumPpmRaw,
    acidType,
    strength,
    grist,
    waterToGristRatioQtPerLbOverride,
  } = input;

  assertFinite(startingAlkalinityPpmCaCO3, "startingAlkalinityPpmCaCO3");
  assertFinite(startingPh, "startingPh");
  assertFinite(volumeLiters, "volumeLiters");
  assertFinite(targetMashPh, "targetMashPh");
  if (!(startingAlkalinityPpmCaCO3 >= 0)) throw new Error("startingAlkalinityPpmCaCO3 must be >= 0");
  if (!(volumeLiters > 0)) throw new Error("volumeLiters must be > 0");

  const calciumPpm = typeof calciumPpmRaw === "number" ? calciumPpmRaw : 0;
  const magnesiumPpm = typeof magnesiumPpmRaw === "number" ? magnesiumPpmRaw : 0;
  assertFinite(calciumPpm, "calciumPpm");
  assertFinite(magnesiumPpm, "magnesiumPpm");
  if (calciumPpm < 0 || magnesiumPpm < 0) throw new Error("calciumPpm/magnesiumPpm must be >= 0");

  const units = amountUnits(strength);

  const estimateAtZero = estimateMashPh({
    volumeLiters,
    alkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
    calciumPpm,
    magnesiumPpm,
    grist,
    waterToGristRatioQtPerLbOverride,
  });

  if (estimateAtZero.estimatedMashPhRoomTemp <= targetMashPh) {
    return {
      acidRequiredMl: units === "ml" ? 0 : null,
      acidRequiredTsp: units === "ml" ? 0 : null,
      acidRequiredGrams: units === "grams" ? 0 : null,
      acidRequiredKg: units === "grams" ? 0 : null,
      finalAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
      sulfateAddedPpm: 0,
      chlorideAddedPpm: 0,
      estimatedMashPhRoomTemp: estimateAtZero.estimatedMashPhRoomTemp,
      debug: {
        clamped: "low",
        iterations: 0,
        amountUnits: units,
        bracket: { low: 0, high: 0 },
        estimateAtZero,
        estimateAtSolution: estimateAtZero,
      },
    };
  }

  const evalAt = (amount: number): PredictedAtAmount => {
    assertFinite(amount, "acid amount");
    if (!(amount >= 0)) throw new Error("acid amount must be >= 0");

    if (amount === 0) {
      return {
        amount,
        predicted: {
          acidRequiredMl: units === "ml" ? 0 : null,
          acidRequiredTsp: units === "ml" ? 0 : null,
          acidRequiredGrams: units === "grams" ? 0 : null,
          acidRequiredKg: units === "grams" ? 0 : null,
          finalAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
          sulfateAddedPpm: 0,
          chlorideAddedPpm: 0,
          debug: {
            acidRequired_mEqPerL: 0,
            mMRequired_mmolPerL: 0,
            frac_equivalentsPerMole: 0,
            sg_mgPerMl: null,
            calciumPpm,
            magnesiumPpm,
            effectiveAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
            alkalinityReductionFromCaMgPpmCaCO3: 0,
          },
        },
        estimate: estimateAtZero,
      };
    }

    const manual = mashAcidificationManual({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters,
      acidType,
      strength,
      ...withAmount(strength, amount),
    });

    const acidAdded_mEqPerL = manual.predicted.debug.acidRequired_mEqPerL;
    const estimate = estimateMashPh({
      volumeLiters,
      alkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
      calciumPpm,
      magnesiumPpm,
      grist,
      waterToGristRatioQtPerLbOverride,
      acidAdded_mEqPerL,
    });

    return { amount, predicted: manual.predicted, estimate };
  };

  let low = 0;
  let high = 1;
  let hi = evalAt(high);

  let expandIters = 0;
  while (hi.estimate.estimatedMashPhRoomTemp > targetMashPh && expandIters < 30) {
    high *= 2;
    hi = evalAt(high);
    expandIters += 1;
    if (high > (units === "grams" ? 5000 : 50000)) break;
  }

  if (hi.estimate.estimatedMashPhRoomTemp > targetMashPh) {
    return {
      acidRequiredMl: units === "ml" ? high : null,
      acidRequiredTsp: units === "ml" ? high * 0.2029 : null,
      acidRequiredGrams: units === "grams" ? high : null,
      acidRequiredKg: units === "grams" ? high / 1000 : null,
      finalAlkalinityPpmCaCO3: hi.predicted.finalAlkalinityPpmCaCO3,
      sulfateAddedPpm: hi.predicted.sulfateAddedPpm,
      chlorideAddedPpm: hi.predicted.chlorideAddedPpm,
      estimatedMashPhRoomTemp: hi.estimate.estimatedMashPhRoomTemp,
      debug: {
        clamped: "high",
        iterations: 0,
        amountUnits: units,
        bracket: { low, high },
        estimateAtZero,
        estimateAtSolution: hi.estimate,
      },
    };
  }

  let best = hi;
  let iterations = 0;
  for (let i = 0; i < 60; i += 1) {
    iterations = i + 1;
    const mid = (low + high) / 2;
    const midRes = evalAt(mid);
    best = midRes;

    const midPh = midRes.estimate.estimatedMashPhRoomTemp;
    const diff = midPh - targetMashPh;
    if (Math.abs(diff) < 1e-3) break;
    if (midPh > targetMashPh) low = mid;
    else high = mid;
  }

  return {
    acidRequiredMl: units === "ml" ? best.predicted.acidRequiredMl : null,
    acidRequiredTsp: units === "ml" ? best.predicted.acidRequiredTsp : null,
    acidRequiredGrams: units === "grams" ? best.predicted.acidRequiredGrams : null,
    acidRequiredKg: units === "grams" ? best.predicted.acidRequiredKg : null,
    finalAlkalinityPpmCaCO3: best.predicted.finalAlkalinityPpmCaCO3,
    sulfateAddedPpm: best.predicted.sulfateAddedPpm,
    chlorideAddedPpm: best.predicted.chlorideAddedPpm,
    estimatedMashPhRoomTemp: best.estimate.estimatedMashPhRoomTemp,
    debug: {
      clamped: "none",
      iterations,
      amountUnits: units,
      bracket: { low, high },
      estimateAtZero,
      estimateAtSolution: best.estimate,
    },
  };
}

