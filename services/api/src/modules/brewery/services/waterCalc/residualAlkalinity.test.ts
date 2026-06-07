import { describe, expect, it } from "vitest";
import {
  alkalinityReductionFromCaMgPpmCaCO3,
  effectiveAlkalinityPpmCaCO3FromCaMg,
} from "./residualAlkalinity.js";

// L1 unit tests for the residual-alkalinity helpers (Phase 5b-1).
// These functions are part of the Palmer/Kolbach-style mash-pH chain:
//   alkalinity_asCaCO3 - (0.713 * Ca_mgL) - (0.588 * Mg_mgL) -> effective alkalinity
// Pinned so a future "tighten clamp" or "swap coefficients" refactor surfaces
// explicitly rather than silently shifting mash-pH predictions.

describe("alkalinityReductionFromCaMgPpmCaCO3 (Phase 5b-1)", () => {
  it("returns zero when both ions are zero", () => {
    expect(alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: 0, magnesiumPpm: 0 })).toBe(0);
  });

  // Pinned: Kolbach coefficient for Ca is 0.713 (mg/L as CaCO3 per mg/L Ca).
  // A future PR that swaps to a different normalization (e.g. eq/L instead of
  // ppm-as-CaCO3) would silently shift predictions; the literature value is
  // the only thing pinning the coefficient.
  it("applies the 0.713 Kolbach coefficient to calcium", () => {
    const r = alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: 100, magnesiumPpm: 0 });
    expect(r).toBeCloseTo(71.3, 6);
  });

  // Pinned: Kolbach coefficient for Mg is 0.588.
  it("applies the 0.588 Kolbach coefficient to magnesium", () => {
    const r = alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: 0, magnesiumPpm: 100 });
    expect(r).toBeCloseTo(58.8, 6);
  });

  it("sums the Ca and Mg contributions", () => {
    const r = alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: 80, magnesiumPpm: 20 });
    expect(r).toBeCloseTo(0.713 * 80 + 0.588 * 20, 6);
    expect(r).toBeCloseTo(68.8, 6);
  });

  it("throws on non-finite calciumPpm", () => {
    expect(() => alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: NaN, magnesiumPpm: 0 })).toThrow(
      /Invalid calciumPpm/,
    );
    expect(() => alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: Infinity, magnesiumPpm: 0 })).toThrow(
      /Invalid calciumPpm/,
    );
  });

  it("throws on non-finite magnesiumPpm", () => {
    expect(() => alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: 0, magnesiumPpm: NaN })).toThrow(
      /Invalid magnesiumPpm/,
    );
  });

  // Pinned: negative ion concentrations are NOT rejected — the function only
  // checks Number.isFinite. Pass-through behavior makes the helper composable
  // with derivation code that may produce negative intermediate values.
  it("accepts negative ion values (passes through without clamping)", () => {
    const r = alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: -10, magnesiumPpm: 0 });
    expect(r).toBeCloseTo(-7.13, 6);
  });
});

