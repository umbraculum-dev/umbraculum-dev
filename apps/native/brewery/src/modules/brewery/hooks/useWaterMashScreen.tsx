import { useRef, useState } from "react";

import { useT } from "@umbraculum/i18n-react";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import { useAuth, getApiBaseUrl } from "@umbraculum/native-shell/auth";
import { useLocaleController } from "@umbraculum/native-shell/i18n";
import type { RootStackParamList } from "../../../navigation/types";
import { useNativeWaterMashAcidification } from "./waterMash/useNativeWaterMashAcidification";
import { useNativeWaterMashAdjustment } from "./waterMash/useNativeWaterMashAdjustment";
import { useNativeWaterMashGrist } from "./waterMash/useNativeWaterMashGrist";
import { useNativeWaterMashProfiles } from "./waterMash/useNativeWaterMashProfiles";
import { useNativeWaterMashSalts } from "./waterMash/useNativeWaterMashSalts";
import { useNativeWaterMashSteps } from "./waterMash/useNativeWaterMashSteps";
import { useWaterMashScreenLoad, type WaterMashScreenLoadHydratorsRef } from "./useWaterMashScreenLoad";

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

  const [openSections, setOpenSections] = useState<string[]>(["adjustment", "acidification"]);

  const canCall = Boolean(recipeId && baseUrl && token);

  const hydratorsRef = useRef<WaterMashScreenLoadHydratorsRef["current"]>({
    hydrateFromSettings: () => {},
    applyRecipeMashState: () => {},
    mashStepsDirty: false,
  });

  const load = useWaterMashScreenLoad({ canCall, recipeId, baseUrl, token, hydratorsRef });

  const profilesDerived = useNativeWaterMashProfiles(load.profiles);

  const adjustment = useNativeWaterMashAdjustment({
    waterProfiles: profilesDerived.waterProfiles,
    dilutionProfiles: profilesDerived.dilutionProfiles,
    saveSettings: load.saveSettings,
    setError: load.setError,
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
    saveSettings: load.saveSettings,
    setError: load.setError,
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

  const steps = useNativeWaterMashSteps({
    canCall,
    recipeId,
    baseUrl,
    token,
    derivedMashWaterVolumeLiters: adjustment.derivedMashWaterVolumeLiters,
    setError: load.setError,
    t,
    onAfterSave: () => {
      void load.loadDataRef.current();
    },
  });

  const grist = useNativeWaterMashGrist({
    canCall,
    recipeId,
    baseUrl,
    token,
    saveSettings: load.saveSettings,
    recipe: steps.recipe,
  });

  hydratorsRef.current = {
    hydrateFromSettings: (s) => {
      adjustment.hydrateMashAdjustment(s);
      acid.hydrateMashAcidification(s);
      salts.hydrateMashSalts(s);
      grist.hydrateMashGrist(s);
    },
    applyRecipeMashState: (recipe, mashStepsDirty) =>
      steps.applyRecipeMashState(recipe as Parameters<typeof steps.applyRecipeMashState>[0], mashStepsDirty),
    mashStepsDirty: steps.mashStepsDirty,
  };

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
    loadRecipeMeta: load.loadRecipeMeta,
    t,
    tEdit,
    tCommon,
    tUnits,
    tWaterCommon,
    profiles: load.profiles,
    setProfiles: load.setProfiles,
    _settings: load._settings,
    setSettings: load.setSettings,
    loading: load.loading,
    setLoading: load.setLoading,
    error: load.error,
    setError: load.setError,
    openSections,
    setOpenSections,
    canCall,
    loadData: load.loadData,
    saveSettings: load.saveSettings,
    ...profilesDerived,
    ...adjustmentPublic,
    ...saltsPublic,
    ...acidPublic,
    ...gristPublic,
    ...stepsPublic,
  };
}

export type WaterMashScreenModel = ReturnType<typeof useWaterMashScreen>;
