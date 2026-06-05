import type { GravityAnalysisWarningCode } from "@umbraculum/contracts";

export interface GravityAnalysisWarning {
  code: GravityAnalysisWarningCode;
  message?: string;
}

export interface GravityAnalysis {
  boilTimeMinutes: number | null;
  kettleVolumeLiters: number | null;
  preBoilVolumeLiters: number | null;
  ogEstimatedSg: number | null;
  pbgEstimatedSg: number | null;
  ibuTinsethEstimated: number | null;
  ibuRagerEstimated: number | null;
  buGuRatio: number | null;
  colorSrmMoreyEstimated: number | null;
  colorSrmDanielsEstimated: number | null;
  fgEstimatedSg: number | null;
  abvEstimatedPercent: number | null;
  attenuationEffectivePercent: number | null;
  warnings: GravityAnalysisWarning[];
}

export interface ExtractedEquipment {
  kettleCapacityLiters: number | null;
  kettleLossesLiters: number;
  kettleBoilEvaporationRatePercentPerHour: number;
  kettleCoolingShrinkagePercent: number;
  kettleHopsAbsorptionLitersPerGram: number;
  mashLossesLiters: number;
  mashGrainAbsorptionLPerKg: number;
  mashWaterLeftoverLiters: number;
  mashEfficiencyPercent: number | null;
  otherLossesLiters: number;
}

export interface ExtractedYeastAttenuation {
  id: string;
  attenuationPercent: number | null;
  overridePercent: number | null;
}

export type HopUse = "boil" | "whirlpool" | "dryhop";
export type HopForm = "extract" | "leaf" | "leaf (wet)" | "pellet" | "powder" | "plug" | "debittered_leaf" | "hop_extract";

export interface ExtractedHopAddition {
  id: string | null;
  name: string | null;
  form: HopForm | null;
  use: HopUse;
  timeMinutes: number | null;
  amountGrams: number | null;
  alphaAcidPercent: number | null;
}

export interface ExtractedFermentableForColor {
  pounds: number;
  lovibond: number;
}

export const KG_TO_LB = 2.204_622_621_8;
export const L_TO_GAL = 0.264_172_052_4;
export const ABV_FACTOR = 131.25;
export const WHIRLPOOL_UTILIZATION_MULTIPLIER = 0.5;
export const WET_HOPS_DRY_EQUIVALENT_WEIGHT_FACTOR = 4.5;

export const HOP_FORM_FACTOR: Record<HopForm, number> = {
  pellet: 1,
  leaf: 0.9,
  plug: 0.9,
  "leaf (wet)": 1 / WET_HOPS_DRY_EQUIVALENT_WEIGHT_FACTOR,
  powder: 1,
  extract: 1,
  hop_extract: 1,
  debittered_leaf: 0.5,
};

export function safeNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
