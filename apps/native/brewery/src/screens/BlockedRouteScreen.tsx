import React, { useState } from "react";
import { Alert } from "react-native";

import { useT } from "@umbraculum/i18n-react";
import type { RouteId } from "@umbraculum/navigation";
import { buildWebFallbackRouteRef, getRouteAvailability } from "@umbraculum/navigation";
import { Button, Heading, Screen, Text } from "@umbraculum/ui";

import { getApiBaseUrl, useAuth } from "@umbraculum/native-shell/auth";
import { useLocaleController } from "@umbraculum/native-shell/i18n";
import { openWebFallbackRoute } from "../navigation/openWebFallback";

export function BlockedRouteScreen({ routeId }: { routeId: RouteId }) {
  const { t } = useT("nav");
  const { t: tCommon } = useT("common");
  const auth = useAuth();
  const { locale } = useLocaleController();
  const [opening, setOpening] = useState(false);

  const availability = getRouteAvailability(routeId, "native");
  const canOpenOnWeb = availability === "whitelisted_web_fallback";
  const webRoute = canOpenOnWeb ? buildWebFallbackRouteRef(routeId) : null;

  const onOpenWeb = async () => {
    if (auth.state.status !== "logged_in" || !webRoute) return;
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      Alert.alert(t("openOnWeb"), t("missingApiBaseUrl"));
      return;
    }

    setOpening(true);
    try {
      const res = await openWebFallbackRoute({
        baseUrl,
        token: auth.state.token,
        locale,
        route: webRoute,
      });
      if (!res.ok) Alert.alert(t("openOnWeb"), res.error ?? "Open on web failed");
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen>
      <Heading fontSize={22}>{t("notAvailableOnMobileYet")}</Heading>
      <Text fontSize={16}>{t("notAvailableOnMobileYet")}</Text>

      {canOpenOnWeb && webRoute ? (
        <Button
          onPress={() => { void onOpenWeb(); }}
          disabled={opening || auth.state.status !== "logged_in"}
          accessibilityRole="button"
          accessibilityLabel={t("openOnWeb")}
        >
          <Text>{opening ? tCommon("loading") : t("openOnWeb")}</Text>
        </Button>
      ) : null}
    </Screen>
  );
}
