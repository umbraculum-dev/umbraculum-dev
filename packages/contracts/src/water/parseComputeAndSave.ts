import type {
  BoilComputeAndSaveResponseV1,
  MashAcidComputeBlock,
  MashComputeAndSaveResponseV1,
  MashAcidificationTargetMashPhResult,
  RecipeWaterSettingsSavedRef,
  SpargeAcidComputeBlock,
  SpargeComputeAndSaveResponseV1,
  BoilAcidComputeBlock,
  WaterAcidificationManualResult,
  WaterAcidificationResult,
  WaterOverallResult,
  WaterSaltAdditionsResult,
} from "./computeAndSave";
import type { WaterCalcDerivation, WaterCalcDerivationLine, WaterCalcDerivationValue } from "./derivation";
import type { IonProfilePpm } from "./ionProfile";
import type { NumberFormatHintV1 } from "../format/numberFormat";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function parseIonProfilePpm(v: unknown, label: string): IonProfilePpm {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) {
    if (!isFiniteNumber(o[k])) throw new Error(`Invalid ${label}.${String(k)}`);
  }
  return {
    calcium: o.calcium,
    magnesium: o.magnesium,
    sodium: o.sodium,
    sulfate: o.sulfate,
    chloride: o.chloride,
    bicarbonate: o.bicarbonate,
  };
}

