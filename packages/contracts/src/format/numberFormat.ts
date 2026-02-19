export type NumberFormatUnit =
  | "pH"
  | "ppm"
  | "ppm_as_CaCO3"
  | "L"
  | "mL"
  | "g"
  | "kg"
  | "percent"
  | "sg"
  | "ibu"
  | "srm";

export interface NumberFormatHintV1 {
  version: 1;
  style: "fixed" | "significant";
  decimals: number;
  unit?: NumberFormatUnit;
  clamp?: { min?: number; max?: number };
}

