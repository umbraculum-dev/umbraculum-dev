import { describe, expect, it } from "vitest";
import { platoToSg, sgToPlato } from "./gravity.js";

describe("platoToSg", () => {
  // Boundary contract: pure water (0 plato / SG 1.0) is treated as "no
  // wort" and rejected, symmetric with sgToPlato(1.0) -> null. Pinned
  // here so this contract cannot drift unnoticed.
  it("returns null at the no-sugar boundary (0 plato)", () => {
    expect(platoToSg(0)).toBeNull();
  });

  it("returns reasonable SG for typical brewing range (10-15 plato)", () => {
    expect(platoToSg(10)).toBeCloseTo(1.0398, 3);
    expect(platoToSg(12)).toBeCloseTo(1.048, 3);
    expect(platoToSg(15)).toBeCloseTo(1.0612, 3);
  });

  it("rejects non-numeric inputs", () => {
    expect(platoToSg("12")).toBeNull();
    expect(platoToSg(null)).toBeNull();
    expect(platoToSg(undefined)).toBeNull();
    expect(platoToSg(NaN)).toBeNull();
  });

  it("rejects out-of-range plato", () => {
    expect(platoToSg(-1)).toBeNull();
    expect(platoToSg(101)).toBeNull();
  });

  it("round-trips approximately with sgToPlato in the typical range", () => {
    for (const startPlato of [5, 10, 12, 15, 18, 20]) {
      const sg = platoToSg(startPlato);
      expect(sg).not.toBeNull();
      const backPlato = sgToPlato(sg);
      expect(backPlato).not.toBeNull();
      expect(Math.abs(backPlato - startPlato)).toBeLessThan(0.2);
    }
  });
});

describe("sgToPlato", () => {
  it("returns positive plato for typical SG in 1.04-1.07", () => {
    expect(sgToPlato(1.048)).toBeCloseTo(11.91, 1);
    expect(sgToPlato(1.052)).toBeCloseTo(12.86, 1);
    expect(sgToPlato(1.07)).toBeCloseTo(17.06, 1);
  });

  it("returns null for non-positive SG", () => {
    expect(sgToPlato(1.0)).toBeNull();
    expect(sgToPlato(0.999)).toBeNull();
    expect(sgToPlato(0)).toBeNull();
    expect(sgToPlato(-0.5)).toBeNull();
  });

  it("rejects non-numeric inputs", () => {
    expect(sgToPlato("1.048")).toBeNull();
    expect(sgToPlato(null)).toBeNull();
    expect(sgToPlato(undefined)).toBeNull();
    expect(sgToPlato(NaN)).toBeNull();
    expect(sgToPlato(Infinity)).toBeNull();
  });
});
