import { useCallback, useEffect, useState } from "react";

import { getRecipe } from "@umbraculum/brewery-api-client";
import {
  editorStateFromBeerJson,
  mergeYeastAttenuationRangeFromExt,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMiscRow,
  type EditorYeastRow,
} from "@umbraculum/brewery-beerjson";

import { asRecord } from "../../../../lib/typeGuards";
import type { Recipe } from "./yeastScreenHelpers";

type ApiClient = Parameters<typeof getRecipe>[0];

export function useNativeYeastScreenLoad(params: { api: ApiClient | null; recipeId: string }) {
  const { api, recipeId } = params;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});

  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [miscRows, setMiscRows] = useState<EditorMiscRow[]>([]);
  const [mash, setMash] = useState<EditorMash | null>(null);

  const loadRecipe = useCallback(async () => {
    if (!api || !recipeId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getRecipe(api, recipeId);
      const r = res.recipe as Recipe;
      setRecipe(r);

      const extRec = asRecord(r.recipeExtJson);
      const linksRec = asRecord(extRec?.['ingredientLinks']);
      const yeastLinks = asRecord(linksRec?.['yeast']);
      const yeastOverridesRaw = asRecord(extRec?.['yeastAttenuationOverridesPercent']);
      if (yeastOverridesRaw) {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(yeastOverridesRaw)) {
          if (typeof k === "string" && typeof v === "number" && Number.isFinite(v)) out[k] = String(v);
        }
        setYeastAttenuationOverrides(out);
      } else {
        setYeastAttenuationOverrides({});
      }

      const yeastPitchRateRaw = asRecord(extRec?.['yeastPitchRateOverrides']);
      const yeastFermentationTempRaw = asRecord(extRec?.['yeastFermentationTempOverrides']);
      const yeastOxygenationRaw = asRecord(extRec?.['yeastOxygenationOverrides']);
      const yeastDiacetylRestRaw = asRecord(extRec?.['yeastDiacetylRestOverrides']);
      const yeastFormatRaw = asRecord(extRec?.['yeastFormatOverrides'] ?? extRec?.['yeastTypeOverrides']);
      const yeastSpeciesRaw = asRecord(extRec?.['yeastSpeciesOverrides']);
      const yeastNeedsPropagationRaw = asRecord(extRec?.['yeastNeedsPropagationOverrides']);
      const yeastManualCellCountRaw = asRecord(extRec?.['yeastManualCellCountOverrides']);

      if (!r.beerJsonRecipeJson) throw new Error("Recipe is missing BeerJSON");
      const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
      setGristRows(s.gristRows);
      setHopsRows(s.hopsRows);
      setMiscRows(s.miscRows);
      setMash(s.mash);

      const baseYeast = mergeYeastAttenuationRangeFromExt(s.yeastRows, r.recipeExtJson);
      setYeastRows(
        baseYeast.map((row) => {
          const pitchRate = yeastPitchRateRaw && typeof yeastPitchRateRaw[row.id] === "string" ? (yeastPitchRateRaw[row.id] as string) : null;
          const fermentationTempC = yeastFermentationTempRaw && typeof yeastFermentationTempRaw[row.id] === "number" && Number.isFinite(yeastFermentationTempRaw[row.id]) ? (yeastFermentationTempRaw[row.id] as number) : null;
          const oxygenation = yeastOxygenationRaw && (yeastOxygenationRaw[row.id] === "yes" || yeastOxygenationRaw[row.id] === "no") ? (yeastOxygenationRaw[row.id] as "yes" | "no") : null;
          const diacetylRest = yeastDiacetylRestRaw && (yeastDiacetylRestRaw[row.id] === "yes" || yeastDiacetylRestRaw[row.id] === "no") ? (yeastDiacetylRestRaw[row.id] as "yes" | "no") : null;
          const format = yeastFormatRaw && (yeastFormatRaw[row.id] === "dry" || yeastFormatRaw[row.id] === "liquid" || yeastFormatRaw[row.id] === "slurry") ? (yeastFormatRaw[row.id] as "dry" | "liquid" | "slurry") : null;
          const validSpecies = ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"] as const;
          const speciesRaw = yeastSpeciesRaw ? yeastSpeciesRaw[row.id] : null;
          const species = typeof speciesRaw === "string" && (validSpecies as ReadonlyArray<string>).includes(speciesRaw) ? (speciesRaw as (typeof validSpecies)[number]) : null;
          const needsPropagation = yeastNeedsPropagationRaw && (yeastNeedsPropagationRaw[row.id] === "yes" || yeastNeedsPropagationRaw[row.id] === "no") ? (yeastNeedsPropagationRaw[row.id] as "yes" | "no") : null;
          const manualRaw = yeastManualCellCountRaw && asRecord(yeastManualCellCountRaw[row.id]) ? (yeastManualCellCountRaw[row.id] as { dilutionFactor?: number; aliveCells?: number; totalCells?: number }) : null;
          const dilutionFactor = manualRaw?.dilutionFactor === 200 || manualRaw?.dilutionFactor === 2000 ? (manualRaw.dilutionFactor) : undefined;
          const aliveCells = typeof manualRaw?.aliveCells === "number" && Number.isFinite(manualRaw.aliveCells) && manualRaw.aliveCells > 0 ? manualRaw.aliveCells : undefined;
          const totalCells = typeof manualRaw?.totalCells === "number" && Number.isFinite(manualRaw.totalCells) && manualRaw.totalCells > 0 ? manualRaw.totalCells : undefined;
          const manualCellCount = dilutionFactor != null && aliveCells != null && totalCells != null ? { dilutionFactor, aliveCells, totalCells } : undefined;

          return {
            ...row,
            ingredientId: typeof yeastLinks?.[row.id] === "string" ? (yeastLinks[row.id] as string) : null,
            pitchRate: pitchRate ?? undefined,
            fermentationTempC: fermentationTempC ?? undefined,
            oxygenation: oxygenation ?? undefined,
            diacetylRest: diacetylRest ?? undefined,
            format: format ?? undefined,
            species: species ?? undefined,
            needsPropagation: needsPropagation ?? undefined,
            manualCellCount: manualCellCount ?? undefined,
          };
        }) as EditorYeastRow[],
      );
    } catch (err) {
      setLoadError(String(err));
    } finally {
      setLoading(false);
    }
  }, [api, recipeId]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  return {
    recipe,
    setRecipe,
    loading,
    loadError,
    yeastRows,
    setYeastRows,
    yeastAttenuationOverrides,
    setYeastAttenuationOverrides,
    gristRows,
    hopsRows,
    miscRows,
    mash,
    loadRecipe,
  };
}
