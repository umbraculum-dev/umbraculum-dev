import { describe, expect, it } from "vitest";
import { spargeAcidification } from "../domain/waterCalc/spargeAcidification.js";

describe("waterCalc.spargeAcidification (BrunWater 1.25 parity)", () => {
  it("matches BrunWater sheet2 default scenario (phosphoric, 1% strength, 1 gal)", () => {
    // BrunWater default inputs (sheet 2):
    // - starting alkalinity: 0 ppm as CaCO3
    // - starting pH: 7.0
    // - target pH: 5.6
    // - water volume: 1.0 gallon = 3.785 L
    // - acid: Phosphoric, strength kind: %, strength value: 1
    //
    // Expected outputs were extracted from `docs/calculators/BrunWater1.25.ods` (sheet 2):
    // - Phosphoric Acid Required = 0.361072950558936 ml
    // - Final Water Alkalinity = -0.500120594321575 ppm as CaCO3 (stored value)
    const res = spargeAcidification({
      startingAlkalinityPpmCaCO3: 0,
      startingPh: 7.0,
      targetPh: 5.6,
      volumeLiters: 3.785,
      acidType: "phosphoric",
      strength: { kind: "percent", value: 1 },
    });

    expect(res.acidRequiredMl).not.toBeNull();
    expect(res.acidRequiredMl as number).toBeCloseTo(0.361072950558936, 9);
    expect(res.finalAlkalinityPpmCaCO3).toBeCloseTo(-0.500120594321575, 9);
    expect(res.sulfateAddedPpm).toBe(0);
    expect(res.chlorideAddedPpm).toBe(0);
  });

  it("reduces acid required when Ca/Mg increase (RA-like effective alkalinity heuristic)", () => {
    const base = {
      startingAlkalinityPpmCaCO3: 200,
      startingPh: 7.0,
      targetPh: 5.6,
      volumeLiters: 10,
      acidType: "phosphoric" as const,
      strength: { kind: "percent" as const, value: 10 },
    };

    const low = spargeAcidification({ ...base, calciumPpm: 0, magnesiumPpm: 0 });
    const high = spargeAcidification({ ...base, calciumPpm: 100, magnesiumPpm: 20 });

    expect(low.acidRequiredMl).not.toBeNull();
    expect(high.acidRequiredMl).not.toBeNull();
    expect(high.acidRequiredMl as number).toBeLessThan(low.acidRequiredMl as number);
  });

  it("reports sulfate/chloride contributions for sulfuric/hydrochloric acids", () => {
    const base = {
      startingAlkalinityPpmCaCO3: 0,
      startingPh: 7.0,
      targetPh: 5.6,
      volumeLiters: 3.785,
      strength: { kind: "percent" as const, value: 1 },
    };

    const sulfuric = spargeAcidification({ ...base, acidType: "sulfuric" });
    expect(sulfuric.sulfateAddedPpm).toBeGreaterThan(0);
    expect(sulfuric.chlorideAddedPpm).toBe(0);

    const hcl = spargeAcidification({ ...base, acidType: "hydrochloric" });
    expect(hcl.chlorideAddedPpm).toBeGreaterThan(0);
    expect(hcl.sulfateAddedPpm).toBe(0);
  });
});

