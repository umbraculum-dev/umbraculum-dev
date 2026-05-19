import React, { useCallback, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@umbraculum/api-client";
import type { RouteRef } from "@umbraculum/navigation";
import { useT } from "@umbraculum/i18n-react";
import { locales, type SupportedLocale } from "@umbraculum/i18n";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AdSlot } from "../components/AdSlot";
import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useLocaleController } from "../i18n/I18nProvider";
import { openWebFallbackRoute } from "../navigation/openWebFallback";
import type { RootStackParamList, TabParamList } from "../navigation/types";

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function DashboardScreen() {
  const auth = useAuth();
  const { locale, setLocale } = useLocaleController();
  const { t: tNav } = useT("nav");
  const { t } = useT("dashboard");
  const { t: tCommon } = useT("common");
  const { t: tHealth } = useT("health");
  const { t: tLocales } = useT("locales");

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  type HealthState =
    | { status: "idle" | "loading" }
    | { status: "ok"; health: unknown; me: unknown }
    | { status: "error"; errorKey?: "missingApiBaseUrl"; error?: string };

  const [healthState, setHealthState] = useState<HealthState>({ status: "idle" });
  const [openWebState, setOpenWebState] = useState<{ status: "idle" | "opening"; error?: string }>({
    status: "idle",
  });
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const healthFetchInFlightRef = useRef(false);

  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
      promise.then(
        (v) => {
          clearTimeout(t);
          resolve(v);
        },
        (err: unknown) => {
          clearTimeout(t);
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      );
    });
  }

  function jsonPreview(data: unknown): string {
    try {
      const s = JSON.stringify(data);
      return s.length > 600 ? `${s.slice(0, 600)}…` : s;
    } catch {
      return String(data);
    }
  }

  const navigation = useNavigation<DashboardNavigationProp>();

  const loadHealthAndMe = useCallback(() => {
    if (!token) return () => {};
    if (!baseUrl) {
      setHealthState({ status: "error", errorKey: "missingApiBaseUrl" });
      return () => {};
    }

    if (healthFetchInFlightRef.current) return () => {};
    healthFetchInFlightRef.current = true;

    let cancelled = false;
    setHealthState({ status: "loading" });

    const api = createApiClient(baseUrl, bearerTokenAuth(() => token));
    withTimeout(Promise.all([api.get("/api/health"), api.get("/api/auth/me")]), 15000)
      .then(([healthRes, meRes]) => {
        if (cancelled) return;
        if (!healthRes.ok) throw new Error(`health failed with status ${healthRes.status}`);
        if (!meRes.ok) throw new Error(`me failed with status ${meRes.status}`);
        setHealthState({ status: "ok", health: healthRes.data, me: meRes.data });
      })
      .catch((err) => {
        if (!cancelled) setHealthState({ status: "error", error: String(err) });
      })
      .finally(() => {
        healthFetchInFlightRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, token]);

  useFocusEffect(loadHealthAndMe);

  const openWeb = useCallback(
    async (route: RouteRef) => {
      try {
        if (!token) throw new Error("Not authenticated");
        if (!baseUrl) throw new Error(tNav("missingApiBaseUrl"));
        setOpenWebState({ status: "opening" });
        const res = await openWebFallbackRoute({ baseUrl, token, locale, route });
        if (!res.ok) throw new Error(res.error || "Failed to open web");
        setOpenWebState({ status: "idle" });
      } catch (err) {
        setOpenWebState({ status: "idle", error: String(err) });
      }
    },
    [baseUrl, locale, tNav, token],
  );

  const links = useMemo(
    () =>
      [
        { key: "fermDataIntegration", label: t("links.fermDataIntegration"), route: { id: "fermDataIntegration", params: {} } as const },
        { key: "brewdayStepsSettings", label: t("links.brewdayStepsSettings"), route: { id: "brewdayStepsSettings", params: {} } as const },
        { key: "waterProfiles", label: t("links.waterProfiles"), route: { id: "waterProfiles", params: {} } as const },
        { key: "ai", label: t("links.ai"), route: { id: "fermDataIntegration", params: {} } as const },
      ] satisfies readonly { key: string; label: string; route: RouteRef }[],
    [t],
  );

  const breweryLinks = useMemo(
    () =>
      [
        { key: "equipment", label: t("links.equipment"), route: { id: "equipment", params: {} } as const },
        { key: "inventory", label: t("links.inventory"), route: { id: "inventory", params: {} } as const },
      ] satisfies readonly { key: string; label: string; route: RouteRef }[],
    [t],
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <AdSlot placement="global_top" />
          <View style={{ gap: 6 }}>
            <Heading fontSize={28}>{t("title")}</Heading>
            <Text fontSize={14} opacity={0.8}>
              {t("subtitle")}
            </Text>
          </View>

          <Card gap="$2" aria-label={tHealth("title")}>
            <Heading fontSize={18}>{tHealth("title")}</Heading>
            <Text fontSize={12} opacity={0.8}>
              {tHealth("subtitle", { url: baseUrl ?? "(missing)" })}
            </Text>

            {healthState.status === "loading" ? (
              <View style={{ paddingVertical: 8 }}>
                <Spinner />
              </View>
            ) : healthState.status === "error" ? (
              <Text color="$red10" fontSize={12}>
                {healthState.errorKey ? tNav(healthState.errorKey) : healthState.error}
              </Text>
            ) : healthState.status === "ok" ? (
              <View style={{ gap: 6 }}>
                <Text fontSize={11} opacity={0.75}>
                  {jsonPreview(healthState.health)}
                </Text>
              </View>
            ) : null}
          </Card>

          <Card gap="$2" aria-label={tHealth("appPermissions.title")}>
            <Heading fontSize={18}>{tHealth("appPermissions.title")}</Heading>
            <Text fontSize={12} opacity={0.8}>
              {tHealth("appPermissions.subtitle")}
            </Text>

            {healthState.status === "loading" ? (
              <View style={{ paddingVertical: 8 }}>
                <Spinner />
              </View>
            ) : healthState.status === "error" ? (
              <Text color="$red10" fontSize={12}>
                {healthState.errorKey ? tNav(healthState.errorKey) : healthState.error}
              </Text>
            ) : healthState.status === "ok" ? (
              <View style={{ gap: 6 }}>
                <Text fontSize={12} opacity={0.85}>
                  {tHealth("appPermissions.userLabel")}: {(healthState.me as { user?: { email?: unknown } } | null | undefined)?.user?.email ?? "—"}
                </Text>
                <Text fontSize={12} opacity={0.85}>
                  {tHealth("appPermissions.activeWorkspaceLabel")}: {(healthState.me as { activeWorkspaceId?: unknown } | null | undefined)?.activeWorkspaceId ?? "—"}
                </Text>
                <Text fontSize={12} opacity={0.85}>
                  {tHealth("appPermissions.roleLabel")}: {(healthState.me as { role?: unknown } | null | undefined)?.role ?? tHealth("appPermissions.roleUnknown")}
                </Text>
                <Button
                  onPress={() => navigation.navigate("SelectWorkspace")}
                  accessibilityRole="button"
                  accessibilityLabel={tHealth("appPermissions.selectWorkspaceCta")}
                >
                  <Text>{tHealth("appPermissions.selectWorkspaceCta")}</Text>
                </Button>
              </View>
            ) : null}
          </Card>

          <Card gap="$2" aria-label={t("importExport.title")}>
            <Heading fontSize={18}>{t("importExport.title")}</Heading>
            <Text fontSize={12} opacity={0.85}>
              {t("importExport.supportedNote")}
            </Text>
            <Text fontSize={12} opacity={0.85}>
              {t("importExport.actionsLiveInRecipes")}
            </Text>
            <Button
              onPress={() => navigation.navigate("Recipes")}
              accessibilityRole="button"
              accessibilityLabel={t("importExport.actionsCta")}
            >
              <Text>{t("importExport.actionsCta")}</Text>
            </Button>
            {openWebState.error ? (
              <Text color="$red10" fontSize={12}>
                {openWebState.error}
              </Text>
            ) : null}
          </Card>

          <Card gap="$2" aria-label={t("links.title")}>
            <Heading fontSize={18}>{t("links.title")}</Heading>
            <View style={{ gap: 8, marginTop: 4 }}>
              {links.map((l) => (
                <Button
                  key={l.key}
                  onPress={() =>
                    l.key === "waterProfiles"
                      ? navigation.navigate("WaterProfiles")
                      : l.key === "fermDataIntegration"
                        ? navigation.navigate("FermDataIntegration")
                        : l.key === "brewdayStepsSettings"
                          ? navigation.navigate("BrewdayStepsSettings")
                          : l.key === "ai"
                            ? navigation.navigate("Ai")
                            : void openWeb(l.route)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={l.label}
                >
                  <Text>{l.label}</Text>
                </Button>
              ))}
              <Button
                onPress={() => navigation.navigate("About")}
                accessibilityRole="button"
                accessibilityLabel={tNav("about")}
              >
                <Text>{tNav("about")}</Text>
              </Button>
            </View>
          </Card>

          <Card gap="$2" aria-label={t("links.brewery")}>
            <Heading fontSize={18}>{t("links.brewery")}</Heading>
            <View style={{ gap: 8, marginTop: 4 }}>
              {breweryLinks.map((l) => (
                <Button
                  key={l.key}
                  onPress={() =>
                    l.key === "equipment"
                      ? navigation.navigate("Equipment")
                      : void openWeb(l.route)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={l.label}
                >
                  <Text>{l.label}</Text>
                </Button>
              ))}
            </View>
          </Card>

          <Card gap="$2" aria-label={tNav("language")}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text fontSize={14}>
                {tCommon("localeLabel")}: {tLocales(locale)}
              </Text>
              <Button
                onPress={() => setLanguagePickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={tCommon("toggleLanguage")}
              >
                <Text>{tCommon("changeLanguage")}</Text>
              </Button>
            </View>
          </Card>

          <Modal
            visible={languagePickerOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setLanguagePickerOpen(false)}
          >
            <Pressable
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
              onPress={() => setLanguagePickerOpen(false)}
              accessibilityRole="button"
              accessibilityLabel={tCommon("close")}
            >
              <Pressable
                onPress={() => {}}
                style={{
                  backgroundColor: "#141820",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: "#2a2f3a",
                }}
                accessibilityRole="none"
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <Heading fontSize={18}>{tNav("language")}</Heading>
                  <Button
                    onPress={() => setLanguagePickerOpen(false)}
                    accessibilityRole="button"
                    accessibilityLabel={tCommon("close")}
                  >
                    <Text>{tCommon("close")}</Text>
                  </Button>
                </View>

                <View style={{ gap: 10, marginTop: 12 }}>
                  {(locales as readonly SupportedLocale[]).map((l) => {
                    const selected = l === locale;
                    return (
                      <Button
                        key={l}
                        onPress={() => {
                          setLocale(l);
                          setLanguagePickerOpen(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={tLocales(l)}
                        background={selected ? "$color4" : "$background"}
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Text fontWeight={selected ? "700" : "400"}>
                          {tLocales(l)}
                          {selected ? " ✓" : ""}
                        </Text>
                      </Button>
                    );
                  })}
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          <Button
            onPress={() => void auth.logout()}
            accessibilityRole="button"
            accessibilityLabel={tNav("logout")}
          >
            <Text>{tNav("logout")}</Text>
          </Button>

          <AdSlot placement="global_bottom" />
        </View>
      </ScrollView>
    </Screen>
  );
}

