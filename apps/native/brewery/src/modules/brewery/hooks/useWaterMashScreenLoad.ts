import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

import {
  getRecipe,
  listWaterProfiles,
  getRecipeWaterSettings,
  updateRecipeWaterSettings,
} from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import type { WaterProfilesResponse } from "@umbraculum/brewery-contracts";

import { nativePlatformApiClient } from "@umbraculum/native-shell/auth";

export type WaterMashScreenLoadHydratorsRef = MutableRefObject<{
  hydrateFromSettings: (settings: Record<string, unknown>) => void;
  applyRecipeMashState: (recipe: unknown, mashStepsDirty: boolean) => void;
  mashStepsDirty: boolean;
}>;

export function useWaterMashScreenLoad(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  hydratorsRef: WaterMashScreenLoadHydratorsRef;
}) {
  const { canCall, recipeId, baseUrl, token, hydratorsRef } = params;

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const api = nativePlatformApiClient(token, baseUrl);
    try {
      const data = await getRecipe(api, id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, [baseUrl, token]);

  const saveSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!canCall) return;
      const api = nativePlatformApiClient(token!, baseUrl);
      const d = await updateRecipeWaterSettings(api, recipeId, patch);
      if (d.settings) setSettings(d.settings);
    },
    [canCall, recipeId, baseUrl, token],
  );

  const loadDataRef = useRef<() => Promise<void>>(async () => {});

  const loadData = useCallback(async () => {
    if (!canCall) return;
    setLoading(true);
    setError(null);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const [profilesData, settingsData, recipeData] = await Promise.all([
        listWaterProfiles(api),
        getRecipeWaterSettings(api, recipeId),
        getRecipe(api, recipeId),
      ]);
      setProfiles(profilesData);
      if (settingsData.settings) {
        const s = settingsData.settings;
        setSettings(s);
        hydratorsRef.current.hydrateFromSettings(s);
      }
      const d = recipeData.recipe;
      if (d) {
        hydratorsRef.current.applyRecipeMashState(d, hydratorsRef.current.mashStepsDirty);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [canCall, recipeId, baseUrl, token, hydratorsRef]);

  loadDataRef.current = loadData;

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    profiles,
    setProfiles,
    _settings,
    setSettings,
    loading,
    setLoading,
    error,
    setError,
    loadData,
    loadDataRef,
    saveSettings,
    loadRecipeMeta,
  };
}
