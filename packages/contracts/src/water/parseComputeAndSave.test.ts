import { describe, expect, it } from "vitest";
import {
  parseBoilComputeAndSaveResponse,
  parseMashComputeAndSaveResponse,
  parseSpargeComputeAndSaveResponse,
} from "./parseComputeAndSave";

function ions() {
  return {
    calcium: 80,
    magnesium: 5,
    sodium: 10,
    sulfate: 100,
    chloride: 60,
    bicarbonate: 50,
  };
}

function deltaIons() {
  return { calcium: 10, magnesium: 0, sodium: 0, sulfate: 20, chloride: 0, bicarbonate: 0 };
}

function saltsBlock() {
  return {
    result: {
      baseProfile: ions(),
      resultingProfile: ions(),
      deltasPpm: deltaIons(),
      breakdown: [
        { saltKey: "gypsum", grams: 2, deltasPpm: { calcium: 10, sulfate: 20 } },
        { saltKey: "garbage", grams: "no", deltasPpm: {} },
      ],
    },
    derivation: derivation("salts.compute", "salts.compute.simple"),
  };
}

function derivation(kind: string, formulaId: string) {
  return {
    kind,
    version: 1,
    formulaId,
    inputs: [{ id: "in", value: { kind: "number", value: 1, unit: "g" } }],
    intermediates: [{ id: "tmp", value: { kind: "string", value: "ok" } }],
  };
}

function acidResult() {
  return {
    acidRequiredMl: 3.2,
    acidRequiredTsp: 0.65,
    acidRequiredGrams: null,
    acidRequiredKg: null,
    finalAlkalinityPpmCaCO3: 30,
    sulfateAddedPpm: 12,
    chlorideAddedPpm: 6,
  };
}

function mashTargetPhBlock() {
  return {
    kind: "mash_acidification_target_mash_ph",
    result: { ...acidResult(), estimatedMashPhRoomTemp: 5.42 },
    derivation: derivation("mash.acid", "mash.acid.target"),
  };
}

function overallBlock() {
  return {
    result: {
      calculatedAt: "2026-05-12T10:00:00.000Z",
      ionsPpm: ions(),
      finalAlkalinityPpmCaCO3: 30,
      ph: { kind: "estimated", value: 5.42 },
    },
    derivation: derivation("mash.overall", "mash.overall.merge"),
  };
}

function validMashResponse() {
  return {
    ok: true,
    version: 1,
    settings: { recipeId: "00000000-0000-0000-0000-000000000abc" },
    salts: saltsBlock(),
    acid: mashTargetPhBlock(),
    overall: overallBlock(),
    formatHints: {
      ph: { version: 1, style: "fixed", decimals: 2 },
    },
  };
}

