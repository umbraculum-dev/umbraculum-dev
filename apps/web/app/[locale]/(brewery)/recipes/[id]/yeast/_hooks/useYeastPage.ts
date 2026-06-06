"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../../../_shell/_lib/useRequireAuth";
import { formatFixed } from "../../../../../../../src/i18n/format";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { useYeastPageLoad } from "./useYeastPageLoad";
import { useYeastPageSave } from "./useYeastPageSave";

export function useYeastPage() {
  const locale = useLocale();
  const t = useTranslations("recipes.edit");
  const tAnalysis = useTranslations("recipes.analysis");
  const tUnits = useTranslations("units");
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });

  const loadRecipeMeta = useCallback(async (id: string) => {
    try {
      const data = await getRecipe(webBreweryApiClient(), id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, []);

  const [surfaceMath, setSurfaceMath] = useState(false);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:yeast");
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:yeast", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  const canCallAccountScoped = authState.status === "ready" && Boolean(recipeId);

  const load = useYeastPageLoad(canCallAccountScoped, recipeId);
  const save = useYeastPageSave({
    recipeId,
    recipe: load.recipe,
    setRecipe: load.setRecipe,
    yeastRows: load.yeastRows,
    yeastAttenuationOverrides: load.yeastAttenuationOverrides,
    gristRows: load.gristRows,
    hopsRows: load.hopsRows,
    miscRows: load.miscRows,
    mash: load.mash,
    t,
  });

  return {
    locale,
    t,
    tAnalysis,
    tUnits,
    recipeId,
    authState,
    loadRecipeMeta,
    recipe: load.recipe,
    loading: load.loading,
    loadError: load.loadError,
    yeastRows: load.yeastRows,
    yeastAttenuationOverrides: load.yeastAttenuationOverrides,
    saving: save.saving,
    saveStatus: save.saveStatus,
    setSaveStatus: save.setSaveStatus,
    saveError: save.saveError,
    lowViabilityWarning: save.lowViabilityWarning,
    surfaceMath,
    setSurfaceMath,
    canCallAccountScoped,
    addYeastRow: load.addYeastRow,
    removeYeastRow: load.removeYeastRow,
    updateYeastRow: load.updateYeastRow,
    onAttenuationOverrideChange: load.onAttenuationOverrideChange,
    onSave: save.onSave,
    formatFixed,
  };
}

export type UseYeastPageModel = ReturnType<typeof useYeastPage>;
