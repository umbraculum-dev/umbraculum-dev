import type {
  WaterCalcDerivation,
  WaterCalcDerivationKind,
  WaterCalcDerivationLine,
  WaterCalcDerivationValue,
  WaterCalcNoteCode,
  WaterCalcUnit,
} from "./derivation";
import type { IonProfilePpm } from "./ionProfile";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function parseIonProfilePpm(v: unknown, label: string): IonProfilePpm {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) {
    if (!isFiniteNumber(v[k])) throw new Error(`Invalid ${label}.${String(k)}`);
  }
  return {
    calcium: v['calcium'] as number,
    magnesium: v['magnesium'] as number,
    sodium: v['sodium'] as number,
    sulfate: v['sulfate'] as number,
    chloride: v['chloride'] as number,
    bicarbonate: v['bicarbonate'] as number,
  };
}

export function parseDerivationValue(v: unknown, label: string): WaterCalcDerivationValue {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  if (v['kind'] === "number") {
    if (!isFiniteNumber(v['value'])) throw new Error(`Invalid ${label}.value`);
    const unit = typeof v['unit'] === "string" ? (v['unit'] as WaterCalcUnit) : undefined;
    return unit ? { kind: "number", value: v['value'], unit } : { kind: "number", value: v['value'] };
  }
  if (v['kind'] === "string") {
    if (typeof v['value'] !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: v['value'] };
  }
  if (v['kind'] === "boolean") {
    if (typeof v['value'] !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: v['value'] };
  }
  if (v['kind'] === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}

export function parseDerivationLine(v: unknown, label: string): WaterCalcDerivationLine {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const id = typeof v['id'] === "string" ? v['id'] : "";
  if (!id) throw new Error(`Invalid ${label}.id`);
  return { id, value: parseDerivationValue(v['value'], `${label}.value`) };
}

export function parseDerivation(v: unknown, label: string): WaterCalcDerivation {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = typeof v['kind'] === "string" ? v['kind'] : "";
  if (!kind) throw new Error(`Invalid ${label}.kind`);
  if (v['version'] !== 1) throw new Error(`Invalid ${label}.version`);
  const formulaId = typeof v['formulaId'] === "string" ? v['formulaId'] : "";
  if (!formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const inputs = Array.isArray(v['inputs'])
    ? v['inputs'].map((x: unknown, i: number) => parseDerivationLine(x, `${label}.inputs[${i}]`))
    : [];
  const intermediates = Array.isArray(v['intermediates'])
    ? v['intermediates'].map((x: unknown, i: number) => parseDerivationLine(x, `${label}.intermediates[${i}]`))
    : [];
  const breakdowns = Array.isArray(v['breakdowns'])
    ? v['breakdowns']
        .filter((b: unknown): b is Record<string, unknown> =>
          isObject(b) && typeof b['id'] === "string" && Array.isArray(b['rows']),
        )
        .map((b) => ({
          id: b['id'] as string,
          rows: (b['rows'] as unknown[]).filter((r): r is Record<string, WaterCalcDerivationValue> =>
            isObject(r),
          ),
        }))
    : undefined;
  const notes = Array.isArray(v['notes'])
    ? (v['notes'].filter((n: unknown): n is string => typeof n === "string") as WaterCalcNoteCode[])
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