describe("parseMashComputeAndSaveResponse", () => {
  it("accepts a well-formed targetPh response", () => {
    const parsed = parseMashComputeAndSaveResponse(validMashResponse());
    expect(parsed.ok).toBe(true);
    expect(parsed.version).toBe(1);
    expect(parsed.settings.recipeId).toBe("00000000-0000-0000-0000-000000000abc");
    expect(parsed.acid.kind).toBe("mash_acidification_target_mash_ph");
    if (parsed.acid.kind === "mash_acidification_target_mash_ph") {
      expect(parsed.acid.result.estimatedMashPhRoomTemp).toBeCloseTo(5.42, 2);
    }
    expect(parsed.overall.result.ph).toEqual({ kind: "estimated", value: 5.42 });
    expect(parsed.formatHints?.['ph']).toEqual({ version: 1, style: "fixed", decimals: 2 });
  });

  it("rejects when ok is false", () => {
    const r = validMashResponse();
    (r as any).ok = false;
    expect(() => parseMashComputeAndSaveResponse(r)).toThrow(/ok/);
  });

  it("rejects when version is not 1", () => {
    const r = validMashResponse();
    (r as any).version = 0;
    expect(() => parseMashComputeAndSaveResponse(r)).toThrow(/version/);
  });

  it("rejects when settings.recipeId is missing", () => {
    const r = validMashResponse();
    (r as any).settings = {};
    expect(() => parseMashComputeAndSaveResponse(r)).toThrow(/recipeId/);
  });

  it("rejects when ionsPpm has a missing ion", () => {
    const r = validMashResponse();
    (r as any).overall.result.ionsPpm = { ...ions(), magnesium: undefined };
    expect(() => parseMashComputeAndSaveResponse(r)).toThrow(/magnesium/);
  });

  it("filters out malformed salt breakdown rows", () => {
    const parsed = parseMashComputeAndSaveResponse(validMashResponse());
    expect(parsed.salts.result.breakdown.length).toBe(1);
    expect(parsed.salts.result.breakdown[0]!.saltKey).toBe("gypsum");
  });

  it("accepts mash_acidification_manual variant", () => {
    const r = validMashResponse();
    (r as any).acid = {
      kind: "mash_acidification_manual",
      result: {
        achievedPh: 5.4,
        predicted: acidResult(),
        clamped: "none",
        iterations: 12,
        targetAmount: 3,
        predictedAmount: 3.2,
      },
      derivation: derivation("mash.acid", "mash.acid.manual"),
    };
    const parsed = parseMashComputeAndSaveResponse(r);
    expect(parsed.acid.kind).toBe("mash_acidification_manual");
    expect(parsed.acid.mode).toBe("manual");
  });

  it("rejects an unknown acid kind", () => {
    const r = validMashResponse();
    (r as any).acid.kind = "mash_unicorn";
    expect(() => parseMashComputeAndSaveResponse(r)).toThrow(/kind/);
  });

  it("rejects an invalid overall.ph kind/value pair", () => {
    const r = validMashResponse();
    (r as any).overall.result.ph = { kind: "unknown", value: 5.4 };
    expect(() => parseMashComputeAndSaveResponse(r)).toThrow(/ph/);
  });

  it("drops formatHints entirely when no valid entries survive", () => {
    const r = validMashResponse();
    (r as any).formatHints = {
      foo: { version: 2, style: "fixed", decimals: 2 },
      bar: { version: 1, style: "broken", decimals: 2 },
    };
    const parsed = parseMashComputeAndSaveResponse(r);
    expect(parsed.formatHints).toBeUndefined();
  });
});

describe("parseSpargeComputeAndSaveResponse", () => {
  function validSpargeResponse() {
    return {
      ok: true,
      version: 1,
      settings: { recipeId: "00000000-0000-0000-0000-000000000abc" },
      salts: saltsBlock(),
      acid: {
        kind: "sparge_acidification",
        result: acidResult(),
        derivation: derivation("sparge.acid", "sparge.acid.target"),
      },
    };
  }

  it("accepts sparge_acidification_manual", () => {
    const r = validSpargeResponse();
    (r as any).acid = {
      kind: "sparge_acidification_manual",
      result: {
        achievedPh: 5.6,
        predicted: acidResult(),
        clamped: "low",
        iterations: 5,
        targetAmount: 2,
        predictedAmount: 1.8,
      },
      derivation: derivation("sparge.acid", "sparge.acid.manual"),
    };
    const parsed = parseSpargeComputeAndSaveResponse(r);
    expect(parsed.acid.kind).toBe("sparge_acidification_manual");
  });

  it("rejects unknown sparge acid kind", () => {
    const r = validSpargeResponse();
    (r as any).acid.kind = "sparge_chaos";
    expect(() => parseSpargeComputeAndSaveResponse(r)).toThrow(/kind/);
  });
});

describe("parseBoilComputeAndSaveResponse", () => {
  function validBoilResponse() {
    return {
      ok: true,
      version: 1,
      settings: { recipeId: "00000000-0000-0000-0000-000000000abc" },
      salts: saltsBlock(),
      acid: {
        kind: "boil_acidification",
        result: acidResult(),
        derivation: derivation("boil.acid", "boil.acid.target"),
      },
      overall: overallBlock(),
    };
  }

  it("accepts a well-formed boil response", () => {
    const parsed = parseBoilComputeAndSaveResponse(validBoilResponse());
    expect(parsed.acid.kind).toBe("boil_acidification");
    expect(parsed.overall.result.calculatedAt).toBe("2026-05-12T10:00:00.000Z");
  });

  it("rejects unknown boil acid kind", () => {
    const r = validBoilResponse();
    (r as any).acid.kind = "boil_freestyle";
    expect(() => parseBoilComputeAndSaveResponse(r)).toThrow(/kind/);
  });
});
