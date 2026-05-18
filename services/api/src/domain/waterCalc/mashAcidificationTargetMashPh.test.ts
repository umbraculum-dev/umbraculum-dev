import { describe, expect, it } from "vitest";
import {
  mashAcidificationTargetMashPh,
  type MashAcidificationTargetMashPhInput,
  type MashAcidificationTargetMashPhGristRow,
} from "./mashAcidificationTargetMashPh.js";
import type { AcidStrength, SpargeAcidType } from "./spargeAcidification.js";

// L1 unit tests for the target-mash-pH acid solver (Phase 5b-3).
// This function bisects over acid amount (in ml for liquid, g for solid)
// to find the amount that, when fed back into the mash-pH estimator,
// produces a predicted mash pH ≈ targetMashPh.
//
// The maltClass values map to mashPhDefaultsV1 model keys:
//   base    → base_pale
//   crystal → crystal
//   roast   → roasted
//   acid    → acidulated

const LACTIC_88: AcidStrength = { kind: "percent", value: 88 };
const SOLID: AcidStrength = { kind: "solid" };

const baseGrist: MashAcidificationTargetMashPhGristRow[] = [
  { amountKg: 5, colorLovibond: 3, maltClass: "base" },
];

function input(
  overrides: Partial<MashAcidificationTargetMashPhInput> = {},
): MashAcidificationTargetMashPhInput {
  return {
    // Note on these defaults: with alkalinity=100, vol=20, 5kg base-pale,
    // estimateAtZero ≈ 6.19 (alkalinity uplifts mash pH above the 5.76
    // baseline DI). The model's dynamic range from mashAcidificationManual
    // is bounded by the water-pH=3 inverse clamp; targets within ~0.2 of
    // estimateAtZero converge cleanly. We deliberately use target=6.00 in
    // the happy-path test so the bisection has plenty of headroom.
    startingAlkalinityPpmCaCO3: 100,
    startingPh: 8.5,
    volumeLiters: 20,
    targetMashPh: 6.00,
    acidType: "lactic" as SpargeAcidType,
    strength: LACTIC_88,
    grist: baseGrist,
    ...overrides,
  };
}

describe("mashAcidificationTargetMashPh — happy paths (Phase 5b-3)", () => {
  // Pinned: realistic recipe input → bisection converges, returns a
  // positive acid amount, and the predicted mash pH at the solution is
  // close to the target. Uses target=6.00 with alk=100 (estimateAtZero
  // ≈ 6.194), which sits comfortably inside the function's reachable
  // pH range (limited by the water-pH=3 inverse clamp).
  it("converges to a positive acid amount that lands estimated pH within tolerance of target", () => {
    const r = mashAcidificationTargetMashPh(input({ targetMashPh: 6.00 }));
    expect(r.debug.clamped).toBe("none");
    expect(r.debug.iterations).toBeGreaterThan(0);
    expect(r.acidRequiredMl).not.toBeNull();
    expect(r.acidRequiredMl as number).toBeGreaterThan(0);
    expect(r.estimatedMashPhRoomTemp).toBeCloseTo(6.00, 1);
  });

  // Pinned: the result shape for liquid strength populates ml/tsp and
  // leaves grams/kg as null. The tsp factor is 1 ml ≈ 0.2029 tsp.
  it("liquid strength populates ml + tsp, leaves grams + kg null", () => {
    const r = mashAcidificationTargetMashPh(input());
    expect(typeof r.acidRequiredMl).toBe("number");
    expect(typeof r.acidRequiredTsp).toBe("number");
    expect(r.acidRequiredGrams).toBeNull();
    expect(r.acidRequiredKg).toBeNull();
    // tsp/ml ratio is the pinned conversion factor.
    expect(r.acidRequiredTsp as number).toBeCloseTo((r.acidRequiredMl as number) * 0.2029, 4);
    expect(r.debug.amountUnits).toBe("ml");
  });

  it("solid strength populates grams + kg, leaves ml + tsp null", () => {
    const r = mashAcidificationTargetMashPh(input({
      acidType: "citric",
      strength: SOLID,
    }));
    expect(typeof r.acidRequiredGrams).toBe("number");
    expect(typeof r.acidRequiredKg).toBe("number");
    expect(r.acidRequiredMl).toBeNull();
    expect(r.acidRequiredTsp).toBeNull();
    expect(r.acidRequiredKg as number).toBeCloseTo((r.acidRequiredGrams as number) / 1000, 6);
    expect(r.debug.amountUnits).toBe("grams");
  });
});

