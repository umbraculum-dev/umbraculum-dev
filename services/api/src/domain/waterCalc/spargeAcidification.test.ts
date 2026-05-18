import { describe, expect, it } from "vitest";
import {
  spargeAcidification,
  type AcidStrength,
  type SpargeAcidificationInput,
  type SpargeAcidType,
} from "./spargeAcidification.js";

// L1 unit tests for the BrunWater-style sparge acidification solver (Phase 5b-4).
//
// This is the lowest-level water-chemistry function in the waterCalc surface:
// given (alkalinity, starting pH, target pH, volume, acid type, strength)
// it returns the acid amount needed and the resulting ion contributions.
// Everything upstream — mashAcidificationManual, mashAcidificationTargetMashPh,
// spargeAcidificationManual — bisects or composes on top of this function.
//
// The constants pinned by these tests are the empirical-fit physical
// constants that downstream UI displays and recipe contracts depend on.

const LACTIC_88: AcidStrength = { kind: "percent", value: 88 };
const PHOSPHORIC_10: AcidStrength = { kind: "percent", value: 10 };
const SULFURIC_10: AcidStrength = { kind: "percent", value: 10 };
const HCL_10: AcidStrength = { kind: "percent", value: 10 };
const NORMALITY_1: AcidStrength = { kind: "normality", value: 1 };
const MOLARITY_1: AcidStrength = { kind: "molarity", value: 1 };
const SOLID: AcidStrength = { kind: "solid" };

function input(overrides: Partial<SpargeAcidificationInput> = {}): SpargeAcidificationInput {
  return {
    startingAlkalinityPpmCaCO3: 100,
    startingPh: 8.5,
    targetPh: 5.5,
    volumeLiters: 20,
    acidType: "lactic" as SpargeAcidType,
    strength: LACTIC_88,
    ...overrides,
  };
}

describe("spargeAcidification — happy paths + output shape (Phase 5b-4)", () => {
  // Pinned: realistic inputs produce a positive, finite acid amount and
  // all numeric debug fields are finite.
  it("typical input (lactic 88%, alk=100, vol=20, 8.5→5.5) → positive finite acid", () => {
    const r = spargeAcidification(input());
    expect(r.acidRequiredMl).not.toBeNull();
    expect(r.acidRequiredMl as number).toBeGreaterThan(0);
    expect(r.acidRequiredTsp).not.toBeNull();
    expect(Number.isFinite(r.debug.acidRequired_mEqPerL)).toBe(true);
    expect(r.debug.acidRequired_mEqPerL).toBeGreaterThan(0);
    expect(Number.isFinite(r.debug.mMRequired_mmolPerL)).toBe(true);
    expect(Number.isFinite(r.debug.frac_equivalentsPerMole)).toBe(true);
    // Sulfate/chloride should be 0 for non-sulfuric/hydrochloric acids.
    expect(r.sulfateAddedPpm).toBe(0);
    expect(r.chlorideAddedPpm).toBe(0);
  });

  // Pinned: the tsp/ml conversion ratio (a 1:1 multiplicative constant).
  it("tsp/ml conversion factor pinned at 0.2029", () => {
    const r = spargeAcidification(input());
    expect(r.acidRequiredTsp as number).toBeCloseTo((r.acidRequiredMl as number) * 0.2029, 6);
  });

  // Pinned: the BrunWater B11 identity — finalAlkalinity = effAlk -
  // acidRequired_mEqPerL * 50. Catches a refactor that drops the
  // *50 factor or replaces effAlk with raw alkalinity.
  it("finalAlkalinity = effectiveAlkalinity - acidRequired_mEqPerL * 50", () => {
    const r = spargeAcidification(input());
    const expected = r.debug.effectiveAlkalinityPpmCaCO3 - r.debug.acidRequired_mEqPerL * 50;
    expect(r.finalAlkalinityPpmCaCO3).toBeCloseTo(expected, 6);
  });
});

