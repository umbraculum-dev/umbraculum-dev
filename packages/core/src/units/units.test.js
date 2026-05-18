import { describe, expect, it } from "vitest";
import {
  isMassUnitV1,
  isVolumeUnitV1,
  kgToLb,
  litersToUsGallons,
  massToGrams,
  massToKg,
  volumeToLiters,
} from "./units.js";

describe("isMassUnitV1 / isVolumeUnitV1", () => {
  it("classifies mass units", () => {
    for (const u of ["kg", "g", "lb", "oz"]) expect(isMassUnitV1(u)).toBe(true);
    for (const u of ["l", "ml", "gal", "unknown", "", null, undefined]) {
      expect(isMassUnitV1(u)).toBe(false);
    }
  });

  it("classifies volume units", () => {
    for (const u of ["l", "ml", "gal", "qt", "pt", "fl_oz"]) expect(isVolumeUnitV1(u)).toBe(true);
    for (const u of ["kg", "g", "unknown", "", null, undefined]) {
      expect(isVolumeUnitV1(u)).toBe(false);
    }
  });
});

describe("massToKg", () => {
  it("returns the value unchanged for kg", () => {
    expect(massToKg(2.5, "kg")).toBe(2.5);
  });

  it("converts g, lb, oz to kg", () => {
    expect(massToKg(1500, "g")).toBe(1.5);
    expect(massToKg(2, "lb")).toBeCloseTo(0.9071847, 6);
    expect(massToKg(16, "oz")).toBeCloseTo(0.45359237, 6);
  });

  it("returns null for unknown unit", () => {
    expect(massToKg(10, "stone")).toBeNull();
  });

  it("returns null for non-finite values", () => {
    expect(massToKg(NaN, "kg")).toBeNull();
    expect(massToKg(Infinity, "kg")).toBeNull();
    expect(massToKg("2", "kg")).toBeNull();
  });
});

describe("massToGrams", () => {
  it("scales kg -> grams", () => {
    expect(massToGrams(1.5, "kg")).toBe(1500);
  });

  it("returns null when the underlying massToKg fails", () => {
    expect(massToGrams(NaN, "kg")).toBeNull();
    expect(massToGrams(1, "bogus")).toBeNull();
  });
});

describe("volumeToLiters", () => {
  it("returns the value unchanged for l", () => {
    expect(volumeToLiters(5, "l")).toBe(5);
  });

  it("converts ml, gal, qt, pt, fl_oz to liters", () => {
    expect(volumeToLiters(500, "ml")).toBe(0.5);
    expect(volumeToLiters(1, "gal")).toBeCloseTo(3.785411784, 6);
    expect(volumeToLiters(1, "qt")).toBeCloseTo(0.946352946, 6);
    expect(volumeToLiters(1, "pt")).toBeCloseTo(0.473176473, 6);
    expect(volumeToLiters(8, "fl_oz")).toBeCloseTo(0.2365882, 4);
  });

  it("returns null for unknown unit", () => {
    expect(volumeToLiters(1, "barrel")).toBeNull();
  });

  it("returns null for non-finite values", () => {
    expect(volumeToLiters(NaN, "l")).toBeNull();
    expect(volumeToLiters("1", "l")).toBeNull();
  });
});

describe("litersToUsGallons + kgToLb (inverse helpers)", () => {
  it("litersToUsGallons round-trips with volumeToLiters", () => {
    const liters = volumeToLiters(3, "gal");
    expect(litersToUsGallons(liters)).toBeCloseTo(3, 6);
  });

  it("kgToLb round-trips with massToKg", () => {
    const kg = massToKg(5, "lb");
    expect(kgToLb(kg)).toBeCloseTo(5, 6);
  });
});

