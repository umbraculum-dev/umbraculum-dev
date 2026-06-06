"use client";

import { useState } from "react";

import { getRecipe, patchRecipe } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import type {
  EditorGristRow,
  EditorHopRow,
  EditorMashStep,
  EditorMiscRow,
  EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import { buildRecipeEditSavePayload } from "./buildRecipeEditSavePayload";
import type { Recipe } from "../_lib/recipeEditTypes";

export function useRecipeEditSaveRecipe(params: {
  t: (key: string) => string;
  recipeId: string;
  recipe: Recipe | null;
  setRecipe: (r: Recipe | null) => void;
  setAnalysis: (a: unknown) => void;
  setStyleKey: (k: string) => void;
  styleKey: string;
  name: string;
  notes: string;
  boilTimeMinutes: string;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  mashProcedure: { name: string; grainTemperatureC: number } | null;
  mashRows: EditorMashStep[];
  waterVolumes: { spargeLiters: number } | null | undefined;
  buildYeastOverrides: () => Record<string, Record<string, unknown>>;
}) {
  const {
    t,
    recipeId,
    recipe,
    setRecipe,
    setAnalysis,
    setStyleKey,
    styleKey,
    name,
    notes,
    boilTimeMinutes,
    gristRows,
    hopsRows,
    yeastRows,
    miscRows,
    mashProcedure,
    mashRows,
    waterVolumes,
    buildYeastOverrides,
  } = params;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const onSave = async () => {
    if (!recipeId) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const built = buildRecipeEditSavePayload({
        recipe,
        name,
        styleKey,
        notes,
        boilTimeMinutes,
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        mashProcedure,
        mashRows,
        waterVolumes,
        buildYeastOverrides,
      });
      if (!built.ok) {
        setSaveError(built.errors);
        setSaving(false);
        return;
      }

      await patchRecipe(webBreweryApiClient(), recipeId, built.payload);

      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      const r = reload.recipe as unknown as Recipe;
      setRecipe(r);
      setAnalysis(r.analysis ?? null);
      setStyleKey(r.styleKey ?? styleKey);
      setSaveStatus(t("status.saved"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveError,
    saveStatus,
    setSaveStatus,
    onSave,
  };
}
