import type { DevAuth } from "../../../../_lib/devAuth";
import { apiFetch } from "./api";

export type RecipeWaterSettings = {
  id: string;
  accountId: string;
  recipeId: string;

  sourceWaterProfileId: string | null;
  targetWaterProfileId: string | null;
  dilutionWaterProfileId: string | null;

  tapWaterVolumeLiters: number | null;
  dilutionWaterVolumeLiters: number | null;

  mashStartingAlkalinityPpmCaCO3: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashWaterVolumeLiters: number;
  mashAcidType: string;
  mashStrengthKind: string;
  mashStrengthValue: number | null;

  mashLastAcidRequiredMl: number | null;
  mashLastAcidRequiredTsp: number | null;
  mashLastAcidRequiredGrams: number | null;
  mashLastAcidRequiredKg: number | null;
  mashLastFinalAlkalinityPpmCaCO3: number | null;
  mashLastSulfateAddedPpm: number | null;
  mashLastChlorideAddedPpm: number | null;
  mashLastCalculatedAt: string | null;

  mashAcidificationMode: string;
  mashManualAcidAddedMl: number | null;
  mashManualAcidAddedGrams: number | null;
  mashManualLastAchievedPh: number | null;
  mashManualLastFinalAlkalinityPpmCaCO3: number | null;
  mashManualLastSulfateAddedPpm: number | null;
  mashManualLastChlorideAddedPpm: number | null;
  mashManualLastCalculatedAt: string | null;

  mashSaltAdditionsJson: unknown;
  mashSaltsLastResultJson: unknown;

  mashOverallLastResultJson?: unknown;
  mashOverallLastCalculatedAt?: string | null;

  mashGristImportedJson?: unknown;
  mashGristImportedAt?: string | null;
  mashGristSourceRecipeUpdatedAt?: string | null;

  spargeWaterProfileId?: string | null;
  spargeStartingAlkalinityPpmCaCO3: number;
  spargeStartingPh: number;
  spargeTargetPh: number;
  spargeVolumeLiters: number;
  spargeAcidType: string;
  spargeStrengthKind: string;
  spargeStrengthValue: number | null;

  spargeAcidificationMode?: string;
  spargeManualAcidAddedMl?: number | null;
  spargeManualAcidAddedGrams?: number | null;
  spargeManualLastAchievedPh?: number | null;
  spargeManualLastFinalAlkalinityPpmCaCO3?: number | null;
  spargeManualLastSulfateAddedPpm?: number | null;
  spargeManualLastChlorideAddedPpm?: number | null;
  spargeManualLastCalculatedAt?: string | null;

  spargeSaltAdditionsJson?: unknown;
  spargeSaltsLastResultJson?: unknown;

  spargeLastAcidRequiredMl: number | null;
  spargeLastAcidRequiredTsp: number | null;
  spargeLastAcidRequiredGrams: number | null;
  spargeLastAcidRequiredKg: number | null;
  spargeLastFinalAlkalinityPpmCaCO3: number | null;
  spargeLastSulfateAddedPpm: number | null;
  spargeLastChlorideAddedPpm: number | null;
  spargeLastCalculatedAt: string | null;
};

export type RecipeWaterSettingsResponse = { ok: true; settings: RecipeWaterSettings | null };

export async function fetchRecipeWaterSettings(recipeId: string, auth: DevAuth) {
  const res = await apiFetch(`/api/recipes/${recipeId}/water-settings`, auth);
  if (!res.ok) throw new Error(JSON.stringify(res.data));
  return res.data as RecipeWaterSettingsResponse;
}

export async function saveRecipeWaterSettings(recipeId: string, auth: DevAuth, patch: Record<string, unknown>) {
  const res = await apiFetch(`/api/recipes/${recipeId}/water-settings`, auth, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(JSON.stringify(res.data));
  return res.data as { ok: true; settings: RecipeWaterSettings };
}

