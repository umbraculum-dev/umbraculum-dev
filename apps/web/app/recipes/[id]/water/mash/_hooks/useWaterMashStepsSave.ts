"use client";

import { type Dispatch, type SetStateAction } from "react";

import { getRecipe, patchRecipe } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../_lib/typeGuards";
import {
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  type EditorMashStep,
} from "../../../../_lib/beerjsonRecipe";

import type { WaterMashStepsRecipe } from "./useWaterMashStepsLoad";

export function useWaterMashStepsSave(params: {
  canCall: boolean;
  recipeId: string;
  recipe: WaterMashStepsRecipe | null;
  setRecipe: Dispatch<SetStateAction<WaterMashStepsRecipe | null>>;
  mashRows: EditorMashStep[];
  mashProcedure: { name: string; grainTemperatureC: number } | null;
  waterVolumes: { mashLiters: number; spargeLiters: number } | null;
  derivedMashWaterVolumeLiters: number;
  computeFirstStepAmountL: number;
  setMashStepsDirty: Dispatch<SetStateAction<boolean>>;
  setMashStepsSaveError: Dispatch<SetStateAction<string | null>>;
  setMashStepsSaveStatus: Dispatch<SetStateAction<string | null>>;
  setMashStepsSaving: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    canCall,
    recipeId,
    recipe,
    setRecipe,
    mashRows,
    mashProcedure,
    waterVolumes,
    derivedMashWaterVolumeLiters,
    computeFirstStepAmountL,
    setMashStepsDirty,
    setMashStepsSaveError,
    setMashStepsSaveStatus,
    setMashStepsSaving,
  } = params;

  const saveMashSteps = async () => {
    if (!canCall || !recipeId || !recipe?.beerJsonRecipeJson) return;
    setMashStepsSaveError(null);
    setMashStepsSaveStatus(null);
    setMashStepsSaving(true);
    try {
      const stepsForSave = mashRows.map((r, idx) => {
        if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
          return { ...r, amountL: waterVolumes.spargeLiters };
        }
        if (idx === 0 && r.type === "infusion" && derivedMashWaterVolumeLiters > 0) {
          return { ...r, amountL: computeFirstStepAmountL };
        }
        if (idx > 0 && r.deduceFromMashIn !== true) {
          return { ...r, amountL: 0 };
        }
        return r;
      });
      const mash =
        mashRows.length > 0 && mashProcedure
          ? {
              name: mashProcedure.name || "Mash",
              grainTemperatureC: mashProcedure.grainTemperatureC,
              steps: stepsForSave,
            }
          : mashRows.length > 0
            ? { name: "Mash", grainTemperatureC: 20, steps: stepsForSave }
            : null;
      const mashValidation = validateMashBeforeSave(mash);
      if (!mashValidation.ok) {
        setMashStepsSaveError(mashValidation.errors);
        return;
      }
      const newDoc = replaceMashInBeerJsonDocument(recipe.beerJsonRecipeJson, mash);
      const extBase = asRecord(recipe.recipeExtJson) ?? { version: 1 };
      const mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
          .filter(([k, v]) => k !== "0" && v === true),
      );
      const recipeExtJson = { ...extBase, mashStepDeduceFromMashIn };
      await patchRecipe(webBreweryApiClient(), recipeId, { beerJsonRecipeJson: newDoc, recipeExtJson });
      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      setRecipe(reload.recipe as WaterMashStepsRecipe);
      setMashStepsDirty(false);
      setMashStepsSaveStatus("Saved.");
    } catch (err) {
      setMashStepsSaveError(String(err));
    } finally {
      setMashStepsSaving(false);
    }
  };

  return { saveMashSteps };
}
