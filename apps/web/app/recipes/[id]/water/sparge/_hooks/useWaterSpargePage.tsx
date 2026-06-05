"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { formatWithHint } from "../../../../../../src/i18n/format";
import { useWaterPageAuthProfiles } from "../../_hooks/useWaterPageAuthProfiles";
import { useWaterSurfaceMath } from "../../_hooks/useWaterSurfaceMath";
import { fetchRecipeWaterSettings, saveRecipeWaterSettings } from "../../_lib/waterSettings";
import { useWaterSpargeAcidification, type SpargeSaltsBridgeRef } from "./useWaterSpargeAcidification";
import { useWaterSpargeConfig } from "./useWaterSpargeConfig";
import { useWaterSpargeSalts } from "./useWaterSpargeSalts";

export function useWaterSpargePage() {
  const locale = useLocale();
  const tWater = useTranslations("recipes.water.common");
  const t = useTranslations("recipes.water.sparge");
  const tEdit = useTranslations("recipes.edit");
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
  const { surfaceMath, setSurfaceMath } = useWaterSurfaceMath("sparge");
  const [openSpargeSections, setOpenSpargeSections] = useState<string[]>(["spargeConfig"]);
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

  const saltsBridgeRef = useRef<SpargeSaltsBridgeRef["current"]>({
    applySaltsFromCompute: () => {},
    buildSpargeSaltsInputsKey: () => "",
    spargeSaltsResult: null,
  });

  const acid = useWaterSpargeAcidification({
    canCall: auth.canCall,
    recipeId,
    saveSettings,
    setSavingError,
    waterProfiles: auth.waterProfiles,
    fmt,
    tUnits,
    setFormatHints,
    saltsBridgeRef,
  });

  const salts = useWaterSpargeSalts({
    canCall: auth.canCall,
    saveSettings,
    setSavingError,
    selectedSpargeProfile: acid.selectedSpargeProfile,
    volumeLiters: acid.volumeLiters,
    spargeWaterProfileId: acid.spargeWaterProfileId,
    spargeSaltAdditions: acid.spargeSaltAdditions,
    setSpargeSaltAdditions: acid.setSpargeSaltAdditions,
    refreshSpargeOverallIfPossible: acid.refreshSpargeOverallIfPossible,
  });

  saltsBridgeRef.current = {
    applySaltsFromCompute: (result, derivation) => {
      salts.applySaltsFromCompute(result, derivation);
    },
    buildSpargeSaltsInputsKey: salts.buildSpargeSaltsInputsKey,
    spargeSaltsResult: salts.spargeSaltsResult,
  };

  const config = useWaterSpargeConfig({
    saveSettings,
    setSavingError,
  });

  const loadSettings = useCallback(async () => {
    if (!recipeId) return;
    setSettingsError(null);
    try {
      const data = await fetchRecipeWaterSettings(recipeId);
      const s = data.settings;
      if (!s) return;
      config.hydrateSpargeConfig(s);
      acid.hydrateSpargeAcidification(s);
      salts.hydrateSpargeSalts(s);
    } catch (err) {
      setSettingsError(String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate fns are stable useCallbacks from section hooks
  }, [
    recipeId,
    config.hydrateSpargeConfig,
    acid.hydrateSpargeAcidification,
    salts.hydrateSpargeSalts,
  ]);

  useEffect(() => {
    if (!auth.authed) return;
    void loadSettings();
  }, [auth.authed, recipeId, loadSettings]);

  return {
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    params,
    recipeId,
    loadRecipeMeta,
    authChecked: auth.authChecked,
    authed: auth.authed,
    profilesError: auth.profilesError,
    settingsError,
    savingError,
    fmt,
    surfaceMath,
    setSurfaceMath,
    openSpargeSections,
    setOpenSpargeSections,
    canCall: auth.canCall,
    refreshProfiles: auth.refreshProfiles,
    waterProfiles: auth.waterProfiles,
    formatHints,
    ...config,
    ...acid,
    ...salts,
    _ensureSpargeSaltsSnapshotForAcidification: salts.ensureSpargeSaltsSnapshotForAcidification,
  };
}

export type WaterSpargePageModel = ReturnType<typeof useWaterSpargePage>;
