"use client";

import {
  type EditorGristRow,
  type EditorHopRow,
  type EditorMashStep,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import type { EquipmentProfile, Recipe } from "../_lib/recipeEditTypes";
import { useRecipeEditPublishActions } from "./useRecipeEditPublishActions";
import { useRecipeEditSaveActions } from "./useRecipeEditSaveActions";

export function useRecipeEditActions(params: {
  t: (key: string) => string;
  tEquip: (key: string) => string;
  recipeId: string;
  canCall: boolean;
  routerPush: (path: string) => void;
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
  equipmentProfiles: EquipmentProfile[];
  selectedEquipmentProfileId: string;
}) {
  const saveActions = useRecipeEditSaveActions(params);
  const publishActions = useRecipeEditPublishActions({
    recipeId: params.recipeId,
    canCall: params.canCall,
    routerPush: params.routerPush,
  });

  return {
    ...saveActions,
    ...publishActions,
  };
}
