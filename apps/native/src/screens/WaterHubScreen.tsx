import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import type { IonProfilePpm, RecipeWaterHubSummaryResponse } from "@umbraculum/contracts";
import { parseRecipeWaterHubSummaryResponse, parseWaterProfilesResponse } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Text } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@brewery/recipes-ui";
import { Accordion } from "tamagui";

import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useLocaleController } from "../i18n/I18nProvider";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/types";

function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatWithHint(
  locale: string,
  value: unknown,
  formatHints: Record<string, { decimals?: number }> | undefined,
  unitKey: string,
  fallbackDecimals: number
): string {
  const decimals =
    formatHints?.[unitKey]?.decimals != null && Number.isFinite(formatHints[unitKey].decimals)
      ? formatHints[unitKey].decimals
      : fallbackDecimals;
  return typeof value === "number" && Number.isFinite(value) ? formatFixed(locale, value, decimals) : "—";
}

type DisplayStream = {
  key: "mash" | "sparge" | "boil";
  label: string;
  volumeLiters: number | null;
  ph: number | null;
  finalAlkalinityPpmCaCO3: number | null;
  saltsAddedLabel: string | null;
  acidType: string | null;
  acidAmountLabel: string | null;
};

function formatSaltKeyLabel(saltKey: string, tsalts: (k: string) => string): string {
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
}

