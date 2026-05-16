import type {
  GravityAnalysisCanonicalModelsV1,
  GravityAnalysisResponseV1,
  GravityAnalysisResultV1,
  GravityAnalysisWarningCode,
} from "./gravityAnalysis";
import type { NumberFormatHintV1, NumberFormatUnit } from "../format/numberFormat";
import type {
  WaterCalcDerivation,
  WaterCalcDerivationKind,
  WaterCalcDerivationLine,
  WaterCalcDerivationValue,
  WaterCalcNoteCode,
  WaterCalcUnit,
} from "../water/derivation";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function parseCanonicalModels(v: unknown): GravityAnalysisCanonicalModelsV1 {
  const o = isObject(v) ? v : null;
  const ibu = o?.ibu === "tinseth" || o?.ibu === "rager" ? o.ibu : "tinseth";
  const srm = o?.srm === "morey" || o?.srm === "daniels" ? o.srm : "morey";
  return { ibu, srm };
}

function parseNumberFormatHintV1(v: unknown, label: string): NumberFormatHintV1 {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  if (v.version !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v.style === "fixed" || v.style === "significant" ? v.style : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber(v.decimals) ? v.decimals : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unit = typeof v.unit === "string" ? v.unit : undefined;
  const clamp = isObject(v.clamp)
    ? {
        min: isFiniteNumber(v.clamp.min) ? v.clamp.min : undefined,
        max: isFiniteNumber(v.clamp.max) ? v.clamp.max : undefined,
      }
    : undefined;
  return { version: 1, style, decimals, unit: unit as NumberFormatUnit | undefined, clamp };
}

function parseDerivationLineValue(v: unknown, label: string): WaterCalcDerivationValue {
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

function parseDerivation(v: unknown, label: string): WaterCalcDerivation {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  if (typeof v.kind !== "string" || !v.kind) throw new Error(`Invalid ${label}.kind`);
  if (v.version !== 1) throw new Error(`Invalid ${label}.version`);
  if (typeof v.formulaId !== "string" || !v.formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const parseLine = (x: unknown, i: number, base: string): WaterCalcDerivationLine => {
    if (!isObject(x)) throw new Error(`Invalid ${base}[${i}]`);
    if (typeof x.id !== "string" || !x.id) throw new Error(`Invalid ${base}[${i}].id`);
    return { id: x.id, value: parseDerivationLineValue(x.value, `${base}[${i}].value`) };
  };
  const inputs = Array.isArray(v.inputs) ? v.inputs.map((x: unknown, i: number) => parseLine(x, i, `${label}.inputs`)) : [];
  const intermediates = Array.isArray(v.intermediates)
    ? v.intermediates.map((x: unknown, i: number) => parseLine(x, i, `${label}.intermediates`))
    : [];
  return {
    kind: v.kind as WaterCalcDerivationKind,
    version: 1,
    formulaId: v.formulaId,
    inputs,
    intermediates,
    breakdowns: Array.isArray(v.breakdowns)
      ? (v.breakdowns as Array<{ id: string; rows: Array<Record<string, WaterCalcDerivationValue>> }>)
      : undefined,
    notes: Array.isArray(v.notes)
      ? (v.notes.filter((n: unknown): n is string => typeof n === "string") as WaterCalcNoteCode[])
      : undefined,
  };
}

export function parseGravityAnalysisResponseV1(x: unknown): GravityAnalysisResponseV1 {
  if (!isObject(x)) throw new Error("Invalid GravityAnalysisResponseV1");
  if (x.ok !== true) throw new Error("Invalid GravityAnalysisResponseV1.ok");
  if (x.version !== 1) throw new Error("Invalid GravityAnalysisResponseV1.version");

  const canonicalModels = parseCanonicalModels(x.canonicalModels);

  if (!isObject(x.result)) throw new Error("Invalid GravityAnalysisResponseV1.result");
  const r = x.result;

  const warningsRaw = Array.isArray(r.warnings) ? r.warnings : [];
  const warnings = warningsRaw
    .map((w: unknown): string => (isObject(w) && typeof w.code === "string" ? w.code : ""))
    .filter((c: string): boolean => Boolean(c))
    .map((code: string) => ({ code: code as GravityAnalysisWarningCode }));

  const result: GravityAnalysisResultV1 = {
    boilTimeMinutes: r.boilTimeMinutes === null ? null : isFiniteNumber(r.boilTimeMinutes) ? r.boilTimeMinutes : null,
    kettleVolumeLiters: r.kettleVolumeLiters === null ? null : isFiniteNumber(r.kettleVolumeLiters) ? r.kettleVolumeLiters : null,
    preBoilVolumeLiters: r.preBoilVolumeLiters === null ? null : isFiniteNumber(r.preBoilVolumeLiters) ? r.preBoilVolumeLiters : null,
    ogEstimatedSg: r.ogEstimatedSg === null ? null : isFiniteNumber(r.ogEstimatedSg) ? r.ogEstimatedSg : null,
    pbgEstimatedSg: r.pbgEstimatedSg === null ? null : isFiniteNumber(r.pbgEstimatedSg) ? r.pbgEstimatedSg : null,
    ibuTinsethEstimated: r.ibuTinsethEstimated === null ? null : isFiniteNumber(r.ibuTinsethEstimated) ? r.ibuTinsethEstimated : null,
    ibuRagerEstimated: r.ibuRagerEstimated === null ? null : isFiniteNumber(r.ibuRagerEstimated) ? r.ibuRagerEstimated : null,
    buGuRatio: r.buGuRatio === null ? null : isFiniteNumber(r.buGuRatio) ? r.buGuRatio : null,
    colorSrmMoreyEstimated:
      r.colorSrmMoreyEstimated === null ? null : isFiniteNumber(r.colorSrmMoreyEstimated) ? r.colorSrmMoreyEstimated : null,
    colorSrmDanielsEstimated:
      r.colorSrmDanielsEstimated === null ? null : isFiniteNumber(r.colorSrmDanielsEstimated) ? r.colorSrmDanielsEstimated : null,
    fgEstimatedSg: r.fgEstimatedSg === null ? null : isFiniteNumber(r.fgEstimatedSg) ? r.fgEstimatedSg : null,
    abvEstimatedPercent: r.abvEstimatedPercent === null ? null : isFiniteNumber(r.abvEstimatedPercent) ? r.abvEstimatedPercent : null,
    attenuationEffectivePercent:
      r.attenuationEffectivePercent === null ? null : isFiniteNumber(r.attenuationEffectivePercent) ? r.attenuationEffectivePercent : null,
    warnings,
  };

  const derivationsOut: Record<string, WaterCalcDerivation> = {};
  if (isObject(x.derivations)) {
    for (const [k, val] of Object.entries(x.derivations)) {
      try {
        derivationsOut[k] = parseDerivation(val, `GravityAnalysisResponseV1.derivations.${k}`);
      } catch {
        // ignore invalid derivation entries
      }
    }
  }

  const hintsOut: Record<string, NumberFormatHintV1> = {};
  if (isObject(x.formatHints)) {
    for (const [k, val] of Object.entries(x.formatHints)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(val, `GravityAnalysisResponseV1.formatHints.${k}`);
      } catch {
        // ignore invalid hint entries
      }
    }
  }

  return {
    ok: true,
    version: 1,
    canonicalModels,
    result,
    derivations: derivationsOut,
    formatHints: hintsOut,
  };
}
