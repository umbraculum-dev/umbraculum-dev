"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { useRequireAuth } from "../../../../../../../_shared-layout/_lib/useRequireAuth";
import { formatWithHint } from "../../../../../../../../src/i18n/format";
import { useWaterSurfaceMath } from "../../_hooks/useWaterSurfaceMath";
import { saveRecipeWaterSettings } from "../../_lib/waterSettings";
import { buildWaterMashPageReturn } from "./buildWaterMashPageReturn";
import {
  useWaterMashAcidification,
  type MashAdjustmentFieldsRef,
  type MashGristBridgeRef,
} from "./useWaterMashAcidification";
import { useWaterMashAdjustment } from "./useWaterMashAdjustment";
import { useWaterMashGrist } from "./useWaterMashGrist";
import { useWaterMashPageLoad } from "./useWaterMashPageLoad";
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

  const profilesHook = useWaterMashProfiles(canCall);
  const { surfaceMath, setSurfaceMath } = useWaterSurfaceMath("mash");
  const [openMashSections, setOpenMashSections] = useState<string[]>(["adjustment"]);
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

  const pageLoad = useWaterMashPageLoad({
    canCall,
    recipeId,
    adjustment,
    acid,
    salts,
    grist,
  });

  return buildWaterMashPageReturn({
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    authState,
    params,
    recipeId,
    pageLoad,
    profilesHook,
    surfaceMath,
    setSurfaceMath,
    openMashSections,
    setOpenMashSections,
    savingError,
    setSavingError,
    formatHints,
    setFormatHints,
    fmt,
    canCall,
    saveSettings,
    adjustment,
    grist,
    acid,
    salts,
    steps,
  });
}

export type WaterMashPageModel = ReturnType<typeof useWaterMashPage>;
