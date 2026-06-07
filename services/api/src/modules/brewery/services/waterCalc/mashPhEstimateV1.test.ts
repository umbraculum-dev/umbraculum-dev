import { describe, expect, it } from "vitest";
import { mashPhEstimateV1, type MashPhEstimateV1Input } from "./mashPhEstimateV1.js";

// L1 unit tests for the canonical mash-pH estimator (Phase 5b-2).
//
// Pinned model constants (these are the empirical-fit constants that the
// downstream UI calibration and L4 contract snapshots both depend on —
// silent drift here would shift every mash pH prediction):
//   BASELINE_DI_MASH_PH      = 5.76    (distilled-water mash pH at room temp)
//   PH_SLOPE                 = -0.17   (pH units per mEq/L of net acidity)
//   BASELINE_RATIO_QT_PER_LB = 1.5     (BrunWater reference mash thickness)
//   L_PER_KG_TO_QT_PER_LB    = 0.4792  (unit conversion)
//
// The test file uses the input shape that production routes actually
// construct (volumeLiters + alkalinityPpmCaCO3 + optional Ca/Mg + grist[]
// + optional ratio override + optional acid added).

// Convenience factory so tests don't repeat the full Input shape.
function input(overrides: Partial<MashPhEstimateV1Input> = {}): MashPhEstimateV1Input {
  return {
    volumeLiters: 25,
    alkalinityPpmCaCO3: 0,
    grist: [],
    ...overrides,
  };
}

describe("mashPhEstimateV1 — baseline + boundary outputs (Phase 5b-2)", () => {
  // Pinned: empty grist + zero alkalinity + no acid → pH falls back to the
  // baseline DI mash pH constant (5.76). Catches a refactor that changes
  // the empty-grist fallback (e.g. to null or to 5.6 to align with
  // DEFAULT_MASH_TARGET_PH from packages/core/water.js).
  it("empty grist + zero alkalinity → estimated pH = baseline DI mash pH (5.76)", () => {
    const r = mashPhEstimateV1(input());
    expect(r.estimatedMashPhRoomTemp).toBeCloseTo(5.76, 6);
    expect(r.clamped).toBe("none");
    expect(r.debug.gristTotalKg).toBe(0);
    expect(r.debug.diMashPhWeightedAvg).toBeCloseTo(5.76, 6);
    expect(r.debug.waterToGristRatioQtPerLb).toBeCloseTo(1.5, 6);
  });

  // Pinned: empty grist + non-zero alkalinity still uses the baseline
  // qt/lb ratio (alkalinityRatioFactor = 1.0), so the alkalinity ⇒ pH
  // shift is direct.
  it("empty grist + alkalinity=50 → pH rises by alk shift only (no grist acidity)", () => {
    const r = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 50 }));
    // totalAlkalinity_mEq = (50/50)*25 = 25; alkRatioFactor = 1 (empty grist
    // falls back to baseline ratio); netAcidity = -25/25 = -1.0;
    // estimated = 5.76 + (-0.17)*(-1.0) = 5.93.
    expect(r.estimatedMashPhRoomTemp).toBeCloseTo(5.93, 6);
    expect(r.debug.alkalinityRatioFactor).toBeCloseTo(1, 6);
  });

  // Pinned: single base-malt row with explicit mashDiPh, zero alkalinity,
  // zero TA → estimated pH equals the row's diPh (no shifts apply).
  // Catches a refactor that introduces a bias term.
  it("single base-malt row, zero alk + zero TA → pH = the row's mashDiPh", () => {
    const r = mashPhEstimateV1(input({
      grist: [{ amountKg: 5, mashDiPh: 5.8, mashTaToPh57_mEqPerKg: 0 }],
    }));
    expect(r.estimatedMashPhRoomTemp).toBeCloseTo(5.8, 6);
    expect(r.debug.gristTotalKg).toBe(5);
    expect(r.debug.diMashPhWeightedAvg).toBeCloseTo(5.8, 6);
  });

  // Pinned: single row with mild acidity (TA=5 mEq/kg) shifts pH down.
  // Hand-computed: ratio = 25/5 * 0.4792 = 2.396; alkRatioFactor = 1.597;
  // totalAcidity = 5*5 = 25 mEq; totalAlk = 0;
  // netAcidity = 25/25 = 1.0 mEq/L; estimated = 5.8 + (-0.17)*1.0 = 5.63.
  it("single row with TA=5 mEq/kg → pH = diPh + slope*netAcidity = 5.63", () => {
    const r = mashPhEstimateV1(input({
      grist: [{ amountKg: 5, mashDiPh: 5.8, mashTaToPh57_mEqPerKg: 5 }],
    }));
    expect(r.estimatedMashPhRoomTemp).toBeCloseTo(5.63, 2);
    expect(r.debug.totalAcidity_mEq).toBeCloseTo(25, 6);
    expect(r.debug.netAcidityBeforeAcid_mEqPerL).toBeCloseTo(1, 6);
  });

  // Pinned: weighted average of mashDiPh across heterogeneous rows.
  // 5kg @ 5.7 + 5kg @ 5.4 → weighted avg = 5.55.
  it("weighted DI pH average across rows (5kg@5.7 + 5kg@5.4 → 5.55)", () => {
    const r = mashPhEstimateV1(input({
      grist: [
        { amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 0 },
        { amountKg: 5, mashDiPh: 5.4, mashTaToPh57_mEqPerKg: 0 },
      ],
    }));
    expect(r.debug.diMashPhWeightedAvg).toBeCloseTo(5.55, 6);
    expect(r.estimatedMashPhRoomTemp).toBeCloseTo(5.55, 6);
  });
});

