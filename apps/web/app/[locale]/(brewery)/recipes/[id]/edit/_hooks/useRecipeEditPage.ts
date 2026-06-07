"use client";

import { useCallback } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../../../_shared-layout/_lib/useRequireAuth";
import { roundTo } from "../_lib/recipeEditHelpers";
import { buildRecipeEditPageReturn } from "./buildRecipeEditPageReturn";
import { useRecipeEditAnalysis } from "./useRecipeEditAnalysis";
import { useRecipeEditCatalogs } from "./useRecipeEditCatalogs";
import { useRecipeEditFermentables } from "./useRecipeEditFermentables";
import { useRecipeEditHops } from "./useRecipeEditHops";
import { useRecipeEditLayout } from "./useRecipeEditLayout";
import { useRecipeEditLoad } from "./useRecipeEditLoad";
import { useRecipeEditMashing } from "./useRecipeEditMashing";
import { useRecipeEditMisc } from "./useRecipeEditMisc";
import { useRecipeEditPageI18n } from "./useRecipeEditPageI18n";
import { useRecipeEditSave } from "./useRecipeEditSave";
import { useRecipeEditSections } from "./useRecipeEditSections";
import { useRecipeEditYeast } from "./useRecipeEditYeast";

export function useRecipeEditPage() {
  const i18n = useRecipeEditPageI18n();
  const { t, tEquip, router, recipeId } = i18n;
  const authState = useRequireAuth({ requireActiveWorkspace: true });

  const loadRecipeMeta = useCallback(async (id: string) => {
    try {
      const data = await getRecipe(webBreweryApiClient(), id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, []);

  const analysisState = useRecipeEditAnalysis();
  const { analysis, setAnalysis } = analysisState;

  const layout = useRecipeEditLayout();
  const sections = useRecipeEditSections(t);
  const catalogs = useRecipeEditCatalogs(authState.status === "ready");

  const canCallAccountScoped = authState.status === "ready" && Boolean(recipeId);

  const fermentables = useRecipeEditFermentables({ t, roundTo });
  const hops = useRecipeEditHops({ roundTo });
  const yeast = useRecipeEditYeast();
  const mashing = useRecipeEditMashing({ analysis, tSparge: i18n.tSparge, canCallAccountScoped, recipeId });

  const misc = useRecipeEditMisc({ gristRows: fermentables.gristRows, waterSettings: mashing.waterSettings });

  const load = useRecipeEditLoad({
    canCall: canCallAccountScoped,
    recipeId,
    hydrators: {
      hydrateGristRows: fermentables.hydrateGristRows,
      hydrateHopsRows: hops.hydrateHopsRows,
      hydrateYeast: yeast.hydrateYeast,
      hydrateYeastAttenuationOverrides: yeast.hydrateYeastAttenuationOverrides,
      hydrateMash: mashing.hydrateMash,
    },
    setMiscRows: misc.setMiscRows,
    setSelectedEquipmentProfileId: catalogs.setSelectedEquipmentProfileId,
    setAnalysis,
  });

  const save = useRecipeEditSave({
    t,
    tEquip,
    recipeId,
    canCall: canCallAccountScoped,
    routerPush: router.push,
    recipe: load.recipe,
    setRecipe: load.setRecipe,
    setAnalysis,
    setStyleKey: load.setStyleKey,
    styleKey: load.styleKey,
    name: load.name,
    notes: load.notes,
    boilTimeMinutes: load.boilTimeMinutes,
    gristRows: fermentables.gristRows,
    hopsRows: hops.hopsRows,
    yeastRows: yeast.yeastRows,
    miscRows: misc.miscRows,
    mashProcedure: mashing.mashProcedure,
    mashRows: mashing.mashRows,
    waterVolumes: mashing.waterVolumes,
    buildYeastOverrides: yeast.buildYeastOverrides,
    equipmentProfiles: catalogs.equipmentProfiles,
    selectedEquipmentProfileId: catalogs.selectedEquipmentProfileId,
  });

  return buildRecipeEditPageReturn({
    i18n,
    authState,
    loadRecipeMeta,
    layout,
    sections,
    catalogs,
    canCallAccountScoped,
    fermentables,
    hops,
    yeast,
    mashing,
    misc,
    load,
    save,
    analysisState,
    roundTo,
  });
}

export type RecipeEditPageModel = ReturnType<typeof useRecipeEditPage>;
