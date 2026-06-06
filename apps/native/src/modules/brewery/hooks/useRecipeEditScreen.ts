import { useEffect, useMemo, useRef } from "react";
import { ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useT } from "@umbraculum/i18n-react";

import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";
import { useLocaleController } from "../../../i18n/I18nProvider";
import type { RootStackParamList } from "../../../navigation/types";
import { buildNativeRecipeEditScreenReturn } from "./recipeEditScreen/buildNativeRecipeEditScreenReturn";
import { useNativeRecipeEditActions } from "./recipeEditScreen/useNativeRecipeEditActions";
import { useNativeRecipeEditCatalogs } from "./recipeEditScreen/useNativeRecipeEditCatalogs";
import { useNativeRecipeEditLoad } from "./recipeEditScreen/useNativeRecipeEditLoad";
import { useNativeRecipeEditMashing } from "./recipeEditScreen/useNativeRecipeEditMashing";
import { useNativeRecipeEditSections } from "./recipeEditScreen/useNativeRecipeEditSections";
import { useNativeRecipeEditYeast } from "./recipeEditScreen/useNativeRecipeEditYeast";
import { useRecipeEditScreenFermentables } from "./useRecipeEditScreenFermentables";
import { useRecipeEditScreenHops } from "./useRecipeEditScreenHops";

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
  const mashing = useNativeRecipeEditMashing({ analysis, mashRows: load.mashRows });

  const selectedStyleLabel =
    load.styleKey && catalogs.styles.find((s) => s.key === load.styleKey)
      ? load.styleKey === "custom"
        ? (catalogs.styles.find((s) => s.key === "custom")?.name ?? "Custom")
        : `${catalogs.styles.find((s) => s.key === load.styleKey)?.code ?? ""} — ${catalogs.styles.find((s) => s.key === load.styleKey)?.name ?? load.styleKey}`
      : "Select style";

  return buildNativeRecipeEditScreenReturn({
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
  });
}

export type RecipeEditScreenModel = ReturnType<typeof useRecipeEditScreen>;
