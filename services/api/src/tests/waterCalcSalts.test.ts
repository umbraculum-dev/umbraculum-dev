import { describe, expect, it } from "vitest";
import { applySaltAdditions } from "../domain/waterCalc/saltAdditions.js";

describe("applySaltAdditions", () => {
  it("scales ppm with grams and volume", () => {
    const base = { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 };

    const r1 = applySaltAdditions(base, 10, [{ saltKey: "gypsum", grams: 1 }]);
    const r2 = applySaltAdditions(base, 20, [{ saltKey: "gypsum", grams: 1 }]);
    const r3 = applySaltAdditions(base, 10, [{ saltKey: "gypsum", grams: 2 }]);

    // Same grams, double volume => half ppm
    expect(r2.deltasPpm.calcium).toBeCloseTo(r1.deltasPpm.calcium / 2, 6);
    expect(r2.deltasPpm.sulfate).toBeCloseTo(r1.deltasPpm.sulfate / 2, 6);

    // Same volume, double grams => double ppm
    expect(r3.deltasPpm.calcium).toBeCloseTo(r1.deltasPpm.calcium * 2, 6);
    expect(r3.deltasPpm.sulfate).toBeCloseTo(r1.deltasPpm.sulfate * 2, 6);
  });

  it("adds chloride for table salt", () => {
    const base = { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 };
    const r = applySaltAdditions(base, 1, [{ saltKey: "table_salt", grams: 1 }]);
    expect(r.deltasPpm.sodium).toBeGreaterThan(0);
    expect(r.deltasPpm.chloride).toBeGreaterThan(0);
    expect(r.deltasPpm.sulfate).toBeCloseTo(0, 12);
  });
});

