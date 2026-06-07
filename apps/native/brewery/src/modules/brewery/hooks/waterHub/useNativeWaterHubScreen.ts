import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import {
  getRecipe,
  getRecipeWaterHubSummary,
  listWaterProfiles,
} from "@umbraculum/brewery-api-client";
import type { RecipeWaterHubSummaryResponse } from "@umbraculum/brewery-contracts";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { useT } from "@umbraculum/i18n-react";

import { useAuth, getApiBaseUrl, nativePlatformApiClient } from "@umbraculum/native-shell/auth";
import { useLocaleController } from "@umbraculum/native-shell/i18n";
import type { RootStackParamList } from "../../../../navigation/types";
import {
  type DisplayStream,
  formatSaltKeyLabel,
  formatWithHint,
} from "../../lib/waterHubFormatters";

export function useNativeWaterHubScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const api = nativePlatformApiClient(token, baseUrl);
    try {
      const data = await getRecipe(api, id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, [baseUrl, token]);

  const { t } = useT("waterHub");
  const { t: tUnits } = useT("units");
  const { t: tSalts } = useT("salts");

  const [summaryRes, setSummaryRes] = useState<RecipeWaterHubSummaryResponse | null>(null);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["links", "status"]);

  const refresh = useCallback(async () => {
    if (!recipeId || !baseUrl || !token) return;
    setError(null);
    setLoading(true);
    try {
      const api = nativePlatformApiClient(token, baseUrl);
      setSummaryRes(await getRecipeWaterHubSummary(api, recipeId));
      await listWaterProfiles(api);
      setProfilesLoaded(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [recipeId, baseUrl, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = summaryRes?.summary ?? null;
  const formatHints = summaryRes?.formatHints;
  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints as Record<string, { decimals?: number }> | undefined, unitKey, fallback);

  const mashLast = summary?.status.mashLastCalculatedAt ? new Date(summary.status.mashLastCalculatedAt).toLocaleString() : "—";
  const spargeLast = summary?.status.spargeLastCalculatedAt ? new Date(summary.status.spargeLastCalculatedAt).toLocaleString() : "—";
  const boilLast = summary?.status.boilLastCalculatedAt ? new Date(summary.status.boilLastCalculatedAt).toLocaleString() : "—";

  const displayAlkalinityPpmCaCO3 = (v: number) => (v < 0 && v > -1 ? 0 : v);

  const displayStreams = useMemo<DisplayStream[] | null>(() => {
    if (!summary) return null;
    const hints = formatHints as Record<string, { decimals?: number }> | undefined;

    const saltBreakdownLabel = (rows: Array<{ saltKey: string; grams: number }> | null): string | null => {
      if (!rows?.length) return null;
      return rows
        .filter((r) => r && typeof r.saltKey === "string" && typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0)
        .map((r) => `${formatSaltKeyLabel(r.saltKey, tSalts)} ${formatWithHint(locale, r.grams, hints, "g", 0)} ${tUnits("g")}`)
        .join("; ");
    };

    const acidAmountLabel = (s: (typeof summary.streams)[number]): string | null => {
      const suffix = s.acidMode === "manual" ? tSalts("modeManualSuffix") : s.acidMode === "required" ? tSalts("modeRequiredSuffix") : "";
      if (s.acidAmountGrams != null) return `${formatWithHint(locale, s.acidAmountGrams, hints, "g", 0)} ${tUnits("g")}${suffix ? ` ${suffix}` : ""}`;
      if (s.acidAmountMl != null) return `${formatWithHint(locale, s.acidAmountMl, hints, "mL", 0)} ${tUnits("mL")}${suffix ? ` ${suffix}` : ""}`;
      return null;
    };

    const labelForKey = (k: "mash" | "sparge" | "boil"): string => {
      if (k === "mash") return t("mashWater");
      if (k === "sparge") return t("spargeWater");
      return t("additionalBoilWater");
    };

    return summary.streams.map((s) => ({
      key: s.key,
      label: labelForKey(s.key),
      volumeLiters: s.volumeLiters,
      ph: s.ph,
      finalAlkalinityPpmCaCO3: s.finalAlkalinityPpmCaCO3,
      saltsAddedLabel: saltBreakdownLabel(s.saltsBreakdown),
      acidType: s.acidType,
      acidAmountLabel: acidAmountLabel(s),
    }));
  }, [summary, formatHints, locale, t, tUnits, tSalts]);

  const canCall = Boolean(recipeId && baseUrl && token);

  const navigateToRecipeEdit = useCallback(() => {
    navigation.navigate("RecipeEdit", { recipeId });
  }, [navigation, recipeId]);

  const navigateToWaterMash = useCallback(() => {
    navigation.navigate("WaterMash", { recipeId });
  }, [navigation, recipeId]);

  const navigateToWaterSparge = useCallback(() => {
    navigation.navigate("WaterSparge", { recipeId });
  }, [navigation, recipeId]);

  const navigateToWaterBoil = useCallback(() => {
    navigation.navigate("WaterBoil", { recipeId });
  }, [navigation, recipeId]);

  const navigateToWaterProfiles = useCallback(() => {
    navigation.navigate("WaterProfiles");
  }, [navigation]);

  const onOpenSectionsChange = useCallback((next: string | string[]) => {
    setOpenSections(Array.isArray(next) ? next : next ? [next] : []);
  }, []);

  return {
    recipeId,
    t,
    tUnits,
    loadRecipeMeta,
    summary,
    profilesLoaded,
    loading,
    error,
    openSections,
    onOpenSectionsChange,
    refresh,
    fmt,
    mashLast,
    spargeLast,
    boilLast,
    displayAlkalinityPpmCaCO3,
    displayStreams,
    canCall,
    navigateToRecipeEdit,
    navigateToWaterMash,
    navigateToWaterSparge,
    navigateToWaterBoil,
    navigateToWaterProfiles,
  };
}

export type NativeWaterHubScreenModel = ReturnType<typeof useNativeWaterHubScreen>;
