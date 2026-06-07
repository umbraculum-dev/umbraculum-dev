import { describe, expect, it } from "vitest";
import {
  alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult,
  alkalinityPpmCaCO3ToBicarbonatePpm,
  bicarbonatePpmToAlkalinityPpmCaCO3,
  combineAfterSaltsAndAcid,
  deriveBicarbonatePpmFromAlkalinityPpmCaCO3,
} from "./overall.js";
import type { IonProfilePpm, SaltAdditionsResult } from "./saltAdditions.js";

// L1 unit tests for the orchestration / unit-conversion helpers in
// overall.ts (Phase 5b-5). These functions are tiny but they sit on
// the hot path between the salt-additions step, the acid step, and
// the final ion profile that the recipe-water route returns to the UI.

describe("bicarbonatePpmToAlkalinityPpmCaCO3 (Phase 5b-5)", () => {
  // Pinned: the unit-conversion factor 50/61 (equivalent weight of CaCO3
  // / HCO3). Standard brewing chemistry constant.
  it("conversion factor pinned at 50/61 (≈ 0.8197)", () => {
    expect(bicarbonatePpmToAlkalinityPpmCaCO3(61)).toBeCloseTo(50, 6);
    expect(bicarbonatePpmToAlkalinityPpmCaCO3(122)).toBeCloseTo(100, 6);
    expect(bicarbonatePpmToAlkalinityPpmCaCO3(100)).toBeCloseTo(100 * (50 / 61), 6);
  });

  it("returns 0 for 0 input", () => {
    expect(bicarbonatePpmToAlkalinityPpmCaCO3(0)).toBe(0);
  });

  // Pinned: non-defensive contract on negative inputs (just passes
  // through the linear conversion). Brewing scenarios shouldn't have
  // negative bicarbonate but the function doesn't add a clamp here —
  // that's `deriveBicarbonatePpmFromAlkalinityPpmCaCO3`'s job in the
  // other direction.
  it("negative bicarbonate passes through to negative alkalinity (no clamp)", () => {
    expect(bicarbonatePpmToAlkalinityPpmCaCO3(-61)).toBeCloseTo(-50, 6);
  });

  it("throws on non-finite input", () => {
    expect(() => bicarbonatePpmToAlkalinityPpmCaCO3(NaN)).toThrow(/Invalid bicarbPpm/);
    expect(() => bicarbonatePpmToAlkalinityPpmCaCO3(Infinity)).toThrow(/Invalid bicarbPpm/);
  });
});

describe("alkalinityPpmCaCO3ToBicarbonatePpm (Phase 5b-5)", () => {
  // Pinned: the reverse conversion factor 61/50 (≈ 1.22).
  it("conversion factor pinned at 61/50 (≈ 1.22)", () => {
    expect(alkalinityPpmCaCO3ToBicarbonatePpm(50)).toBeCloseTo(61, 6);
    expect(alkalinityPpmCaCO3ToBicarbonatePpm(100)).toBeCloseTo(122, 6);
    expect(alkalinityPpmCaCO3ToBicarbonatePpm(100)).toBeCloseTo(100 * (61 / 50), 6);
  });

  // Pinned: round-trip symmetry — bicarb→alk→bicarb returns the original
  // value (modulo floating-point noise). Validates the two functions are
  // exact inverses.
  it("round-trip alk→bicarb→alk returns the original value", () => {
    for (const x of [0, 1, 50, 100, 250.5]) {
      const round = bicarbonatePpmToAlkalinityPpmCaCO3(
        alkalinityPpmCaCO3ToBicarbonatePpm(x),
      );
      expect(round).toBeCloseTo(x, 6);
    }
  });

  it("throws on non-finite input", () => {
    expect(() => alkalinityPpmCaCO3ToBicarbonatePpm(NaN)).toThrow(/Invalid alkalinityPpmCaCO3/);
  });
});

describe("deriveBicarbonatePpmFromAlkalinityPpmCaCO3 (Phase 5b-5)", () => {
  // Pinned: same multiplicative formula as
  // alkalinityPpmCaCO3ToBicarbonatePpm, BUT with a clamp to >= 0. Brewing
  // contract: "reported bicarbonate concentration cannot be negative".
  // This matters because the acid step can drive finalAlkalinity below 0
  // mathematically (residual = effAlk - acidReq*50), but the UI must
  // never display a negative ion concentration.
  it("positive alkalinity → same as alkalinityPpmCaCO3ToBicarbonatePpm", () => {
    for (const x of [0, 50, 100, 250]) {
      expect(deriveBicarbonatePpmFromAlkalinityPpmCaCO3(x)).toBeCloseTo(
        alkalinityPpmCaCO3ToBicarbonatePpm(x),
        6,
      );
    }
  });

  it("negative alkalinity → clamped to 0 (brewing reporting contract)", () => {
    expect(deriveBicarbonatePpmFromAlkalinityPpmCaCO3(-10)).toBe(0);
    expect(deriveBicarbonatePpmFromAlkalinityPpmCaCO3(-100)).toBe(0);
  });

  it("zero alkalinity → 0", () => {
    expect(deriveBicarbonatePpmFromAlkalinityPpmCaCO3(0)).toBe(0);
  });

  it("throws on non-finite input (via inner alkalinityPpmCaCO3ToBicarbonatePpm)", () => {
    expect(() => deriveBicarbonatePpmFromAlkalinityPpmCaCO3(NaN)).toThrow(
      /Invalid alkalinityPpmCaCO3/,
    );
  });
});

