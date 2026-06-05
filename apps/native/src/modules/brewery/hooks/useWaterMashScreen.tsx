import { useCallback, useEffect, useRef, useState } from "react";

import {
  getRecipe,
  listWaterProfiles,
  getRecipeWaterSettings,
  updateRecipeWaterSettings,
} from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import type { WaterProfilesResponse } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";
import { useLocaleController } from "../../../i18n/I18nProvider";
import type { RootStackParamList } from "../../../navigation/types";
import { useNativeWaterMashAcidification } from "./waterMash/useNativeWaterMashAcidification";
import { useNativeWaterMashAdjustment } from "./waterMash/useNativeWaterMashAdjustment";
import { useNativeWaterMashGrist } from "./waterMash/useNativeWaterMashGrist";
import { useNativeWaterMashProfiles } from "./waterMash/useNativeWaterMashProfiles";
import { useNativeWaterMashSalts } from "./waterMash/useNativeWaterMashSalts";
import { useNativeWaterMashSteps } from "./waterMash/useNativeWaterMashSteps";

export function useWaterMashScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("recipes.water.mash");
  const { t: tEdit } = useT("recipes.edit");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["adjustment", "acidification"]);

  const canCall = Boolean(recipeId && baseUrl && token);

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

  const profilesDerived = useNativeWaterMashProfiles(profiles);

  const adjustment = useNativeWaterMashAdjustment({
    waterProfiles: profilesDerived.waterProfiles,
    dilutionProfiles: profilesDerived.dilutionProfiles,
    saveSettings,
    setError,
  });

  const adjustmentFieldsRef = useRef({
    sourceProfileId: "",
    dilutionProfileId: "",
    tapNum: 0,
    dilNum: 0,
    derivedMashWaterVolumeLiters: 0,
  });

  const salts = useNativeWaterMashSalts();

  const acid = useNativeWaterMashAcidification({
    canCall,
    recipeId,
    baseUrl,
    token,
    saveSettings,
    setError,
    adjustmentFieldsRef,
    saltAdditions: salts.saltAdditions,
  });

  adjustmentFieldsRef.current = {
    sourceProfileId: adjustment.sourceProfileId,
    dilutionProfileId: adjustment.dilutionProfileId,
    tapNum: adjustment.tapNum,
    dilNum: adjustment.dilNum,
    derivedMashWaterVolumeLiters: adjustment.derivedMashWaterVolumeLiters,
  };

  const loadDataRef = useRef<() => Promise<void>>(async () => {});

  const steps = useNativeWaterMashSteps({
    canCall,
    recipeId,
    baseUrl,
    token,
    derivedMashWaterVolumeLiters: adjustment.derivedMashWaterVolumeLiters,
    setError,
    t,
    onAfterSave: () => {
      void loadDataRef.current();
    },
  });

  const grist = useNativeWaterMashGrist({
    canCall,
    recipeId,
    baseUrl,
    token,
    saveSettings,
    recipe: steps.recipe,
  });

  const gristBridgeRef = useRef({ gristImportedRows: grist.gristImportedRows });
  gristBridgeRef.current = { gristImportedRows: grist.gristImportedRows };

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
        adjustment.hydrateMashAdjustment(s);
        acid.hydrateMashAcidification(s);
        salts.hydrateMashSalts(s);
        grist.hydrateMashGrist(s);
      }
      const d = recipeData.recipe;
      if (d) {
        steps.applyRecipeMashState(d, steps.mashStepsDirty);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [
    canCall,
    recipeId,
    baseUrl,
    token,
    adjustment,
    acid,
    salts,
    grist,
    steps,
  ]);

  loadDataRef.current = loadData;

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const {
    hydrateMashAdjustment: _hydrateAdjustment,
    ...adjustmentPublic
  } = adjustment;
  const { hydrateMashAcidification: _hydrateAcid, ...acidPublic } = acid;
  const { hydrateMashSalts: _hydrateSalts, ...saltsPublic } = salts;
  const { hydrateMashGrist: _hydrateGrist, ...gristPublic } = grist;
  const { applyRecipeMashState: _applyRecipeMashState, ...stepsPublic } = steps;

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
    canCall,
    loadData,
    saveSettings,
    ...profilesDerived,
    ...adjustmentPublic,
    ...saltsPublic,
    ...acidPublic,
    ...gristPublic,
    ...stepsPublic,
  };
}

export type WaterMashScreenModel = ReturnType<typeof useWaterMashScreen>;