describe("effectiveAlkalinityPpmCaCO3FromCaMg (Phase 5b-1)", () => {
  it("returns alkalinity unchanged when Ca and Mg are both zero", () => {
    const r = effectiveAlkalinityPpmCaCO3FromCaMg({
      alkalinityPpmCaCO3: 150,
      calciumPpm: 0,
      magnesiumPpm: 0,
    });
    expect(r.effectiveAlkalinityPpmCaCO3).toBe(150);
    expect(r.alkalinityReductionFromCaMgPpmCaCO3).toBe(0);
  });

  it("subtracts the Ca/Mg reduction from alkalinity (happy path)", () => {
    const r = effectiveAlkalinityPpmCaCO3FromCaMg({
      alkalinityPpmCaCO3: 200,
      calciumPpm: 100,
      magnesiumPpm: 50,
    });
    const expectedReduction = 0.713 * 100 + 0.588 * 50;
    expect(r.alkalinityReductionFromCaMgPpmCaCO3).toBeCloseTo(expectedReduction, 6);
    expect(r.effectiveAlkalinityPpmCaCO3).toBeCloseTo(200 - expectedReduction, 6);
  });

  // Pinned: the clamp to >= 0 is the documented stability guard. Without this
  // test, a future "let negatives represent acidic effective alkalinity" PR
  // would silently change the contract.
  it("clamps effective alkalinity to zero when Ca/Mg reduction exceeds alkalinity", () => {
    const r = effectiveAlkalinityPpmCaCO3FromCaMg({
      alkalinityPpmCaCO3: 30,
      calciumPpm: 200,
      magnesiumPpm: 0,
    });
    // reduction = 142.6, clamp keeps effective at 0 (not -112.6).
    expect(r.effectiveAlkalinityPpmCaCO3).toBe(0);
    expect(r.alkalinityReductionFromCaMgPpmCaCO3).toBeCloseTo(142.6, 6);
  });

  // Pinned: the documented contract is that omitted Ca/Mg default to 0
  // (NOT to null/undefined treatment that errors out). Pin both the
  // omitted-key flavor and the explicit-undefined flavor.
  it("defaults missing calciumPpm to 0", () => {
    const r = effectiveAlkalinityPpmCaCO3FromCaMg({
      alkalinityPpmCaCO3: 100,
      magnesiumPpm: 50,
    });
    expect(r.alkalinityReductionFromCaMgPpmCaCO3).toBeCloseTo(0.588 * 50, 6);
  });

  it("defaults missing magnesiumPpm to 0", () => {
    const r = effectiveAlkalinityPpmCaCO3FromCaMg({
      alkalinityPpmCaCO3: 100,
      calciumPpm: 50,
    });
    expect(r.alkalinityReductionFromCaMgPpmCaCO3).toBeCloseTo(0.713 * 50, 6);
  });

  it("defaults both missing Ca and Mg to 0", () => {
    const r = effectiveAlkalinityPpmCaCO3FromCaMg({ alkalinityPpmCaCO3: 100 });
    expect(r.alkalinityReductionFromCaMgPpmCaCO3).toBe(0);
    expect(r.effectiveAlkalinityPpmCaCO3).toBe(100);
  });

  it("throws on non-finite alkalinityPpmCaCO3", () => {
    expect(() => effectiveAlkalinityPpmCaCO3FromCaMg({ alkalinityPpmCaCO3: NaN })).toThrow(
      /Invalid alkalinityPpmCaCO3/,
    );
    expect(() =>
      effectiveAlkalinityPpmCaCO3FromCaMg({ alkalinityPpmCaCO3: Infinity }),
    ).toThrow(/Invalid alkalinityPpmCaCO3/);
  });

  it("throws on non-finite calciumPpm when explicitly provided", () => {
    expect(() =>
      effectiveAlkalinityPpmCaCO3FromCaMg({ alkalinityPpmCaCO3: 100, calciumPpm: NaN }),
    ).toThrow(/Invalid calciumPpm/);
  });

  it("throws on non-finite magnesiumPpm when explicitly provided", () => {
    expect(() =>
      effectiveAlkalinityPpmCaCO3FromCaMg({ alkalinityPpmCaCO3: 100, magnesiumPpm: NaN }),
    ).toThrow(/Invalid magnesiumPpm/);
  });

  // Pinned: the helper's reduction value matches the standalone helper for
  // the same Ca/Mg inputs. Symmetry between the two exports is part of the
  // contract — a future refactor that diverges them should surface here.
  it("returned reduction value matches the standalone alkalinityReduction helper", () => {
    const r = effectiveAlkalinityPpmCaCO3FromCaMg({
      alkalinityPpmCaCO3: 300,
      calciumPpm: 75,
      magnesiumPpm: 25,
    });
    const standalone = alkalinityReductionFromCaMgPpmCaCO3({ calciumPpm: 75, magnesiumPpm: 25 });
    expect(r.alkalinityReductionFromCaMgPpmCaCO3).toBe(standalone);
  });
});
