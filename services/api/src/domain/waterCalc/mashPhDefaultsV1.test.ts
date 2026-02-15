import { describe, expect, it } from "vitest";
import {
  defaultMashDiPh,
  defaultMashTaToPh57_mEqPerKg,
  getMashPhModelDefaultsV1,
  inferIsDehuskedOrDebittered,
  inferMashPhModelKeyV1,
} from "./mashPhDefaultsV1.js";

describe("mashPhDefaultsV1", () => {
  it("detects dehusked/de-bittered markers", () => {
    expect(inferIsDehuskedOrDebittered("Weyermann CARAFA SPECIAL II", null)).toBe(true);
    expect(inferIsDehuskedOrDebittered("Mroost 1400 MD (De-Bittered Black)", null)).toBe(true);
    expect(inferIsDehuskedOrDebittered("Chocolate malt", null)).toBe(false);
  });

  it("infers mash pH model keys from group/type/name", () => {
    expect(
      inferMashPhModelKeyV1({ name: "Acid Malt", group: "Acid malt", type: null, notes: null, colorEbc: 5 }),
    ).toBe("acidulated");
    expect(
      inferMashPhModelKeyV1({ name: "Dextrose", group: "Sugar", type: "Sugar", notes: null, colorEbc: null }),
    ).toBe("adjunct_sugar");
    expect(
      inferMashPhModelKeyV1({ name: "Crystal 60", group: "Crystal/Caramel", type: "Crystal", notes: null, colorEbc: 120 }),
    ).toBe("crystal");
    expect(
      inferMashPhModelKeyV1({ name: "Roasted Barley", group: "Roasted", type: null, notes: null, colorEbc: 1200 }),
    ).toBe("roasted");
    expect(
      inferMashPhModelKeyV1({ name: "Munich Malt", group: "Base malt", type: "Munich", notes: null, colorEbc: 20 }),
    ).toBe("base_munich");
  });

  it("provides reasonable defaults and versions", () => {
    expect(defaultMashDiPh("base_pale")).toBeTypeOf("number");
    expect(defaultMashDiPh("crystal")).toBe(null);

    expect(defaultMashTaToPh57_mEqPerKg("roasted", 1000)).toBe(40);
    expect(defaultMashTaToPh57_mEqPerKg("acidulated", 5)).toBeGreaterThan(200);

    const d = getMashPhModelDefaultsV1({
      name: "Crystal 60",
      group: "Crystal/Caramel",
      type: "Crystal",
      notes: null,
      colorEbc: 120,
    });
    expect(d.mashPhModelSource).toBe("defaults_v1");
    expect(d.mashPhModelVersion).toBe(1);
    expect(d.mashPhModelKey).toBe("crystal");
    expect(d.mashTaToPh57_mEqPerKg).toBeGreaterThan(0);
  });
});

