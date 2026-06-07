/**
 * Residual alkalinity / effective alkalinity helpers (Palmer/Kolbach-style).
 *
 * Notes:
 * - This is a brewing heuristic, not a full chemistry model.
 * - We use this to produce an "effective alkalinity" that can be fed into mash pH estimators
 *   so Ca/Mg salt additions can move predicted mash pH modestly.
 *
 * Units:
 * - alkalinityPpmCaCO3: mg/L as CaCO3 (a.k.a. ppm as CaCO3)
 * - calciumPpm, magnesiumPpm: mg/L of the element (Ca, Mg)
 */

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

/**
 * Palmer/Kolbach-style residual alkalinity contribution (as mg/L as CaCO3).
 *
 * This is the portion subtracted from alkalinity to estimate residual alkalinity:
 *   RA_asCaCO3 = Alkalinity_asCaCO3 - (0.713*Ca_mgL) - (0.588*Mg_mgL)
 *
 * We expose the subtractive term:
 *   alkReduction = (0.713*Ca_mgL) + (0.588*Mg_mgL)
 */
export function alkalinityReductionFromCaMgPpmCaCO3(input: {
  calciumPpm: number;
  magnesiumPpm: number;
}): number {
  assertFinite(input.calciumPpm, "calciumPpm");
  assertFinite(input.magnesiumPpm, "magnesiumPpm");
  return (0.713 * input.calciumPpm) + (0.588 * input.magnesiumPpm);
}

/**
 * Compute an "effective alkalinity" (mg/L as CaCO3) after accounting for Ca/Mg.
 *
 * For stability and to avoid over-claiming, we clamp to >= 0 for now.
 */
export function effectiveAlkalinityPpmCaCO3FromCaMg(input: {
  alkalinityPpmCaCO3: number;
  calciumPpm?: number;
  magnesiumPpm?: number;
}): {
  effectiveAlkalinityPpmCaCO3: number;
  alkalinityReductionFromCaMgPpmCaCO3: number;
} {
  assertFinite(input.alkalinityPpmCaCO3, "alkalinityPpmCaCO3");
  const calciumPpm = typeof input.calciumPpm === "number" ? input.calciumPpm : 0;
  const magnesiumPpm = typeof input.magnesiumPpm === "number" ? input.magnesiumPpm : 0;
  assertFinite(calciumPpm, "calciumPpm");
  assertFinite(magnesiumPpm, "magnesiumPpm");

  const reduction = alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm, magnesiumPpm });
  const effective = Math.max(0, input.alkalinityPpmCaCO3 - reduction);
  return {
    effectiveAlkalinityPpmCaCO3: effective,
    alkalinityReductionFromCaMgPpmCaCO3: reduction,
  };
}