describe("mashPhEstimateV1 — model constants (Phase 5b-2)", () => {
  // Pinned all 4 empirical model constants in one place. A future PR that
  // tunes any of these has to update this test, which forces an explicit
  // review of the calibration impact.
  it("emits the 4 model constants in debug.constants (unchanged)", () => {
    const r = mashPhEstimateV1(input());
    expect(r.debug.constants).toEqual({
      baselineDiMashPh: 5.76,
      slope: -0.17,
      baselineRatioQtPerLb: 1.5,
      lPerKg_to_qtPerLb: 0.4792,
    });
  });
});

describe("mashPhEstimateV1 — monotonic sensitivities (Phase 5b-2)", () => {
  // Pinned: more alkalinity → higher predicted pH. This is the cardinal
  // chemistry property of the model — a refactor that flips the sign
  // (e.g. swaps slope to +0.17 or swaps totalAcidity/totalAlkalinity in
  // the netAcidity expression) fails this test immediately.
  it("increasing alkalinity → higher predicted pH (cardinal direction)", () => {
    const grist = [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 }];
    const low = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 20, grist }));
    const high = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 150, grist }));
    expect(high.estimatedMashPhRoomTemp).toBeGreaterThan(low.estimatedMashPhRoomTemp);
  });

  // Pinned: Ca/Mg additions reduce effective alkalinity (per Kolbach) →
  // lower predicted pH. Combined with the test above, this pins the full
  // chain alkalinity → effAlk → pH.
  it("increasing Ca reduces effective alkalinity → lower predicted pH", () => {
    const grist = [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 }];
    const noCa = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 150, grist }));
    const withCa = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 150, calciumPpm: 100, grist }));
    expect(withCa.debug.effectiveAlkalinityPpmCaCO3).toBeLessThan(noCa.debug.effectiveAlkalinityPpmCaCO3);
    expect(withCa.estimatedMashPhRoomTemp).toBeLessThan(noCa.estimatedMashPhRoomTemp);
  });

  it("increasing Mg also reduces effective alkalinity → lower predicted pH", () => {
    const grist = [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 }];
    const noMg = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 150, grist }));
    const withMg = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 150, magnesiumPpm: 80, grist }));
    expect(withMg.estimatedMashPhRoomTemp).toBeLessThan(noMg.estimatedMashPhRoomTemp);
  });

  // Pinned: higher TA on any grist row → more acidity → lower predicted
  // pH. Mirrors how acidulated malt / crystal / roasted contributions
  // work in the production model.
  it("increasing acidulated-malt TA → lower predicted pH", () => {
    const lowTa = mashPhEstimateV1(input({
      grist: [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 }],
    }));
    const highTa = mashPhEstimateV1(input({
      grist: [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 50 }],
    }));
    expect(highTa.estimatedMashPhRoomTemp).toBeLessThan(lowTa.estimatedMashPhRoomTemp);
  });

  it("increasing acidAdded_mEqPerL → lower predicted pH", () => {
    const grist = [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 0 }];
    const noAcid = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 80, grist }));
    const withAcid = mashPhEstimateV1(input({ alkalinityPpmCaCO3: 80, grist, acidAdded_mEqPerL: 3 }));
    expect(withAcid.estimatedMashPhRoomTemp).toBeLessThan(noAcid.estimatedMashPhRoomTemp);
    expect(withAcid.debug.acidAdded_mEqPerL).toBe(3);
  });

  // Pinned: thicker mash (more grist per liter) amplifies the impact of
  // alkalinity. With the same alkalinity, a thicker mash → larger
  // alkalinityRatioFactor → larger pH shift. (BrunWater rationale: in a
  // thicker mash, the alkaline water represents a larger fraction of the
  // protonatable surface.)
  it("thicker mash (higher qt/lb) amplifies alkalinity's pH impact", () => {
    const grist = [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 0 }];
    // Thicker mash: smaller volume per kg grist.
    const thick = mashPhEstimateV1(input({ volumeLiters: 20, alkalinityPpmCaCO3: 100, grist }));
    const thin = mashPhEstimateV1(input({ volumeLiters: 50, alkalinityPpmCaCO3: 100, grist }));
    expect(thick.debug.alkalinityRatioFactor).toBeLessThan(thin.debug.alkalinityRatioFactor);
    expect(thin.estimatedMashPhRoomTemp).toBeGreaterThan(thick.estimatedMashPhRoomTemp);
  });
});

