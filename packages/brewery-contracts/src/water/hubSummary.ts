import type { IonProfilePpm } from "./ionProfile";
import type { NumberFormatHintV1 } from "@umbraculum/contracts";

export type WaterHubFormatHintKeys = "L" | "pH" | "ppm_as_CaCO3" | "g" | "mL";

export interface ExpectedRaRange {
  min: number;
  max: number;
  rationaleKey: "styleExpectedRaDark" | "styleExpectedRaPale" | "styleExpectedRaAmber";
}

export interface RecipeWaterHubStreamSummary {
  key: "mash" | "sparge" | "boil";
  volumeLiters: number | null;
  ph: number | null;
  finalAlkalinityPpmCaCO3: number | null;
  ionsPpm: IonProfilePpm | null;
  saltsBreakdown: Array<{ saltKey: string; grams: number }> | null;
  acidType: string | null;
  acidMode: "manual" | "required" | null;
  acidStrengthKind: string | null;
  acidStrengthValue: number | null;
  acidAmountMl: number | null;
  acidAmountGrams: number | null;
}

export interface RecipeWaterHubSummary {
  version: 1;
  status: {
    mashAcidificationMode: string | null;
    spargeAcidificationMode: string | null;
    boilAcidificationMode: string | null;
    mashLastCalculatedAt: string | null;
    spargeLastCalculatedAt: string | null;
    boilLastCalculatedAt: string | null;
    mashOverallSnapshot: null | {
      ph: { kind: "target" | "estimated"; value: number };
      finalAlkalinityPpmCaCO3: number;
    };
  };
  streams: RecipeWaterHubStreamSummary[];
  merged: {
    totalVolumeLiters: number;
    ph: number | null;
    finalAlkalinityPpmCaCO3: number | null;
    ionsPpm: IonProfilePpm | null;
  };
  finalRecap: {
    predictedMashPh: null | { kind: "target" | "estimated"; value: number };
    residualAlkalinityMashOverallPpmCaCO3: number | null;
    residualAlkalinityMergedPpmCaCO3: number | null;
    styleExpectedRa: ExpectedRaRange | null;
  };
}

export interface RecipeWaterHubSummaryResponse {
  ok: true;
  summary: RecipeWaterHubSummary;
  formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
}

