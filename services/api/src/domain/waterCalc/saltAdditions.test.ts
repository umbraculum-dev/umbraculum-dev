import { describe, expect, it } from "vitest";
import {
  applySaltAdditions,
  type IonProfilePpm,
  type SaltAddition,
} from "./saltAdditions.js";

// L1 unit tests for the salt-additions stoichiometry (Phase 5b-1).
// Each numeric assertion is pinned at literature-comparable accuracy
// (toBeCloseTo with 1 decimal place ≈ 0.1 mg/L precision) so floating-point
// noise doesn't flake while still catching real coefficient drift.
//
// Reference cross-check (Bru'n Water convention): 1g gypsum per US gallon
// yields ~62 ppm Ca and ~147 ppm SO4. Our 1g-per-20L expected values below
// are simply that scaled by 3.785 / 20.

const ZERO_PROFILE: IonProfilePpm = {
  calcium: 0,
  magnesium: 0,
  sodium: 0,
  sulfate: 0,
  chloride: 0,
  bicarbonate: 0,
};

describe("applySaltAdditions — happy paths (Phase 5b-1)", () => {
  it("returns the base profile unchanged when no additions are supplied", () => {
    const base: IonProfilePpm = {
      calcium: 50,
      magnesium: 10,
      sodium: 20,
      sulfate: 40,
      chloride: 30,
      bicarbonate: 80,
    };
    const r = applySaltAdditions(base, 20, []);
    expect(r.resultingProfile).toEqual(base);
    expect(r.deltasPpm).toEqual(ZERO_PROFILE);
    expect(r.breakdown).toEqual([]);
    expect(r.baseProfile).toEqual(base);
  });

  // Pinned: 1g gypsum (CaSO4·2H2O, MM ≈ 172.17 g/mol) in 20L water
  // contributes ~11.64 ppm Ca and ~27.90 ppm SO4. These values are derived
  // from the source's molar-mass constants and are the cleanest single
  // sanity check on the stoichiometry pipeline (mol → g ion → mg → ppm).
  it("1g gypsum in 20L → ~11.64 ppm Ca + ~27.90 ppm SO4 (no other ions affected)", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: 1 }]);
    expect(r.deltasPpm.calcium).toBeCloseTo(11.64, 1);
    expect(r.deltasPpm.sulfate).toBeCloseTo(27.9, 1);
    expect(r.deltasPpm.magnesium).toBe(0);
    expect(r.deltasPpm.sodium).toBe(0);
    expect(r.deltasPpm.chloride).toBe(0);
    expect(r.deltasPpm.bicarbonate).toBe(0);
  });

  // Pinned: stoich for CaCl2·2H2O is {calcium: 1, chloride: 2} — the
  // chloride coefficient of 2 is the most failure-prone bit of the salt
  // table because a refactor that "simplifies" the table by setting all
  // coefficients to 1 would silently produce wrong Cl numbers.
  it("1g CaCl2·2H2O in 20L → ~13.63 ppm Ca + ~24.11 ppm Cl (stoich Cl=2 per Ca)", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "calcium_chloride", grams: 1 }]);
    expect(r.deltasPpm.calcium).toBeCloseTo(13.63, 1);
    expect(r.deltasPpm.chloride).toBeCloseTo(24.11, 1);
    expect(r.deltasPpm.sulfate).toBe(0);
  });

  it("1g Epsom (MgSO4·7H2O) in 20L → ~4.93 ppm Mg + ~19.49 ppm SO4", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "epsom", grams: 1 }]);
    expect(r.deltasPpm.magnesium).toBeCloseTo(4.93, 1);
    expect(r.deltasPpm.sulfate).toBeCloseTo(19.49, 1);
    expect(r.deltasPpm.calcium).toBe(0);
  });

  it("1g NaCl in 20L → ~19.67 ppm Na + ~30.33 ppm Cl (1:1 stoich)", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "table_salt", grams: 1 }]);
    expect(r.deltasPpm.sodium).toBeCloseTo(19.67, 1);
    expect(r.deltasPpm.chloride).toBeCloseTo(30.33, 1);
  });

  it("1g NaHCO3 (baking soda) in 20L → ~13.68 ppm Na + ~36.32 ppm HCO3", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "baking_soda", grams: 1 }]);
    expect(r.deltasPpm.sodium).toBeCloseTo(13.68, 1);
    expect(r.deltasPpm.bicarbonate).toBeCloseTo(36.32, 1);
  });

  // Pinned: linearity. Doubling grams doubles the ppm contribution. This
  // catches a class of "off-by-volume" or "log-scale" refactor bugs that
  // the single-salt point tests above wouldn't catch (e.g. a future PR
  // that introduces saturation logic).
  it("scales linearly with grams (2g gypsum → 2x the 1g contribution)", () => {
    const r1 = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: 1 }]);
    const r2 = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: 2 }]);
    expect(r2.deltasPpm.calcium).toBeCloseTo(r1.deltasPpm.calcium * 2, 6);
    expect(r2.deltasPpm.sulfate).toBeCloseTo(r1.deltasPpm.sulfate * 2, 6);
  });

  // Pinned: inverse scaling with volume. Same grams in 2x volume = half
  // the ppm contribution. Catches a refactor that confuses volumeLiters
  // with a different volume unit (e.g. gallons) or that drops the
  // per-volume division entirely.
  it("scales inversely with volume (1g gypsum in 40L → half the 20L contribution)", () => {
    const r20 = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: 1 }]);
    const r40 = applySaltAdditions(ZERO_PROFILE, 40, [{ saltKey: "gypsum", grams: 1 }]);
    expect(r40.deltasPpm.calcium).toBeCloseTo(r20.deltasPpm.calcium / 2, 6);
    expect(r40.deltasPpm.sulfate).toBeCloseTo(r20.deltasPpm.sulfate / 2, 6);
  });

  it("multiple salts accumulate per-ion (gypsum + CaCl2 → Ca contribution sums)", () => {
    const gypsumOnly = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: 1 }]);
    const cacl2Only = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "calcium_chloride", grams: 1 }]);
    const both = applySaltAdditions(ZERO_PROFILE, 20, [
      { saltKey: "gypsum", grams: 1 },
      { saltKey: "calcium_chloride", grams: 1 },
    ]);
    expect(both.deltasPpm.calcium).toBeCloseTo(gypsumOnly.deltasPpm.calcium + cacl2Only.deltasPpm.calcium, 6);
    expect(both.deltasPpm.sulfate).toBeCloseTo(gypsumOnly.deltasPpm.sulfate, 6);
    expect(both.deltasPpm.chloride).toBeCloseTo(cacl2Only.deltasPpm.chloride, 6);
  });

  it("adds onto a non-zero base profile correctly", () => {
    const base: IonProfilePpm = {
      calcium: 30,
      magnesium: 5,
      sodium: 10,
      sulfate: 50,
      chloride: 20,
      bicarbonate: 40,
    };
    const r = applySaltAdditions(base, 20, [{ saltKey: "gypsum", grams: 1 }]);
    expect(r.resultingProfile.calcium).toBeCloseTo(30 + 11.64, 1);
    expect(r.resultingProfile.sulfate).toBeCloseTo(50 + 27.9, 1);
    expect(r.resultingProfile.chloride).toBe(20);
  });
});

