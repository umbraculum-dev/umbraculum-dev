import type { RefObject } from "react";
import type { ScrollView } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { TranslationValues } from "@umbraculum/i18n-react";

import type { RootStackParamList } from "../../../../navigation/types";

type NativeRecipeEditT = (key: string, values?: TranslationValues) => string;
import type { useNativeRecipeEditActions } from "./useNativeRecipeEditActions";
import type { useNativeRecipeEditCatalogs } from "./useNativeRecipeEditCatalogs";
import type { useNativeRecipeEditLoad } from "./useNativeRecipeEditLoad";
import type { useNativeRecipeEditMashing } from "./useNativeRecipeEditMashing";
import type { useNativeRecipeEditSections } from "./useNativeRecipeEditSections";
import type { useNativeRecipeEditYeast } from "./useNativeRecipeEditYeast";
import type { useRecipeEditScreenFermentables } from "../useRecipeEditScreenFermentables";
import type { useRecipeEditScreenHops } from "../useRecipeEditScreenHops";

type RecipeEditNavigationProp = NativeStackNavigationProp<RootStackParamList, "RecipeEdit">;

export function buildNativeRecipeEditScreenReturn(params: {
  canCall: boolean;
  recipeId: string;
  locale: string;
  navigation: RecipeEditNavigationProp;
  scrollRef: RefObject<ScrollView | null>;
  t: NativeRecipeEditT;
  tBrewSessions: NativeRecipeEditT;
  tSparge: NativeRecipeEditT;
  tRecipes: NativeRecipeEditT;
  tCommon: NativeRecipeEditT;
  tEquip: NativeRecipeEditT;
  tUnits: NativeRecipeEditT;
  sections: ReturnType<typeof useNativeRecipeEditSections>;
  catalogs: ReturnType<typeof useNativeRecipeEditCatalogs>;
  yeast: ReturnType<typeof useNativeRecipeEditYeast>;
  fermentables: ReturnType<typeof useRecipeEditScreenFermentables>;
  hops: ReturnType<typeof useRecipeEditScreenHops>;
  load: ReturnType<typeof useNativeRecipeEditLoad>;
  actions: ReturnType<typeof useNativeRecipeEditActions>;
  mashing: ReturnType<typeof useNativeRecipeEditMashing>;
  selectedStyleLabel: string;
}) {
  const {
    canCall,
    recipeId,
    locale,
    navigation,
    scrollRef,
    t,
    tBrewSessions,
    tSparge,
    tRecipes,
    tCommon,
    tEquip,
    tUnits,
    sections,
    catalogs,
    yeast,
    fermentables,
    hops,
    load,
    actions,
    mashing,
    selectedStyleLabel,
  } = params;

  return {
    canCall,
    loading: load.loading,
    recipe: load.recipe,
    loadError: load.loadError,
    t,
    tBrewSessions,
    tSparge,
    tRecipes,
    tCommon,
    tEquip,
    tUnits,
    locale,
    navigation,
    recipeId,
    saveStatus: actions.saveStatus,
    saveError: actions.saveError,
    scrollRef,
    openSections: sections.openSections,
    setOpenSections: sections.setOpenSections,
    name: load.name,
    setName: load.setName,
    styleKey: load.styleKey,
    setStyleKey: load.setStyleKey,
    styles: catalogs.styles,
    stylesLoading: catalogs.stylesLoading,
    stylePickerOpen: sections.stylePickerOpen,
    setStylePickerOpen: sections.setStylePickerOpen,
    selectedStyleLabel,
    fermentableQuery: fermentables.fermentableQuery,
    setFermentableQuery: fermentables.setFermentableQuery,
    fermentableResults: fermentables.fermentableResults,
    setFermentableResults: fermentables.setFermentableResults,
    fermentableSearching: fermentables.fermentableSearching,
    fermentableSearchError: fermentables.fermentableSearchError,
    searchFermentables: fermentables.searchFermentables,
    addFermentableFromDb: fermentables.addFermentableFromDb,
    addGristRow: fermentables.addGristRow,
    gristTotals: fermentables.gristTotals,
    openFermentableIds: fermentables.openFermentableIds,
    setOpenFermentableIds: fermentables.setOpenFermentableIds,
    gristRows: fermentables.gristRows,
    updateGristRow: fermentables.updateGristRow,
    removeGristRow: fermentables.removeGristRow,
    hopQuery: hops.hopQuery,
    setHopQuery: hops.setHopQuery,
    hopResults: hops.hopResults,
    setHopResults: hops.setHopResults,
    hopSearching: hops.hopSearching,
    hopSearchError: hops.hopSearchError,
    searchHops: hops.searchHops,
    addHopFromDb: hops.addHopFromDb,
    addHopRow: hops.addHopRow,
    openHopIds: hops.openHopIds,
    setOpenHopIds: hops.setOpenHopIds,
    hopsRows: hops.hopsRows,
    updateHopRow: hops.updateHopRow,
    removeHopRow: hops.removeHopRow,
    openYeastIds: sections.openYeastIds,
    setOpenYeastIds: sections.setOpenYeastIds,
    yeastRows: yeast.yeastRows,
    yeastAttenuationOverrides: yeast.yeastAttenuationOverrides,
    equipmentProfilesError: catalogs.equipmentProfilesError,
    equipmentProfiles: catalogs.equipmentProfiles,
    selectedEquipmentProfileId: catalogs.selectedEquipmentProfileId,
    setSelectedEquipmentProfileId: catalogs.setSelectedEquipmentProfileId,
    equipmentApplying: actions.equipmentApplying,
    applyEquipmentProfileToRecipe: actions.applyEquipmentProfileToRecipe,
    equipmentApplyError: actions.equipmentApplyError,
    waterVolumes: mashing.waterVolumes,
    mashRowsFiltered: mashing.mashRowsFiltered,
    mashProcedure: load.mashProcedure,
    spargeRows: mashing.spargeRows,
    spargeConfigured: mashing.spargeConfigured,
    waterSettings: load.waterSettings,
    boilTimeMinutes: load.boilTimeMinutes,
    setBoilTimeMinutes: load.setBoilTimeMinutes,
    notes: load.notes,
    setNotes: load.setNotes,
    saving: actions.saving,
    save: actions.save,
  };
}