function parseDerivationValue(v: unknown, label: string): WaterCalcDerivationValue {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  if (o.kind === "number") {
    if (!isFiniteNumber(o.value)) throw new Error(`Invalid ${label}.value`);
    const unit = typeof o.unit === "string" ? o.unit : undefined;
    return unit ? { kind: "number", value: o.value, unit: unit as any } : { kind: "number", value: o.value };
  }
  if (o.kind === "string") {
    if (typeof o.value !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: o.value };
  }
  if (o.kind === "boolean") {
    if (typeof o.value !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: o.value };
  }
  if (o.kind === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}

function parseDerivationLine(v: unknown, label: string): WaterCalcDerivationLine {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const id = typeof o.id === "string" ? o.id : "";
  if (!id) throw new Error(`Invalid ${label}.id`);
  return { id, value: parseDerivationValue(o.value, `${label}.value`) };
}

function parseDerivation(v: unknown, label: string): WaterCalcDerivation {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const kind = typeof o.kind === "string" ? o.kind : "";
  if (!kind) throw new Error(`Invalid ${label}.kind`);
  if (o.version !== 1) throw new Error(`Invalid ${label}.version`);
  const formulaId = typeof o.formulaId === "string" ? o.formulaId : "";
  if (!formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const inputs = Array.isArray(o.inputs)
    ? o.inputs.map((x: unknown, i: number) => parseDerivationLine(x, `${label}.inputs[${i}]`))
    : [];
  const intermediates = Array.isArray(o.intermediates)
    ? o.intermediates.map((x: unknown, i: number) => parseDerivationLine(x, `${label}.intermediates[${i}]`))
    : [];
  const breakdowns = Array.isArray(o.breakdowns)
    ? o.breakdowns
        .filter((b: any) => b && typeof b === "object" && typeof b.id === "string" && Array.isArray(b.rows))
        .map((b: any) => ({
          id: b.id,
          rows: (b.rows as any[]).filter((r) => r && typeof r === "object") as Array<Record<string, WaterCalcDerivationValue>>,
        }))
    : undefined;
  const notes = Array.isArray(o.notes) ? (o.notes.filter((n: unknown) => typeof n === "string") as any) : undefined;
  return { kind: kind as any, version: 1, formulaId, inputs, intermediates, breakdowns, notes };
}

function parseSettingsSavedRef(v: unknown, label: string): RecipeWaterSettingsSavedRef {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const recipeId = typeof o.recipeId === "string" ? o.recipeId : "";
  if (!recipeId) throw new Error(`Invalid ${label}.recipeId`);
  return { recipeId };
}

function parseSaltAdditionsResult(v: unknown, label: string): WaterSaltAdditionsResult {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const baseProfile = parseIonProfilePpm(o.baseProfile, `${label}.baseProfile`);
  const resultingProfile = parseIonProfilePpm(o.resultingProfile, `${label}.resultingProfile`);
  const deltasPpm = parseIonProfilePpm(o.deltasPpm, `${label}.deltasPpm`);
  const breakdown = Array.isArray(o.breakdown)
    ? o.breakdown
        .filter((r: any) => r && typeof r === "object" && typeof r.saltKey === "string" && isFiniteNumber(r.grams))
        .map((r: any) => ({
          saltKey: r.saltKey as string,
          grams: r.grams as number,
          deltasPpm: (r.deltasPpm && typeof r.deltasPpm === "object" ? r.deltasPpm : {}) as any,
        }))
    : [];
  return { baseProfile, resultingProfile, deltasPpm, breakdown };
}

function parseAcidificationResult(v: unknown, label: string): WaterAcidificationResult {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(o.finalAlkalinityPpmCaCO3) ? o.finalAlkalinityPpmCaCO3 : NaN;
  const sulfateAddedPpm = isFiniteNumber(o.sulfateAddedPpm) ? o.sulfateAddedPpm : NaN;
  const chlorideAddedPpm = isFiniteNumber(o.chlorideAddedPpm) ? o.chlorideAddedPpm : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  if (!Number.isFinite(sulfateAddedPpm)) throw new Error(`Invalid ${label}.sulfateAddedPpm`);
  if (!Number.isFinite(chlorideAddedPpm)) throw new Error(`Invalid ${label}.chlorideAddedPpm`);
  return {
    acidRequiredMl: o.acidRequiredMl === null ? null : isFiniteNumber(o.acidRequiredMl) ? o.acidRequiredMl : null,
    acidRequiredTsp: o.acidRequiredTsp === null ? null : isFiniteNumber(o.acidRequiredTsp) ? o.acidRequiredTsp : null,
    acidRequiredGrams: o.acidRequiredGrams === null ? null : isFiniteNumber(o.acidRequiredGrams) ? o.acidRequiredGrams : null,
    acidRequiredKg: o.acidRequiredKg === null ? null : isFiniteNumber(o.acidRequiredKg) ? o.acidRequiredKg : null,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: o.debug && typeof o.debug === "object" ? (o.debug as Record<string, unknown>) : undefined,
  };
}

function parseAcidificationManualResult(v: unknown, label: string): WaterAcidificationManualResult {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const achievedPh = isFiniteNumber(o.achievedPh) ? o.achievedPh : NaN;
  if (!Number.isFinite(achievedPh)) throw new Error(`Invalid ${label}.achievedPh`);
  const clamped = o.clamped === "none" || o.clamped === "low" || o.clamped === "high" ? o.clamped : "none";
  const iterations = isFiniteNumber(o.iterations) ? o.iterations : 0;
  const targetAmount = isFiniteNumber(o.targetAmount) ? o.targetAmount : NaN;
  const predictedAmount = isFiniteNumber(o.predictedAmount) ? o.predictedAmount : NaN;
  return {
    achievedPh,
    predicted: parseAcidificationResult(o.predicted, `${label}.predicted`),
    clamped,
    iterations,
    targetAmount,
    predictedAmount,
  };
}

function parseMashTargetMashPhResult(v: unknown, label: string): MashAcidificationTargetMashPhResult {
  const base = parseAcidificationResult(v, label) as MashAcidificationTargetMashPhResult;
  const o = v as any;
  const estimatedMashPhRoomTemp = isFiniteNumber(o.estimatedMashPhRoomTemp) ? o.estimatedMashPhRoomTemp : NaN;
  if (!Number.isFinite(estimatedMashPhRoomTemp)) throw new Error(`Invalid ${label}.estimatedMashPhRoomTemp`);
  return { ...base, estimatedMashPhRoomTemp };
}

function parseOverallResult(v: unknown, label: string): WaterOverallResult {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const calculatedAt = typeof o.calculatedAt === "string" ? o.calculatedAt : "";
  if (!calculatedAt) throw new Error(`Invalid ${label}.calculatedAt`);
  const ionsPpm = parseIonProfilePpm(o.ionsPpm, `${label}.ionsPpm`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(o.finalAlkalinityPpmCaCO3) ? o.finalAlkalinityPpmCaCO3 : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  const ph = o.ph;
  const kind = ph?.kind === "target" || ph?.kind === "estimated" ? ph.kind : null;
  const value = isFiniteNumber(ph?.value) ? ph.value : null;
  if (!kind || value === null) throw new Error(`Invalid ${label}.ph`);
  return {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3,
    ph: { kind, value },
    debug: o.debug && typeof o.debug === "object" ? (o.debug as Record<string, unknown>) : undefined,
  };
}

function parseMashAcidBlock(v: unknown, label: string): MashAcidComputeBlock {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const kind = o.kind;
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification_target_mash_ph") {
    return {
      kind,
      mode: "targetPh",
      result: parseMashTargetMashPhResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

function parseSpargeAcidBlock(v: unknown, label: string): SpargeAcidComputeBlock {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const kind = o.kind;
  if (kind === "sparge_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`),
    };
  }
  if (kind === "sparge_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

function parseBoilAcidBlock(v: unknown, label: string): BoilAcidComputeBlock {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  const kind = o.kind;
  if (kind === "boil_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`),
    };
  }
  if (kind === "boil_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

function parseNumberFormatHintV1(v: unknown, label: string): NumberFormatHintV1 {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  if (o.version !== 1) throw new Error(`Invalid ${label}.version`);
  const style = o.style === "fixed" || o.style === "significant" ? o.style : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber(o.decimals) ? o.decimals : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unit = typeof o.unit === "string" ? o.unit : undefined;
  const clamp =
    o.clamp && typeof o.clamp === "object"
      ? {
          min: isFiniteNumber((o.clamp as any).min) ? (o.clamp as any).min : undefined,
          max: isFiniteNumber((o.clamp as any).max) ? (o.clamp as any).max : undefined,
        }
      : undefined;
  return { version: 1, style, decimals, unit: unit as any, clamp };
}

function parseFormatHints(root: any): Record<string, NumberFormatHintV1> {
  const hintsOut: Record<string, NumberFormatHintV1> = {};
  const h = root?.formatHints;
  if (h && typeof h === "object") {
    for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(v, `formatHints.${k}`);
      } catch {
        // ignore invalid hint entries
      }
    }
  }
  return hintsOut;
}

export function parseMashComputeAndSaveResponse(x: unknown): MashComputeAndSaveResponseV1 {
  const root = (x ?? {}) as any;
  if (!root || typeof root !== "object") throw new Error("Invalid MashComputeAndSaveResponseV1");
  if (root.ok !== true) throw new Error("Invalid MashComputeAndSaveResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid MashComputeAndSaveResponseV1.version");

  const salts = root.salts;
  const acid = root.acid;
  const overall = root.overall;

  const formatHints = parseFormatHints(root);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(root.settings, "MashComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts?.result, "MashComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts?.derivation, "MashComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseMashAcidBlock(acid, "MashComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall?.result, "MashComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall?.derivation, "MashComputeAndSaveResponseV1.overall.derivation"),
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}

export function parseSpargeComputeAndSaveResponse(x: unknown): SpargeComputeAndSaveResponseV1 {
  const root = (x ?? {}) as any;
  if (!root || typeof root !== "object") throw new Error("Invalid SpargeComputeAndSaveResponseV1");
  if (root.ok !== true) throw new Error("Invalid SpargeComputeAndSaveResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid SpargeComputeAndSaveResponseV1.version");

  const salts = root.salts;
  const acid = root.acid;

  const formatHints = parseFormatHints(root);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(root.settings, "SpargeComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts?.result, "SpargeComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts?.derivation, "SpargeComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseSpargeAcidBlock(acid, "SpargeComputeAndSaveResponseV1.acid"),
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}

export function parseBoilComputeAndSaveResponse(x: unknown): BoilComputeAndSaveResponseV1 {
  const root = (x ?? {}) as any;
  if (!root || typeof root !== "object") throw new Error("Invalid BoilComputeAndSaveResponseV1");
  if (root.ok !== true) throw new Error("Invalid BoilComputeAndSaveResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid BoilComputeAndSaveResponseV1.version");

  const salts = root.salts;
  const acid = root.acid;
  const overall = root.overall;

  const formatHints = parseFormatHints(root);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(root.settings, "BoilComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts?.result, "BoilComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts?.derivation, "BoilComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseBoilAcidBlock(acid, "BoilComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall?.result, "BoilComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall?.derivation, "BoilComputeAndSaveResponseV1.overall.derivation"),
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}
