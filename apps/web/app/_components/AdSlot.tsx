"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

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
  const locale = useLocale();
  const t = useTranslations("ads");

  const [disabled, setDisabled] = useState(false);
  const [ad, setAd] = useState<SlotResponse["ad"]>(null);

  const contactHref = useMemo(() => `/${locale}/contact`, [locale]);

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
    <div className="adSlotWrap">
      <aside className="adSlot" aria-label={t("ariaLabel")}>
        {ad ? (
          <>
            <a href={ad.linkUrl} target="_blank" rel="noreferrer noopener">
              <img className="adSlotImage" src={ad.imageUrl} alt={ad.altText} loading="lazy" />
            </a>
            <p className="muted adSlotLine">{t("upgradeLine")}</p>
          </>
        ) : (
          <>
            <p className="muted adSlotLine">
              <a href={contactHref}>{t("contactLine")}</a>
            </p>
            <p className="muted adSlotLine">{t("upgradeLine")}</p>
          </>
        )}
      </aside>
    </div>
  );
}