describe("applySaltAdditions — invariants and breakdown shape (Phase 5b-1)", () => {
  // Pinned: deltasPpm === resultingProfile - baseProfile per ion. This is
  // the cheapest invariant to verify and catches a class of "wrong base"
  // refactor bugs.
  it("deltasPpm equals resultingProfile minus baseProfile (per ion)", () => {
    const base: IonProfilePpm = {
      calcium: 25,
      magnesium: 8,
      sodium: 15,
      sulfate: 40,
      chloride: 25,
      bicarbonate: 60,
    };
    const r = applySaltAdditions(base, 30, [
      { saltKey: "gypsum", grams: 2 },
      { saltKey: "epsom", grams: 0.5 },
    ]);
    for (const ion of Object.keys(base) as Array<keyof IonProfilePpm>) {
      expect(r.deltasPpm[ion]).toBeCloseTo(r.resultingProfile[ion] - base[ion], 8);
    }
  });

  it("breakdown contains one entry per addition (in input order, with the original grams)", () => {
    const additions: SaltAddition[] = [
      { saltKey: "gypsum", grams: 1 },
      { saltKey: "calcium_chloride", grams: 0.5 },
      { saltKey: "epsom", grams: 0.25 },
    ];
    const r = applySaltAdditions(ZERO_PROFILE, 20, additions);
    expect(r.breakdown).toHaveLength(3);
    expect(r.breakdown.map((b) => b.saltKey)).toEqual([
      "gypsum",
      "calcium_chloride",
      "epsom",
    ]);
    expect(r.breakdown.map((b) => b.grams)).toEqual([1, 0.5, 0.25]);
  });

  // Pinned: each breakdown entry only contains ions the salt actually
  // contributes (per its stoich object), not the full six-ion shape.
  // A future "always emit the full profile" refactor would change wire
  // format consumed by the UI; pin here.
  it("breakdown entries only list ions the salt actually contributes", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: 1 }]);
    const keys = Object.keys(r.breakdown[0]!.deltasPpm).sort();
    expect(keys).toEqual(["calcium", "sulfate"]);
  });

  // Pinned: per-ion sum of breakdown deltas equals overall deltasPpm.
  // The cheapest "breakdown is internally consistent" check.
  it("sum of breakdown deltasPpm (per ion) equals overall deltasPpm", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [
      { saltKey: "gypsum", grams: 1 },
      { saltKey: "calcium_chloride", grams: 1 },
    ]);
    let sumCa = 0;
    let sumCl = 0;
    let sumSO4 = 0;
    for (const b of r.breakdown) {
      sumCa += b.deltasPpm.calcium ?? 0;
      sumCl += b.deltasPpm.chloride ?? 0;
      sumSO4 += b.deltasPpm.sulfate ?? 0;
    }
    expect(sumCa).toBeCloseTo(r.deltasPpm.calcium, 8);
    expect(sumCl).toBeCloseTo(r.deltasPpm.chloride, 8);
    expect(sumSO4).toBeCloseTo(r.deltasPpm.sulfate, 8);
  });

  // Pinned: zero-gram addition produces a breakdown entry but no ion delta.
  // Edge case worth pinning because the function does NOT skip 0g
  // additions — the UI consumer expects to see "I added X but its
  // contribution is 0" in the breakdown.
  it("zero-gram addition still produces a breakdown entry (with zero deltas)", () => {
    const r = applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: 0 }]);
    expect(r.breakdown).toHaveLength(1);
    expect(r.breakdown[0]).toMatchObject({ saltKey: "gypsum", grams: 0 });
    expect(r.deltasPpm.calcium).toBe(0);
    expect(r.deltasPpm.sulfate).toBe(0);
  });
});

