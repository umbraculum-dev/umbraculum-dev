import { patchRecipe } from "@umbraculum/api-client/brewery";
import {
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  type EditorMashStep,
} from "@umbraculum/brewery-beerjson";
import type { WaterVolumes } from "@umbraculum/brewery-recipes-ui";
import type { Dispatch, SetStateAction } from "react";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";

import type { NativeWaterMashStepsRecipe } from "./useNativeWaterMashStepsLoad";

export function useNativeWaterMashStepsSave(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  recipe: NativeWaterMashStepsRecipe | null;
  mashRows: EditorMashStep[];
  mashProcedure: { name: string; grainTemperatureC: number } | null;
  waterVolumes: WaterVolumes | null;
  derivedMashWaterVolumeLiters: number;
  computeFirstStepAmountL: number;
  setMashStepsDirty: Dispatch<SetStateAction<boolean>>;
  setMashStepsSaving: Dispatch<SetStateAction<boolean>>;
  setError: (value: string | null) => void;
  checkMashStepsBudget: () => boolean;
  onAfterSave: () => void;
}) {
  const {
    canCall,
    recipeId,
    baseUrl,
    token,
    recipe,
    mashRows,
    mashProcedure,
    waterVolumes,
    derivedMashWaterVolumeLiters,
    computeFirstStepAmountL,
    setMashStepsDirty,
    setMashStepsSaving,
    setError,
    checkMashStepsBudget,
    onAfterSave,
  } = params;

  const saveMashSteps = async () => {
    if (!canCall || !recipe?.beerJsonRecipeJson) return;
    setError(null);
    setMashStepsSaving(true);
    try {
      if (!checkMashStepsBudget()) return;

      const stepsForSave = mashRows.map((r, idx) => {
        if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
          return { ...r, amountL: waterVolumes.spargeLiters };
        }
        if (idx === 0 && r.type === "infusion" && derivedMashWaterVolumeLiters > 0) {
          return { ...r, amountL: computeFirstStepAmountL };
        }
        return r;
      });

      const mash =
        mashRows.length > 0 && mashProcedure
          ? { name: mashProcedure.name, grainTemperatureC: mashProcedure.grainTemperatureC, steps: stepsForSave }
          : mashRows.length > 0
            ? { name: "Mash", grainTemperatureC: 20, steps: stepsForSave }
            : null;
      const validation = validateMashBeforeSave(mash);
      if (!validation.ok) {
        setError(validation.errors);
        return;
      }
      const newDoc = replaceMashInBeerJsonDocument(recipe.beerJsonRecipeJson, mash);
      const extBase =
        recipe.recipeExtJson && typeof recipe.recipeExtJson === "object"
          ? recipe.recipeExtJson
          : ({ version: 1 } as Record<string, unknown>);
      const mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
          .filter(([k, v]) => k !== "0" && v === true),
      );
      const recipeExtJson = { ...(extBase as Record<string, unknown>), mashStepDeduceFromMashIn };
      const api = nativePlatformApiClient(token!, baseUrl);
      await patchRecipe(api, recipeId, {
        beerJsonRecipeJson: newDoc,
        recipeExtJson,
      });
      setMashStepsDirty(false);
      onAfterSave();
    } catch (err) {
      setError(String(err));
    } finally {
      setMashStepsSaving(false);
    }
  };

  return { saveMashSteps };
}
