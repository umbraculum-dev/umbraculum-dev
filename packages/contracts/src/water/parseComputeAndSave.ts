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
import type {
  WaterCalcDerivation,
  WaterCalcDerivationKind,
  WaterCalcDerivationLine,
  WaterCalcDerivationValue,
  WaterCalcNoteCode,
  WaterCalcUnit,
} from "./derivation";
import type { IonProfilePpm } from "./ionProfile";
import type { NumberFormatHintV1, NumberFormatUnit } from "../format/numberFormat";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function parseIonProfilePpm(v: unknown, label: string): IonProfilePpm {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) {
    if (!isFiniteNumber(v[k])) throw new Error(`Invalid ${label}.${String(k)}`);
  }
  return {
    calcium: v.calcium as number,
    magnesium: v.magnesium as number,
    sodium: v.sodium as number,
    sulfate: v.sulfate as number,
    chloride: v.chloride as number,
    bicarbonate: v.bicarbonate as number,
  };
}

function parseDerivationValue(v: unknown, label: string): WaterCalcDerivationValue {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  if (v.kind === "number") {
    if (!isFiniteNumber(v.value)) throw new Error(`Invalid ${label}.value`);
    const unit = typeof v.unit === "string" ? (v.unit as WaterCalcUnit) : undefined;
    return unit ? { kind: "number", value: v.value, unit } : { kind: "number", value: v.value };
  }
  if (v.kind === "string") {
    if (typeof v.value !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: v.value };
  }
  if (v.kind === "boolean") {
    if (typeof v.value !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: v.value };
  }
  if (v.kind === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}

function parseDerivationLine(v: unknown, label: string): WaterCalcDerivationLine {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const id = typeof v.id === "string" ? v.id : "";
  if (!id) throw new Error(`Invalid ${label}.id`);
  return { id, value: parseDerivationValue(v.value, `${label}.value`) };
}

function parseDerivation(v: unknown, label: string): WaterCalcDerivation {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = typeof v.kind === "string" ? v.kind : "";
  if (!kind) throw new Error(`Invalid ${label}.kind`);
  if (v.version !== 1) throw new Error(`Invalid ${label}.version`);
  const formulaId = typeof v.formulaId === "string" ? v.formulaId : "";
  if (!formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const inputs = Array.isArray(v.inputs)
    ? v.inputs.map((x: unknown, i: number) => parseDerivationLine(x, `${label}.inputs[${i}]`))
    : [];
  const intermediates = Array.isArray(v.intermediates)
    ? v.intermediates.map((x: unknown, i: number) => parseDerivationLine(x, `${label}.intermediates[${i}]`))
    : [];
  const breakdowns = Array.isArray(v.breakdowns)
    ? v.breakdowns
        .filter((b: unknown): b is Record<string, unknown> =>
          isObject(b) && typeof b.id === "string" && Array.isArray(b.rows),
        )
        .map((b) => ({
          id: b.id as string,
          rows: (b.rows as unknown[]).filter((r): r is Record<string, WaterCalcDerivationValue> =>
            isObject(r),
          ),
        }))
    : undefined;
  const notes = Array.isArray(v.notes)
    ? (v.notes.filter((n: unknown): n is string => typeof n === "string") as WaterCalcNoteCode[])
    : undefined;
  return {
    kind: kind as WaterCalcDerivationKind,
    version: 1,
    formulaId,
    inputs,
    intermediates,
    breakdowns,
    notes,
  };
}

function parseSettingsSavedRef(v: unknown, label: string): RecipeWaterSettingsSavedRef {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const recipeId = typeof v.recipeId === "string" ? v.recipeId : "";
  if (!recipeId) throw new Error(`Invalid ${label}.recipeId`);
  return { recipeId };
}

function parseSaltAdditionsResult(v: unknown, label: string): WaterSaltAdditionsResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const baseProfile = parseIonProfilePpm(v.baseProfile, `${label}.baseProfile`);
  const resultingProfile = parseIonProfilePpm(v.resultingProfile, `${label}.resultingProfile`);
  const deltasPpm = parseIonProfilePpm(v.deltasPpm, `${label}.deltasPpm`);
  const breakdown = Array.isArray(v.breakdown)
    ? v.breakdown
        .filter((r: unknown): r is Record<string, unknown> =>
          isObject(r) && typeof r.saltKey === "string" && isFiniteNumber(r.grams),
        )
        .map((r) => ({
          saltKey: r.saltKey as string,
          grams: r.grams as number,
          deltasPpm: (isObject(r.deltasPpm) ? r.deltasPpm : {}) as Partial<IonProfilePpm>,
        }))
    : [];
  return { baseProfile, resultingProfile, deltasPpm, breakdown };
}

function parseAcidificationResult(v: unknown, label: string): WaterAcidificationResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(v.finalAlkalinityPpmCaCO3) ? v.finalAlkalinityPpmCaCO3 : NaN;
  const sulfateAddedPpm = isFiniteNumber(v.sulfateAddedPpm) ? v.sulfateAddedPpm : NaN;
  const chlorideAddedPpm = isFiniteNumber(v.chlorideAddedPpm) ? v.chlorideAddedPpm : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  if (!Number.isFinite(sulfateAddedPpm)) throw new Error(`Invalid ${label}.sulfateAddedPpm`);
  if (!Number.isFinite(chlorideAddedPpm)) throw new Error(`Invalid ${label}.chlorideAddedPpm`);
  return {
    acidRequiredMl: v.acidRequiredMl === null ? null : isFiniteNumber(v.acidRequiredMl) ? v.acidRequiredMl : null,
    acidRequiredTsp: v.acidRequiredTsp === null ? null : isFiniteNumber(v.acidRequiredTsp) ? v.acidRequiredTsp : null,
    acidRequiredGrams: v.acidRequiredGrams === null ? null : isFiniteNumber(v.acidRequiredGrams) ? v.acidRequiredGrams : null,
    acidRequiredKg: v.acidRequiredKg === null ? null : isFiniteNumber(v.acidRequiredKg) ? v.acidRequiredKg : null,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: isObject(v.debug) ? v.debug : undefined,
  };
}