describe("mashAcidificationTargetMashPh — early-return: already at or below target (Phase 5b-3)", () => {
  // Pinned: when the estimateAtZero already shows mash pH <= target,
  // the function short-circuits to "0 acid + clamped: 'low'" (in
  // debug.clamped — the term "low" here means "the solver bottomed out
  // at the low-acid boundary because no acid is needed").
  it("zero-alk + neutral grist already below target → returns 0 acid with clamped=\"low\"", () => {
    const r = mashAcidificationTargetMashPh(input({
      startingAlkalinityPpmCaCO3: 0,
      targetMashPh: 5.8, // baseline DI mash pH from base malt is around 5.7
    }));
    expect(r.debug.clamped).toBe("low");
    expect(r.debug.iterations).toBe(0);
    expect(r.acidRequiredMl).toBe(0);
    expect(r.acidRequiredTsp).toBe(0);
    expect(r.acidRequiredGrams).toBeNull();
    expect(r.acidRequiredKg).toBeNull();
    expect(r.finalAlkalinityPpmCaCO3).toBe(0);
    expect(r.sulfateAddedPpm).toBe(0);
    expect(r.chlorideAddedPpm).toBe(0);
  });

  it("early-return: same debug.estimateAtZero === debug.estimateAtSolution", () => {
    const r = mashAcidificationTargetMashPh(input({
      startingAlkalinityPpmCaCO3: 0,
      targetMashPh: 5.9,
    }));
    expect(r.debug.estimateAtSolution).toBe(r.debug.estimateAtZero);
  });
});

describe("mashAcidificationTargetMashPh — monotonic sensitivities (Phase 5b-3)", () => {
  // Pinned: a lower target mash pH requires more acid (more aggressive
  // acidification). Cardinal direction. All three inputs converge
  // (probe-verified) inside the function's reachable pH range.
  it("lower target mash pH → more acid required", () => {
    const high = mashAcidificationTargetMashPh(input({ targetMashPh: 6.15 }));
    const mid = mashAcidificationTargetMashPh(input({ targetMashPh: 6.10 }));
    const low = mashAcidificationTargetMashPh(input({ targetMashPh: 6.00 }));
    expect([high.debug.clamped, mid.debug.clamped, low.debug.clamped]).toEqual([
      "none", "none", "none",
    ]);
    expect(mid.acidRequiredMl as number).toBeGreaterThan(high.acidRequiredMl as number);
    expect(low.acidRequiredMl as number).toBeGreaterThan(mid.acidRequiredMl as number);
  });

  // Pinned: more starting alkalinity → more acid required for the same
  // target. Validates the alkalinity → acid demand relationship end-to-end.
  // Uses target=6.05 (probe-verified to converge for alk in [80, 120]).
  it("higher starting alkalinity → more acid required for same target", () => {
    const low = mashAcidificationTargetMashPh(input({
      startingAlkalinityPpmCaCO3: 80, targetMashPh: 6.05,
    }));
    const mid = mashAcidificationTargetMashPh(input({
      startingAlkalinityPpmCaCO3: 100, targetMashPh: 6.05,
    }));
    const high = mashAcidificationTargetMashPh(input({
      startingAlkalinityPpmCaCO3: 120, targetMashPh: 6.05,
    }));
    expect([low.debug.clamped, mid.debug.clamped, high.debug.clamped]).toEqual([
      "none", "none", "none",
    ]);
    expect(mid.acidRequiredMl as number).toBeGreaterThan(low.acidRequiredMl as number);
    expect(high.acidRequiredMl as number).toBeGreaterThan(mid.acidRequiredMl as number);
  });

  // Pinned: roasted-grain rows reduce the predicted mash pH at zero
  // acid (because their default TA is high). Catches a refactor that
  // mis-maps maltClass to model key (e.g. sends "roast" rows through
  // the "base_pale" branch in modelKeyFromMaltClass) — if that happens,
  // the roasted rows would be treated as base malt with TA=0 and the
  // estimateAtZero would be unchanged.
  //
  // This test compares estimateAtZero directly (not the bisection
  // output) because, depending on how far the roasted contribution
  // pulls estimateAtZero below the target, the solver may early-return
  // clamped="low" (no acid needed). estimateAtZero itself is a clean
  // mashPhEstimate forwarding test.
  it("adding roasted grain pulls estimateAtZero down (maltClass → modelKey wiring)", () => {
    const baseOnly = mashAcidificationTargetMashPh(input({
      grist: [{ amountKg: 5, colorLovibond: 3, maltClass: "base" }],
    }));
    const withRoast = mashAcidificationTargetMashPh(input({
      grist: [
        { amountKg: 4.5, colorLovibond: 3, maltClass: "base" },
        { amountKg: 0.5, colorLovibond: 500, maltClass: "roast" },
      ],
    }));
    expect(withRoast.debug.estimateAtZero.estimatedMashPhRoomTemp).toBeLessThan(
      baseOnly.debug.estimateAtZero.estimatedMashPhRoomTemp,
    );
  });

  // Pinned same direction for acidulated-malt: adding acid malt also
  // reduces estimateAtZero (maltClass "acid" → modelKey "acidulated"
  // → TA defaults ~335 mEq/kg, far higher than crystal/roast).
  it("adding acidulated malt pulls estimateAtZero down further than roast", () => {
    const baseOnly = mashAcidificationTargetMashPh(input({
      grist: [{ amountKg: 5, colorLovibond: 3, maltClass: "base" }],
    }));
    const withAcid = mashAcidificationTargetMashPh(input({
      grist: [
        { amountKg: 4.9, colorLovibond: 3, maltClass: "base" },
        { amountKg: 0.1, colorLovibond: 3, maltClass: "acid" },
      ],
    }));
    expect(withAcid.debug.estimateAtZero.estimatedMashPhRoomTemp).toBeLessThan(
      baseOnly.debug.estimateAtZero.estimatedMashPhRoomTemp,
    );
  });
});