describe("combineAfterSaltsAndAcid (Phase 5b-5)", () => {
  const afterSalts: IonProfilePpm = {
    calcium: 80,
    magnesium: 20,
    sodium: 15,
    sulfate: 100,
    chloride: 60,
    bicarbonate: 122, // ~100 ppm CaCO3 alkalinity, but combine() IGNORES this
  };

  // Pinned: this function composes the post-acid ion profile by:
  //   - keeping Ca / Mg / Na unchanged from afterSalts;
  //   - ADDING acid-step sulfate + chloride contributions;
  //   - OVERWRITING bicarbonate using the acid step's finalAlkalinity
  //     (NOT propagating afterSalts.bicarbonate).
  // The bicarbonate overwrite is the most subtle invariant — it pins
  // that the acid step is the final source of truth for alkalinity.

  it("Ca + Mg + Na come through unchanged from afterSalts", () => {
    const r = combineAfterSaltsAndAcid({
      afterSalts,
      acidResult: { sulfateAddedPpm: 50, chlorideAddedPpm: 10, finalAlkalinityPpmCaCO3: 0 },
    });
    expect(r.calcium).toBe(80);
    expect(r.magnesium).toBe(20);
    expect(r.sodium).toBe(15);
  });

  it("sulfate + chloride get the acid-step deltas ADDED", () => {
    const r = combineAfterSaltsAndAcid({
      afterSalts,
      acidResult: { sulfateAddedPpm: 50, chlorideAddedPpm: 10, finalAlkalinityPpmCaCO3: 0 },
    });
    expect(r.sulfate).toBe(100 + 50);
    expect(r.chloride).toBe(60 + 10);
  });

  // Cardinal pinning: bicarbonate is computed from acidResult, NOT
  // from afterSalts. This catches a refactor that "preserves" the
  // afterSalts bicarbonate (which would be wrong because the acid step
  // already accounted for it).
  it("bicarbonate is overwritten by acidResult.finalAlkalinity (NOT afterSalts.bicarbonate)", () => {
    const r = combineAfterSaltsAndAcid({
      afterSalts: { ...afterSalts, bicarbonate: 999 }, // wildly different
      acidResult: { sulfateAddedPpm: 0, chlorideAddedPpm: 0, finalAlkalinityPpmCaCO3: 100 },
    });
    // bicarbonate = max(0, 100 * 61/50) = 122.
    expect(r.bicarbonate).toBeCloseTo(122, 6);
  });

  // Pinned: when acidResult.finalAlkalinity goes negative (residual after
  // over-acidification), bicarbonate clamps to 0 via
  // deriveBicarbonatePpmFromAlkalinityPpmCaCO3.
  it("negative finalAlkalinity → bicarbonate clamped to 0", () => {
    const r = combineAfterSaltsAndAcid({
      afterSalts,
      acidResult: { sulfateAddedPpm: 0, chlorideAddedPpm: 0, finalAlkalinityPpmCaCO3: -10 },
    });
    expect(r.bicarbonate).toBe(0);
  });

  // Pinned: validation propagates from assertFinite — all 3 acidResult
  // fields are checked.
  it("throws on non-finite acidResult.sulfateAddedPpm", () => {
    expect(() =>
      combineAfterSaltsAndAcid({
        afterSalts,
        acidResult: { sulfateAddedPpm: NaN, chlorideAddedPpm: 0, finalAlkalinityPpmCaCO3: 0 },
      }),
    ).toThrow(/Invalid acidResult.sulfateAddedPpm/);
  });

  it("throws on non-finite acidResult.chlorideAddedPpm", () => {
    expect(() =>
      combineAfterSaltsAndAcid({
        afterSalts,
        acidResult: { sulfateAddedPpm: 0, chlorideAddedPpm: NaN, finalAlkalinityPpmCaCO3: 0 },
      }),
    ).toThrow(/Invalid acidResult.chlorideAddedPpm/);
  });

  it("throws on non-finite acidResult.finalAlkalinityPpmCaCO3", () => {
    expect(() =>
      combineAfterSaltsAndAcid({
        afterSalts,
        acidResult: { sulfateAddedPpm: 0, chlorideAddedPpm: 0, finalAlkalinityPpmCaCO3: NaN },
      }),
    ).toThrow(/Invalid acidResult.finalAlkalinityPpmCaCO3/);
  });
});

describe("alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult (Phase 5b-5)", () => {
  // Pinned: the function reads `salts.resultingProfile.bicarbonate`
  // and converts to alkalinity via the 50/61 factor. This is the
  // bridge between the saltAdditions step and the acid step.
  it("converts saltAdditions.resultingProfile.bicarbonate → alkalinity via 50/61 factor", () => {
    const fakeSalts: SaltAdditionsResult = {
      baseProfile: {
        calcium: 80,
        magnesium: 20,
        sodium: 15,
        sulfate: 100,
        chloride: 60,
        bicarbonate: 122,
      },
      resultingProfile: {
        calcium: 80,
        magnesium: 20,
        sodium: 15,
        sulfate: 100,
        chloride: 60,
        bicarbonate: 122,
      },
      deltasPpm: { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
      breakdown: [],
    };
    expect(alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(fakeSalts)).toBeCloseTo(100, 6);
  });

  it("zero bicarbonate → zero alkalinity", () => {
    const fakeSalts: SaltAdditionsResult = {
      baseProfile: {
        calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0,
      },
      resultingProfile: {
        calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0,
      },
      deltasPpm: { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
      breakdown: [],
    };
    expect(alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(fakeSalts)).toBe(0);
  });
});
