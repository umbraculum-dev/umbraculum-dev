export type NumberFormatUnit =
  | "pH"
  | "ppm"
  | "ppm_as_CaCO3"
  | "L"
  | "mL"
  | "g"
  | "kg"
  | "gal"
  | "qt"
  | "pt"
  | "fl_oz"
  | "lb"
  | "oz"
  | "percent"
  | "sg"
  | "ibu"
  | "srm"
  | "min";

export interface NumberFormatHintV1 {
  version: 1;
  style: "fixed" | "significant";
  decimals: number;
  unit?: NumberFormatUnit | undefined;
  clamp?: { min?: number | undefined; max?: number | undefined } | undefined;
}

