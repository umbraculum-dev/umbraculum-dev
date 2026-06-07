"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Image } from "tamagui";

import { Link } from "../../../src/i18n/navigation";
import { getAdSlot } from "@umbraculum/api-client";
import { webPlatformApiClient } from "../_lib/webApiClient";
import { AdSlotCard, Text } from "@umbraculum/ui";

export type AdPlacementV1 =
  | "global_top"
  | "global_bottom"
  | "recipe_edit_after_fermentables"
  | "recipe_edit_after_hops"
  | "recipe_edit_after_yeast";

export function AdSlot({ placement }: { placement: AdPlacementV1 }) {
  const t = useTranslations("ads");

  const [disabled, setDisabled] = useState(false);
  const [ad, setAd] = useState<{
    id: string;
    imageUrl: string;
    linkUrl: string;
    altText: string;
  } | null>(null);
  const mediaHeightPx = placement === "global_top" ? 120 : 160;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getAdSlot(webPlatformApiClient(), placement, { platform: "web" });
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
  }, [placement]);

  if (disabled) return null;

  return (
    <AdSlotCard
      ariaLabel={t("ariaLabel")}
      mediaHeightPx={mediaHeightPx}
      media={
        ad ? (
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="brew-block"
            style={{ height: "100%" }}
          >
            <Image
              src={ad.imageUrl}
              alt={ad.altText}
              loading="lazy"
              w="100%"
              h="100%"
              style={{ objectFit: "cover" }}
            />
          </a>
        ) : null
      }
      contactLine={
        <Text fontSize={12} opacity={0.8}>
          <Link href="/contact">{t("contactLine")}</Link>
        </Text>
      }
      upgradeLine={<Text fontSize={12} opacity={0.8}>{t("upgradeLine")}</Text>}
    />
  );
}
