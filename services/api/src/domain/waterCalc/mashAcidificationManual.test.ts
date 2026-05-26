import { describe, expect, it } from "vitest";
import {
  mashAcidificationManual,
  type MashAcidificationManualInput,
} from "./mashAcidificationManual.js";
import { spargeAcidification } from "./spargeAcidification.js";
import type { AcidStrength, SpargeAcidType } from "./spargeAcidification.js";

// L1 unit tests for the manual-entry mash acidification solver (Phase 5b-3).
// This function inverts `spargeAcidification` via bisection over pH:
// given an acid amount that the user added, it finds the pH the water
// would have ended up at. It is the foundation of the "manual" mode of
// the water-calc pages.
//
// The bisection bracket is [phLow=3.0, phHigh=8.0]. Outside this range
// the result is "clamped".

const LACTIC_88: AcidStrength = { kind: "percent", value: 88 };
const PHOSPHORIC_10: AcidStrength = { kind: "percent", value: 10 };
const SOLID: AcidStrength = { kind: "solid" };

function input(overrides: Partial<MashAcidificationManualInput> = {}): MashAcidificationManualInput {
  return {
    startingAlkalinityPpmCaCO3: 100,
    startingPh: 8.5,
    volumeLiters: 20,
    acidType: "lactic" as SpargeAcidType,
    strength: LACTIC_88,
    acidAddedMl: 5,
    ...overrides,
  };
}

describe("mashAcidificationManual — clamps + bracket boundaries (Phase 5b-3)", () => {
  // Pinned: 0 acid added with realistic alkaline water → can't even hit
  // phHigh=8.0 from the starting pH → "high" clamp returns achievedPh=8.
  // (The model treats anything between startingPh and 8.0 as
  // unrepresentable in the [3,8] bracket and reports the high boundary.)
  it("zero acid added → clamped \"high\" at achievedPh=8.0", () => {
    const r = mashAcidificationManual(input({ acidAddedMl: 0 }));
    expect(r.clamped).toBe("high");
    expect(r.achievedPh).toBe(8.0);
    expect(r.iterations).toBe(0);
    expect(r.targetAmount).toBe(0);
  });

  // Pinned: very large acid amount → can't even hit phLow=3.0 → "low"
  // clamp returns achievedPh=3.0.
  it("very large acid amount → clamped \"low\" at achievedPh=3.0", () => {
    const r = mashAcidificationManual(input({ acidAddedMl: 1000 }));
    expect(r.clamped).toBe("low");
    expect(r.achievedPh).toBe(3.0);
    expect(r.iterations).toBe(0);
  });

  it("targetAmount field reflects the supplied input verbatim", () => {
    const r = mashAcidificationManual(input({ acidAddedMl: 7.5 }));
    expect(r.targetAmount).toBe(7.5);
  });
});

