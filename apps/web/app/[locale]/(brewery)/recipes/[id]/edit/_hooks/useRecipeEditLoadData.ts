"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { getRecipe, listRecipeVersions } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import type { Recipe, RecipeVersionListItem } from "../_lib/recipeEditTypes";

export type RecipeEditLoadDataState = {
  loading: boolean;
  loadError: string | null;
  recipe: Recipe | null;
  setRecipe: Dispatch<SetStateAction<Recipe | null>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  styleKey: string;
  setStyleKey: Dispatch<SetStateAction<string>>;
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
  boilTimeMinutes: string;
  setBoilTimeMinutes: Dispatch<SetStateAction<string>>;
  versions: RecipeVersionListItem[] | null;
  _versionsLoading: boolean;
  versionsError: string | null;
  visibilityRefreshTrigger: number;
};

export function useRecipeEditLoadData(params: {
  canCall: boolean;
  recipeId: string;
  setAnalysis: (analysis: unknown) => void;
}): RecipeEditLoadDataState {
  const { canCall, recipeId, setAnalysis } = params;

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [name, setName] = useState("");
  const [styleKey, setStyleKey] = useState("custom");
  const [notes, setNotes] = useState("");
  const [boilTimeMinutes, setBoilTimeMinutes] = useState("");

  const [versions, setVersions] = useState<RecipeVersionListItem[] | null>(null);
  const [_versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  const [visibilityRefreshTrigger, setVisibilityRefreshTrigger] = useState(0);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => {
      if (document.visibilityState === "visible") {
        setVisibilityRefreshTrigger((t) => t + 1);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  useEffect(() => {
    if (!canCall) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getRecipe(webBreweryApiClient(), recipeId);
        const r = data.recipe as unknown as Recipe;
        if (cancelled) return;
        if (!r.beerJsonRecipeJson) {
          throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
        }
        setRecipe(r);
        setAnalysis(r.analysis ?? null);
        setName(r.name ?? "");
        setStyleKey(r.styleKey ?? "custom");
        setNotes(r.notes ?? "");
      } catch (err) {
        if (cancelled) return;
        setLoadError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId, visibilityRefreshTrigger, setAnalysis]);

  useEffect(() => {
    if (!canCall) return;
    let cancelled = false;

    void (async () => {
      setVersionsLoading(true);
      setVersionsError(null);
      try {
        const data = await listRecipeVersions(webBreweryApiClient(), recipeId);
        if (!cancelled) setVersions(data.versions as unknown as RecipeVersionListItem[]);
      } catch (err) {
        if (!cancelled) {
          setVersions(null);
          setVersionsError(String(err));
        }
      } finally {
        if (!cancelled) setVersionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId, visibilityRefreshTrigger]);

  return {
    loading,
    loadError,
    recipe,
    setRecipe,
    name,
    setName,
    styleKey,
    setStyleKey,
    notes,
    setNotes,
    boilTimeMinutes,
    setBoilTimeMinutes,
    versions,
    _versionsLoading,
    versionsError,
    visibilityRefreshTrigger,
  };
}
