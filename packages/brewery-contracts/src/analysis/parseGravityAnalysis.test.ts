import { describe, expect, it } from "vitest";
import { parseGravityAnalysisResponseV1 } from "./parseGravityAnalysis";

function validResult() {
  return {
    boilTimeMinutes: 60,
    kettleVolumeLiters: 25,
    preBoilVolumeLiters: 27,
    ogEstimatedSg: 1.052,
    pbgEstimatedSg: 1.048,
    ibuTinsethEstimated: 35,
    ibuRagerEstimated: 40,
    buGuRatio: 0.67,
    colorSrmMoreyEstimated: 8,
    colorSrmDanielsEstimated: 9,
    fgEstimatedSg: 1.012,
    abvEstimatedPercent: 5.3,
    attenuationEffectivePercent: 77,
    warnings: [{ code: "missing_efficiency" }, { code: "missing_attenuation" }],
  };
}

function validResponse() {
  return {
    ok: true,
    version: 1,
    canonicalModels: { ibu: "tinseth", srm: "morey" },
    result: validResult(),
    derivations: {
      "analysis.abv": {
        kind: "analysis.abv",
        version: 1,
        formulaId: "analysis.abv.simple",
        inputs: [{ id: "og", value: { kind: "number", value: 1.052, unit: "sg" } }],
        intermediates: [{ id: "fg", value: { kind: "number", value: 1.012 } }],
      },
    },
    formatHints: {
      ogEstimatedSg: { version: 1, style: "fixed", decimals: 3, unit: "sg" },
    },
  };
}

describe("parseGravityAnalysisResponseV1", () => {
  it("accepts a well-formed response and preserves shape", () => {
    const parsed = parseGravityAnalysisResponseV1(validResponse());
    expect(parsed.ok).toBe(true);
    expect(parsed.version).toBe(1);
    expect(parsed.canonicalModels).toEqual({ ibu: "tinseth", srm: "morey" });
    expect(parsed.result.ogEstimatedSg).toBe(1.052);
    expect(parsed.result.warnings).toEqual([
      { code: "missing_efficiency" },
      { code: "missing_attenuation" },
    ]);
    expect(parsed.derivations["analysis.abv"]).toBeDefined();
    expect(parsed.formatHints.ogEstimatedSg).toEqual({
      version: 1,
      style: "fixed",
      decimals: 3,
      unit: "sg",
    });
  });

  it("rejects non-object payloads", () => {
    expect(() => parseGravityAnalysisResponseV1(null)).toThrow();
    expect(() => parseGravityAnalysisResponseV1("nope")).toThrow();
    expect(() => parseGravityAnalysisResponseV1(42)).toThrow();
  });

  it("rejects when ok is not true", () => {
    const r = validResponse();
    (r as any).ok = false;
    expect(() => parseGravityAnalysisResponseV1(r)).toThrow(/ok/);
  });

  it("rejects when version is not 1", () => {
    const r = validResponse();
    (r as any).version = 2;
    expect(() => parseGravityAnalysisResponseV1(r)).toThrow(/version/);
  });

  it("defaults canonicalModels to tinseth/morey when missing or invalid", () => {
    const r = validResponse();
    (r as any).canonicalModels = { ibu: "garbage", srm: undefined };
    const parsed = parseGravityAnalysisResponseV1(r);
    expect(parsed.canonicalModels).toEqual({ ibu: "tinseth", srm: "morey" });
  });

  it("preserves rager/daniels when explicitly chosen", () => {
    const r = validResponse();
    (r as any).canonicalModels = { ibu: "rager", srm: "daniels" };
    const parsed = parseGravityAnalysisResponseV1(r);
    expect(parsed.canonicalModels).toEqual({ ibu: "rager", srm: "daniels" });
  });

  it("normalises non-finite or non-null numeric fields to null", () => {
    const r = validResponse();
    (r as any).result.ogEstimatedSg = "not a number";
    (r as any).result.ibuTinsethEstimated = Number.NaN;
    (r as any).result.fgEstimatedSg = Infinity;
    const parsed = parseGravityAnalysisResponseV1(r);
    expect(parsed.result.ogEstimatedSg).toBeNull();
    expect(parsed.result.ibuTinsethEstimated).toBeNull();
    expect(parsed.result.fgEstimatedSg).toBeNull();
  });

  it("preserves explicit null values without coercion", () => {
    const r = validResponse();
    (r as any).result.boilTimeMinutes = null;
    (r as any).result.kettleVolumeLiters = null;
    const parsed = parseGravityAnalysisResponseV1(r);
    expect(parsed.result.boilTimeMinutes).toBeNull();
    expect(parsed.result.kettleVolumeLiters).toBeNull();
  });

  it("filters out warnings that lack a code", () => {
    const r = validResponse();
    (r as any).result.warnings = [
      { code: "missing_efficiency" },
      { code: 42 },
      "not an object",
      { code: "" },
      { code: "missing_attenuation" },
    ];
    const parsed = parseGravityAnalysisResponseV1(r);
    expect(parsed.result.warnings).toEqual([
      { code: "missing_efficiency" },
      { code: "missing_attenuation" },
    ]);
  });

  it("silently drops invalid derivation entries instead of throwing", () => {
    const r = validResponse();
    (r as any).derivations = {
      "analysis.abv": (validResponse() as any).derivations["analysis.abv"],
      "analysis.og": { kind: "analysis.og" },
    };
    const parsed = parseGravityAnalysisResponseV1(r);
    expect(parsed.derivations["analysis.abv"]).toBeDefined();
    expect((parsed.derivations as any)["analysis.og"]).toBeUndefined();
  });

  it("silently drops malformed format hints", () => {
    const r = validResponse();
    (r as any).formatHints = {
      ogEstimatedSg: { version: 1, style: "fixed", decimals: 3 },
      ibuTinsethEstimated: { version: 1, style: "broken", decimals: 0 },
      fgEstimatedSg: { version: 2, style: "fixed", decimals: 3 },
      abvEstimatedPercent: { version: 1, style: "fixed", decimals: -1 },
    };
    const parsed = parseGravityAnalysisResponseV1(r);
    expect(parsed.formatHints.ogEstimatedSg).toBeDefined();
    expect((parsed.formatHints as any).ibuTinsethEstimated).toBeUndefined();
    expect((parsed.formatHints as any).fgEstimatedSg).toBeUndefined();
    expect((parsed.formatHints as any).abvEstimatedPercent).toBeUndefined();
  });
});
