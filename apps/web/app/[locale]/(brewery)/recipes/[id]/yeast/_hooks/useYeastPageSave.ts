"use client";

import { useState } from "react";

import { getRecipe, patchRecipe } from "@umbraculum/api-client/brewery";
import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../../_shared-layout/_lib/typeGuards";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import { buildYeastOverrideMaps } from "../_lib/yeastPageOverrideMaps";
import type { Recipe } from "../_lib/yeastPageTypes";

type UseYeastPageSaveParams = {
  recipeId: string;
  recipe: Recipe | null;
  setRecipe: (recipe: Recipe) => void;
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  miscRows: EditorMiscRow[];
  mash: EditorMash | null;
  t: (key: string) => string;
};

export function useYeastPageSave({
  recipeId,
  recipe,
  setRecipe,
  yeastRows,
  yeastAttenuationOverrides,
  gristRows,
  hopsRows,
  miscRows,
  mash,
  t,
}: UseYeastPageSaveParams) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lowViabilityWarning, setLowViabilityWarning] = useState<number | null>(null);

  const onSave = async () => {
    if (!recipeId || !recipe) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    setLowViabilityWarning(null);
    try {
      const extBaseRec = asRecord(recipe.recipeExtJson);
      const extBaseForSave: Record<string, unknown> = extBaseRec ? { ...extBaseRec } : {};

      const yeastAttenuationOverridesPercent = Object.fromEntries(
        Object.entries(yeastAttenuationOverrides)
          .map(([k, v]) => {
            const trimmed = v.trim();
            if (!trimmed) return null;
            const n = Number(trimmed);
            if (!Number.isFinite(n)) return null;
            return [k, n] as const;
          })
          .filter(Boolean) as Array<readonly [string, number]>,
      );
      if (Object.keys(yeastAttenuationOverridesPercent).length) {
        extBaseForSave["yeastAttenuationOverridesPercent"] = yeastAttenuationOverridesPercent;
      } else {
        delete extBaseForSave["yeastAttenuationOverridesPercent"];
      }

      const {
        yeastPitchRateOverrides,
        yeastFermentationTempOverrides,
        yeastOxygenationOverrides,
        yeastDiacetylRestOverrides,
        yeastFormatOverrides,
        yeastSpeciesOverrides,
        yeastNeedsPropagationOverrides,
        yeastCellsPerLOverrides,
        yeastCellsPerKGOverrides,
        yeastManualCellCountOverrides,
      } = buildYeastOverrideMaps(yeastRows);

      if (Object.keys(yeastPitchRateOverrides).length) {
        extBaseForSave["yeastPitchRateOverrides"] = yeastPitchRateOverrides;
      } else {
        delete extBaseForSave["yeastPitchRateOverrides"];
      }
      if (Object.keys(yeastFermentationTempOverrides).length) {
        extBaseForSave["yeastFermentationTempOverrides"] = yeastFermentationTempOverrides;
      } else {
        delete extBaseForSave["yeastFermentationTempOverrides"];
      }
      if (Object.keys(yeastOxygenationOverrides).length) {
        extBaseForSave["yeastOxygenationOverrides"] = yeastOxygenationOverrides;
      } else {
        delete extBaseForSave["yeastOxygenationOverrides"];
      }
      if (Object.keys(yeastDiacetylRestOverrides).length) {
        extBaseForSave["yeastDiacetylRestOverrides"] = yeastDiacetylRestOverrides;
      } else {
        delete extBaseForSave["yeastDiacetylRestOverrides"];
      }
      if (Object.keys(yeastFormatOverrides).length) {
        extBaseForSave["yeastFormatOverrides"] = yeastFormatOverrides;
      } else {
        delete extBaseForSave["yeastFormatOverrides"];
      }
      delete extBaseForSave["yeastTypeOverrides"];
      if (Object.keys(yeastSpeciesOverrides).length) {
        extBaseForSave["yeastSpeciesOverrides"] = yeastSpeciesOverrides;
      } else {
        delete extBaseForSave["yeastSpeciesOverrides"];
      }
      if (Object.keys(yeastNeedsPropagationOverrides).length) {
        extBaseForSave["yeastNeedsPropagationOverrides"] = yeastNeedsPropagationOverrides;
      } else {
        delete extBaseForSave["yeastNeedsPropagationOverrides"];
      }
      if (Object.keys(yeastCellsPerLOverrides).length) {
        extBaseForSave["yeastCellsPerLOverrides"] = yeastCellsPerLOverrides;
      } else {
        delete extBaseForSave["yeastCellsPerLOverrides"];
      }
      if (Object.keys(yeastCellsPerKGOverrides).length) {
        extBaseForSave["yeastCellsPerKGOverrides"] = yeastCellsPerKGOverrides;
      } else {
        delete extBaseForSave["yeastCellsPerKGOverrides"];
      }
      if (Object.keys(yeastManualCellCountOverrides).length) {
        extBaseForSave["yeastManualCellCountOverrides"] = yeastManualCellCountOverrides;
      } else {
        delete extBaseForSave["yeastManualCellCountOverrides"];
      }
      delete extBaseForSave["yeastCellsPerGOverrides"];

      const batchSizeLiters =
        typeof extBaseForSave["batchSizeLiters"] === "number" ? extBaseForSave["batchSizeLiters"] : null;
      const brewhouseEfficiencyPercent =
        typeof extBaseForSave["brewhouseEfficiencyPercent"] === "number" ? extBaseForSave["brewhouseEfficiencyPercent"] : null;

      const beerJsonRecipeJson = buildBeerJsonRecipeDocument({
        name: recipe.name ?? "",
        notes: recipe.notes || null,
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        mash: mash ?? undefined,
        batchSizeLiters,
        brewhouseEfficiencyPercent,
      });

      const recipeExtJson = buildRecipeExtJsonFromEditorState({
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        extBase: extBaseForSave,
      });

      await patchRecipe(webBreweryApiClient(), recipeId, {
        name: recipe.name,
        styleKey: recipe.styleKey,
        notes: recipe.notes ?? null,
        beerJsonRecipeJson,
        recipeExtJson,
      });

      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      const r = reload.recipe as Recipe;
      setRecipe(r);
      setSaveStatus(t("status.saved"));
      let minViability: number | null = null;
      for (const row of yeastRows) {
        if (
          row.format === "slurry" &&
          row.manualCellCount &&
          row.manualCellCount.totalCells > 0 &&
          Number.isFinite(row.manualCellCount.aliveCells)
        ) {
          const v =
            (row.manualCellCount.aliveCells / row.manualCellCount.totalCells) * 100;
          if (v < 85 && (minViability == null || v < minViability)) minViability = v;
        }
      }
      if (minViability != null) setLowViabilityWarning(minViability);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveStatus,
    setSaveStatus,
    saveError,
    lowViabilityWarning,
    onSave,
  };
}
