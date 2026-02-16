import type { AcidStrength, SpargeAcidType, SpargeAcidificationResult } from "./spargeAcidification.js";
import { mashAcidificationManual } from "./mashAcidificationManual.js";
import {
  mashPhEstimateV0,
  type MashPhEstimateGristRowV0,
  type MashPhEstimateV0Result,
} from "./mashPhEstimateV0.js";

export type MashAcidificationTargetMashPhV0Input = {
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
  grist: MashPhEstimateGristRowV0[];
  waterToGristRatioQtPerLbOverride?: number;
};

export type MashAcidificationTargetMashPhV0Result = {
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
    estimateAtZero: MashPhEstimateV0Result;
    estimateAtSolution: MashPhEstimateV0Result;
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

function estimateMashPh(
  volumeLiters: number,
  alkalinityPpmCaCO3: number,
  calciumPpm: number,
  magnesiumPpm: number,
  grist: MashPhEstimateGristRowV0[],
  waterToGristRatioQtPerLbOverride?: number,
  acidAdded_mEqPerL?: number,
) {
  return mashPhEstimateV0({
    volumeLiters,
    alkalinityPpmCaCO3,
    calciumPpm,
    magnesiumPpm,
    grist,
    waterToGristRatioQtPerLbOverride,
    acidAdded_mEqPerL,
  });
}

type PredictedAtAmount = {
  amount: number;
  predicted: SpargeAcidificationResult;
  estimate: MashPhEstimateV0Result;
};

/**
 * Solve for acid amount that achieves a target **estimated mash pH** (BrunWater-inspired).
 *
 * v0 approach:
 * - Use existing water acidification model to map acid amount -> final alkalinity.
 * - Feed that final alkalinity into the BrunWater mash pH estimator.
 * - Bisection over acid amount (monotonic in typical regions).
 */
export function mashAcidificationTargetMashPhV0(
  input: MashAcidificationTargetMashPhV0Input,
): MashAcidificationTargetMashPhV0Result {
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

  const estimateAtZero = estimateMashPh(
    volumeLiters,
    startingAlkalinityPpmCaCO3,
    calciumPpm,
    magnesiumPpm,
    grist,
    waterToGristRatioQtPerLbOverride,
  );

  // If we already meet or are below the target mash pH without adding acid, clamp to zero acid.
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

    // Special-case for 0: avoid the manual inversion clamping behavior.
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
    const estimate = estimateMashPh(
      volumeLiters,
      startingAlkalinityPpmCaCO3,
      calciumPpm,
      magnesiumPpm,
      grist,
      waterToGristRatioQtPerLbOverride,
      acidAdded_mEqPerL,
    );

    return { amount, predicted: manual.predicted, estimate };
  };

  // Find an upper bound amount such that estimated mash pH <= target.
  let low = 0;
  let high = units === "grams" ? 1 : 1; // 1 g or 1 mL starter
  let hi = evalAt(high);

  let expandIters = 0;
  while (hi.estimate.estimatedMashPhRoomTemp > targetMashPh && expandIters < 30) {
    high *= 2;
    hi = evalAt(high);
    expandIters += 1;
    // Hard stop to avoid absurd amounts during early development.
    if (high > (units === "grams" ? 5000 : 50000)) break;
  }

  // If even huge acid doesn't reach target, clamp high.
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

  // Bisection on amount.
  let best = hi;
  let iterations = 0;
  for (let i = 0; i < 60; i++) {
    iterations = i + 1;
    const mid = (low + high) / 2;
    const midRes = evalAt(mid);
    best = midRes;

    const midPh = midRes.estimate.estimatedMashPhRoomTemp;
    const diff = midPh - targetMashPh;
    if (Math.abs(diff) < 1e-3) break;

    // If mid pH is still too high, need more acid -> move low up.
    if (midPh > targetMashPh) low = mid;
    else high = mid;
  }

  return {
    acidRequiredMl: units === "ml" ? best.amount : null,
    acidRequiredTsp: units === "ml" ? best.amount * 0.2029 : null,
    acidRequiredGrams: units === "grams" ? best.amount : null,
    acidRequiredKg: units === "grams" ? best.amount / 1000 : null,
    finalAlkalinityPpmCaCO3: best.predicted.finalAlkalinityPpmCaCO3,
    sulfateAddedPpm: best.predicted.sulfateAddedPpm,
    chlorideAddedPpm: best.predicted.chlorideAddedPpm,
    estimatedMashPhRoomTemp: best.estimate.estimatedMashPhRoomTemp,
    debug: {
      clamped: "none",
      iterations,
      amountUnits: units,
      bracket: { low: 0, high: best.amount },
      estimateAtZero,
      estimateAtSolution: best.estimate,
    },
  };
}

