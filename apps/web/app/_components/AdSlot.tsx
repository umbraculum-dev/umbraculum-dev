"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Image, SizableText, View, YStack } from "tamagui";

import { Link } from "../../src/i18n/navigation";
import { apiFetch } from "../_lib/apiClient";

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
    <YStack my="$3" gap="$1.5">
      <View
        as="aside"
        aria-label={t("ariaLabel")}
        bg="color-mix(in srgb, var(--surface-2) 45%, var(--surface))"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$2.5"
      >
        <YStack gap="$1.5">
        {ad ? (
          <>
            <a href={ad.linkUrl} target="_blank" rel="noreferrer noopener">
              <Image
                src={ad.imageUrl}
                alt={ad.altText}
                loading="lazy"
                w="100%"
                maxW="100%"
                h="auto"
                rounded="$2"
                className="brew-block"
              />
            </a>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
              {t("upgradeLine")}
            </SizableText>
          </>
        ) : (
          <>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
              <Link href="/contact">{t("contactLine")}</Link>
            </SizableText>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
              {t("upgradeLine")}
            </SizableText>
          </>
        )}
        </YStack>
      </View>
    </YStack>
  );
}
