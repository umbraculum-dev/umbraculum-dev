"use client";

import {
  type EditorGristRow,
  type EditorHopRow,
  type EditorMashStep,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import type { EquipmentProfile, Recipe } from "../_lib/recipeEditTypes";
import { useRecipeEditSaveEquipment } from "./useRecipeEditSaveEquipment";
import { useRecipeEditSaveRecipe } from "./useRecipeEditSaveRecipe";

export function useRecipeEditSaveActions(params: {
  t: (key: string) => string;
  tEquip: (key: string) => string;
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
  equipmentProfiles: EquipmentProfile[];
  selectedEquipmentProfileId: string;
}) {
  const recipeSave = useRecipeEditSaveRecipe(params);

  const equipmentSave = useRecipeEditSaveEquipment({
    t: params.t,
    tEquip: params.tEquip,
    recipeId: params.recipeId,
    recipe: params.recipe,
    setRecipe: params.setRecipe,
    setAnalysis: params.setAnalysis,
    setSaveStatus: recipeSave.setSaveStatus,
    equipmentProfiles: params.equipmentProfiles,
    selectedEquipmentProfileId: params.selectedEquipmentProfileId,
  });

  return {
    ...recipeSave,
    ...equipmentSave,
  };
}