describe("spargeAcidification — strength-kind output shape (Phase 5b-4)", () => {
  // Pinned: 4 strength.kind variants produce distinct output shapes.
  // The route response shape (and L4 contract test) consumes these,
  // so they're part of the wire format.

  it("strength.kind=\"percent\" (liquid) → ml + tsp + sg_mgPerMl populated; grams + kg null", () => {
    const r = spargeAcidification(input({ strength: LACTIC_88 }));
    expect(typeof r.acidRequiredMl).toBe("number");
    expect(typeof r.acidRequiredTsp).toBe("number");
    expect(r.acidRequiredGrams).toBeNull();
    expect(r.acidRequiredKg).toBeNull();
    expect(typeof r.debug.sg_mgPerMl).toBe("number");
  });

  it("strength.kind=\"normality\" → ml + tsp populated; no sg_mgPerMl", () => {
    const r = spargeAcidification(input({ strength: NORMALITY_1 }));
    expect(typeof r.acidRequiredMl).toBe("number");
    expect(typeof r.acidRequiredTsp).toBe("number");
    expect(r.acidRequiredGrams).toBeNull();
    expect(r.debug.sg_mgPerMl).toBeNull();
  });

  it("strength.kind=\"molarity\" → ml + tsp populated; no sg_mgPerMl", () => {
    const r = spargeAcidification(input({ strength: MOLARITY_1 }));
    expect(typeof r.acidRequiredMl).toBe("number");
    expect(typeof r.acidRequiredTsp).toBe("number");
    expect(r.acidRequiredGrams).toBeNull();
    expect(r.debug.sg_mgPerMl).toBeNull();
  });

  it("strength.kind=\"solid\" → grams + kg populated; ml + tsp null; kg/grams=0.001", () => {
    const r = spargeAcidification(input({
      acidType: "citric",
      strength: SOLID,
    }));
    expect(typeof r.acidRequiredGrams).toBe("number");
    expect(typeof r.acidRequiredKg).toBe("number");
    expect(r.acidRequiredMl).toBeNull();
    expect(r.acidRequiredTsp).toBeNull();
    expect(r.acidRequiredKg as number).toBeCloseTo((r.acidRequiredGrams as number) / 1000, 6);
  });

  // Pinned: even for a liquid acid (e.g. lactic), strength.kind="solid"
  // forces the solid output shape (grams + kg). The route uses this to
  // support manual entry of solid acid weights regardless of base acid.
  it("liquid acid type + strength.kind=\"solid\" → grams + kg populated (state override)", () => {
    const r = spargeAcidification(input({ strength: SOLID }));
    expect(typeof r.acidRequiredGrams).toBe("number");
    expect(r.acidRequiredMl).toBeNull();
  });
});

describe("spargeAcidification — sulfate / chloride additions (Phase 5b-4)", () => {
  // Pinned: only sulfuric acid contributes sulfate; only hydrochloric
  // contributes chloride. The contribution is a direct ion-mass
  // calculation: ppm = mMRequired * (ion atomic weight). For SO4 the
  // factor is 96 g/mol; for Cl it is 35.5 g/mol. These are wire-format
  // constants — the route response shape returns sulfateAddedPpm /
  // chlorideAddedPpm and the UI shows them as ion-profile deltas.

  it("sulfuric acid → sulfateAddedPpm = mMRequired * 96 (BrunWater strtable)", () => {
    const r = spargeAcidification(input({
      acidType: "sulfuric",
      strength: SULFURIC_10,
    }));
    expect(r.sulfateAddedPpm).toBeCloseTo(r.debug.mMRequired_mmolPerL * 96, 6);
    expect(r.chlorideAddedPpm).toBe(0);
  });

  it("hydrochloric acid → chlorideAddedPpm = mMRequired * 35.5 (BrunWater strtable)", () => {
    const r = spargeAcidification(input({
      acidType: "hydrochloric",
      strength: HCL_10,
    }));
    expect(r.chlorideAddedPpm).toBeCloseTo(r.debug.mMRequired_mmolPerL * 35.5, 6);
    expect(r.sulfateAddedPpm).toBe(0);
  });

  it("other acid types (lactic / phosphoric / citric / tartaric / malic / acetic) → both ion additions are 0", () => {
    const acidsToCheck: Array<{ acidType: SpargeAcidType; strength: AcidStrength }> = [
      { acidType: "lactic", strength: LACTIC_88 },
      { acidType: "phosphoric", strength: PHOSPHORIC_10 },
      { acidType: "acetic", strength: { kind: "percent", value: 5 } },
      { acidType: "citric", strength: SOLID },
      { acidType: "tartaric", strength: SOLID },
      { acidType: "malic", strength: SOLID },
    ];
    for (const a of acidsToCheck) {
      const r = spargeAcidification(input(a));
      expect(r.sulfateAddedPpm).toBe(0);
      expect(r.chlorideAddedPpm).toBe(0);
    }
  });
});

