"use client";

import { useCallback, useEffect, useState } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { webBreweryApiClient } from "../../../../../../../_lib/breweryWaterClient";
import { fetchRecipeWaterSettings } from "../../_lib/waterSettings";
import type { useWaterMashAcidification } from "./useWaterMashAcidification";
import type { useWaterMashAdjustment } from "./useWaterMashAdjustment";
import type { useWaterMashGrist } from "./useWaterMashGrist";
import type { useWaterMashSalts } from "./useWaterMashSalts";

export function useWaterMashPageLoad(params: {
  canCall: boolean;
  recipeId: string;
  adjustment: Pick<ReturnType<typeof useWaterMashAdjustment>, "hydrateMashAdjustment">;
  acid: Pick<ReturnType<typeof useWaterMashAcidification>, "hydrateMashAcidification">;
  salts: Pick<ReturnType<typeof useWaterMashSalts>, "hydrateMashSalts">;
  grist: Pick<ReturnType<typeof useWaterMashGrist>, "hydrateMashGrist">;
}) {
  const { canCall, recipeId, adjustment, acid, salts, grist } = params;

  const [settingsError, setSettingsError] = useState<string | null>(null);

  const loadRecipeMeta = useCallback(async (id: string) => {
    try {
      const data = await getRecipe(webBreweryApiClient(), id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, []);

  const loadSettings = useCallback(async () => {
    if (!canCall || !recipeId) return;
    setSettingsError(null);
    try {
      const data = await fetchRecipeWaterSettings(recipeId);
      const s = data.settings;
      if (!s) return;
      adjustment.hydrateMashAdjustment(s);
      acid.hydrateMashAcidification(s);
      salts.hydrateMashSalts(s);
      grist.hydrateMashGrist(s);
    } catch (err) {
      setSettingsError(String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate fns are stable useCallbacks from section hooks
  }, [
    canCall,
    recipeId,
    adjustment.hydrateMashAdjustment,
    acid.hydrateMashAcidification,
    salts.hydrateMashSalts,
    grist.hydrateMashGrist,
  ]);

  useEffect(() => {
    if (!canCall) return;
    void loadSettings();
  }, [canCall, recipeId, loadSettings]);

  return {
    loadRecipeMeta,
    loadSettings,
    settingsError,
    setSettingsError,
  };
}
