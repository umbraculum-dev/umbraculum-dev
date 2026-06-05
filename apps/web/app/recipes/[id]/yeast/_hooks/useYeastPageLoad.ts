"use client";

import { useEffect, useState } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../_lib/typeGuards";
import {
  editorStateFromBeerJson,
  mergeYeastAttenuationRangeFromExt,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import { newRowId, type Recipe } from "../_lib/yeastPageTypes";
import {
  mergeYeastRowsWithExtOverrides,
  parseYeastAttenuationOverridesFromExt,
} from "../_lib/yeastPageLoadHelpers";

export function useYeastPageLoad(canCallAccountScoped: boolean, recipeId: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});
  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [miscRows, setMiscRows] = useState<EditorMiscRow[]>([]);
  const [mash, setMash] = useState<EditorMash | null>(null);

  useEffect(() => {
    if (!canCallAccountScoped || !recipeId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getRecipe(webBreweryApiClient(), recipeId);
        const r = data.recipe as Recipe;
        if (cancelled) return;
        setRecipe(r);

        const extRec = asRecord(r.recipeExtJson);
        const linksRec = asRecord(extRec?.["ingredientLinks"]);
        setYeastAttenuationOverrides(parseYeastAttenuationOverridesFromExt(extRec));

        if (!r.beerJsonRecipeJson) {
          throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
        }
        const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
        const hopsLinks = asRecord(linksRec?.["hops"]);
        const yeastLinks = asRecord(linksRec?.["yeast"]);
        setGristRows(s.gristRows);
        setHopsRows(
          s.hopsRows.map((row) => ({
            ...row,
            ingredientId: typeof hopsLinks?.[row.id] === "string" ? (hopsLinks[row.id] as string) : null,
          })),
        );
        const baseYeast = mergeYeastAttenuationRangeFromExt(s.yeastRows, r.recipeExtJson);
        setYeastRows(mergeYeastRowsWithExtOverrides(baseYeast, extRec, yeastLinks));
        setMiscRows(s.miscRows);
        setMash(s.mash);
      } catch (err) {
        if (!cancelled) setLoadError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped, recipeId]);

  const addYeastRow = (row?: Partial<EditorYeastRow>) => {
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        lab: null,
        productId: null,
        attenuationMin: null,
        attenuationMax: null,
        ...row,
      },
    ]);
  };

  const removeYeastRow = (id: string) => {
    setYeastRows((prev) => prev.filter((r) => r.id !== id));
    setYeastAttenuationOverrides((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateYeastRow = (id: string, patch: Partial<EditorYeastRow>) =>
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const onAttenuationOverrideChange = (id: string, value: string) =>
    setYeastAttenuationOverrides((prev) => ({ ...prev, [id]: value }));

  return {
    recipe,
    setRecipe,
    loading,
    loadError,
    yeastRows,
    yeastAttenuationOverrides,
    gristRows,
    hopsRows,
    miscRows,
    mash,
    addYeastRow,
    removeYeastRow,
    updateYeastRow,
    onAttenuationOverrideChange,
  };
}
