import { useCallback, useState } from "react";

import { patchRecipe } from "@umbraculum/brewery-api-client";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  type EditorGristRow,
  type EditorHopRow,
  type EditorYeastRow,
} from "@umbraculum/brewery-beerjson";

import { asRecord } from "../../../../lib/typeGuards";
import type { Recipe } from "../../lib/recipeEditTypes";

type ApiClient = Parameters<typeof patchRecipe>[0];

export function useNativeRecipeEditSaveActions(params: {
  api: ApiClient | null;
  recipeId: string;
  recipe: Recipe | null;
  t: (key: string) => string;
  name: string;
  styleKey: string;
  notes: string;
  boilTimeMinutes: string;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
  loadRecipe: () => Promise<void>;
}) {
  const {
    api,
    recipeId,
    recipe,
    t,
    name,
    styleKey,
    notes,
    boilTimeMinutes,
    gristRows,
    hopsRows,
    yeastRows,
    yeastAttenuationOverrides,
    loadRecipe,
  } = params;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const save = useCallback(async () => {
    if (!api || !recipeId || !recipe) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const extBaseRec = asRecord(recipe?.recipeExtJson);
      const extBaseForSave: Record<string, unknown> = extBaseRec ? { ...extBaseRec } : {};

      const boilTimeMinutesVal = (() => {
        const trimmed = boilTimeMinutes.trim();
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n) || n < 0 || n > 600) return null;
        return Math.round(n);
      })();
      if (boilTimeMinutesVal != null) {
        extBaseForSave["boilTimeMinutesOverride"] = boilTimeMinutesVal;
      } else {
        delete extBaseForSave["boilTimeMinutesOverride"];
      }

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
      }

      const yeastFermentationTempOverrides = Object.fromEntries(
        yeastRows
          .filter(
            (r) =>
              r.fermentationTempC != null &&
              Number.isFinite(r.fermentationTempC) &&
              r.fermentationTempC >= -10 &&
              r.fermentationTempC <= 50,
          )
          .map((r) => [r.id, r.fermentationTempC as number]),
      );
      const yeastOxygenationOverrides = Object.fromEntries(
        yeastRows
          .filter((r) => r.oxygenation === "yes" || r.oxygenation === "no")
          .map((r) => [r.id, r.oxygenation as "yes" | "no"]),
      );
      const yeastDiacetylRestOverrides = Object.fromEntries(
        yeastRows
          .filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no")
          .map((r) => [r.id, r.diacetylRest as "yes" | "no"]),
      );
      const yeastFormatOverrides = Object.fromEntries(
        yeastRows
          .filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry")
          .map((r) => [r.id, r.format as "dry" | "liquid" | "slurry"]),
      );

      if (Object.keys(yeastFermentationTempOverrides).length)
        extBaseForSave["yeastFermentationTempOverrides"] = yeastFermentationTempOverrides;
      else delete extBaseForSave["yeastFermentationTempOverrides"];

      if (Object.keys(yeastOxygenationOverrides).length)
        extBaseForSave["yeastOxygenationOverrides"] = yeastOxygenationOverrides;
      else delete extBaseForSave["yeastOxygenationOverrides"];

      if (Object.keys(yeastDiacetylRestOverrides).length)
        extBaseForSave["yeastDiacetylRestOverrides"] = yeastDiacetylRestOverrides;
      else delete extBaseForSave["yeastDiacetylRestOverrides"];

      if (Object.keys(yeastFormatOverrides).length) extBaseForSave["yeastFormatOverrides"] = yeastFormatOverrides;
      else delete extBaseForSave["yeastFormatOverrides"];

      delete extBaseForSave["yeastTypeOverrides"];

      const beerJsonDoc = buildBeerJsonRecipeDocument({
        name: name.trim() || recipe.name,
        notes: notes.trim() || null,
        gristRows,
        hopsRows,
        yeastRows,
        miscRows: [],
      });

      const recipeExtJson = buildRecipeExtJsonFromEditorState({
        gristRows,
        hopsRows,
        yeastRows,
        miscRows: [],
        extBase: extBaseForSave,
      });

      const payload: Record<string, unknown> = {
        name: name.trim() || recipe.name,
        styleKey: styleKey.trim() || "custom",
        notes: notes.trim() || null,
        beerJsonRecipeJson: beerJsonDoc,
        recipeExtJson,
      };

      await patchRecipe(api, recipeId, payload);
      setSaveStatus(t("status.saved"));
      await loadRecipe();
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }, [
    api,
    recipeId,
    recipe,
    name,
    styleKey,
    notes,
    boilTimeMinutes,
    gristRows,
    hopsRows,
    yeastRows,
    yeastAttenuationOverrides,
    loadRecipe,
    t,
  ]);

  return {
    saving,
    saveError,
    saveStatus,
    setSaveStatus,
    save,
  };
}