describe("mashAcidificationTargetMashPh — debug shape (Phase 5b-3)", () => {
  // Pinned: the debug payload includes estimateAtZero + estimateAtSolution
  // (both are MashPhEstimateResult). These are wire-format-consumed by
  // the route response shape — see the L4 contract test
  // recipeWaterCompute.contract.test.ts.
  it("debug payload includes estimateAtZero + estimateAtSolution with .estimatedMashPhRoomTemp on both", () => {
    const r = mashAcidificationTargetMashPh(input({ targetMashPh: 6.00 }));
    expect(r.debug.estimateAtZero).toBeDefined();
    expect(r.debug.estimateAtSolution).toBeDefined();
    expect(Number.isFinite(r.debug.estimateAtZero.estimatedMashPhRoomTemp)).toBe(true);
    expect(Number.isFinite(r.debug.estimateAtSolution.estimatedMashPhRoomTemp)).toBe(true);
    // The "solution" estimate must be closer to target than the "zero" estimate
    // for a non-early-return case.
    const target = 6.00;
    const distZero = Math.abs(r.debug.estimateAtZero.estimatedMashPhRoomTemp - target);
    const distSolution = Math.abs(r.debug.estimateAtSolution.estimatedMashPhRoomTemp - target);
    expect(distSolution).toBeLessThan(distZero);
  });

  it("debug.bracket records the final bisection [low, high] window", () => {
    const r = mashAcidificationTargetMashPh(input());
    expect(typeof r.debug.bracket.low).toBe("number");
    expect(typeof r.debug.bracket.high).toBe("number");
    expect(r.debug.bracket.high).toBeGreaterThanOrEqual(r.debug.bracket.low);
  });
});

describe("mashAcidificationTargetMashPh — validation errors (Phase 5b-3)", () => {
  it("throws on non-finite startingAlkalinityPpmCaCO3", () => {
    expect(() => mashAcidificationTargetMashPh(input({ startingAlkalinityPpmCaCO3: NaN }))).toThrow(
      /Invalid startingAlkalinityPpmCaCO3/,
    );
  });

  it("throws on negative startingAlkalinityPpmCaCO3", () => {
    expect(() => mashAcidificationTargetMashPh(input({ startingAlkalinityPpmCaCO3: -1 }))).toThrow(
      /startingAlkalinityPpmCaCO3 must be >= 0/,
    );
  });

  it("throws on non-finite startingPh", () => {
    expect(() => mashAcidificationTargetMashPh(input({ startingPh: NaN }))).toThrow(
      /Invalid startingPh/,
    );
  });

  it("throws on non-finite volumeLiters", () => {
    expect(() => mashAcidificationTargetMashPh(input({ volumeLiters: NaN }))).toThrow(
      /Invalid volumeLiters/,
    );
  });

  it("throws on volumeLiters <= 0", () => {
    expect(() => mashAcidificationTargetMashPh(input({ volumeLiters: 0 }))).toThrow(
      /volumeLiters must be > 0/,
    );
  });

  it("throws on non-finite targetMashPh", () => {
    expect(() => mashAcidificationTargetMashPh(input({ targetMashPh: NaN }))).toThrow(
      /Invalid targetMashPh/,
    );
  });

  it("throws on negative Ca / Mg", () => {
    expect(() => mashAcidificationTargetMashPh(input({ calciumPpm: -1 }))).toThrow(
      /calciumPpm\/magnesiumPpm must be >= 0/,
    );
    expect(() => mashAcidificationTargetMashPh(input({ magnesiumPpm: -1 }))).toThrow(
      /calciumPpm\/magnesiumPpm must be >= 0/,
    );
  });

  it("throws on non-finite Ca / Mg", () => {
    expect(() => mashAcidificationTargetMashPh(input({ calciumPpm: NaN }))).toThrow(
      /Invalid calciumPpm/,
    );
    expect(() => mashAcidificationTargetMashPh(input({ magnesiumPpm: NaN }))).toThrow(
      /Invalid magnesiumPpm/,
    );
  });
});