describe("spargeAcidification — monotonic sensitivities (Phase 5b-4)", () => {
  // Pinned: more starting alkalinity → more acid needed to hit the same
  // target pH. Cardinal physical direction.
  it("higher starting alkalinity → more acid required (cardinal direction)", () => {
    const lowAlk = spargeAcidification(input({ startingAlkalinityPpmCaCO3: 50 }));
    const highAlk = spargeAcidification(input({ startingAlkalinityPpmCaCO3: 200 }));
    expect(highAlk.acidRequiredMl as number).toBeGreaterThan(lowAlk.acidRequiredMl as number);
    expect(highAlk.debug.acidRequired_mEqPerL).toBeGreaterThan(lowAlk.debug.acidRequired_mEqPerL);
  });

  // Pinned: a lower target pH (further from starting pH) → more acid.
  it("lower target pH → more acid required (further drop from starting pH)", () => {
    const small = spargeAcidification(input({ targetPh: 6.5 }));
    const large = spargeAcidification(input({ targetPh: 5.0 }));
    expect(large.acidRequiredMl as number).toBeGreaterThan(small.acidRequiredMl as number);
  });

  // Pinned: Ca / Mg reduce effective alkalinity (Kolbach-style) → less
  // acid required. Validates the residualAlkalinity ↔ spargeAcidification
  // wiring end-to-end.
  it("adding Ca reduces effective alkalinity → less acid required", () => {
    const noCa = spargeAcidification(input({ startingAlkalinityPpmCaCO3: 200 }));
    const withCa = spargeAcidification(input({
      startingAlkalinityPpmCaCO3: 200,
      calciumPpm: 100,
    }));
    expect(withCa.debug.effectiveAlkalinityPpmCaCO3).toBeLessThan(
      noCa.debug.effectiveAlkalinityPpmCaCO3,
    );
    expect(withCa.debug.acidRequired_mEqPerL).toBeLessThan(noCa.debug.acidRequired_mEqPerL);
  });

  it("adding Mg reduces effective alkalinity → less acid required", () => {
    const noMg = spargeAcidification(input({ startingAlkalinityPpmCaCO3: 200 }));
    const withMg = spargeAcidification(input({
      startingAlkalinityPpmCaCO3: 200,
      magnesiumPpm: 80,
    }));
    expect(withMg.debug.acidRequired_mEqPerL).toBeLessThan(noMg.debug.acidRequired_mEqPerL);
  });

  // Pinned: scaling volume scales acidRequiredMl proportionally
  // (acidRequired_mEqPerL is intensive — same per liter — so the
  // extensive ml output scales linearly with volume).
  it("doubling volume doubles acidRequiredMl (linearity in volume)", () => {
    const r1 = spargeAcidification(input({ volumeLiters: 10 }));
    const r2 = spargeAcidification(input({ volumeLiters: 20 }));
    expect(r2.acidRequiredMl as number).toBeCloseTo((r1.acidRequiredMl as number) * 2, 4);
    // The intensive mEq/L value should be IDENTICAL across volumes.
    expect(r2.debug.acidRequired_mEqPerL).toBeCloseTo(r1.debug.acidRequired_mEqPerL, 6);
  });

  // Pinned: different acid types with the SAME strength produce DIFFERENT
  // acidRequiredMl values (because the acid pK values change frac_equivalents,
  // and the molecular weights differ). Catches a refactor that accidentally
  // ignores the acid table and uses a single hardcoded acid.
  it("different acid types at same strength → different acidRequiredMl", () => {
    const lactic = spargeAcidification(input({ acidType: "lactic", strength: LACTIC_88 }));
    const phosphoric = spargeAcidification(input({ acidType: "phosphoric", strength: LACTIC_88 }));
    expect(lactic.acidRequiredMl).not.toBeCloseTo(phosphoric.acidRequiredMl as number, 2);
    // The frac_equivalentsPerMole must differ — that's the underlying mechanism.
    expect(lactic.debug.frac_equivalentsPerMole).not.toBeCloseTo(
      phosphoric.debug.frac_equivalentsPerMole, 4,
    );
  });
});

describe("spargeAcidification — validation errors (Phase 5b-4)", () => {
  it("throws on non-finite startingAlkalinityPpmCaCO3", () => {
    expect(() => spargeAcidification(input({ startingAlkalinityPpmCaCO3: NaN }))).toThrow(
      /Invalid startingAlkalinityPpmCaCO3/,
    );
  });

  it("throws on non-finite startingPh", () => {
    expect(() => spargeAcidification(input({ startingPh: NaN }))).toThrow(/Invalid startingPh/);
  });

  it("throws on non-finite targetPh", () => {
    expect(() => spargeAcidification(input({ targetPh: NaN }))).toThrow(/Invalid targetPh/);
  });

  it("throws on non-finite volumeLiters", () => {
    expect(() => spargeAcidification(input({ volumeLiters: NaN }))).toThrow(/Invalid volumeLiters/);
  });

  it("throws on negative Ca / Mg", () => {
    expect(() => spargeAcidification(input({ calciumPpm: -1 }))).toThrow(
      /calciumPpm\/magnesiumPpm must be >= 0/,
    );
    expect(() => spargeAcidification(input({ magnesiumPpm: -1 }))).toThrow(
      /calciumPpm\/magnesiumPpm must be >= 0/,
    );
  });

  it("throws on non-finite Ca / Mg", () => {
    expect(() => spargeAcidification(input({ calciumPpm: NaN }))).toThrow(/Invalid calciumPpm/);
    expect(() => spargeAcidification(input({ magnesiumPpm: NaN }))).toThrow(/Invalid magnesiumPpm/);
  });

  it("throws when percent strength is <= 0 (liquid)", () => {
    expect(() => spargeAcidification(input({ strength: { kind: "percent", value: 0 } }))).toThrow(
      /Percent strength must be > 0/,
    );
    expect(() => spargeAcidification(input({ strength: { kind: "percent", value: -5 } }))).toThrow(
      /Percent strength must be > 0/,
    );
  });

  it("throws when normality is <= 0", () => {
    expect(() => spargeAcidification(input({ strength: { kind: "normality", value: 0 } }))).toThrow(
      /Normality must be > 0/,
    );
  });

  it("throws when molarity is <= 0", () => {
    expect(() => spargeAcidification(input({ strength: { kind: "molarity", value: 0 } }))).toThrow(
      /Molarity must be > 0/,
    );
  });
});
