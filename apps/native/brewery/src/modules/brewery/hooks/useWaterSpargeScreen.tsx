import { useCallback, useEffect, useState } from "react";

import { getRecipe, getRecipeWaterSettings, listWaterProfiles, updateRecipeWaterSettings } from "@umbraculum/brewery-api-client";
import type { WaterProfilesResponse } from "@umbraculum/brewery-contracts";
import { useT } from "@umbraculum/i18n-react";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import { useAuth, getApiBaseUrl, nativePlatformApiClient } from "@umbraculum/native-shell/auth";
import { useLocaleController } from "@umbraculum/native-shell/i18n";
import type { RootStackParamList } from "../../../navigation/types";
import { useNativeWaterSpargeAcidification } from "./waterSparge/useNativeWaterSpargeAcidification";
import { useNativeWaterSpargeConfig } from "./waterSparge/useNativeWaterSpargeConfig";
import { useNativeWaterSpargeProfiles } from "./waterSparge/useNativeWaterSpargeProfiles";
import { useNativeWaterSpargeSalts } from "./waterSparge/useNativeWaterSpargeSalts";

export function useWaterSpargeScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("recipes.water.sparge");
  const { t: tEdit } = useT("recipes.edit");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["spargeConfig", "acidification", "salts"]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const profilesDerived = useNativeWaterSpargeProfiles(profiles);
  const config = useNativeWaterSpargeConfig({ canCall, saveSettings, setError });
  const salts = useNativeWaterSpargeSalts({ canCall, saveSettings, setError, setSaving, setSaveStatus });
  const acidification = useNativeWaterSpargeAcidification({
    canCall,
    recipeId,
    baseUrl,
    token,
    saveSettings,
    setSettings,
    setError,
    waterProfiles: profilesDerived.waterProfiles,
    saltAdditions: salts.saltAdditions,
    setSaving,
    setSaveStatus,
  });

  const hydrateFromSettings = useCallback(
    (s: Record<string, unknown>) => {
      config.hydrateSpargeConfig(s);
      acidification.hydrateSpargeAcidification(s);
      salts.hydrateSpargeSalts(s);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sub-hook hydrate fns are stable useCallbacks
    [config.hydrateSpargeConfig, acidification.hydrateSpargeAcidification, salts.hydrateSpargeSalts],
  );

  const loadData = useCallback(async () => {
    if (!canCall || !recipeId) return;
    setLoading(true);
    setError(null);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const [profilesData, settingsData] = await Promise.all([
        listWaterProfiles(api),
        getRecipeWaterSettings(api, recipeId),
      ]);
      setProfiles(profilesData);
      const s = settingsData.settings;
      if (s) {
        setSettings(s);
        hydrateFromSettings(s);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [canCall, recipeId, baseUrl, token, hydrateFromSettings]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    route,
    recipeId,
    navigation,
    auth,
    locale,
    baseUrl,
    token,
    loadRecipeMeta,
    t,
    tEdit,
    tCommon,
    tUnits,
    tWaterCommon,
    canCall,
    profiles,
    setProfiles,
    _settings,
    setSettings,
    loading,
    setLoading,
    error,
    setError,
    openSections,
    setOpenSections,
    ...config,
    ...acidification,
    ...salts,
    saveStatus,
    setSaveStatus,
    saving,
    setSaving,
    ...profilesDerived,
    loadData,
    saveSettings,
    onSaveSalts: salts.onSaveSalts,
  };
}

export type WaterSpargeScreenModel = ReturnType<typeof useWaterSpargeScreen>;
