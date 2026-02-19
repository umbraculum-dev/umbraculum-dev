import type { GravityAnalysisResponseV1, GravityAnalysisWarningCode, NumberFormatHintV1, WaterCalcDerivation } from "@brewery/contracts";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
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

function parseDerivationLineValue(v: unknown, label: string): any {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  if (o.kind === "number") {
    if (!isFiniteNumber(o.value)) throw new Error(`Invalid ${label}.value`);
    const unit = typeof o.unit === "string" ? o.unit : undefined;
    return unit ? { kind: "number", value: o.value, unit } : { kind: "number", value: o.value };
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

function parseDerivation(v: unknown, label: string): WaterCalcDerivation {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v as any;
  if (typeof o.kind !== "string" || !o.kind) throw new Error(`Invalid ${label}.kind`);
  if (o.version !== 1) throw new Error(`Invalid ${label}.version`);
  if (typeof o.formulaId !== "string" || !o.formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const parseLine = (x: unknown, i: number, base: string) => {
    if (!x || typeof x !== "object") throw new Error(`Invalid ${base}[${i}]`);
    const l = x as any;
    if (typeof l.id !== "string" || !l.id) throw new Error(`Invalid ${base}[${i}].id`);
    return { id: l.id, value: parseDerivationLineValue(l.value, `${base}[${i}].value`) };
  };
  const inputs = Array.isArray(o.inputs) ? o.inputs.map((x: unknown, i: number) => parseLine(x, i, `${label}.inputs`)) : [];
  const intermediates = Array.isArray(o.intermediates)
    ? o.intermediates.map((x: unknown, i: number) => parseLine(x, i, `${label}.intermediates`))
    : [];
  return {
    kind: o.kind,
    version: 1,
    formulaId: o.formulaId,
    inputs,
    intermediates,
    breakdowns: Array.isArray(o.breakdowns) ? (o.breakdowns as any) : undefined,
    notes: Array.isArray(o.notes) ? (o.notes.filter((n: unknown) => typeof n === "string") as any) : undefined,
  } as any;
}

export function parseGravityAnalysisResponseV1(x: unknown): GravityAnalysisResponseV1 {
  if (!x || typeof x !== "object") throw new Error("Invalid GravityAnalysisResponseV1");
  const root = x as any;
  if (root.ok !== true) throw new Error("Invalid GravityAnalysisResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid GravityAnalysisResponseV1.version");

  const r = root.result;
  if (!r || typeof r !== "object") throw new Error("Invalid GravityAnalysisResponseV1.result");
  const rr = r as any;

  const warningsRaw = Array.isArray(rr.warnings) ? rr.warnings : [];
  const warnings = warningsRaw
    .map((w: any) => (w && typeof w === "object" ? (typeof w.code === "string" ? w.code : "") : ""))
    .filter((c: string) => Boolean(c))
    .map((code: string) => ({ code: code as GravityAnalysisWarningCode }));

  const result = {
    kettleVolumeLiters: rr.kettleVolumeLiters === null ? null : isFiniteNumber(rr.kettleVolumeLiters) ? rr.kettleVolumeLiters : null,
    preBoilVolumeLiters: rr.preBoilVolumeLiters === null ? null : isFiniteNumber(rr.preBoilVolumeLiters) ? rr.preBoilVolumeLiters : null,
    ogEstimatedSg: rr.ogEstimatedSg === null ? null : isFiniteNumber(rr.ogEstimatedSg) ? rr.ogEstimatedSg : null,
    pbgEstimatedSg: rr.pbgEstimatedSg === null ? null : isFiniteNumber(rr.pbgEstimatedSg) ? rr.pbgEstimatedSg : null,
    ibuTinsethEstimated: rr.ibuTinsethEstimated === null ? null : isFiniteNumber(rr.ibuTinsethEstimated) ? rr.ibuTinsethEstimated : null,
    ibuRagerEstimated: rr.ibuRagerEstimated === null ? null : isFiniteNumber(rr.ibuRagerEstimated) ? rr.ibuRagerEstimated : null,
    colorSrmMoreyEstimated:
      rr.colorSrmMoreyEstimated === null ? null : isFiniteNumber(rr.colorSrmMoreyEstimated) ? rr.colorSrmMoreyEstimated : null,
    colorSrmDanielsEstimated:
      rr.colorSrmDanielsEstimated === null ? null : isFiniteNumber(rr.colorSrmDanielsEstimated) ? rr.colorSrmDanielsEstimated : null,
    fgEstimatedSg: rr.fgEstimatedSg === null ? null : isFiniteNumber(rr.fgEstimatedSg) ? rr.fgEstimatedSg : null,
    abvEstimatedPercent: rr.abvEstimatedPercent === null ? null : isFiniteNumber(rr.abvEstimatedPercent) ? rr.abvEstimatedPercent : null,
    attenuationEffectivePercent:
      rr.attenuationEffectivePercent === null ? null : isFiniteNumber(rr.attenuationEffectivePercent) ? rr.attenuationEffectivePercent : null,
    warnings,
  };

  const derivationsOut: Record<string, WaterCalcDerivation> = {};
  const d = root.derivations;
  if (d && typeof d === "object") {
    for (const [k, v] of Object.entries(d as Record<string, unknown>)) {
      try {
        derivationsOut[k] = parseDerivation(v, `GravityAnalysisResponseV1.derivations.${k}`);
      } catch {
        // ignore invalid derivation entries
      }
    }
  }

  const hintsOut: Record<string, NumberFormatHintV1> = {};
  const h = root.formatHints;
  if (h && typeof h === "object") {
    for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(v, `GravityAnalysisResponseV1.formatHints.${k}`);
      } catch {
        // ignore invalid hint entries
      }
    }
  }

  return {
    ok: true,
    version: 1,
    result: result as any,
    derivations: derivationsOut as any,
    formatHints: hintsOut as any,
  };
}