function parseAcidificationManualResult(v: unknown, label: string): WaterAcidificationManualResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const achievedPh = isFiniteNumber(v.achievedPh) ? v.achievedPh : NaN;
  if (!Number.isFinite(achievedPh)) throw new Error(`Invalid ${label}.achievedPh`);
  const clamped = v.clamped === "none" || v.clamped === "low" || v.clamped === "high" ? v.clamped : "none";
  const iterations = isFiniteNumber(v.iterations) ? v.iterations : 0;
  const targetAmount = isFiniteNumber(v.targetAmount) ? v.targetAmount : NaN;
  const predictedAmount = isFiniteNumber(v.predictedAmount) ? v.predictedAmount : NaN;
  return {
    achievedPh,
    predicted: parseAcidificationResult(v.predicted, `${label}.predicted`),
    clamped,
    iterations,
    targetAmount,
    predictedAmount,
  };
}

function parseMashTargetMashPhResult(v: unknown, label: string): MashAcidificationTargetMashPhResult {
  const base = parseAcidificationResult(v, label) as MashAcidificationTargetMashPhResult;
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const estimatedMashPhRoomTemp = isFiniteNumber(v.estimatedMashPhRoomTemp) ? v.estimatedMashPhRoomTemp : NaN;
  if (!Number.isFinite(estimatedMashPhRoomTemp)) throw new Error(`Invalid ${label}.estimatedMashPhRoomTemp`);
  return { ...base, estimatedMashPhRoomTemp };
}

function parseOverallResult(v: unknown, label: string): WaterOverallResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const calculatedAt = typeof v.calculatedAt === "string" ? v.calculatedAt : "";
  if (!calculatedAt) throw new Error(`Invalid ${label}.calculatedAt`);
  const ionsPpm = parseIonProfilePpm(v.ionsPpm, `${label}.ionsPpm`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(v.finalAlkalinityPpmCaCO3) ? v.finalAlkalinityPpmCaCO3 : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  const ph = isObject(v.ph) ? v.ph : null;
  const kind = ph?.kind === "target" || ph?.kind === "estimated" ? ph.kind : null;
  const value = isFiniteNumber(ph?.value) ? ph.value : null;
  if (!kind || value === null) throw new Error(`Invalid ${label}.ph`);
  return {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3,
    ph: { kind, value },
    debug: isObject(v.debug) ? v.debug : undefined,
  };
}

