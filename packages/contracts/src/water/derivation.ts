export type WaterCalcDerivationKind =
  | "salt_additions"
  | "acidification"
  | "mash_overall"
  | "sparge_overall"
  | "boil_overall";

export type WaterCalcUnit =
  | "L"
  | "g"
  | "mL"
  | "ppm"
  | "ppm_as_CaCO3"
  | "pH"
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

export type WaterCalcNoteCode = "counter_ions_only_for_sulfuric_or_hydrochloric";

export interface WaterCalcDerivation {
  kind: WaterCalcDerivationKind;
  version: 1;
  formulaId: string;
  inputs: WaterCalcDerivationLine[];
  intermediates: WaterCalcDerivationLine[];
  breakdowns?: Array<{
    id: string;
    rows: Array<Record<string, WaterCalcDerivationValue>>;
  }>;
  notes?: WaterCalcNoteCode[];
}

