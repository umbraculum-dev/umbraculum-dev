import { useCallback, useMemo, useRef, useState } from "react";

import { getAuthMe, getHealth } from "@umbraculum/api-client";
import type { RouteRef } from "@umbraculum/navigation";
import { useT } from "@umbraculum/i18n-react";
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "../../auth/AuthProvider";
import { getApiBaseUrl } from "../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../auth/nativeApiClient";
import { useLocaleController } from "../../i18n/I18nProvider";
import { openWebFallbackRoute } from "../../navigation/openWebFallback";
import type { RootStackParamList, TabParamList } from "../../navigation/types";
import { withTimeout, type HealthState } from "./dashboardScreenUtils";

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function useDashboardScreen() {
  const auth = useAuth();
  const { locale, setLocale } = useLocaleController();
  const { t: tNav } = useT("nav");
  const { t } = useT("dashboard");
  const { t: tCommon } = useT("common");
  const { t: tHealth } = useT("health");
  const { t: tLocales } = useT("locales");

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [healthState, setHealthState] = useState<HealthState>({ status: "idle" });
  const [openWebState, setOpenWebState] = useState<{ status: "idle" | "opening"; error?: string }>({
    status: "idle",
  });
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const healthFetchInFlightRef = useRef(false);

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

    const client = nativePlatformApiClient(token);
    withTimeout(Promise.all([getHealth(client), getAuthMe(client)]), 15000)
      .then(([health, me]) => {
        if (cancelled) return;
        setHealthState({ status: "ok", health, me });
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

  return {
    auth,
    locale,
    setLocale,
    t,
    tNav,
    tCommon,
    tHealth,
    tLocales,
    baseUrl,
    healthState,
    navigation,
    links,
    breweryLinks,
    openWeb,
    openWebState,
    languagePickerOpen,
    setLanguagePickerOpen,
  };
}
