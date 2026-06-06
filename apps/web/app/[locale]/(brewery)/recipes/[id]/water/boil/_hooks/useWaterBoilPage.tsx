"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { formatWithHint } from "../../../../../../../../src/i18n/format";
import { useWaterPageAuthProfiles } from "../../_hooks/useWaterPageAuthProfiles";
import { useWaterSurfaceMath } from "../../_hooks/useWaterSurfaceMath";
import { fetchRecipeWaterSettings, saveRecipeWaterSettings } from "../../_lib/waterSettings";
import {
  useWaterBoilAcidification,
  type BoilAdjustmentFieldsRef,
  type BoilSaltsBridgeRef,
} from "./useWaterBoilAcidification";
import { useWaterBoilAdjustment } from "./useWaterBoilAdjustment";
import { useWaterBoilSalts } from "./useWaterBoilSalts";

export function useWaterBoilPage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.boil");
  const tUnits = useTranslations("units");
  const tMath = useTranslations("math");
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const loadRecipeMeta = useCallback(async (id: string) => {
    try {
      const data = await getRecipe(webBreweryApiClient(), id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, []);

  const auth = useWaterPageAuthProfiles();
  const { surfaceMath, setSurfaceMath } = useWaterSurfaceMath("boil");
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [formatHints, setFormatHints] = useState<Record<string, { decimals?: number }> | undefined>(undefined);

  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints, unitKey, fallback);

  const saveSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!auth.canCall) return;
      await saveRecipeWaterSettings(recipeId, patch);
    },
    [auth.canCall, recipeId],
  );

  const adjustmentFieldsRef = useRef<BoilAdjustmentFieldsRef["current"]>({
    sourceProfileId: "",
    targetProfileId: "",
    dilutionProfileId: "",
    tapVolumeLiters: 0,
    dilutionVolumeLiters: 0,
    mixedSourceProfile: null,
    derivedBoilWaterVolumeLiters: 0,
  });

  const saltsBridgeRef = useRef<BoilSaltsBridgeRef["current"]>({
    applySaltsFromCompute: () => {},
    ensureZeroSaltsSnapshotIfMissing: async () => {},
  });

  const acid = useWaterBoilAcidification({
    canCall: auth.canCall,
    recipeId,
    saveSettings,
    setSavingError,
    setFormatHints,
    saltsBridgeRef,
    adjustmentFieldsRef,
  });

  const adjustment = useWaterBoilAdjustment({
    saveSettings,
    setSavingError,
    waterProfiles: auth.waterProfiles,
    dilutionProfiles: auth.dilutionProfiles,
    startingAlkTouched: acid.startingAlkTouched,
    setStartingAlk: acid.setStartingAlk,
  });

  adjustmentFieldsRef.current = {
    sourceProfileId: adjustment.sourceProfileId,
    targetProfileId: adjustment.targetProfileId,
    dilutionProfileId: adjustment.dilutionProfileId,
    tapVolumeLiters: adjustment.tapVolumeLiters,
    dilutionVolumeLiters: adjustment.dilutionVolumeLiters,
    mixedSourceProfile: adjustment.mixedSourceProfile,
    derivedBoilWaterVolumeLiters: adjustment.derivedBoilWaterVolumeLiters,
  };

  const salts = useWaterBoilSalts({
    canCall: auth.canCall,
    saveSettings,
    setSavingError,
    mixedSourceProfile: adjustment.mixedSourceProfile,
    tapVolumeLiters: adjustment.tapVolumeLiters,
    dilutionVolumeLiters: adjustment.dilutionVolumeLiters,
    selectedSource: adjustment.selectedSource,
    selectedDilution: adjustment.selectedDilution,
    saltAdditions: acid.saltAdditions,
    setSaltAdditions: acid.setSaltAdditions,
  });

  saltsBridgeRef.current = {
    applySaltsFromCompute: salts.applySaltsFromCompute,
    ensureZeroSaltsSnapshotIfMissing: salts.ensureZeroSaltsSnapshotIfMissing,
  };

  const loadSettings = useCallback(async () => {
    if (!recipeId) return;
    setSettingsError(null);
    try {
      const data = await fetchRecipeWaterSettings(recipeId);
      const s = data.settings;
      if (!s) return;
      adjustment.hydrateBoilAdjustment(s);
      acid.hydrateBoilAcidification(s);
      salts.hydrateBoilSalts(s);
    } catch (err) {
      setSettingsError(String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate fns are stable useCallbacks from section hooks
  }, [
    recipeId,
    adjustment.hydrateBoilAdjustment,
    acid.hydrateBoilAcidification,
    salts.hydrateBoilSalts,
  ]);

  useEffect(() => {
    if (!auth.authed) return;
    void loadSettings();
  }, [auth.authed, recipeId, loadSettings]);

  return {
    locale,
    tWater,
    t,
    tUnits,
    tMath,
    params,
    recipeId,
    loadRecipeMeta,
    authChecked: auth.authChecked,
    authed: auth.authed,
    loadingProfiles: auth.loadingProfiles,
    profilesError: auth.profilesError,
    settingsError,
    savingError,
    fmt,
    surfaceMath,
    setSurfaceMath,
    displayAlkalinityPpmCaCO3: acid.displayAlkalinityPpmCaCO3,
    canCall: auth.canCall,
    refreshProfiles: auth.refreshProfiles,
    waterProfiles: auth.waterProfiles,
    dilutionProfiles: auth.dilutionProfiles,
    formatHints,
    ...adjustment,
    ...acid,
    ...salts,
    _profiles: auth.profiles,
  };
}

export type WaterBoilPageModel = ReturnType<typeof useWaterBoilPage>;
