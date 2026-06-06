import type { NumberFormatHintV1 } from "@umbraculum/contracts";
import type { WaterCalcDerivation } from "../water/derivation";

export type GravityAnalysisWarningCode =
  | "missing_beerjson"
  | "missing_water_settings"
  | "missing_water_volumes"
  | "invalid_runoff_volume"
  | "invalid_evaporation"
  | "invalid_kettle_volume"
  | "exceeds_kettle_capacity"
  | "missing_efficiency"
  | "missing_fermentables"
  | "missing_color_volume"
  | "missing_fermentable_colors"
  | "used_batch_size_volume"
  | "missing_ibu_gravity"
  | "missing_ibu_inputs"
  | "missing_attenuation";

export interface GravityAnalysisWarningV1 {
  code: GravityAnalysisWarningCode;
}

export type GravityAnalysisIbuModelV1 = "tinseth" | "rager";

export type GravityAnalysisSrmModelV1 = "morey" | "daniels";

export interface GravityAnalysisCanonicalModelsV1 {
  ibu: GravityAnalysisIbuModelV1;
  srm: GravityAnalysisSrmModelV1;
}

export interface GravityAnalysisResultV1 {
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
  warnings: GravityAnalysisWarningV1[];
}

export type GravityAnalysisDerivationKind =
  | "analysis.abv"
  | "analysis.ibu_tinseth"
  | "analysis.ibu_rager"
  | "analysis.mcu"
  | "analysis.srm_morey"
  | "analysis.srm_daniels"
  | "analysis.kettle_volume"
  | "analysis.pre_boil_volume"
  | "analysis.og"
  | "analysis.fg"
  | "analysis.attenuation"
  | "analysis.pbg";

export interface GravityAnalysisResponseV1 {
  ok: true;
  version: 1;
  canonicalModels: GravityAnalysisCanonicalModelsV1;
  result: GravityAnalysisResultV1;
  derivations: Partial<Record<GravityAnalysisDerivationKind, WaterCalcDerivation>>;
  formatHints: Partial<Record<keyof GravityAnalysisResultV1, NumberFormatHintV1>>;
}

