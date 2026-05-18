import {
  spargeAcidification,
  type AcidStrength,
  type SpargeAcidType,
  type SpargeAcidificationResult,
} from "./spargeAcidification.js";

export type SpargeAcidificationManualInput = {
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  volumeLiters: number;
  /** Optional Ca (mg/L) for RA-like effective alkalinity adjustment. */
  calciumPpm?: number | undefined;
  /** Optional Mg (mg/L) for RA-like effective alkalinity adjustment. */
  magnesiumPpm?: number | undefined;
  acidType: SpargeAcidType;
  strength: AcidStrength;
  acidAddedMl?: number | undefined;
  acidAddedGrams?: number | undefined;
};

export type SpargeAcidificationManualResult = {
  achievedPh: number;
  predicted: SpargeAcidificationResult;
  clamped: "none" | "low" | "high";
  iterations: number;
  targetAmount: number;
  predictedAmount: number;
};

function relevantAmount(result: SpargeAcidificationResult, strength: AcidStrength) {
  if (strength.kind === "solid") {
    if (result.acidRequiredGrams === null) {
      throw new Error("Expected acidRequiredGrams for solid acid strength");
    }
    return result.acidRequiredGrams;
  }
  if (result.acidRequiredMl === null) {
    throw new Error("Expected acidRequiredMl for liquid acid strength");
  }
  return result.acidRequiredMl;
}

/**
 * Manual-entry sparge acidification (v0).
 *
 * Given an acid amount added (mL for liquids, g for solids), estimate the achieved pH by inverting
 * the existing sparge acidification solver using bisection over pH.
 */
export function spargeAcidificationManual(
  input: SpargeAcidificationManualInput,
): SpargeAcidificationManualResult {
  const {
    startingAlkalinityPpmCaCO3,
    startingPh,
    volumeLiters,
    calciumPpm,
    magnesiumPpm,
    acidType,
    strength,
    acidAddedMl,
    acidAddedGrams,
  } = input;

  const targetAmount =
    strength.kind === "solid" ? (acidAddedGrams ?? NaN) : (acidAddedMl ?? NaN);
  if (!Number.isFinite(targetAmount) || targetAmount < 0) {
    throw new Error("acidAdded must be a finite number >= 0");
  }

  // Search range: allow wide pH range; bisection requires monotonic region (acid required increases as pH decreases).
  let phLow = 3.0;
  let phHigh = 8.0;

  const amountAt = (ph: number) => {
    const r = spargeAcidification({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh: ph,
      volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
    });
    return { r, amount: relevantAmount(r, strength) };
  };

  const hi = amountAt(phHigh);
  const lo = amountAt(phLow);

  // Clamp if outside solvable range.
  if (targetAmount <= hi.amount) {
    return {
      achievedPh: phHigh,
      predicted: hi.r,
      clamped: "high",
      iterations: 0,
      targetAmount,
      predictedAmount: hi.amount,
    };
  }
  if (targetAmount >= lo.amount) {
    return {
      achievedPh: phLow,
      predicted: lo.r,
      clamped: "low",
      iterations: 0,
      targetAmount,
      predictedAmount: lo.amount,
    };
  }

  let iterations = 0;
  let bestPh = (phLow + phHigh) / 2;
  let best = amountAt(bestPh);

  for (let i = 0; i < 60; i++) {
    iterations = i + 1;
    const mid = (phLow + phHigh) / 2;
    const midRes = amountAt(mid);
    bestPh = mid;
    best = midRes;

    const diff = midRes.amount - targetAmount;
    if (Math.abs(diff) < 1e-6) break;

    // If mid requires more acid than added, achieved pH must be higher.
    if (midRes.amount > targetAmount) {
      phLow = mid;
    } else {
      phHigh = mid;
    }
  }

  return {
    achievedPh: bestPh,
    predicted: best.r,
    clamped: "none",
    iterations,
    targetAmount,
    predictedAmount: best.amount,
  };
}

