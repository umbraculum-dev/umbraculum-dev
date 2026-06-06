export const SPARGE_ACID_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "phosphoric", label: "Phosphoric" },
  { value: "lactic", label: "Lactic" },
  { value: "hydrochloric", label: "Hydrochloric" },
  { value: "sulfuric", label: "Sulfuric" },
  { value: "acetic", label: "Acetic" },
  { value: "citric", label: "Citric (solid)" },
  { value: "tartaric", label: "Tartaric (solid)" },
  { value: "malic", label: "Malic (solid)" },
];

export const SPARGE_STRENGTH_KIND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "percent", label: "Percent (%)" },
  { value: "normality", label: "Normality (N)" },
  { value: "molarity", label: "Molarity (M)" },
  { value: "solid", label: "Solid (pure)" },
];

export type NativeWaterAcidificationResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
};

export type NativeWaterAcidificationManualResult = {
  achievedPh: number;
  predicted: { finalAlkalinityPpmCaCO3: number; sulfateAddedPpm: number; chlorideAddedPpm: number };
};

export type NativeWaterAcidStrengthKind = "percent" | "normality" | "molarity" | "solid";

export type NativeWaterAcidificationMode = "targetPh" | "manual";
