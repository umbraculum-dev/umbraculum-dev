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
});
