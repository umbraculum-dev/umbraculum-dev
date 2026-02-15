import { describe, expect, it } from "vitest";
import { mashPhEstimateV1 } from "./mashPhEstimateV1.js";

describe("mashPhEstimateV1", () => {
  it("increases estimated mash pH as alkalinity increases", () => {
    const base = {
      volumeLiters: 10,
      grist: [{ amountKg: 5, mashDiPh: 5.76, mashTaToPh57_mEqPerKg: 0 }],
    };
    const low = mashPhEstimateV1({ ...base, alkalinityPpmCaCO3: 0 });
    const high = mashPhEstimateV1({ ...base, alkalinityPpmCaCO3: 200 });
    expect(high.estimatedMashPhRoomTemp).toBeGreaterThan(low.estimatedMashPhRoomTemp);
  });

  it("decreases estimated mash pH as malt acidity (TA) increases", () => {
    const base = {
      volumeLiters: 10,
      alkalinityPpmCaCO3: 50,
      grist: [{ amountKg: 5, mashDiPh: 5.76, mashTaToPh57_mEqPerKg: 0 }],
    };
    const a = mashPhEstimateV1(base);
    const b = mashPhEstimateV1({
      ...base,
      grist: [{ amountKg: 5, mashDiPh: 5.76, mashTaToPh57_mEqPerKg: 40 }],
    });
    expect(b.estimatedMashPhRoomTemp).toBeLessThan(a.estimatedMashPhRoomTemp);
  });

  it("uses weighted DI mash pH as baseline", () => {
    const a = mashPhEstimateV1({
      volumeLiters: 10,
      alkalinityPpmCaCO3: 0,
      grist: [
        { amountKg: 4, mashDiPh: 5.70, mashTaToPh57_mEqPerKg: 0 },
        { amountKg: 1, mashDiPh: 5.90, mashTaToPh57_mEqPerKg: 0 },
      ],
    });
    expect(a.debug.diMashPhWeightedAvg).toBeCloseTo((4 * 5.7 + 1 * 5.9) / 5, 6);
  });

  it("reports missing row params in debug", () => {
    const r = mashPhEstimateV1({
      volumeLiters: 10,
      alkalinityPpmCaCO3: 50,
      grist: [
        { amountKg: 5, mashDiPh: null, mashTaToPh57_mEqPerKg: null },
        { amountKg: 1, mashDiPh: 5.7, mashTaToPh57_mEqPerKg: null },
      ],
    });
    expect(r.debug.missingDiPhRowCount).toBeGreaterThan(0);
    expect(r.debug.missingTaRowCount).toBeGreaterThan(0);
  });
});

