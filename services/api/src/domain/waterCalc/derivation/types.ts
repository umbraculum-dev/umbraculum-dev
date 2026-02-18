export type WaterCalcDerivationKind =
  | "salt_additions"
  | "acidification"
  | "mash_overall"
  | "sparge_overall"
  | "boil_overall"
  | "analysis.abv"
  | "analysis.ibu_tinseth"
  | "analysis.ibu_rager"
  | "analysis.kettle_volume"
  | "analysis.pre_boil_volume"
  | "analysis.og"
  | "analysis.fg"
  | "analysis.attenuation"
  | "analysis.pbg";

export type WaterCalcUnit =
  | "L"
  | "g"
  | "mL"
  | "ppm"
  | "ppm_as_CaCO3"
  | "pH"
  | "percent"
  | "sg"
  | "ibu"
  | "h"
  | "percent_per_hour"
  | "L_per_kg"
  | "mEq_per_L"
  | "mmol_per_L";

export type WaterCalcDerivationValue =
  | { kind: "number"; value: number; unit?: WaterCalcUnit }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "null" };

export interface WaterCalcDerivationLine {
  id: string;
  value: WaterCalcDerivationValue;
}

export interface WaterCalcDerivation {
  kind: WaterCalcDerivationKind;
  version: 1;
  /**
   * Human-readable formula identifier (stable, versioned).
   * Clients can map this to localized formula skeleton text.
   */
  formulaId: string;
  /** Key input values the computation used. */
  inputs: WaterCalcDerivationLine[];
  /** Key intermediate values (debug-style), for explaining “how”. */
  intermediates: WaterCalcDerivationLine[];
  /**
   * Optional breakdown blocks, intended for capped, readability-first explainability.
   * Example: per-salt ion delta contributions.
   */
  breakdowns?: Array<{
    id: string;
    rows: Array<Record<string, WaterCalcDerivationValue>>;
  }>;
  /**
   * Optional short notes (non-localized, machine-readable).
   * Clients can map note codes to localized copy.
   */
  notes?: string[];
}

export function derivationNumber(value: number, unit?: WaterCalcUnit): WaterCalcDerivationValue {
  return { kind: "number", value, unit };
}

export function derivationString(value: string): WaterCalcDerivationValue {
  return { kind: "string", value };
}

export function derivationBoolean(value: boolean): WaterCalcDerivationValue {
  return { kind: "boolean", value };
}

export function derivationNull(): WaterCalcDerivationValue {
  return { kind: "null" };
}

export function capRows<T>(rows: T[], max: number): { kept: T[]; omittedCount: number } {
  if (rows.length <= max) return { kept: rows, omittedCount: 0 };
  return { kept: rows.slice(0, max), omittedCount: rows.length - max };
}