export function WaterHubScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const api = createApiClient(baseUrl, bearerTokenAuth(() => token));
    const res = await api.get(`/api/recipes/${id}`);
    if (!res.ok) return null;
    return parseRecipeMetaFromGetRecipeResponse(res.data);
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
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token));
      const summaryResRaw = await api.get(`/api/recipes/${recipeId}/water-hub-summary`);
      if (!summaryResRaw.ok) throw new Error(JSON.stringify(summaryResRaw.data));
      setSummaryRes(parseRecipeWaterHubSummaryResponse(summaryResRaw.data));

      const profRes = await api.get("/api/water-profiles");
      if (profRes.ok) {
        parseWaterProfilesResponse(profRes.data);
        setProfilesLoaded(true);
      }
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

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Heading fontSize={22} mb="$2">
          {t("title")}
        </Heading>
        <RecipeMetaLine recipeId={recipeId} enabled={canCall} loadRecipeMeta={loadRecipeMeta} />
        <Button
          chromeless
          size="$3"
          mt="$2"
          mb="$3"
          onPress={() => navigation.navigate("RecipeEdit", { recipeId })}
        >
          <Text fontSize={12}>{t("backToRecipeEditor")}</Text>
        </Button>

        {error ? (
          <Card background="$red3" p="$3" mb="$3">
            <Text color="$red11">{error}</Text>
          </Card>
        ) : null}

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <Accordion.Item value="links">
            <Card gap="$2" mt="$2">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("chooseArea")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("links") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <View style={{ gap: 4 }}>
                    <Button size="$4" width="100%" onPress={() => navigation.navigate("WaterMash", { recipeId })}>
                      <Text fontSize={14}>{t("mashWater")}</Text>
                    </Button>
                    <Text fontSize={12} opacity={0.7}>
                      {t("lastCalculated")}: {mashLast}
                    </Text>
                  </View>

                  <View style={{ gap: 4 }}>
                    <Button size="$4" width="100%" onPress={() => navigation.navigate("WaterSparge", { recipeId })}>
                      <Text fontSize={14}>{t("spargeWater")}</Text>
                    </Button>
                    <Text fontSize={12} opacity={0.7}>
                      {t("lastCalculated")}: {spargeLast}
                    </Text>
                  </View>

                  <View style={{ gap: 4 }}>
                    <Button size="$4" width="100%" onPress={() => navigation.navigate("WaterBoil", { recipeId })}>
                      <Text fontSize={14}>{t("additionalBoilWater")}</Text>
                    </Button>
                    <Text fontSize={12} opacity={0.7}>
                      {t("lastCalculated")}: {boilLast}
                    </Text>
                  </View>

                  <Text fontSize={12} opacity={0.8}>
                    {t("manageProfilesOn")}{" "}
                    <Text onPress={() => navigation.navigate("WaterProfiles")} color="$blue10">
                      {t("waterProfilesLink")}
                    </Text>
                  </Text>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="status">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("quickStatus")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("status") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 8 }}>
                  <Text fontSize={12}>{t("mashAcidMode")}: {summary?.status.mashAcidificationMode ?? "—"}</Text>
                  <Text fontSize={12}>{t("spargeAcidMode")}: {summary?.status.spargeAcidificationMode ?? "—"}</Text>
                  <Text fontSize={12}>
                    {t("mashOverallSnapshot")}:{" "}
                    {summary?.status.mashOverallSnapshot
                      ? `pH (${summary.status.mashOverallSnapshot.ph.kind}) ${fmt("pH", summary.status.mashOverallSnapshot.ph.value, 2)} · Final alkalinity ${fmt("ppm_as_CaCO3", summary.status.mashOverallSnapshot.finalAlkalinityPpmCaCO3, 0)}`
                      : "—"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Button
                      size="$3"
                      onPress={() => void refresh()}
                      disabled={!canCall || loading}
                    >
                      <Text>{loading ? t("refreshing") : t("refresh")}</Text>
                    </Button>
                    <Text fontSize={12} opacity={0.8}>
                      {profilesLoaded ? t("profilesLoaded") : t("profilesNotLoaded")}
                    </Text>
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="recap">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("recap")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("recap") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Text fontSize={12} opacity={0.8} mb="$2">
                  {t("recapSubtitle")}
                </Text>
                {summary && displayStreams ? (
                  <View style={{ gap: 12 }}>
                    <Heading fontSize={14}>{t("perStream")}</Heading>
                    <View style={{ gap: 4 }}>
                      {displayStreams.map((s) => (
                        <View key={s.key} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text fontSize={12} fontWeight="bold">{s.label}</Text>
                          <Text fontSize={12}>
                            {s.volumeLiters == null ? "—" : fmt("L", s.volumeLiters, 2)} · pH {s.ph == null ? "—" : fmt("pH", s.ph, 2)} · Alk {s.finalAlkalinityPpmCaCO3 == null ? "—" : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(s.finalAlkalinityPpmCaCO3), 0)}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Heading fontSize={14}>{t("mergedSummary")}</Heading>
                    <Text fontSize={12}>
                      {t("totalVolume")}: {fmt("L", summary.merged.totalVolumeLiters, 2)} {tUnits("L")}
                    </Text>
                    <Text fontSize={12}>
                      {t("approxMergedPh")}: {summary.merged.ph == null ? "—" : fmt("pH", summary.merged.ph, 2)}
                    </Text>
                    <Text fontSize={12}>
                      {t("mergedFinalAlk")}: {summary.merged.finalAlkalinityPpmCaCO3 == null ? "—" : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(summary.merged.finalAlkalinityPpmCaCO3), 0)} {tUnits("ppmAsCaCO3")}
                    </Text>
                    <Heading fontSize={14} mt="$2">{t("additionsPerStream")}</Heading>
                    {displayStreams.map((s) => (
                      <View key={`adds-${s.key}`}>
                        <Text fontSize={12} fontWeight="bold">{s.label}</Text>
                        <Text fontSize={12} opacity={0.8}>{t("salt")} {s.saltsAddedLabel ?? "—"}</Text>
                        <Text fontSize={12} opacity={0.8}>{t("acid")} {s.acidType ?? "—"} {s.acidAmountLabel ? `· ${s.acidAmountLabel}` : ""}</Text>
                      </View>
                    ))}
                    {summary.merged.ionsPpm ? (
                      <View style={{ marginTop: 8 }}>
                        <Heading fontSize={14}>{t("mergedIonsTitle")}</Heading>
                        <Text fontSize={12} opacity={0.8} mb="$1">{t("mergedIonsDescription")}</Text>
                        <View style={{ gap: 2 }}>
                          {([["Ca", "calcium"], ["Mg", "magnesium"], ["Na", "sodium"], ["SO4", "sulfate"], ["Cl", "chloride"], ["HCO3", "bicarbonate"]] as const).map(([label, k]) => (
                            <View key={k} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                              <Text fontSize={12}>{label}</Text>
                              <Text fontSize={12}>{fmt("ppm", (summary.merged.ionsPpm as IonProfilePpm)[k], 0)}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <Text fontSize={12} opacity={0.8}>{t("noMergedProfile")}</Text>
                    )}
                  </View>
                ) : (
                  <Text fontSize={12} opacity={0.8}>{t("noSettingsLoaded")}</Text>
                )}
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="finalRecap">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("finalRecapTitle")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("finalRecap") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Text fontSize={12} opacity={0.8} mb="$2">
                  {t("finalRecapSubtitle")}
                </Text>
                <Text fontSize={12}>
                  {t("predictedMashPh")} {summary?.finalRecap.predictedMashPh ? fmt("pH", summary.finalRecap.predictedMashPh.value, 2) : "—"}
                </Text>
                <Text fontSize={12} mt="$2">{t("residualAlkalinity")}</Text>
                <Text fontSize={12} opacity={0.8}>
                  {t("raMashOverall")}: {summary?.finalRecap.residualAlkalinityMashOverallPpmCaCO3 != null ? fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMashOverallPpmCaCO3, 0) : "—"} {tUnits("ppmAsCaCO3")}
                </Text>
                <Text fontSize={12} opacity={0.8}>
                  {t("raMerged")}: {summary?.finalRecap.residualAlkalinityMergedPpmCaCO3 != null ? fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMergedPpmCaCO3, 0) : "—"} {tUnits("ppmAsCaCO3")}
                </Text>
                <Text fontSize={12} mt="$2">
                  {t("styleExpectedRa")}: {summary?.finalRecap.styleExpectedRa ? `${fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.min, 0)}..${fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.max, 0)} ${tUnits("ppmAsCaCO3")} · ${t(summary.finalRecap.styleExpectedRa.rationaleKey)}` : t("styleExpectedRaNa")}
                </Text>
                <Text fontSize={12} opacity={0.8} mt="$2">
                  {t("finalRecapCaveat")}
                </Text>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="alkVsBicarb">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("alkVsBicarbTitle")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("alkVsBicarb") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Text fontSize={12} opacity={0.8} mb="$2">
                  {t("alkVsBicarbSubtitle")}
                </Text>
                <Text fontSize={12} mb="$1">{t("alkVsBicarbPoint1")}</Text>
                <Text fontSize={12} mb="$1">{t("alkVsBicarbPoint2")}</Text>
                <Text fontSize={12} mb="$1">{t("alkVsBicarbPoint3")}</Text>
                <Text fontSize={12}>{t("alkVsBicarbPoint4")}</Text>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