describe("mashPhEstimateV1 — overrides + missing row counts (Phase 5b-2)", () => {
  // Pinned: when waterToGristRatioQtPerLbOverride is provided, the
  // computed-from-volume ratio is ignored. Catches a refactor that
  // accidentally treats the override as additive or as a fallback only.
  it("waterToGristRatioQtPerLbOverride takes precedence over the volume-derived ratio", () => {
    const grist = [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 0 }];
    const r = mashPhEstimateV1(input({
      volumeLiters: 50,
      grist,
      waterToGristRatioQtPerLbOverride: 1.0,
    }));
    expect(r.debug.waterToGristRatioQtPerLb).toBe(1.0);
  });

  // Pinned: when a row's mashDiPh is null/undefined, it counts as missing
  // and the row uses BASELINE_DI_MASH_PH (5.76) for the weighted avg.
  // The route surfaces missingDiPhRowCount to the UI as a data-quality
  // hint, so the count itself is part of the wire format.
  it("rows with missing mashDiPh fall back to baseline 5.76 + increment missingDiPhRowCount", () => {
    const r = mashPhEstimateV1(input({
      grist: [
        { amountKg: 5, mashTaToPh57_mEqPerKg: 0 },              // mashDiPh undefined
        { amountKg: 5, mashDiPh: null, mashTaToPh57_mEqPerKg: 0 }, // explicit null
        { amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 0 },  // explicit
      ],
    }));
    expect(r.debug.missingDiPhRowCount).toBe(2);
    // Weighted avg = (5*5.76 + 5*5.76 + 5*5.7) / 15 = 5.74.
    expect(r.debug.diMashPhWeightedAvg).toBeCloseTo(5.74, 2);
  });

  it("rows with missing mashTaToPh57_mEqPerKg → treated as 0 + increment missingTaRowCount", () => {
    const r = mashPhEstimateV1(input({
      grist: [
        { amountKg: 5, mashDiPh: 5.7 },                      // ta undefined
        { amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: null },
        { amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 },
      ],
    }));
    expect(r.debug.missingTaRowCount).toBe(2);
    expect(r.debug.totalAcidity_mEq).toBeCloseTo(5 * 5, 6); // only the third row contributes
  });

  // Pinned: rows with amountKg <= 0 are silently skipped (no throw, no
  // perRow entry, no contribution to totals). Catches a refactor that
  // changes this to a throw or that erroneously counts them.
  it("rows with amountKg <= 0 are silently skipped (no perRow entry, no totals contribution)", () => {
    const r = mashPhEstimateV1(input({
      grist: [
        { amountKg: 0, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 },
        { amountKg: -1, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 5 },
        { amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 0 },
      ],
    }));
    expect(r.debug.perRow).toHaveLength(1);
    expect(r.debug.gristTotalKg).toBe(5);
    expect(r.debug.totalAcidity_mEq).toBe(0);
  });

  it("perRow debug entry shape: amountKg + mashDiPhUsed + mashTaToPh57_mEqPerKgUsed + acidity_mEq", () => {
    const r = mashPhEstimateV1(input({
      grist: [{ amountKg: 5, mashDiPh: 5.8, mashTaToPh57_mEqPerKg: 10 }],
    }));
    expect(r.debug.perRow).toEqual([
      { amountKg: 5, mashDiPhUsed: 5.8, mashTaToPh57_mEqPerKgUsed: 10, acidity_mEq: 50 },
    ]);
  });
});

