import React, { useEffect, useState } from "react";
import { Linking, Pressable } from "react-native";
import { Image } from "expo-image";

import { getAdSlot } from "@umbraculum/api-client";
import { useT } from "@umbraculum/i18n-react";

import { AdSlotCard, Text } from "@umbraculum/ui";

import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useAuth } from "../auth/AuthProvider";
import { nativePlatformApiClient } from "../auth/nativeApiClient";

export type AdPlacementV1 =
  | "global_top"
  | "global_bottom"
  | "recipe_edit_after_fermentables"
  | "recipe_edit_after_hops"
  | "recipe_edit_after_yeast";

export function AdSlot({ placement }: { placement: AdPlacementV1 }) {
  const { t } = useT("ads");
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [disabled, setDisabled] = useState(false);
  const [ad, setAd] = useState<{
    id: string;
    imageUrl: string;
    linkUrl: string;
    altText: string;
  } | null>(null);

  const mediaHeightPx = placement === "global_top" ? 120 : 160;

  useEffect(() => {
    if (!baseUrl) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await getAdSlot(nativePlatformApiClient(token, baseUrl), placement);
        if (!cancelled) {
          setDisabled(data.disabled);
          setAd(data.ad);
        }
      } catch {
        // non-fatal — slot stays empty
      }
    })().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [baseUrl, placement, token]);

  if (disabled) return null;

  return (
    <AdSlotCard
      ariaLabel={t("ariaLabel")}
      mediaHeightPx={mediaHeightPx}
      media={
        ad ? (
          <Pressable
            onPress={() => { if (ad.linkUrl) void Linking.openURL(ad.linkUrl); }}
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
        ) : null
      }
      contactLine={
        <Pressable
          onPress={() => {
            const base = baseUrl.replace(/\/+$/, "");
            void Linking.openURL(`${base}/contact`);
          }}
          accessibilityRole="link"
          accessibilityLabel={t("contactLine")}
        >
          <Text fontSize={12} opacity={0.8}>
            {t("contactLine")}
          </Text>
        </Pressable>
      }
      upgradeLine={
        <Text fontSize={12} opacity={0.8}>
          {t("upgradeLine")}
        </Text>
      }
    />
  );
}