describe("mashAcidificationManual — bisection (Phase 5b-3)", () => {
  // Pinned: for a typical mid-range input, the bisection runs (iterations
  // > 0), the result is within the [3,8] bracket, and clamped="none".
  it("typical mid-range input → bisects (clamped=\"none\", finite achievedPh in (3,8))", () => {
    const r = mashAcidificationManual(input({ acidAddedMl: 3 }));
    expect(r.clamped).toBe("none");
    expect(r.iterations).toBeGreaterThan(0);
    expect(r.achievedPh).toBeGreaterThan(3);
    expect(r.achievedPh).toBeLessThan(8);
    expect(Number.isFinite(r.predictedAmount)).toBe(true);
  });

  // Pinned: more acid → lower achieved pH. Cardinal monotonicity.
  it("more acid → lower achievedPh (monotonic)", () => {
    const small = mashAcidificationManual(input({ acidAddedMl: 1 }));
    const medium = mashAcidificationManual(input({ acidAddedMl: 5 }));
    const large = mashAcidificationManual(input({ acidAddedMl: 15 }));
    // All three should be inside the bracket to ensure we're comparing bisected results.
    expect([small.clamped, medium.clamped, large.clamped]).toEqual(["none", "none", "none"]);
    expect(medium.achievedPh).toBeLessThan(small.achievedPh);
    expect(large.achievedPh).toBeLessThan(medium.achievedPh);
  });

  // Pinned: the inverse-symmetry round-trip. If sparge solver says
  // "X ml of acid achieves pH=5.5", then mashAcidificationManual({
  // acidAddedMl: X }) should report achievedPh ≈ 5.5.
  // This is the cheapest end-to-end sanity check on the bisection.
  it("inverse symmetry: sparge → ml then manual(ml) → ≈ same achievedPh", () => {
    const targetPh = 5.5;
    const forward = spargeAcidification({
      startingAlkalinityPpmCaCO3: 100,
      startingPh: 8.5,
      targetPh,
      volumeLiters: 20,
      acidType: "lactic",
      strength: LACTIC_88,
    });
    expect(forward.acidRequiredMl).not.toBeNull();
    const acidMl = forward.acidRequiredMl as number;

    const inverse = mashAcidificationManual({
      startingAlkalinityPpmCaCO3: 100,
      startingPh: 8.5,
      volumeLiters: 20,
      acidType: "lactic",
      strength: LACTIC_88,
      acidAddedMl: acidMl,
    });

    expect(inverse.clamped).toBe("none");
    expect(inverse.achievedPh).toBeCloseTo(targetPh, 2);
    expect(inverse.predictedAmount).toBeCloseTo(acidMl, 4);
  });

  // Pinned: different acid types produce different achievedPh for the
  // same amount (different pK values + molecular weights). Catches a
  // refactor that accidentally normalizes all acids to the same
  // effective strength.
  it("different acid types produce different achievedPh for same volume", () => {
    const lactic = mashAcidificationManual(input({
      acidType: "lactic",
      strength: LACTIC_88,
      acidAddedMl: 3,
    }));
    const phosphoric = mashAcidificationManual(input({
      acidType: "phosphoric",
      strength: PHOSPHORIC_10,
      acidAddedMl: 3,
    }));
    expect([lactic.clamped, phosphoric.clamped]).toEqual(["none", "none"]);
    // Different acid strengths/types must yield distinct pH outcomes; we
    // intentionally don't pin which is higher because that depends on the
    // pK / molar-mass / strength interaction (and tests should remain
    // robust to small calibration tweaks of any one acid).
    expect(lactic.achievedPh).not.toBeCloseTo(phosphoric.achievedPh, 2);
  });
});

describe("mashAcidificationManual — solid acid (acidAddedGrams branch) (Phase 5b-3)", () => {
  it("solid strength uses acidAddedGrams (not acidAddedMl)", () => {
    const r = mashAcidificationManual({
      startingAlkalinityPpmCaCO3: 100,
      startingPh: 8.5,
      volumeLiters: 20,
      acidType: "citric",
      strength: SOLID,
      acidAddedGrams: 2,
    });
    expect(r.targetAmount).toBe(2);
    // predicted comes from spargeAcidification — for solid, acidRequiredGrams
    // is populated and acidRequiredMl is null.
    expect(r.predicted.acidRequiredGrams).not.toBeNull();
    expect(r.predicted.acidRequiredMl).toBeNull();
  });

  // Pinned: when strength.kind === "solid" the function reads
  // acidAddedGrams (not acidAddedMl). An undefined acidAddedGrams →
  // NaN → throws.
  it("solid strength without acidAddedGrams → throws", () => {
    expect(() =>
      mashAcidificationManual({
        startingAlkalinityPpmCaCO3: 100,
        startingPh: 8.5,
        volumeLiters: 20,
        acidType: "citric",
        strength: SOLID,
        // acidAddedGrams missing
      }),
    ).toThrow(/acidAdded must be a finite number >= 0/);
  });
});

describe("mashAcidificationManual — validation errors (Phase 5b-3)", () => {
  it("throws when acidAddedMl is undefined for a liquid strength", () => {
    expect(() =>
      mashAcidificationManual({
        startingAlkalinityPpmCaCO3: 100,
        startingPh: 8.5,
        volumeLiters: 20,
        acidType: "lactic",
        strength: LACTIC_88,
        // acidAddedMl missing
      }),
    ).toThrow(/acidAdded must be a finite number >= 0/);
  });

  it("throws on negative acidAddedMl", () => {
    expect(() => mashAcidificationManual(input({ acidAddedMl: -1 }))).toThrow(
      /acidAdded must be a finite number >= 0/,
    );
  });

  it("throws on NaN acidAddedMl", () => {
    expect(() => mashAcidificationManual(input({ acidAddedMl: NaN }))).toThrow(
      /acidAdded must be a finite number >= 0/,
    );
  });
});
