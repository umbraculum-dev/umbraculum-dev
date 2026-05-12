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
