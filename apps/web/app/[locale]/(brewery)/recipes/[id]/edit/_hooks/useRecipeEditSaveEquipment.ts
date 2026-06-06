"use client";

import { useState } from "react";

import { getRecipe, patchRecipe } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../../_lib/typeGuards";
import type { EquipmentProfile, Recipe } from "../_lib/recipeEditTypes";

export function useRecipeEditSaveEquipment(params: {
  t: (key: string) => string;
  tEquip: (key: string) => string;
  recipeId: string;
  recipe: Recipe | null;
  setRecipe: (r: Recipe | null) => void;
  setAnalysis: (a: unknown) => void;
  setSaveStatus: (status: string | null) => void;
  equipmentProfiles: EquipmentProfile[];
  selectedEquipmentProfileId: string;
}) {
  const {
    t,
    tEquip,
    recipeId,
    recipe,
    setRecipe,
    setAnalysis,
    setSaveStatus,
    equipmentProfiles,
    selectedEquipmentProfileId,
  } = params;

  const [equipmentApplyError, setEquipmentApplyError] = useState<string | null>(null);
  const [equipmentApplying, setEquipmentApplying] = useState(false);

  const applyEquipmentProfileToRecipe = async (mode: "apply" | "reload") => {
    if (!recipeId) return;
    setEquipmentApplyError(null);
    setEquipmentApplying(true);
    try {
      const selected = equipmentProfiles.find((p) => p.id === selectedEquipmentProfileId) ?? null;
      if (!selected) throw new Error(tEquip("errors.selectFirst"));

      const extBase = asRecord(recipe?.recipeExtJson);
      const base: Record<string, unknown> = extBase ? { ...extBase } : {};

      base["version"] = 1;
      base["equipment"] = selected.equipment;
      base["equipmentSource"] = { equipmentProfileId: selected.id, copiedAt: new Date().toISOString() };

      await patchRecipe(webBreweryApiClient(), recipeId, { recipeExtJson: base });

      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      const r = reload.recipe as unknown as Recipe;
      setRecipe(r);
      setAnalysis(r.analysis ?? null);
      setSaveStatus(mode === "reload" ? t("status.equipmentReloaded") : t("status.equipmentApplied"));
    } catch (err) {
      setEquipmentApplyError(String(err));
    } finally {
      setEquipmentApplying(false);
    }
  };

  return {
    equipmentApplyError,
    equipmentApplying,
    applyEquipmentProfileToRecipe,
  };
}
