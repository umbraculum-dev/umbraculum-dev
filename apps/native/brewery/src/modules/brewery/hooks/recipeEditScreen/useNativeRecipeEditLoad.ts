import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getRecipe, getRecipeWaterSettings } from "@umbraculum/brewery-api-client";
import type { EditorMashStep } from "@umbraculum/brewery-beerjson";

import type { Recipe } from "../../lib/recipeEditTypes";
import {
  hydrateNativeRecipeEditFromBeerJson,
  type NativeRecipeEditLoadHydrators,
} from "./useNativeRecipeEditLoadHydrate";

type ApiClient = Parameters<typeof getRecipe>[0];

export type { NativeRecipeEditLoadHydrators };

export function useNativeRecipeEditLoad(params: {
  api: ApiClient | null;
  recipeId: string;
  canCall: boolean;
  locale: string;
  hydrators: NativeRecipeEditLoadHydrators;
}) {
  const { api, recipeId, canCall, hydrators } = params;

  // Parent passes a fresh hydrators object each render; keep loadRecipe identity
  // stable so the mount/focus effects cannot loop on setState → new deps → reload.
  const hydratorsRef = useRef(hydrators);
  hydratorsRef.current = hydrators;

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipeState, setRecipe] = useState<Recipe | null>(null);
  const recipeStateRef = useRef(recipeState);
  recipeStateRef.current = recipeState;

  const [name, setName] = useState("");
  const [styleKey, setStyleKey] = useState("");
  const [notes, setNotes] = useState("");
  const [boilTimeMinutes, setBoilTimeMinutes] = useState("");

  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [waterSettings, setWaterSettings] = useState<{
    spargeStepTemperatureC?: number | null;
    spargeStepTimeMin?: number | null;
    spargeStepRampMin?: number | null;
    spargeMethodType?: string | null;
  } | null>(null);

  const loadRecipe = useCallback(async () => {
    if (!api || !recipeId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getRecipe(api, recipeId);
      const r = (res.recipe ?? null) as Recipe | null;
      if (!r) throw new Error("Recipe not found");
      setRecipe(r);
      setName(typeof r.name === "string" ? r.name : "");
      setStyleKey(typeof r.styleKey === "string" ? r.styleKey : "custom");
      setNotes(typeof r.notes === "string" ? r.notes : "");

      hydrateNativeRecipeEditFromBeerJson({
        r,
        hydrators: hydratorsRef.current,
        setBoilTimeMinutes,
        setMashProcedure,
        setMashRows,
      });
    } catch (err) {
      setLoadError(String(err));
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [api, recipeId]);

  useEffect(() => {
    if (canCall && recipeId) {
      void loadRecipe();
    }
  }, [canCall, recipeId, loadRecipe]);

  useEffect(() => {
    if (!canCall || !recipeId || !api) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await getRecipeWaterSettings(api, recipeId);
        if (cancelled) return;
        const data = res.settings as Record<string, unknown> | null | undefined;
        setWaterSettings(data ?? null);
      } catch {
        if (!cancelled) setWaterSettings(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId, api]);

  // Reload on re-focus only when a recipe is already in memory. Read via ref so
  // setRecipe after the initial load does not recreate this callback and re-fire
  // while the screen stays focused (Maximum update depth / Z loop on RN).
  useFocusEffect(
    useCallback(() => {
      if (canCall && recipeId && recipeStateRef.current) {
        void loadRecipe();
      }
    }, [canCall, recipeId, loadRecipe]),
  );

  return {
    loading,
    loadError,
    recipe: recipeState,
    setRecipe,
    name,
    setName,
    styleKey,
    setStyleKey,
    notes,
    setNotes,
    boilTimeMinutes,
    setBoilTimeMinutes,
    mashProcedure,
    mashRows,
    waterSettings,
    loadRecipe,
  };
}
