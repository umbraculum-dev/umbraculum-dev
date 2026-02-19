import { describe, expect, it } from "vitest";
import { massToGrams, massToKg, roundTo, volumeToLiters } from "@brewery/core";

describe("@brewery/core units", () => {
  it("converts US customary volumes to liters", () => {
    expect(volumeToLiters(5, "gal")).toBeCloseTo(18.927_058_92, 10);
    expect(volumeToLiters(1, "qt")).toBeCloseTo(0.946_352_946, 10);
    expect(volumeToLiters(1, "pt")).toBeCloseTo(0.473_176_473, 10);
    expect(volumeToLiters(1, "fl_oz")).toBeCloseTo(0.029_573_529_562_5, 10);
  });

  it("converts US customary masses to kg/grams", () => {
    expect(massToKg(10, "lb")).toBeCloseTo(4.535_923_7, 10);
    expect(massToKg(1, "oz")).toBeCloseTo(0.028_349_523_125, 12);
    expect(massToGrams(2, "oz")).toBeCloseTo(56.699_046_25, 10);
  });

  it("roundTo is stable for display rounding", () => {
    expect(roundTo(5, 2)).toBe(5);
    expect(roundTo(4.999_999_999, 2)).toBe(5);
    expect(roundTo(0.300_000_000_000_000_04, 2)).toBe(0.3);
  });
});

