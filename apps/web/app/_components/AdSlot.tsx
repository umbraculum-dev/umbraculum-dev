"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Image } from "tamagui";

import { Link } from "../../src/i18n/navigation";
import { apiFetch } from "../_lib/apiClient";
import { AdSlotCard, Text } from "@brewery/ui";

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
  const t = useTranslations("ads");

  const [disabled, setDisabled] = useState(false);
  const [ad, setAd] = useState<SlotResponse["ad"]>(null);
  const mediaHeightPx = placement === "global_top" ? 120 : 160;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await apiFetch(`/api/ads/slot/${placement}?platform=web`);
      const data = res.ok && res.data && typeof res.data === "object" ? (res.data as any) : null;

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