describe("mashPhEstimateV1 — invariants (Phase 5b-2)", () => {
  // Pinned: scaling volume + grist proportionally (same mash thickness)
  // produces the same estimated pH. Catches a refactor that confuses
  // per-L vs per-kg vs absolute totals in the netAcidity expression.
  it("scaling volume + grist proportionally keeps the estimated pH constant", () => {
    const base = mashPhEstimateV1(input({
      volumeLiters: 25,
      alkalinityPpmCaCO3: 80,
      grist: [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 8 }],
    }));
    const scaled = mashPhEstimateV1(input({
      volumeLiters: 50,
      alkalinityPpmCaCO3: 80,
      grist: [{ amountKg: 10, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: 8 }],
    }));
    expect(scaled.estimatedMashPhRoomTemp).toBeCloseTo(base.estimatedMashPhRoomTemp, 6);
    expect(scaled.debug.waterToGristRatioQtPerLb).toBeCloseTo(base.debug.waterToGristRatioQtPerLb, 6);
  });

  // Pinned: the debug.effectiveAlkalinityPpmCaCO3 always equals
  // input.alkalinityPpmCaCO3 - debug.alkalinityReductionFromCaMgPpmCaCO3
  // (clamped to >= 0). Sanity check on the residualAlkalinity wiring.
  it("debug.effectiveAlkalinity = alkalinity - reduction (clamped to >= 0)", () => {
    const r = mashPhEstimateV1(input({
      alkalinityPpmCaCO3: 200,
      calciumPpm: 100,
      magnesiumPpm: 50,
    }));
    const expectedEffAlk = Math.max(
      0,
      r.debug.alkalinityPpmCaCO3 - r.debug.alkalinityReductionFromCaMgPpmCaCO3,
    );
    expect(r.debug.effectiveAlkalinityPpmCaCO3).toBeCloseTo(expectedEffAlk, 6);
  });

  // Pinned: massive acid load drives estimated pH below 0; the function
  // clamps to 0.1 and sets clamped: "low". Catches a refactor that
  // changes the clamp value (e.g. to 0) or that drops the flag.
  it("massive acid load → clamped to 0.1 with clamped=\"low\"", () => {
    const r = mashPhEstimateV1(input({ acidAdded_mEqPerL: 100 }));
    expect(r.estimatedMashPhRoomTemp).toBe(0.1);
    expect(r.clamped).toBe("low");
  });
});

