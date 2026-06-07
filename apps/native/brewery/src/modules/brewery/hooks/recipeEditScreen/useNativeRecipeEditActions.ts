import { patchRecipe } from "@umbraculum/brewery-api-client";
import type { EditorGristRow, EditorHopRow, EditorYeastRow } from "@umbraculum/brewery-beerjson";

import type { EquipmentProfile, Recipe } from "../../lib/recipeEditTypes";
import { useNativeRecipeEditEquipmentActions } from "./useNativeRecipeEditEquipmentActions";
import { useNativeRecipeEditSaveActions } from "./useNativeRecipeEditSaveActions";

type ApiClient = Parameters<typeof patchRecipe>[0];

export function useNativeRecipeEditActions(params: {
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
  equipmentProfiles: EquipmentProfile[];
  selectedEquipmentProfileId: string;
  loadRecipe: () => Promise<void>;
}) {
  const save = useNativeRecipeEditSaveActions(params);
  const equipment = useNativeRecipeEditEquipmentActions({
    api: params.api,
    recipeId: params.recipeId,
    recipe: params.recipe,
    t: params.t,
    equipmentProfiles: params.equipmentProfiles,
    selectedEquipmentProfileId: params.selectedEquipmentProfileId,
    loadRecipe: params.loadRecipe,
    setSaveStatus: save.setSaveStatus,
  });

  return {
    saving: save.saving,
    saveError: save.saveError,
    saveStatus: save.saveStatus,
    equipmentApplying: equipment.equipmentApplying,
    equipmentApplyError: equipment.equipmentApplyError,
    applyEquipmentProfileToRecipe: equipment.applyEquipmentProfileToRecipe,
    save: save.save,
  };
}
