import { useCallback, useState } from "react";

import { patchRecipe } from "@umbraculum/brewery-api-client";

import { asRecord } from "../../../../lib/typeGuards";
import type { EquipmentProfile, Recipe } from "../../lib/recipeEditTypes";

type ApiClient = Parameters<typeof patchRecipe>[0];

export function useNativeRecipeEditEquipmentActions(params: {
  api: ApiClient | null;
  recipeId: string;
  recipe: Recipe | null;
  t: (key: string) => string;
  equipmentProfiles: EquipmentProfile[];
  selectedEquipmentProfileId: string;
  loadRecipe: () => Promise<void>;
  setSaveStatus: (value: string | null) => void;
}) {
  const {
    api,
    recipeId,
    recipe,
    t,
    equipmentProfiles,
    selectedEquipmentProfileId,
    loadRecipe,
    setSaveStatus,
  } = params;

  const [equipmentApplying, setEquipmentApplying] = useState(false);
  const [equipmentApplyError, setEquipmentApplyError] = useState<string | null>(null);

  const applyEquipmentProfileToRecipe = useCallback(
    async (mode: "apply" | "reload") => {
      if (!api || !recipeId) return;
      setEquipmentApplyError(null);
      setEquipmentApplying(true);
      try {
        const selected = equipmentProfiles.find((p) => p.id === selectedEquipmentProfileId) ?? null;
        if (!selected) throw new Error(t("equipmentSection.errors.selectFirst"));

        const baseRec = asRecord(recipe?.recipeExtJson);
        const base: Record<string, unknown> = baseRec ? { ...baseRec } : {};
        base["version"] = 1;
        base["equipment"] = selected.equipment;
        base["equipmentSource"] = { equipmentProfileId: selected.id, copiedAt: new Date().toISOString() };

        await patchRecipe(api, recipeId, { recipeExtJson: base });

        await loadRecipe();
        setSaveStatus(mode === "reload" ? t("status.equipmentReloaded") : t("status.equipmentApplied"));
      } catch (err) {
        setEquipmentApplyError(String(err));
      } finally {
        setEquipmentApplying(false);
      }
    },
    [api, recipeId, equipmentProfiles, selectedEquipmentProfileId, recipe, loadRecipe, t, setSaveStatus],
  );

  return {
    equipmentApplying,
    equipmentApplyError,
    applyEquipmentProfileToRecipe,
  };
}
