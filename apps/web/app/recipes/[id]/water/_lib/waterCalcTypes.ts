import type { SaltKey } from "@umbraculum/brewery-recipes-ui";

import type { IonProfilePpm } from "./waterChem";

export type WaterAcidResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;
  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;
};

export type WaterManualCalcResult = {
  achievedPh: number;
  predicted: WaterAcidResult;
  clamped: "none" | "low" | "high";
  iterations: number;
  targetAmount: number;
  predictedAmount: number;
};

export type SaltAdditionsResult = {
  baseProfile: IonProfilePpm;
  resultingProfile: IonProfilePpm;
  deltasPpm: IonProfilePpm;
  breakdown: Array<{ saltKey: SaltKey; grams: number; deltasPpm: Partial<IonProfilePpm> }>;
};

export type BoilOverallResultV0 = {
  calculatedAt: string;
  ionsPpm: IonProfilePpm;
  finalAlkalinityPpmCaCO3: number;
  ph: { kind: "target" | "estimated"; value: number };
  debug: {
    startingAlkalinityPpmCaCO3: number;
    startingAlkalinityAfterSaltsPpmCaCO3: number;
    saltsDeltaBicarbonatePpm: number;
    acidSulfateAddedPpm: number;
    acidChlorideAddedPpm: number;
    boilMode: "targetPh" | "manual";
  };
};

export type WaterStrengthKind = "percent" | "normality" | "molarity" | "solid";

export type WaterAcidificationMode = "targetPh" | "manual";

export function parseWaterStrengthKind(raw: unknown): WaterStrengthKind {
  return raw === "percent" || raw === "normality" || raw === "molarity" || raw === "solid"
    ? raw
    : "percent";
}
