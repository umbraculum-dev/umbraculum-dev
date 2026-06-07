import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

import { getRecipe, patchRecipe } from "@umbraculum/brewery-api-client";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMiscRow,
  type EditorYeastRow,
} from "@umbraculum/brewery-beerjson";

import { asRecord } from "../../../../lib/typeGuards";
import type { Recipe } from "./yeastScreenHelpers";

type ApiClient = Parameters<typeof patchRecipe>[0];

export function useNativeYeastScreenActions(params: {
  api: ApiClient | null;
  recipeId: string;
  recipe: Recipe | null;
  setRecipe: Dispatch<SetStateAction<Recipe | null>>;
  t: (key: string) => string;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  miscRows: EditorMiscRow[];
  mash: EditorMash | null;
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
}) {
  const {
    api,
    recipeId,
    recipe,
    setRecipe,
    t,
    gristRows,
    hopsRows,
    miscRows,
    mash,
    yeastRows,
    yeastAttenuationOverrides,
  } = params;

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lowViabilityWarning, setLowViabilityWarning] = useState<number | null>(null);

  const yeastPitchRateOverrides = Object.fromEntries(yeastRows.filter((r) => r.pitchRate != null && String(r.pitchRate).trim()).map((r) => [r.id, String(r.pitchRate).trim()]));
  const yeastFermentationTempOverrides = Object.fromEntries(yeastRows.filter((r) => r.fermentationTempC != null && Number.isFinite(r.fermentationTempC) && r.fermentationTempC >= -10 && r.fermentationTempC <= 50).map((r) => [r.id, r.fermentationTempC as number]));
  const yeastOxygenationOverrides = Object.fromEntries(yeastRows.filter((r) => r.oxygenation === "yes" || r.oxygenation === "no").map((r) => [r.id, r.oxygenation as "yes" | "no"]));
  const yeastDiacetylRestOverrides = Object.fromEntries(yeastRows.filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no").map((r) => [r.id, r.diacetylRest as "yes" | "no"]));
  const yeastFormatOverrides = Object.fromEntries(yeastRows.filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry").map((r) => [r.id, r.format as "dry" | "liquid" | "slurry"]));
  const yeastSpeciesOverrides = Object.fromEntries(yeastRows.filter((r) => r.species && ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"].includes(r.species)).map((r) => [r.id, r.species!]));
  const yeastNeedsPropagationOverrides = Object.fromEntries(yeastRows.filter((r) => r.needsPropagation === "yes" || r.needsPropagation === "no").map((r) => [r.id, r.needsPropagation as "yes" | "no"]));
  const yeastCellsPerLOverrides = Object.fromEntries(yeastRows.filter((r) => r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride) && r.cellsPerLOverride > 0).map((r) => [r.id, r.cellsPerLOverride as number]));
  const yeastCellsPerKGOverrides = Object.fromEntries(yeastRows.filter((r) => r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride) && r.cellsPerKGOverride > 0).map((r) => [r.id, r.cellsPerKGOverride as number]));
  const yeastManualCellCountOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.manualCellCount != null &&
          (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000) &&
          Number.isFinite(r.manualCellCount.aliveCells) &&
          r.manualCellCount.aliveCells > 0 &&
          Number.isFinite(r.manualCellCount.totalCells) &&
          r.manualCellCount.totalCells > 0 &&
          r.manualCellCount.aliveCells <= r.manualCellCount.totalCells,
      )
      .map((r) => [r.id, { dilutionFactor: r.manualCellCount!.dilutionFactor, aliveCells: r.manualCellCount!.aliveCells, totalCells: r.manualCellCount!.totalCells }]),
  );

  const onSave = useCallback(async () => {
    if (!recipeId || !recipe || !api) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    setLowViabilityWarning(null);
    try {
      const baseRec = asRecord(recipe?.recipeExtJson);
      const extBaseForSave: Record<string, unknown> = baseRec ? { ...baseRec } : {};

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
      if (Object.keys(yeastAttenuationOverridesPercent).length) extBaseForSave['yeastAttenuationOverridesPercent'] = yeastAttenuationOverridesPercent;
      else delete extBaseForSave['yeastAttenuationOverridesPercent'];
      if (Object.keys(yeastPitchRateOverrides).length) extBaseForSave['yeastPitchRateOverrides'] = yeastPitchRateOverrides;
      else delete extBaseForSave['yeastPitchRateOverrides'];
      if (Object.keys(yeastFermentationTempOverrides).length) extBaseForSave['yeastFermentationTempOverrides'] = yeastFermentationTempOverrides;
      else delete extBaseForSave['yeastFermentationTempOverrides'];
      if (Object.keys(yeastOxygenationOverrides).length) extBaseForSave['yeastOxygenationOverrides'] = yeastOxygenationOverrides;
      else delete extBaseForSave['yeastOxygenationOverrides'];
      if (Object.keys(yeastDiacetylRestOverrides).length) extBaseForSave['yeastDiacetylRestOverrides'] = yeastDiacetylRestOverrides;
      else delete extBaseForSave['yeastDiacetylRestOverrides'];
      if (Object.keys(yeastFormatOverrides).length) extBaseForSave['yeastFormatOverrides'] = yeastFormatOverrides;
      else delete extBaseForSave['yeastFormatOverrides'];
      delete extBaseForSave['yeastTypeOverrides'];
      if (Object.keys(yeastSpeciesOverrides).length) extBaseForSave['yeastSpeciesOverrides'] = yeastSpeciesOverrides;
      else delete extBaseForSave['yeastSpeciesOverrides'];
      if (Object.keys(yeastNeedsPropagationOverrides).length) extBaseForSave['yeastNeedsPropagationOverrides'] = yeastNeedsPropagationOverrides;
      else delete extBaseForSave['yeastNeedsPropagationOverrides'];
      if (Object.keys(yeastCellsPerLOverrides).length) extBaseForSave['yeastCellsPerLOverrides'] = yeastCellsPerLOverrides;
      else delete extBaseForSave['yeastCellsPerLOverrides'];
      if (Object.keys(yeastCellsPerKGOverrides).length) extBaseForSave['yeastCellsPerKGOverrides'] = yeastCellsPerKGOverrides;
      else delete extBaseForSave['yeastCellsPerKGOverrides'];
      if (Object.keys(yeastManualCellCountOverrides).length) extBaseForSave['yeastManualCellCountOverrides'] = yeastManualCellCountOverrides;
      else delete extBaseForSave['yeastManualCellCountOverrides'];
      delete extBaseForSave['yeastCellsPerGOverrides'];

      const batchSizeLiters = typeof extBaseForSave['batchSizeLiters'] === "number" ? extBaseForSave['batchSizeLiters'] : null;
      const brewhouseEfficiencyPercent = typeof extBaseForSave['brewhouseEfficiencyPercent'] === "number" ? extBaseForSave['brewhouseEfficiencyPercent'] : null;

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

      await patchRecipe(api, recipeId, {
        name: recipe.name,
        styleKey: recipe.styleKey,
        notes: recipe.notes ?? null,
        beerJsonRecipeJson,
        recipeExtJson,
      });

      const reload = await getRecipe(api, recipeId);
      const r = reload.recipe as Recipe;
      setRecipe(r);
      setSaveStatus(t("status.saved"));

      let minViability: number | null = null;
      for (const row of yeastRows) {
        if (row.format === "slurry" && row.manualCellCount && row.manualCellCount.totalCells > 0 && Number.isFinite(row.manualCellCount.aliveCells)) {
          const v = (row.manualCellCount.aliveCells / row.manualCellCount.totalCells) * 100;
          if (v < 85 && (minViability == null || v < minViability)) minViability = v;
        }
      }
      if (minViability != null) setLowViabilityWarning(minViability);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }, [
    api,
    recipeId,
    recipe,
    setRecipe,
    t,
    gristRows,
    hopsRows,
    miscRows,
    mash,
    yeastRows,
    yeastAttenuationOverrides,
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
  ]);

  return {
    saving,
    saveStatus,
    saveError,
    lowViabilityWarning,
    onSave,
  };
}
