import { describe, expect, it } from "vitest";
import { parseRecipeWaterHubSummaryResponse } from "./parseHubSummary";

function validIons() {
  return {
    calcium: 80,
    magnesium: 5,
    sodium: 10,
    sulfate: 100,
    chloride: 60,
    bicarbonate: 50,
  };
}

function validMashStream() {
  return {
    key: "mash",
    volumeLiters: 18,
    ph: 5.4,
    finalAlkalinityPpmCaCO3: 30,
    ionsPpm: validIons(),
    saltsBreakdown: [{ saltKey: "gypsum", grams: 2.5 }],
    acidType: "lactic",
    acidMode: "required",
    acidStrengthKind: "percent",
    acidStrengthValue: 88,
    acidAmountMl: 3.2,
    acidAmountGrams: null,
  };
}

function validResponse() {
  return {
    ok: true,
    summary: {
      version: 1,
      status: {
        mashAcidificationMode: "required",
        spargeAcidificationMode: null,
        boilAcidificationMode: null,
        mashLastCalculatedAt: "2026-05-12T10:00:00.000Z",
        spargeLastCalculatedAt: null,
        boilLastCalculatedAt: null,
        mashOverallSnapshot: {
          ph: { kind: "estimated", value: 5.42 },
          finalAlkalinityPpmCaCO3: 30,
        },
      },
      streams: [validMashStream()],
      merged: {
        totalVolumeLiters: 22,
        ph: 5.5,
        finalAlkalinityPpmCaCO3: 30,
        ionsPpm: validIons(),
      },
      finalRecap: {
        predictedMashPh: { kind: "estimated", value: 5.4 },
        residualAlkalinityMashOverallPpmCaCO3: -10,
        residualAlkalinityMergedPpmCaCO3: -8,
        styleExpectedRa: { min: -50, max: 0, rationaleKey: "styleExpectedRaPale" },
      },
    },
    formatHints: {
      pH: { version: 1, style: "fixed", decimals: 2 },
    },
  };
}

describe("parseRecipeWaterHubSummaryResponse", () => {
  it("accepts a well-formed response", () => {
    const parsed = parseRecipeWaterHubSummaryResponse(validResponse());
    expect(parsed.ok).toBe(true);
    expect(parsed.summary.version).toBe(1);
    expect(parsed.summary.streams.length).toBe(1);
    expect(parsed.summary.streams[0].key).toBe("mash");
    expect(parsed.summary.merged.totalVolumeLiters).toBe(22);
    expect(parsed.summary.finalRecap.predictedMashPh).toEqual({ kind: "estimated", value: 5.4 });
    expect(parsed.summary.finalRecap.styleExpectedRa).toEqual({
      min: -50,
      max: 0,
      rationaleKey: "styleExpectedRaPale",
    });
    expect(parsed.formatHints?.pH).toEqual({ version: 1, style: "fixed", decimals: 2 });
  });

  it("rejects when ok is not true", () => {
    const r = validResponse();
    (r as any).ok = false;
    expect(() => parseRecipeWaterHubSummaryResponse(r)).toThrow(/ok/);
  });

  it("rejects when summary is missing or malformed", () => {
    expect(() => parseRecipeWaterHubSummaryResponse({ ok: true })).toThrow(/summary/);
    expect(() => parseRecipeWaterHubSummaryResponse({ ok: true, summary: "x" })).toThrow(/summary/);
  });

  it("rejects when summary.version is not 1", () => {
    const r = validResponse();
    (r as any).summary.version = 2;
    expect(() => parseRecipeWaterHubSummaryResponse(r)).toThrow(/version/);
  });

  it("rejects when merged is missing", () => {
    const r = validResponse();
    (r as any).summary.merged = null;
    expect(() => parseRecipeWaterHubSummaryResponse(r)).toThrow(/merged/);
  });

  it("rejects when finalRecap is missing", () => {
    const r = validResponse();
    (r as any).summary.finalRecap = null;
    expect(() => parseRecipeWaterHubSummaryResponse(r)).toThrow(/finalRecap/);
  });

  it("drops streams with unknown key", () => {
    const r = validResponse();
    (r as any).summary.streams = [{ ...validMashStream(), key: "carbonation" }, validMashStream()];
    const parsed = parseRecipeWaterHubSummaryResponse(r);
    expect(parsed.summary.streams.length).toBe(1);
    expect(parsed.summary.streams[0].key).toBe("mash");
  });

  it("returns null ionsPpm when one ion is missing", () => {
    const r = validResponse();
    const broken = validMashStream();
    (broken as any).ionsPpm = { ...validIons(), bicarbonate: undefined };
    (r as any).summary.streams = [broken];
    const parsed = parseRecipeWaterHubSummaryResponse(r);
    expect(parsed.summary.streams[0].ionsPpm).toBeNull();
  });

  it("drops salt breakdown rows lacking saltKey or grams", () => {
    const r = validResponse();
    const stream = validMashStream();
    (stream as any).saltsBreakdown = [
      { saltKey: "gypsum", grams: 1 },
      { saltKey: "epsom", grams: "two" },
      { saltKey: "", grams: 3 },
    ];
    (r as any).summary.streams = [stream];
    const parsed = parseRecipeWaterHubSummaryResponse(r);
    expect(parsed.summary.streams[0].saltsBreakdown).toEqual([{ saltKey: "gypsum", grams: 1 }]);
  });

  it("returns null saltsBreakdown when no valid rows remain", () => {
    const r = validResponse();
    const stream = validMashStream();
    (stream as any).saltsBreakdown = [{ saltKey: "", grams: 1 }];
    (r as any).summary.streams = [stream];
    const parsed = parseRecipeWaterHubSummaryResponse(r);
    expect(parsed.summary.streams[0].saltsBreakdown).toBeNull();
  });

  it("normalises invalid mashOverallSnapshot to null", () => {
    const r = validResponse();
    (r as any).summary.status.mashOverallSnapshot = {
      ph: { kind: "bogus", value: 5.4 },
      finalAlkalinityPpmCaCO3: 30,
    };
    const parsed = parseRecipeWaterHubSummaryResponse(r);
    expect(parsed.summary.status.mashOverallSnapshot).toBeNull();
  });

  it("normalises invalid styleExpectedRa to null", () => {
    const r = validResponse();
    (r as any).summary.finalRecap.styleExpectedRa = {
      min: 1,
      max: 2,
      rationaleKey: "wrongKey",
    };
    const parsed = parseRecipeWaterHubSummaryResponse(r);
    expect(parsed.summary.finalRecap.styleExpectedRa).toBeNull();
  });

  it("defaults totalVolumeLiters to 0 when missing", () => {
    const r = validResponse();
    (r as any).summary.merged.totalVolumeLiters = undefined;
    const parsed = parseRecipeWaterHubSummaryResponse(r);
    expect(parsed.summary.merged.totalVolumeLiters).toBe(0);
  });
});
