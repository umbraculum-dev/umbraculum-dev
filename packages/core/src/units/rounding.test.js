import { describe, expect, it } from "vitest";
import { roundTo } from "./rounding.js";

describe("roundTo", () => {
  it("rounds to the requested decimal places", () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(1.2345, 3)).toBe(1.235);
    expect(roundTo(12.5, 0)).toBe(13);
  });

  it("defaults to 0 decimals when decimals is missing or invalid", () => {
    expect(roundTo(12.6)).toBe(13);
    expect(roundTo(12.6, NaN)).toBe(13);
    expect(roundTo(12.6, "two")).toBe(13);
  });

  it("clamps negative decimals to 0", () => {
    expect(roundTo(12.6, -3)).toBe(13);
  });

  it("returns NaN for non-finite values", () => {
    expect(Number.isNaN(roundTo(NaN, 2))).toBe(true);
    expect(Number.isNaN(roundTo(Infinity, 2))).toBe(true);
    expect(Number.isNaN(roundTo("1.5", 2))).toBe(true);
  });

  // Pinned (Phase 5a): JavaScript's Math.round breaks ties toward +Infinity
  // (NOT half-away-from-zero, NOT banker's rounding). After the EPSILON
  // nudge (which shifts toward +Inf by ~1 ULP), this means negative .5
  // values round toward zero. This is the current contract; callers that
  // need symmetric rounding around zero must do it themselves.
  it("breaks ties toward +Infinity for negative half-values", () => {
    expect(roundTo(-1.5, 0)).toBe(-1);
    expect(roundTo(-2.5, 0)).toBe(-2);
  });

  it("handles negative inputs at higher decimal places", () => {
    expect(roundTo(-1.2345, 3)).toBeCloseTo(-1.234, 10);
  });

  it("returns zero for zero input regardless of decimals", () => {
    expect(roundTo(0, 0)).toBe(0);
    expect(roundTo(0, 5)).toBe(0);
  });
});
