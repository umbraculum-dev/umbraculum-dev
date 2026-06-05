"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { useRecipeEditActions } from "./useRecipeEditActions";
import { useRecipeEditBrewSessions } from "./useRecipeEditBrewSessions";
import type {
  EditorGristRow,
  EditorHopRow,
  EditorMashStep,
  EditorMiscRow,
  EditorYeastRow,
  EquipmentProfile,
  Recipe,
} from "../_lib/recipeEditTypes";

export function useRecipeEditSave(params: {
  t: (key: string) => string;
  tEquip: (key: string) => string;
  recipeId: string;
  canCall: boolean;
  routerPush: AppRouterInstance["push"];
  recipe: Recipe | null;
  setRecipe: (recipe: Recipe | null) => void;
  setAnalysis: (analysis: unknown) => void;
  setStyleKey: (styleKey: string) => void;
  styleKey: string;
  name: string;
  notes: string;
  boilTimeMinutes: number | null;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  mashProcedure: { name: string; grainTemperatureC: number } | null;
  mashRows: EditorMashStep[];
  waterVolumes: { mashLiters: number | null; spargeLiters: number | null; boilLiters: number | null };
  buildYeastOverrides: () => Record<string, number | null>;
  equipmentProfiles: EquipmentProfile[];
  selectedEquipmentProfileId: string | null;
}) {
  const actions = useRecipeEditActions(params);
  const brewSessions = useRecipeEditBrewSessions({
    canCall: params.canCall,
    recipeId: params.recipeId,
    routerPush: params.routerPush,
  });

  return {
    saving: actions.saving,
    saveError: actions.saveError,
    saveStatus: actions.saveStatus,
    setSaveStatus: actions.setSaveStatus,
    creatingVersion: actions.creatingVersion,
    createVersionError: actions.createVersionError,
    duplicatingRecipe: actions.duplicatingRecipe,
    duplicateRecipeError: actions.duplicateRecipeError,
    equipmentApplyError: actions.equipmentApplyError,
    equipmentApplying: actions.equipmentApplying,
    applyEquipmentProfileToRecipe: actions.applyEquipmentProfileToRecipe,
    onSave: actions.onSave,
    onCreateAnotherVersion: actions.onCreateAnotherVersion,
    onDuplicateRecipe: actions.onDuplicateRecipe,
    creatingBrewSession: brewSessions.creatingBrewSession,
    brewSessionError: brewSessions.brewSessionError,
    brewSessions: brewSessions.brewSessions,
    brewSessionsLoading: brewSessions.brewSessionsLoading,
    programmedSessions: brewSessions.programmedSessions,
    brewingNowSessions: brewSessions.brewingNowSessions,
    lastBrewSessions: brewSessions.lastBrewSessions,
    onBrewRecipe: brewSessions.onBrewRecipe,
  };
}

export type RecipeEditSaveModel = ReturnType<typeof useRecipeEditSave>;
