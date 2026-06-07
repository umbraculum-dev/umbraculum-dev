import { describe, expect, it } from "vitest";
import {
  spargeAcidificationManual,
  type SpargeAcidificationManualInput,
} from "./spargeAcidificationManual.js";
import { spargeAcidification } from "./spargeAcidification.js";
import type { AcidStrength, SpargeAcidType } from "./spargeAcidification.js";

// L1 unit tests for the manual-entry sparge acidification solver (Phase 5b-4).
// Mirror of mashAcidificationManual.test.ts — same [3,8] bisection bracket
// and same inverse-symmetry contract — but for the sparge surface, which
// the recipe-water UI displays as a separate panel.

const LACTIC_88: AcidStrength = { kind: "percent", value: 88 };
const PHOSPHORIC_10: AcidStrength = { kind: "percent", value: 10 };
const SOLID: AcidStrength = { kind: "solid" };

function input(overrides: Partial<SpargeAcidificationManualInput> = {}): SpargeAcidificationManualInput {
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

describe("spargeAcidificationManual — bracket clamps + boundaries (Phase 5b-4)", () => {
  it("zero acid added → clamped \"high\" at achievedPh=8.0", () => {
    const r = spargeAcidificationManual(input({ acidAddedMl: 0 }));
    expect(r.clamped).toBe("high");
    expect(r.achievedPh).toBe(8.0);
    expect(r.iterations).toBe(0);
    expect(r.targetAmount).toBe(0);
  });

  it("very large acid amount → clamped \"low\" at achievedPh=3.0", () => {
    const r = spargeAcidificationManual(input({ acidAddedMl: 1000 }));
    expect(r.clamped).toBe("low");
    expect(r.achievedPh).toBe(3.0);
  });

  it("targetAmount field reflects the supplied input verbatim", () => {
    const r = spargeAcidificationManual(input({ acidAddedMl: 7.5 }));
    expect(r.targetAmount).toBe(7.5);
  });
});

describe("spargeAcidificationManual — bisection (Phase 5b-4)", () => {
  // Pinned: typical mid-range input → bisects, clamped="none".
  it("typical mid-range input → bisects (clamped=\"none\", finite achievedPh in (3,8))", () => {
    const r = spargeAcidificationManual(input({ acidAddedMl: 3 }));
    expect(r.clamped).toBe("none");
    expect(r.iterations).toBeGreaterThan(0);
    expect(r.achievedPh).toBeGreaterThan(3);
    expect(r.achievedPh).toBeLessThan(8);
    expect(Number.isFinite(r.predictedAmount)).toBe(true);
  });

  it("more acid → lower achievedPh (monotonic)", () => {
    const small = spargeAcidificationManual(input({ acidAddedMl: 1 }));
    const medium = spargeAcidificationManual(input({ acidAddedMl: 5 }));
    const large = spargeAcidificationManual(input({ acidAddedMl: 15 }));
    expect([small.clamped, medium.clamped, large.clamped]).toEqual(["none", "none", "none"]);
    expect(medium.achievedPh).toBeLessThan(small.achievedPh);
    expect(large.achievedPh).toBeLessThan(medium.achievedPh);
  });

  // Pinned: the inverse-symmetry round-trip with spargeAcidification.
  // If sparge solver says "X ml achieves pH=5.5", manual({acidAddedMl: X})
  // should report achievedPh ≈ 5.5. This is the cheapest end-to-end
  // sanity check on the bisection wiring.
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
    const acidMl = forward.acidRequiredMl as number;

    const inverse = spargeAcidificationManual({
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

  it("different acid types produce different achievedPh for same volume", () => {
    const lactic = spargeAcidificationManual(input({
      acidType: "lactic",
      strength: LACTIC_88,
      acidAddedMl: 3,
    }));
    const phosphoric = spargeAcidificationManual(input({
      acidType: "phosphoric",
      strength: PHOSPHORIC_10,
      acidAddedMl: 3,
    }));
    expect([lactic.clamped, phosphoric.clamped]).toEqual(["none", "none"]);
    expect(lactic.achievedPh).not.toBeCloseTo(phosphoric.achievedPh, 2);
  });

  // Pinned: Ca/Mg pass-through to the inner spargeAcidification.
  // The manual function doesn't validate Ca/Mg itself — invalid values
  // throw via the inner call.
  it("Ca/Mg are forwarded to the inner spargeAcidification (effective alkalinity reduction)", () => {
    const noCa = spargeAcidificationManual(input({
      startingAlkalinityPpmCaCO3: 200,
      acidAddedMl: 3,
    }));
    const withCa = spargeAcidificationManual(input({
      startingAlkalinityPpmCaCO3: 200,
      calciumPpm: 100,
      acidAddedMl: 3,
    }));
    expect([noCa.clamped, withCa.clamped]).toEqual(["none", "none"]);
    // Ca reduces effective alkalinity → less buffering → same acid amount
    // pushes pH LOWER (smaller achievedPh).
    expect(withCa.achievedPh).toBeLessThan(noCa.achievedPh);
  });
});

describe("spargeAcidificationManual — solid acid branch (Phase 5b-4)", () => {
  it("solid strength uses acidAddedGrams (not acidAddedMl)", () => {
    const r = spargeAcidificationManual({
      startingAlkalinityPpmCaCO3: 100,
      startingPh: 8.5,
      volumeLiters: 20,
      acidType: "citric",
      strength: SOLID,
      acidAddedGrams: 2,
    });
    expect(r.targetAmount).toBe(2);
    expect(r.predicted.acidRequiredGrams).not.toBeNull();
    expect(r.predicted.acidRequiredMl).toBeNull();
  });

  it("solid strength without acidAddedGrams → throws", () => {
    expect(() =>
      spargeAcidificationManual({
        startingAlkalinityPpmCaCO3: 100,
        startingPh: 8.5,
        volumeLiters: 20,
        acidType: "citric",
        strength: SOLID,
      }),
    ).toThrow(/acidAdded must be a finite number >= 0/);
  });
});

describe("spargeAcidificationManual — validation errors (Phase 5b-4)", () => {
  it("throws when acidAddedMl is undefined for a liquid strength", () => {
    expect(() =>
      spargeAcidificationManual({
        startingAlkalinityPpmCaCO3: 100,
        startingPh: 8.5,
        volumeLiters: 20,
        acidType: "lactic",
        strength: LACTIC_88,
      }),
    ).toThrow(/acidAdded must be a finite number >= 0/);
  });

  it("throws on negative acidAddedMl", () => {
    expect(() => spargeAcidificationManual(input({ acidAddedMl: -1 }))).toThrow(
      /acidAdded must be a finite number >= 0/,
    );
  });

  it("throws on NaN acidAddedMl", () => {
    expect(() => spargeAcidificationManual(input({ acidAddedMl: NaN }))).toThrow(
      /acidAdded must be a finite number >= 0/,
    );
  });

  // Pinned: invalid Ca/Mg propagates from the inner spargeAcidification.
  it("negative Ca propagates through to the inner spargeAcidification (throws)", () => {
    expect(() =>
      spargeAcidificationManual(input({ calciumPpm: -1, acidAddedMl: 3 })),
    ).toThrow(/calciumPpm\/magnesiumPpm must be >= 0/);
  });
});
