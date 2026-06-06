import { useCallback, useEffect, useState } from "react";

import { getRecipe, getRecipeWaterSettings, listWaterProfiles, updateRecipeWaterSettings } from "@umbraculum/api-client/brewery";
import type { WaterProfilesResponse } from "@umbraculum/brewery-contracts";
import { useT } from "@umbraculum/i18n-react";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";
import { useLocaleController } from "../../../i18n/I18nProvider";
import type { RootStackParamList } from "../../../navigation/types";
import { useNativeWaterBoilAcidification } from "./waterBoil/useNativeWaterBoilAcidification";
import { useNativeWaterBoilAdjustment } from "./waterBoil/useNativeWaterBoilAdjustment";
import { useNativeWaterBoilProfiles } from "./waterBoil/useNativeWaterBoilProfiles";
import { useNativeWaterBoilSalts } from "./waterBoil/useNativeWaterBoilSalts";

export function useWaterBoilScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale: _locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("recipes.water.boil");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["adjustment", "acidification", "salts"]);
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

  const profilesDerived = useNativeWaterBoilProfiles(profiles);
  const adjustment = useNativeWaterBoilAdjustment({
    canCall,
    saveSettings,
    setError,
    setSaving,
    setSaveStatus,
    waterProfiles: profilesDerived.waterProfiles,
    dilutionProfiles: profilesDerived.dilutionProfiles,
  });
  const salts = useNativeWaterBoilSalts({ canCall, saveSettings, setError, setSaving, setSaveStatus });
  const acidification = useNativeWaterBoilAcidification({
    canCall,
    recipeId,
    baseUrl,
    token,
    saveSettings,
    setSettings,
    setError,
    setSaving,
    setSaveStatus,
    sourceProfileId: adjustment.sourceProfileId,
    targetProfileId: adjustment.targetProfileId,
    dilutionProfileId: adjustment.dilutionProfileId,
    tapVolumeLiters: adjustment.tapVolumeLiters,
    dilutionVolumeLiters: adjustment.dilutionVolumeLiters,
    derivedBoilWaterVolumeLiters: adjustment.derivedBoilWaterVolumeLiters,
    derivedStartingAlkPpmCaCO3: adjustment.derivedStartingAlkPpmCaCO3,
    saltAdditions: salts.saltAdditions,
  });

  const hydrateFromSettings = useCallback(
    (s: Record<string, unknown>) => {
      adjustment.hydrateBoilAdjustment(s);
      acidification.hydrateBoilAcidification(s);
      salts.hydrateBoilSalts(s);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sub-hook hydrate fns are stable useCallbacks
    [adjustment.hydrateBoilAdjustment, acidification.hydrateBoilAcidification, salts.hydrateBoilSalts],
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
    _locale,
    baseUrl,
    token,
    loadRecipeMeta,
    t,
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
    ...adjustment,
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

export type WaterBoilScreenModel = ReturnType<typeof useWaterBoilScreen>;