function parseMashAcidBlock(v: unknown, label: string): MashAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v.kind;
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v.result, `${label}.result`),
      derivation: parseDerivation(v.derivation, `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification_target_mash_ph") {
    return {
      kind,
      mode: "targetPh",
      result: parseMashTargetMashPhResult(v.result, `${label}.result`),
      derivation: parseDerivation(v.derivation, `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v.result, `${label}.result`),
      derivation: parseDerivation(v.derivation, `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

function parseSpargeAcidBlock(v: unknown, label: string): SpargeAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v.kind;
  if (kind === "sparge_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v.result, `${label}.result`),
      derivation: parseDerivation(v.derivation, `${label}.derivation`),
    };
  }
  if (kind === "sparge_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v.result, `${label}.result`),
      derivation: parseDerivation(v.derivation, `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

function parseBoilAcidBlock(v: unknown, label: string): BoilAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v.kind;
  if (kind === "boil_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v.result, `${label}.result`),
      derivation: parseDerivation(v.derivation, `${label}.derivation`),
    };
  }
  if (kind === "boil_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v.result, `${label}.result`),
      derivation: parseDerivation(v.derivation, `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

function parseNumberFormatHintV1(v: unknown, label: string): NumberFormatHintV1 {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  if (v.version !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v.style === "fixed" || v.style === "significant" ? v.style : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber(v.decimals) ? v.decimals : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unitRaw = typeof v.unit === "string" ? v.unit : undefined;
  const clamp = isObject(v.clamp)
    ? {
        min: isFiniteNumber(v.clamp.min) ? v.clamp.min : undefined,
        max: isFiniteNumber(v.clamp.max) ? v.clamp.max : undefined,
      }
    : undefined;
  return { version: 1, style, decimals, unit: unitRaw as NumberFormatUnit | undefined, clamp };
}

function parseFormatHints(root: Record<string, unknown>): Record<string, NumberFormatHintV1> {
  const hintsOut: Record<string, NumberFormatHintV1> = {};
  const h = root.formatHints;
  if (isObject(h)) {
    for (const [k, val] of Object.entries(h)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(val, `formatHints.${k}`);
      } catch {
        // ignore invalid hint entries
      }
    }
  }
  return hintsOut;
}

export function parseMashComputeAndSaveResponse(x: unknown): MashComputeAndSaveResponseV1 {
  if (!isObject(x)) throw new Error("Invalid MashComputeAndSaveResponseV1");
  if (x.ok !== true) throw new Error("Invalid MashComputeAndSaveResponseV1.ok");
  if (x.version !== 1) throw new Error("Invalid MashComputeAndSaveResponseV1.version");

  const salts = isObject(x.salts) ? x.salts : {};
  const acid = x.acid;
  const overall = isObject(x.overall) ? x.overall : {};

  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x.settings, "MashComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts.result, "MashComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts.derivation, "MashComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseMashAcidBlock(acid, "MashComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall.result, "MashComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall.derivation, "MashComputeAndSaveResponseV1.overall.derivation"),
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}

export function parseSpargeComputeAndSaveResponse(x: unknown): SpargeComputeAndSaveResponseV1 {
  if (!isObject(x)) throw new Error("Invalid SpargeComputeAndSaveResponseV1");
  if (x.ok !== true) throw new Error("Invalid SpargeComputeAndSaveResponseV1.ok");
  if (x.version !== 1) throw new Error("Invalid SpargeComputeAndSaveResponseV1.version");

  const salts = isObject(x.salts) ? x.salts : {};
  const acid = x.acid;

  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x.settings, "SpargeComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts.result, "SpargeComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts.derivation, "SpargeComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseSpargeAcidBlock(acid, "SpargeComputeAndSaveResponseV1.acid"),
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}

export function parseBoilComputeAndSaveResponse(x: unknown): BoilComputeAndSaveResponseV1 {
  if (!isObject(x)) throw new Error("Invalid BoilComputeAndSaveResponseV1");
  if (x.ok !== true) throw new Error("Invalid BoilComputeAndSaveResponseV1.ok");
  if (x.version !== 1) throw new Error("Invalid BoilComputeAndSaveResponseV1.version");

  const salts = isObject(x.salts) ? x.salts : {};
  const acid = x.acid;
  const overall = isObject(x.overall) ? x.overall : {};

  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x.settings, "BoilComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts.result, "BoilComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts.derivation, "BoilComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseBoilAcidBlock(acid, "BoilComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall.result, "BoilComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall.derivation, "BoilComputeAndSaveResponseV1.overall.derivation"),
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}
