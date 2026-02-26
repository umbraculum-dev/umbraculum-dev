import React, { useEffect, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { Image } from "expo-image";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import { useT } from "@brewery/i18n-react";

import { Text } from "@brewery/ui";

import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useAuth } from "../auth/AuthProvider";
import { SURFACE_BACKGROUND_SEMI, SURFACE_BORDER } from "../theme/colors";

export type AdPlacementV1 =
  | "global_top"
  | "global_bottom"
  | "recipe_edit_after_fermentables"
  | "recipe_edit_after_hops"
  | "recipe_edit_after_yeast";

type SlotResponse = {
  ok: boolean;
  disabled: boolean;
  ad: null | {
    id: string;
    imageUrl: string;
    linkUrl: string;
    altText: string;
  };
};

export function AdSlot({ placement }: { placement: AdPlacementV1 }) {
  const { t } = useT("ads");
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [disabled, setDisabled] = useState(false);
  const [ad, setAd] = useState<SlotResponse["ad"]>(null);

  const mediaHeightPx = placement === "global_top" ? 120 : 160;

  useEffect(() => {
    if (!baseUrl) return;
    let cancelled = false;

    const api = createApiClient(baseUrl, bearerTokenAuth(() => token));

    (async () => {
      const res = await api.get(`/api/ads/slot/${placement}?platform=native`);
      const data = res.ok && res.data && typeof res.data === "object" ? (res.data as SlotResponse) : null;

      const nextDisabled = Boolean(data?.disabled);
      const nextAd = data?.ad ?? null;

      if (!cancelled) {
        setDisabled(nextDisabled);
        setAd(nextAd);
      }
    })().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [baseUrl, placement, token]);

  if (disabled) return null;

  return (
    <View
      style={{
        marginVertical: 12,
        gap: 6,
        padding: 10,
        backgroundColor: SURFACE_BACKGROUND_SEMI,
        borderWidth: 1,
        borderColor: SURFACE_BORDER,
        borderRadius: 8,
      }}
      accessibilityLabel={t("ariaLabel")}
    >
      <View
        style={{
          height: mediaHeightPx,
          width: "100%",
          overflow: "hidden",
          borderRadius: 8,
          backgroundColor: "#1a1e26",
        }}
      >
        {ad ? (
          <Pressable
            onPress={() => ad.linkUrl && Linking.openURL(ad.linkUrl)}
            style={{ flex: 1 }}
            accessibilityRole="link"
            accessibilityLabel={ad.altText}
          >
            <Image
              source={{ uri: ad.imageUrl }}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
              contentFit="cover"
            />
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 4 }}>
        <Pressable
          onPress={() => {
            const base = baseUrl.replace(/\/+$/, "");
            Linking.openURL(`${base}/contact`);
          }}
          accessibilityRole="link"
          accessibilityLabel={t("contactLine")}
        >
          <Text fontSize={12} opacity={0.8}>
            {t("contactLine")}
          </Text>
        </Pressable>
        <Text fontSize={12} opacity={0.8}>
          {t("upgradeLine")}
        </Text>
      </View>
    </View>
  );
}
