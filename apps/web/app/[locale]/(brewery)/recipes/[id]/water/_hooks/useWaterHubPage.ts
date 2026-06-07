"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import type { WaterProfilesResponse } from "@umbraculum/brewery-contracts";

import { getRecipe, listWaterProfiles } from "@umbraculum/api-client/brewery";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { formatWithHint } from "../../../../../../../src/i18n/format";
import { useRequireAuth } from "../../../../../../_shared-layout/_lib/useRequireAuth";
import { fetchRecipeWaterHubSummary, type RecipeWaterHubSummaryResponse } from "../_lib/waterHubSummary";
import type { DisplayStream } from "../_lib/waterHubPageTypes";

export function useWaterHubPage() {
  const t = useTranslations("waterHub");
  const tUnits = useTranslations("units");
  const tsalts = useTranslations("salts");
  const tMath = useTranslations("math");
  const locale = useLocale();
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

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [summaryRes, setSummaryRes] = useState<RecipeWaterHubSummaryResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [surfaceMath, setSurfaceMath] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["links", "status"]);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:waterHub");
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:waterHub", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  const refresh = async () => {
    if (!recipeId) return;
    if (authState.status !== "ready") return;
    setError(null);
    setLoading(true);
    try {
      const profilesRes = await listWaterProfiles(webBreweryApiClient());
      setProfiles(profilesRes);

      const summary = await fetchRecipeWaterHubSummary(recipeId);
      setSummaryRes(summary);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, recipeId]);

  const summary = summaryRes?.summary ?? null;
  const formatHints = summaryRes?.formatHints;
  const fmt = (unitKey: string, value: unknown, fallback: number) =>
    formatWithHint(locale, value, formatHints as Record<string, { decimals?: number }> | undefined, unitKey, fallback);

  const mashLast = summary?.status.mashLastCalculatedAt ? new Date(summary.status.mashLastCalculatedAt).toLocaleString() : "—";
  const spargeLast = summary?.status.spargeLastCalculatedAt ? new Date(summary.status.spargeLastCalculatedAt).toLocaleString() : "—";
  const boilLast = summary?.status.boilLastCalculatedAt ? new Date(summary.status.boilLastCalculatedAt).toLocaleString() : "—";

  const displayAlkalinityPpmCaCO3 = (v: number) => {
    if (v < 0 && v > -1) return 0;
    return v;
  };

  const displayStreams = useMemo(() => {
    if (!summary) return null;
    const hints = formatHints as Record<string, { decimals?: number }> | undefined;

    const formatSaltKeyLabel = (saltKey: string): string => {
      switch (saltKey) {
        case "gypsum":
          return tsalts("gypsum");
        case "calcium_chloride":
          return tsalts("calciumChloride");
        case "epsom":
          return tsalts("epsom");
        case "table_salt":
          return tsalts("tableSalt");
        case "baking_soda":
          return tsalts("bakingSoda");
        default:
          return saltKey;
      }
    };

    const saltBreakdownLabel = (rows: Array<{ saltKey: string; grams: number }> | null): string | null => {
      if (!rows?.length) return null;
      return rows
        .filter((r) => r && typeof r.saltKey === "string" && typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0)
        .map((r) => `${formatSaltKeyLabel(r.saltKey)} ${formatWithHint(locale, r.grams, hints, "g", 0)} ${tUnits("g")}`)
        .join("; ");
    };

    const acidAmountLabel = (s: (typeof summary.streams)[number]): string | null => {
      const suffix = s.acidMode === "manual" ? tsalts("modeManualSuffix") : s.acidMode === "required" ? tsalts("modeRequiredSuffix") : "";
      if (s.acidAmountGrams != null) return `${formatWithHint(locale, s.acidAmountGrams, hints, "g", 0)} ${tUnits("g")}${suffix ? ` ${suffix}` : ""}`;
      if (s.acidAmountMl != null) return `${formatWithHint(locale, s.acidAmountMl, hints, "mL", 0)} ${tUnits("mL")}${suffix ? ` ${suffix}` : ""}`;
      return null;
    };

    const labelForKey = (k: "mash" | "sparge" | "boil"): string => {
      if (k === "mash") return t("mashWater");
      if (k === "sparge") return t("spargeWater");
      return t("additionalBoilWater");
    };

    const streams: DisplayStream[] = summary.streams.map((s) => ({
      key: s.key,
      label: labelForKey(s.key),
      volumeLiters: s.volumeLiters,
      ph: s.ph,
      finalAlkalinityPpmCaCO3: s.finalAlkalinityPpmCaCO3,
      saltsAddedLabel: saltBreakdownLabel(s.saltsBreakdown),
      acidType: s.acidType,
      acidAmountLabel: acidAmountLabel(s),
      ionsAfterAcid: s.ionsPpm,
    }));

    return streams;
  }, [summary, formatHints, locale, t, tUnits, tsalts]);

  return {
    t,
    tUnits,
    tsalts,
    tMath,
    locale,
    recipeId,
    authState,
    loadRecipeMeta,
    profiles,
    summary,
    formatHints,
    loading,
    error,
    surfaceMath,
    setSurfaceMath,
    openSections,
    setOpenSections,
    refresh,
    fmt,
    mashLast,
    spargeLast,
    boilLast,
    displayAlkalinityPpmCaCO3,
    displayStreams,
  };
}

export type UseWaterHubPageModel = ReturnType<typeof useWaterHubPage>;
