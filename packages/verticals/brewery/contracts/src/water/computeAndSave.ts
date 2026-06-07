import type { IonProfilePpm } from "./ionProfile";
import type { WaterCalcDerivation } from "./derivation";
import type { NumberFormatHintV1 } from "@umbraculum/contracts";

export interface RecipeWaterSettingsSavedRef {
  recipeId: string;
}

export type WaterSaltAdditionsResult = {
  baseProfile: IonProfilePpm;
  resultingProfile: IonProfilePpm;
  deltasPpm: IonProfilePpm;
  breakdown: Array<{ saltKey: string; grams: number; deltasPpm: Partial<IonProfilePpm> }>;
};

export type WaterAcidificationResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
  debug?: Record<string, unknown> | undefined;
};

export type WaterAcidificationManualResult = {
  achievedPh: number;
  predicted: WaterAcidificationResult;
  clamped: "none" | "low" | "high";
  iterations: number;
  targetAmount: number;
  predictedAmount: number;
};

export type MashAcidificationTargetMashPhResult = WaterAcidificationResult & {
  estimatedMashPhRoomTemp: number;
};

export type WaterOverallResult = {
  calculatedAt: string;
  ionsPpm: IonProfilePpm;
  finalAlkalinityPpmCaCO3: number;
  ph: { kind: "target" | "estimated"; value: number };
  debug?: Record<string, unknown> | undefined;
};

export type MashAcidComputeBlock =
  | {
      kind: "mash_acidification_manual";
      mode: "manual";
      result: WaterAcidificationManualResult;
      derivation: WaterCalcDerivation;
    }
  | {
      kind: "mash_acidification_target_mash_ph";
      mode: "targetPh";
      result: MashAcidificationTargetMashPhResult;
      derivation: WaterCalcDerivation;
    }
  | {
      kind: "mash_acidification";
      mode: "targetPh";
      result: WaterAcidificationResult;
      derivation: WaterCalcDerivation;
    };

export type SpargeAcidComputeBlock =
  | {
      kind: "sparge_acidification_manual";
      mode: "manual";
      result: WaterAcidificationManualResult;
      derivation: WaterCalcDerivation;
    }
  | {
      kind: "sparge_acidification";
      mode: "targetPh";
      result: WaterAcidificationResult;
      derivation: WaterCalcDerivation;
    };

export type BoilAcidComputeBlock =
  | {
      kind: "boil_acidification_manual";
      mode: "manual";
      result: WaterAcidificationManualResult;
      derivation: WaterCalcDerivation;
    }
  | {
      kind: "boil_acidification";
      mode: "targetPh";
      result: WaterAcidificationResult;
      derivation: WaterCalcDerivation;
    };

export interface MashComputeAndSaveRequest {
  sourceWaterProfileId: string;
  dilutionWaterProfileId: string | null;
  tapWaterVolumeLiters: number;
  dilutionWaterVolumeLiters: number;

  mashStartingAlkalinityPpmCaCO3: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: string;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  mashStrengthValue: number | null;
  mashAcidificationMode: "targetPh" | "manual";
  mashManualAcidAddedMl: number | null;
  mashManualAcidAddedGrams: number | null;

  mashSaltAdditionsJson: unknown;
  grist?: Array<{ amountKg: number; colorLovibond: number | null; maltClass: "base" | "crystal" | "roast" | "acid" }>;
}

export interface SpargeComputeAndSaveRequest {
  spargeWaterProfileId: string;
  spargeSaltAdditionsJson: unknown;
  spargeStartingAlkalinityPpmCaCO3: number;
  spargeStartingPh: number;
  spargeTargetPh: number;
  spargeVolumeLiters: number;
  spargeAcidType: string;
  spargeStrengthKind: "percent" | "normality" | "molarity" | "solid";
  spargeStrengthValue: number | null;
  spargeAcidificationMode: "targetPh" | "manual";
  spargeManualAcidAddedMl: number | null;
  spargeManualAcidAddedGrams: number | null;
}

export interface BoilComputeAndSaveRequest {
  boilSourceWaterProfileId: string;
  boilDilutionWaterProfileId: string | null;
  boilTapWaterVolumeLiters: number;
  boilDilutionWaterVolumeLiters: number;

  boilStartingAlkalinityPpmCaCO3: number;
  boilStartingPh: number;
  boilTargetPh: number;
  boilAcidType: string;
  boilStrengthKind: "percent" | "normality" | "molarity" | "solid";
  boilStrengthValue: number | null;
  boilAcidificationMode: "targetPh" | "manual";
  boilManualAcidAddedMl: number | null;
  boilManualAcidAddedGrams: number | null;

  boilSaltAdditionsJson: unknown;
}

export interface MashComputeAndSaveResponseV1 {
  ok: true;
  version: 1;
  settings: RecipeWaterSettingsSavedRef;
  salts: { result: WaterSaltAdditionsResult; derivation: WaterCalcDerivation };
  acid: MashAcidComputeBlock;
  overall: { result: WaterOverallResult; derivation: WaterCalcDerivation };
  formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
}

export interface SpargeComputeAndSaveResponseV1 {
  ok: true;
  version: 1;
  settings: RecipeWaterSettingsSavedRef;
  salts: { result: WaterSaltAdditionsResult; derivation: WaterCalcDerivation };
  acid: SpargeAcidComputeBlock;
  formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
}

export interface BoilComputeAndSaveResponseV1 {
  ok: true;
  version: 1;
  settings: RecipeWaterSettingsSavedRef;
  salts: { result: WaterSaltAdditionsResult; derivation: WaterCalcDerivation };
  acid: BoilAcidComputeBlock;
  overall: { result: WaterOverallResult; derivation: WaterCalcDerivation };
  formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
}

