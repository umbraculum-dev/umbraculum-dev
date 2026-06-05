"use client";

import { useRouter } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import { roundTo } from "../_lib/recipeEditHelpers";
import { useRecipeEditCatalogs } from "./useRecipeEditCatalogs";
import { useRecipeEditFermentables } from "./useRecipeEditFermentables";
import { useRecipeEditHops } from "./useRecipeEditHops";
import { useRecipeEditLayout } from "./useRecipeEditLayout";
import { useRecipeEditLoad } from "./useRecipeEditLoad";
import { useRecipeEditMashing } from "./useRecipeEditMashing";
import { useRecipeEditMisc } from "./useRecipeEditMisc";
import { useRecipeEditSave } from "./useRecipeEditSave";
import { useRecipeEditSections } from "./useRecipeEditSections";
import { useRecipeEditYeast } from "./useRecipeEditYeast";
import type { YeastSearchResult } from "../_lib/recipeEditTypes";

export function useRecipeEditPage() {
  const t = useTranslations("recipes.edit");
  const tHops = useTranslations("recipes.edit.hops");
  const tEquip = useTranslations("recipes.edit.equipmentSection");
  const tAnalysis = useTranslations("recipes.analysis");
  const tMath = useTranslations("math");
  const tNav = useTranslations("nav");
  const tUnits = useTranslations("units");
  const tWater = useTranslations("waterHub");
  const tSparge = useTranslations("recipes.water.sparge");
  const locale = useLocale();
  const router = useRouter();
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

  const [analysis, setAnalysis] = useState<unknown>(null);

  const { layoutMetrics, useDesktopRail } = useRecipeEditLayout();
  const { sections, openSections, setSectionOpen, surfaceMath, setSurfaceMath } = useRecipeEditSections(t);
  const catalogs = useRecipeEditCatalogs(authState.status === "ready");

  const canCallAccountScoped = authState.status === "ready" && Boolean(recipeId);

  const fermentables = useRecipeEditFermentables({ t, roundTo });
  const hops = useRecipeEditHops({ roundTo });
  const yeast = useRecipeEditYeast();
  const mashing = useRecipeEditMashing({ analysis, tSparge, canCallAccountScoped, recipeId });

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

  const _addYeastFromDb = (item: YeastSearchResult) => {
    const id = typeof item.id === "string" ? item.id : null;
    const nameRaw = typeof item.name === "string" ? item.name : "";
    if (!id || !nameRaw) return;
    const lab = typeof item.lab === "string" ? item.lab : null;
    const productId = typeof item.productId === "string" ? item.productId : null;
    const attenuationMin =
      typeof item.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
    void { id, nameRaw, lab, productId, attenuationMin, attenuationMax };
  };

  return {
    t,
    tHops,
    tEquip,
    tAnalysis,
    tMath,
    tNav,
    tUnits,
    tWater,
    tSparge,
    locale,
    router,
    recipeId,
    authState,
    loadRecipeMeta,
    layoutMetrics,
    useDesktopRail,
    roundTo,
    sections,
    openSections,
    setSectionOpen,
    surfaceMath,
    setSurfaceMath,
    loading: load.loading,
    loadError: load.loadError,
    saving: save.saving,
    saveError: save.saveError,
    saveStatus: save.saveStatus,
    setSaveStatus: save.setSaveStatus,
    recipe: load.recipe,
    analysis,
    versions: load.versions,
    _versionsLoading: load._versionsLoading,
    versionsError: load.versionsError,
    creatingVersion: save.creatingVersion,
    createVersionError: save.createVersionError,
    duplicatingRecipe: save.duplicatingRecipe,
    creatingBrewSession: save.creatingBrewSession,
    brewSessionError: save.brewSessionError,
    brewSessions: save.brewSessions,
    brewSessionsLoading: save.brewSessionsLoading,
    duplicateRecipeError: save.duplicateRecipeError,
    name: load.name,
    setName: load.setName,
    styleKey: load.styleKey,
    setStyleKey: load.setStyleKey,
    notes: load.notes,
    setNotes: load.setNotes,
    gristRows: fermentables.gristRows,
    setGristRows: fermentables.setGristRows,
    hopsRows: hops.hopsRows,
    setHopsRows: hops.setHopsRows,
    yeastRows: yeast.yeastRows,
    setYeastRows: yeast.setYeastRows,
    miscRows: misc.miscRows,
    setMiscRows: misc.setMiscRows,
    mashProcedure: mashing.mashProcedure,
    setMashProcedure: mashing.setMashProcedure,
    mashRows: mashing.mashRows,
    setMashRows: mashing.setMashRows,
    waterSettings: mashing.waterSettings,
    yeastAttenuationOverrides: yeast.yeastAttenuationOverrides,
    setYeastAttenuationOverrides: yeast.setYeastAttenuationOverrides,
    boilTimeMinutes: load.boilTimeMinutes,
    setBoilTimeMinutes: load.setBoilTimeMinutes,
    styles: catalogs.styles,
    stylesLoading: catalogs.stylesLoading,
    stylesError: catalogs.stylesError,
    equipmentProfiles: catalogs.equipmentProfiles,
    equipmentProfilesLoading: catalogs.equipmentProfilesLoading,
    equipmentProfilesError: catalogs.equipmentProfilesError,
    selectedEquipmentProfileId: catalogs.selectedEquipmentProfileId,
    setSelectedEquipmentProfileId: catalogs.setSelectedEquipmentProfileId,
    equipmentApplyError: save.equipmentApplyError,
    equipmentApplying: save.equipmentApplying,
    fermentableQuery: fermentables.fermentableQuery,
    setFermentableQuery: fermentables.setFermentableQuery,
    fermentableResults: fermentables.fermentableResults,
    fermentableSearching: fermentables.fermentableSearching,
    fermentableSearchError: fermentables.fermentableSearchError,
    fermentableAddMessage: fermentables.fermentableAddMessage,
    hopQuery: hops.hopQuery,
    setHopQuery: hops.setHopQuery,
    hopResults: hops.hopResults,
    hopSearching: hops.hopSearching,
    hopSearchError: hops.hopSearchError,
    canCallAccountScoped,
    waterVolumes: mashing.waterVolumes,
    spargeConfigured: mashing.spargeConfigured,
    mashRowsFiltered: mashing.mashRowsFiltered,
    programmedSessions: save.programmedSessions,
    brewingNowSessions: save.brewingNowSessions,
    lastBrewSessions: save.lastBrewSessions,
    spargeStepTempDisplay: mashing.spargeStepTempDisplay,
    spargeMethodLabel: mashing.spargeMethodLabel,
    applyEquipmentProfileToRecipe: save.applyEquipmentProfileToRecipe,
    onSave: save.onSave,
    onCreateAnotherVersion: save.onCreateAnotherVersion,
    onDuplicateRecipe: save.onDuplicateRecipe,
    onBrewRecipe: save.onBrewRecipe,
    addGristRow: fermentables.addGristRow,
    addFermentableFromDb: fermentables.addFermentableFromDb,
    addHopFromDb: hops.addHopFromDb,
    _addYeastFromDb,
    removeGristRow: fermentables.removeGristRow,
    updateGristRow: fermentables.updateGristRow,
    addHopRow: hops.addHopRow,
    removeHopRow: hops.removeHopRow,
    updateHopRow: hops.updateHopRow,
    addMiscRow: misc.addMiscRow,
    removeMiscRow: misc.removeMiscRow,
    updateMiscRow: misc.updateMiscRow,
    onSearchFermentables: fermentables.onSearchFermentables,
    clearFermentableSearchResults: fermentables.clearFermentableSearchResults,
    onSearchHops: hops.onSearchHops,
    clearHopSearchResults: hops.clearHopSearchResults,
    inferMaltClass: fermentables.inferMaltClass,
    isRoastedLike: fermentables.isRoastedLike,
    inferDehuskedFromName: fermentables.inferDehuskedFromName,
    gristTotals: fermentables.gristTotals,
    gristWaterConsistency: misc.gristWaterConsistency,
  };
}

export type RecipeEditPageModel = ReturnType<typeof useRecipeEditPage>;