describe("applySaltAdditions — validation errors (Phase 5b-1)", () => {
  it("throws when volumeLiters is non-finite", () => {
    expect(() => applySaltAdditions(ZERO_PROFILE, NaN, [])).toThrow(/Invalid volumeLiters/);
    expect(() => applySaltAdditions(ZERO_PROFILE, Infinity, [])).toThrow(/Invalid volumeLiters/);
  });

  it("throws when volumeLiters is zero or negative", () => {
    expect(() => applySaltAdditions(ZERO_PROFILE, 0, [])).toThrow(/volumeLiters must be > 0/);
    expect(() => applySaltAdditions(ZERO_PROFILE, -5, [])).toThrow(/volumeLiters must be > 0/);
  });

  it("throws when a baseProfile ion is non-finite", () => {
    const broken: IonProfilePpm = { ...ZERO_PROFILE, calcium: NaN };
    expect(() => applySaltAdditions(broken, 20, [])).toThrow(/Invalid baseProfile\.calcium/);
  });

  it("throws on an unknown saltKey", () => {
    expect(() =>
      // @ts-expect-error — deliberately invalid saltKey for the negative test
      applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "potassium_chloride", grams: 1 }]),
    ).toThrow(/Unknown saltKey: potassium_chloride/);
  });

  it("throws when an addition is missing its saltKey", () => {
    expect(() =>
      // @ts-expect-error — deliberately invalid addition shape for the negative test
      applySaltAdditions(ZERO_PROFILE, 20, [{ grams: 1 }]),
    ).toThrow(/Invalid salt addition/);
  });

  it("throws when an addition is null/undefined", () => {
    expect(() =>
      // @ts-expect-error — deliberately invalid addition shape for the negative test
      applySaltAdditions(ZERO_PROFILE, 20, [null]),
    ).toThrow(/Invalid salt addition/);
  });

  it("throws when grams is non-numeric", () => {
    expect(() =>
      // @ts-expect-error — deliberately invalid grams type for the negative test
      applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: "1" }]),
    ).toThrow(/Invalid grams for gypsum/);
  });

  it("throws when grams is NaN", () => {
    expect(() =>
      applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: NaN }]),
    ).toThrow(/Invalid grams for gypsum/);
  });

  it("throws when grams is negative", () => {
    expect(() =>
      applySaltAdditions(ZERO_PROFILE, 20, [{ saltKey: "gypsum", grams: -1 }]),
    ).toThrow(/Invalid grams for gypsum/);
  });
});
