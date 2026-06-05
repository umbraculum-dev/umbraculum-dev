import { useEffect, useMemo, useRef } from "react";
import { ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import type { WaterVolumes } from "@umbraculum/brewery-recipes-ui";

import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";
import { useLocaleController } from "../../../i18n/I18nProvider";
import type { RootStackParamList } from "../../../navigation/types";
import { useRecipeEditScreenFermentables } from "./useRecipeEditScreenFermentables";
import { useRecipeEditScreenHops } from "./useRecipeEditScreenHops";
import { useNativeRecipeEditActions } from "./recipeEditScreen/useNativeRecipeEditActions";
import { useNativeRecipeEditCatalogs } from "./recipeEditScreen/useNativeRecipeEditCatalogs";
import { useNativeRecipeEditLoad } from "./recipeEditScreen/useNativeRecipeEditLoad";
import { useNativeRecipeEditSections } from "./recipeEditScreen/useNativeRecipeEditSections";
import { useNativeRecipeEditYeast } from "./recipeEditScreen/useNativeRecipeEditYeast";

type RecipeEditNavigationProp = NativeStackNavigationProp<RootStackParamList, "RecipeEdit">;

export function useRecipeEditScreen() {
  const auth = useAuth();
  const route = useRoute();
  const navigation = useNavigation<RecipeEditNavigationProp>();
  const recipeId = (route.params as { recipeId?: string })?.recipeId ?? "";
  const { t } = useT("recipes.edit");
  const { t: tBrewSessions } = useT("recipes.brewSessions");
  const { t: tSparge } = useT("recipes.water.sparge");
  const { t: tRecipes } = useT("recipes");
  const { t: tCommon } = useT("common");
  const { t: tEquip } = useT("equipment");
  const { t: tUnits } = useT("units");
  const { locale } = useLocaleController();

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;
  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return nativePlatformApiClient(token);
  }, [baseUrl, token]);

  const scrollRef = useRef<ScrollView>(null);

  const sections = useNativeRecipeEditSections();
  const catalogs = useNativeRecipeEditCatalogs({ api });
  const yeast = useNativeRecipeEditYeast({ api, locale });
  const fermentables = useRecipeEditScreenFermentables({ api });
  const hops = useRecipeEditScreenHops({ api });

  const load = useNativeRecipeEditLoad({
    api,
    recipeId,
    canCall,
    locale,
    hydrators: {
      setGristRows: fermentables.setGristRows,
      setHopsRows: hops.setHopsRows,
      setYeastRows: yeast.setYeastRows,
      setYeastAttenuationOverrides: yeast.setYeastAttenuationOverrides,
      hydrateYeastAmountText: yeast.hydrateYeastAmountText,
      setSelectedEquipmentProfileId: catalogs.setSelectedEquipmentProfileId,
    },
  });

  const actions = useNativeRecipeEditActions({
    api,
    recipeId,
    recipe: load.recipe,
    t,
    name: load.name,
    styleKey: load.styleKey,
    notes: load.notes,
    boilTimeMinutes: load.boilTimeMinutes,
    gristRows: fermentables.gristRows,
    hopsRows: hops.hopsRows,
    yeastRows: yeast.yeastRows,
    yeastAttenuationOverrides: yeast.yeastAttenuationOverrides,
    equipmentProfiles: catalogs.equipmentProfiles,
    selectedEquipmentProfileId: catalogs.selectedEquipmentProfileId,
    loadRecipe: load.loadRecipe,
  });

  const analysis = (load.recipe as { analysis?: unknown })?.analysis;
  const waterVolumes = useMemo((): WaterVolumes | null => {
    if (!analysis) return null;
    try {
      const parsed = parseGravityAnalysisResponseV1(analysis);
      const preBoil = parsed?.derivations?.["analysis.pre_boil_volume"];
      if (!preBoil?.inputs) return null;
      const mashIn = preBoil.inputs.find((i) => i.id === "mashWaterVolumeLiters")?.value;
      const spargeIn = preBoil.inputs.find((i) => i.id === "spargeVolumeLiters")?.value;
      const mashL = mashIn?.kind === "number" ? mashIn.value : null;
      const spargeL = spargeIn?.kind === "number" ? spargeIn.value : null;
      return mashL != null && spargeL != null ? { mashLiters: mashL, spargeLiters: spargeL } : null;
    } catch {
      return null;
    }
  }, [analysis]);

  const spargeConfigured = waterVolumes != null && waterVolumes.spargeLiters > 0;
  const mashRowsFiltered = useMemo(() => {
    if (!spargeConfigured) return load.mashRows;
    return load.mashRows.filter(
      (r) => !(r.type === "sparge" && r.name.trim().toLowerCase() === "sparge"),
    );
  }, [load.mashRows, spargeConfigured]);

  const spargeRows = useMemo(
    () => load.mashRows.filter((r) => r.type === "sparge"),
    [load.mashRows],
  );

  const selectedStyleLabel =
    load.styleKey && catalogs.styles.find((s) => s.key === load.styleKey)
      ? load.styleKey === "custom"
        ? catalogs.styles.find((s) => s.key === "custom")?.name ?? "Custom"
        : `${catalogs.styles.find((s) => s.key === load.styleKey)?.code ?? ""} — ${catalogs.styles.find((s) => s.key === load.styleKey)?.name ?? load.styleKey}`
      : "Select style";

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
    waterVolumes,
    mashRowsFiltered,
    mashProcedure: load.mashProcedure,
    spargeRows,
    spargeConfigured,
    waterSettings: load.waterSettings,
    boilTimeMinutes: load.boilTimeMinutes,
    setBoilTimeMinutes: load.setBoilTimeMinutes,
    notes: load.notes,
    setNotes: load.setNotes,
    saving: actions.saving,
    save: actions.save,
  };
}

export type RecipeEditScreenModel = ReturnType<typeof useRecipeEditScreen>;