describe("mashPhEstimateV1 — validation errors (Phase 5b-2)", () => {
  it("throws on non-finite volumeLiters", () => {
    expect(() => mashPhEstimateV1(input({ volumeLiters: NaN }))).toThrow(/Invalid volumeLiters/);
    expect(() => mashPhEstimateV1(input({ volumeLiters: Infinity }))).toThrow(/Invalid volumeLiters/);
  });

  it("throws on volumeLiters <= 0", () => {
    expect(() => mashPhEstimateV1(input({ volumeLiters: 0 }))).toThrow(/volumeLiters must be > 0/);
    expect(() => mashPhEstimateV1(input({ volumeLiters: -10 }))).toThrow(/volumeLiters must be > 0/);
  });

  it("throws on non-finite alkalinityPpmCaCO3", () => {
    expect(() => mashPhEstimateV1(input({ alkalinityPpmCaCO3: NaN }))).toThrow(/Invalid alkalinityPpmCaCO3/);
  });

  it("throws on negative Ca / Mg (defensive contract — different from residualAlkalinity's passthrough)", () => {
    expect(() => mashPhEstimateV1(input({ calciumPpm: -1 }))).toThrow(/calciumPpm\/magnesiumPpm must be >= 0/);
    expect(() => mashPhEstimateV1(input({ magnesiumPpm: -1 }))).toThrow(/calciumPpm\/magnesiumPpm must be >= 0/);
  });

  it("throws on non-finite Ca / Mg when explicitly provided", () => {
    expect(() => mashPhEstimateV1(input({ calciumPpm: NaN }))).toThrow(/Invalid calciumPpm/);
    expect(() => mashPhEstimateV1(input({ magnesiumPpm: NaN }))).toThrow(/Invalid magnesiumPpm/);
  });

  it("throws when grist is not an array", () => {
    // @ts-expect-error — deliberately invalid grist type
    expect(() => mashPhEstimateV1(input({ grist: "not an array" }))).toThrow(/grist must be an array/);
  });

  it("throws on non-finite grist[i].amountKg", () => {
    expect(() => mashPhEstimateV1(input({
      grist: [{ amountKg: NaN, mashDiPh: 5.7 }],
    }))).toThrow(/Invalid grist.amountKg/);
  });

  it("throws on non-null non-finite mashDiPh", () => {
    expect(() => mashPhEstimateV1(input({
      grist: [{ amountKg: 5, mashDiPh: NaN }],
    }))).toThrow(/grist.mashDiPh must be null or a finite number/);
  });

  it("throws on non-null non-finite mashTaToPh57_mEqPerKg", () => {
    expect(() => mashPhEstimateV1(input({
      grist: [{ amountKg: 5, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: NaN }],
    }))).toThrow(/grist.mashTaToPh57_mEqPerKg must be null or a finite number/);
  });

  it("throws on non-finite acidAdded_mEqPerL", () => {
    expect(() => mashPhEstimateV1(input({ acidAdded_mEqPerL: NaN }))).toThrow(
      /Invalid acidAdded_mEqPerL/,
    );
  });

  it("throws when waterToGristRatioQtPerLbOverride is non-finite", () => {
    expect(() => mashPhEstimateV1(input({
      waterToGristRatioQtPerLbOverride: NaN,
    }))).toThrow(/Invalid waterToGristRatioQtPerLb/);
  });

  it("throws when waterToGristRatioQtPerLbOverride is <= 0", () => {
    expect(() => mashPhEstimateV1(input({
      waterToGristRatioQtPerLbOverride: 0,
    }))).toThrow(/waterToGristRatioQtPerLb must be > 0/);
    expect(() => mashPhEstimateV1(input({
      waterToGristRatioQtPerLbOverride: -1,
    }))).toThrow(/waterToGristRatioQtPerLb must be > 0/);
  });
});
