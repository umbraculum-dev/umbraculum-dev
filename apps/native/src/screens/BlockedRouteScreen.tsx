import React, { useState } from "react";
import { Alert } from "react-native";

import { useT } from "@brewery/i18n-react";
import type { RouteId, RouteRef } from "@brewery/navigation";
import { getRouteAvailability } from "@brewery/navigation";
import { Button, Heading, Screen, Text } from "@brewery/ui";

import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useAuth } from "../auth/AuthProvider";
import { useLocaleController } from "../i18n/I18nProvider";
import { openWebFallbackRoute } from "../navigation/openWebFallback";

export function BlockedRouteScreen({ routeId }: { routeId: RouteId }) {
  const { t } = useT("nav");
  const { t: tCommon } = useT("common");
  const auth = useAuth();
  const { locale } = useLocaleController();
  const [opening, setOpening] = useState(false);

  const availability = getRouteAvailability(routeId, "native");
  const canOpenOnWeb = availability === "whitelisted_web_fallback";

  const onOpenWeb = async () => {
    if (auth.state.status !== "logged_in") return;
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      Alert.alert(t("openOnWeb"), t("missingApiBaseUrl"));
      return;
    }

    const route: RouteRef = { id: "inventory", params: {} };

    setOpening(true);
    try {
      const res = await openWebFallbackRoute({
        baseUrl,
        token: auth.state.token,
        locale,
        route,
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

      {canOpenOnWeb ? (
        <Button
          onPress={onOpenWeb}
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