describe("Phase 5a contract pins", () => {
  // ---------------------------------------------------------------------
  // Negative-value passthrough on mass/volume conversions
  // ---------------------------------------------------------------------
  // The current contract only validates Number.isFinite, not sign. Negative
  // mass/volume passes through as a negative number rather than being
  // rejected. Callers (e.g. derivation code that subtracts ingredients)
  // may depend on this. Pinned here so a future "reject negative" refactor
  // surfaces explicitly.
  describe("negative-value passthrough", () => {
    it("massToKg accepts negatives and preserves sign", () => {
      expect(massToKg(-2, "kg")).toBe(-2);
      expect(massToKg(-1000, "g")).toBe(-1);
      expect(massToKg(-1, "lb")).toBeCloseTo(-0.45359237, 6);
    });

    it("volumeToLiters accepts negatives and preserves sign", () => {
      expect(volumeToLiters(-1, "l")).toBe(-1);
      expect(volumeToLiters(-500, "ml")).toBe(-0.5);
      expect(volumeToLiters(-1, "gal")).toBeCloseTo(-3.785411784, 6);
    });
  });

  // ---------------------------------------------------------------------
  // Defensive vs non-defensive contract
  // ---------------------------------------------------------------------
  // massToKg / massToGrams / volumeToLiters are defensive: invalid inputs
  // return null. litersToUsGallons / kgToLb are NOT defensive: they
  // perform a single division and propagate whatever number comes in
  // (NaN -> NaN, Infinity -> Infinity, negatives -> negatives). Pinned
  // here so a "make everything defensive by default" refactor surfaces
  // explicitly rather than silently changing return shape.
  describe("non-defensive helpers (litersToUsGallons / kgToLb)", () => {
    it("litersToUsGallons returns NaN for NaN input (does not return null)", () => {
      expect(Number.isNaN(litersToUsGallons(NaN))).toBe(true);
    });

    it("litersToUsGallons returns Infinity for Infinity input (does not return null)", () => {
      expect(litersToUsGallons(Infinity)).toBe(Infinity);
    });

    it("kgToLb returns NaN for NaN input (does not return null)", () => {
      expect(Number.isNaN(kgToLb(NaN))).toBe(true);
    });

    it("kgToLb passes through zero", () => {
      expect(kgToLb(0)).toBe(0);
      expect(litersToUsGallons(0)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------
  // Strict-string unit matching
  // ---------------------------------------------------------------------
  // The guards use strict equality (===) on the unit string. They do NOT
  // lowercase, trim, or accept aliases. Pinned here so a future
  // "case-insensitive units" / "alias support" refactor surfaces
  // explicitly rather than silently changing what payloads we accept.
  describe("isMassUnitV1 / isVolumeUnitV1 strict-string matching", () => {
    it("rejects uppercase / mixed-case mass units", () => {
      for (const u of ["KG", "Kg", "LB", "G", "Oz"]) {
        expect(isMassUnitV1(u)).toBe(false);
      }
    });

    it("rejects whitespace-padded mass units", () => {
      for (const u of [" kg", "kg ", " kg "]) {
        expect(isMassUnitV1(u)).toBe(false);
      }
    });

    it("rejects uppercase / aliased volume units", () => {
      for (const u of ["L", "ML", "GAL", "gallon", "liter", "litre"]) {
        expect(isVolumeUnitV1(u)).toBe(false);
      }
    });
  });

  // ---------------------------------------------------------------------
  // massToKg / volumeToLiters: empty + non-string unit guards
  // ---------------------------------------------------------------------
  // Pinned because the early-return `return null` for unknown units is
  // the only place these helpers reject undefined / number / object
  // units. Without these tests, a refactor that adds `String(unit)`
  // coercion could silently change behavior for callers that pass
  // unexpected types.
  describe("non-string unit inputs", () => {
    it("massToKg returns null for undefined / number / object unit", () => {
      expect(massToKg(1, undefined)).toBeNull();
      expect(massToKg(1, 0)).toBeNull();
      expect(massToKg(1, {})).toBeNull();
    });

    it("volumeToLiters returns null for undefined / number / object unit", () => {
      expect(volumeToLiters(1, undefined)).toBeNull();
      expect(volumeToLiters(1, 0)).toBeNull();
      expect(volumeToLiters(1, {})).toBeNull();
    });
  });
});
