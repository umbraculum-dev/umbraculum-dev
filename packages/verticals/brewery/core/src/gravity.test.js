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

// --------------------------------------------------------------------------
// Phase 5a contract pins
// --------------------------------------------------------------------------
// These tests pin behaviors that downstream code (gravityAnalysis, OG/FG
// derivation in the API) may depend on. Without explicit pins, a future
// "tighten validation" or "tighten range" refactor could silently shift
// what plato / SG values get accepted vs. nulled.
describe("platoToSg upper boundary (Phase 5a)", () => {
  // The current code accepts plato in [0, 100] (exclusive of 0 via the
  // boundary contract above, inclusive of 100). Pinned so a change to the
  // accepted range surfaces explicitly.
  it("accepts the upper boundary at 100 plato (extreme barley wine)", () => {
    const sg = platoToSg(100);
    expect(sg).not.toBeNull();
    expect(sg).toBeGreaterThan(1);
    expect(sg).toBeLessThan(2);
  });

  it("rejects values just above the upper boundary", () => {
    expect(platoToSg(100.001)).toBeNull();
  });

  it("accepts very small positive plato values (near no-sugar)", () => {
    // 0.5 plato ≈ very dilute wort, still a valid SG slightly above 1.
    const sg = platoToSg(0.5);
    expect(sg).not.toBeNull();
    expect(sg).toBeGreaterThan(1);
    expect(sg).toBeLessThan(1.005);
  });
});

describe("sgToPlato upper-bound behavior (Phase 5a)", () => {
  // sgToPlato has NO upper-bound rejection: it only rejects sg <= 1 (and
  // non-finite). High SG values produce large positive plato (returned
  // when the polynomial result is >= 0). Pinned so a future "reject sg >
  // 1.2" refactor surfaces explicitly rather than silently changing what
  // analyzers/imports return for impossible-but-malformed payloads.
  it("does not reject very-high SG (returns a large positive plato)", () => {
    const p = sgToPlato(1.2);
    expect(p).not.toBeNull();
    expect(p).toBeGreaterThan(40);
  });

  it("returns null only when the polynomial result is negative", () => {
    // SG just above 1.0 produces a small positive plato, not null.
    const p = sgToPlato(1.001);
    expect(p).not.toBeNull();
    expect(p).toBeGreaterThanOrEqual(0);
  });
});
