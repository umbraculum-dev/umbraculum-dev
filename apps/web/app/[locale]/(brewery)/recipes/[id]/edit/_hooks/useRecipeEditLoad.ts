"use client";

import { editorStateFromBeerJson, type EditorMiscRow } from "../../../_lib/beerjsonRecipe";
import { useRecipeEditLoadData } from "./useRecipeEditLoadData";
import { useRecipeEditLoadHydrate } from "./useRecipeEditLoadHydrate";

export type RecipeEditHydrators = {
  hydrateGristRows: (input: {
    gristRows: ReturnType<typeof editorStateFromBeerJson>["gristRows"];
    linksGrist: Record<string, unknown> | null;
    mashPhModel: Record<string, unknown> | null;
  }) => void;
  hydrateHopsRows: (input: {
    hopsRows: ReturnType<typeof editorStateFromBeerJson>["hopsRows"];
    linksHops: Record<string, unknown> | null;
    hopFormOverrides: Record<string, unknown> | null;
  }) => void;
  hydrateYeast: (input: {
    yeastRows: ReturnType<typeof editorStateFromBeerJson>["yeastRows"];
    ext: Record<string, unknown> | null;
    linksYeast: Record<string, unknown> | null;
    yeastPitchRateRaw: Record<string, unknown> | null;
    yeastFermentationTempRaw: Record<string, unknown> | null;
    yeastOxygenationRaw: Record<string, unknown> | null;
    yeastDiacetylRestRaw: Record<string, unknown> | null;
    yeastFormatRaw: Record<string, unknown> | null;
    yeastSpeciesRaw: Record<string, unknown> | null;
    yeastNeedsPropagationRaw: Record<string, unknown> | null;
    yeastCellsPerLRaw: Record<string, unknown> | null;
    yeastCellsPerKGRaw: Record<string, unknown> | null;
    yeastCellsPerGRaw: Record<string, unknown> | null;
  }) => void;
  hydrateYeastAttenuationOverrides: (raw: Record<string, unknown> | null) => void;
  hydrateMash: (input: {
    mash: ReturnType<typeof editorStateFromBeerJson>["mash"];
    ext: Record<string, unknown> | null;
  }) => void;
};

export function useRecipeEditLoad(params: {
  canCall: boolean;
  recipeId: string;
  hydrators: RecipeEditHydrators;
  setMiscRows: (rows: EditorMiscRow[]) => void;
  setSelectedEquipmentProfileId: (id: string) => void;
  setAnalysis: (analysis: unknown) => void;
}) {
  const data = useRecipeEditLoadData({
    canCall: params.canCall,
    recipeId: params.recipeId,
    setAnalysis: params.setAnalysis,
  });

  useRecipeEditLoadHydrate({
    recipe: data.recipe,
    hydrators: params.hydrators,
    setMiscRows: params.setMiscRows,
    setSelectedEquipmentProfileId: params.setSelectedEquipmentProfileId,
    setBoilTimeMinutes: data.setBoilTimeMinutes,
  });

  return {
    loading: data.loading,
    loadError: data.loadError,
    recipe: data.recipe,
    setRecipe: data.setRecipe,
    name: data.name,
    setName: data.setName,
    styleKey: data.styleKey,
    setStyleKey: data.setStyleKey,
    notes: data.notes,
    setNotes: data.setNotes,
    boilTimeMinutes: data.boilTimeMinutes,
    setBoilTimeMinutes: data.setBoilTimeMinutes,
    versions: data.versions,
    _versionsLoading: data._versionsLoading,
    versionsError: data.versionsError,
  };
}
