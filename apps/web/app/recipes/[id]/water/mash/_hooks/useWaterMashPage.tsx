"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { useRequireAuth } from "../../../../../_lib/useRequireAuth";
import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { formatWithHint } from "../../../../../../src/i18n/format";
import { useWaterSurfaceMath } from "../../_hooks/useWaterSurfaceMath";
import { fetchRecipeWaterSettings, saveRecipeWaterSettings } from "../../_lib/waterSettings";
import {
  useWaterMashAcidification,
  type MashAdjustmentFieldsRef,
  type MashGristBridgeRef,
} from "./useWaterMashAcidification";
import { useWaterMashAdjustment } from "./useWaterMashAdjustment";
import { useWaterMashGrist } from "./useWaterMashGrist";
import { useWaterMashProfiles } from "./useWaterMashProfiles";
import { useWaterMashSalts, type MashSaltsBridgeRef } from "./useWaterMashSalts";
import { useWaterMashSteps } from "./useWaterMashSteps";

export function useWaterMashPage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.mash");
  const tEdit = useTranslations("recipes.edit");
  const tUnits = useTranslations("units");
  const tMath = useTranslations("math");
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const canCall = authState.status === "ready";

  const loadRecipeMeta = useCallback(async (id: string) => {
    try {
      const data = await getRecipe(webBreweryApiClient(), id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, []);

  const profilesHook = useWaterMashProfiles(canCall);
  const { surfaceMath, setSurfaceMath } = useWaterSurfaceMath("mash");
  const [openMashSections, setOpenMashSections] = useState<string[]>(["adjustment"]);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [formatHints, setFormatHints] = useState<Record<string, { decimals?: number }> | undefined>(undefined);

  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints, unitKey, fallback);

  const saveSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!canCall) return;
      await saveRecipeWaterSettings(recipeId, patch);
    },
    [canCall, recipeId],
  );

  const adjustmentFieldsRef = useRef<MashAdjustmentFieldsRef["current"]>({
    sourceProfileId: "",
    dilutionProfileId: "",
    tapVolumeLiters: 0,
    dilutionVolumeLiters: 0,
    mixedSourceProfile: null,
    derivedMashWaterVolumeLiters: 0,
  });

  const gristBridgeRef = useRef<MashGristBridgeRef["current"]>({
    gristImportedRows: [],
  });

  const saltsBridgeRef = useRef<MashSaltsBridgeRef["current"]>({
    applySaltsFromCompute: () => {},
    ensureZeroSaltsSnapshotIfMissing: async () => {},
  });

  const acid = useWaterMashAcidification({
    canCall,
    recipeId,
    saveSettings,
    setSavingError,
    setFormatHints,
    saltsBridgeRef,
    adjustmentFieldsRef,
    gristBridgeRef,
  });

  const adjustment = useWaterMashAdjustment({
    saveSettings,
    setSavingError,
    waterProfiles: profilesHook.waterProfiles,
    dilutionProfiles: profilesHook.dilutionProfiles,
    mashStartingAlkTouched: acid.mashStartingAlkTouched,
    setMashStartingAlk: acid.setMashStartingAlk,
  });

  adjustmentFieldsRef.current = {
    sourceProfileId: adjustment.sourceProfileId,
    dilutionProfileId: adjustment.dilutionProfileId,
    tapVolumeLiters: adjustment.tapVolumeLiters,
    dilutionVolumeLiters: adjustment.dilutionVolumeLiters,
    mixedSourceProfile: adjustment.mixedSourceProfile,
    derivedMashWaterVolumeLiters: adjustment.derivedMashWaterVolumeLiters,
  };

  const steps = useWaterMashSteps({
    canCall,
    recipeId,
    derivedMashWaterVolumeLiters: adjustment.derivedMashWaterVolumeLiters,
  });

  const grist = useWaterMashGrist({
    canCall,
    recipeId,
    saveSettings,
    recipe: steps.recipe,
  });

  gristBridgeRef.current = {
    gristImportedRows: grist.gristImportedRows,
  };

  const salts = useWaterMashSalts({
    canCall,
    saveSettings,
    setSavingError,
    mixedSourceProfile: adjustment.mixedSourceProfile,
    tapVolumeLiters: adjustment.tapVolumeLiters,
    dilutionVolumeLiters: adjustment.dilutionVolumeLiters,
    derivedMashWaterVolumeLiters: adjustment.derivedMashWaterVolumeLiters,
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
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    authState,
    params,
    recipeId,
    loadRecipeMeta,
    me: profilesHook.me,
    profiles: profilesHook.profiles,
    loadingProfiles: profilesHook.loadingProfiles,
    profilesError: profilesHook.profilesError,
    settingsError,
    setSettingsError,
    savingError,
    setSavingError,
    formatHints,
    setFormatHints,
    fmt,
    canCall,
    surfaceMath,
    setSurfaceMath,
    openMashSections,
    setOpenMashSections,
    refreshProfiles: profilesHook.refreshProfiles,
    loadSettings,
    waterVolumes: steps.waterVolumes,
    allProfiles: profilesHook.allProfiles,
    waterProfiles: profilesHook.waterProfiles,
    dilutionProfiles: profilesHook.dilutionProfiles,
    admin: profilesHook.admin,
    saveSettings,
    ...adjustment,
    ...grist,
    ...acid,
    ...salts,
    ...steps,
  };
}

export type WaterMashPageModel = ReturnType<typeof useWaterMashPage>;
