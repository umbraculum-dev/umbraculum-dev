"use client";

import { useTranslations } from "next-intl";
import { Button, Checkbox, H2, SizableText, View, XStack } from "tamagui";

import type { PlatformAd } from "../_lib/platformAdsTypes";

type PlatformAdsTableProps = {
  items: PlatformAd[];
  loading: boolean;
  onToggleActive: (id: string, next: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function PlatformAdsTable({ items, loading, onToggleActive, onDelete }: PlatformAdsTableProps) {
  const t = useTranslations("platformAds");

  return (
    <View className="brew-panel">
      <H2 mt={0}>{t("listTitle")}</H2>

      {!items.length ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noAds")}
        </SizableText>
      ) : null}

      {items.length ? (
        <View className="brew-table-wrap">
          <table className="brew-table">
            <thead>
              <tr>
                <th align="left">{t("table.placement")}</th>
                <th align="left">{t("table.imageUrl")}</th>
                <th align="left">{t("table.linkUrl")}</th>
                <th align="left">{t("table.active")}</th>
                <th align="left">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="brew-table-cell-top">
                    <code>{a.placement}</code>
                  </td>
                  <td className="brew-table-cell-top">
                    <a href={a.imageUrl} target="_blank" rel="noreferrer noopener">
                      {t("table.open")}
                    </a>
                  </td>
                  <td className="brew-table-cell-top">
                    <a href={a.linkUrl} target="_blank" rel="noreferrer noopener">
                      {t("table.open")}
                    </a>
                  </td>
                  <td className="brew-table-cell-top">
                    <XStack gap="$2" alignItems="center" className="brew-muted">
                      <Checkbox
                        id={`ad-toggle-active-${a.id}`}
                        checked={a.isActive}
                        onCheckedChange={(c) => void onToggleActive(a.id, c === true)}
                        aria-label={t("table.toggleActiveAria", { id: a.id })}
                        size="$2"
                        native
                      >
                        <Checkbox.Indicator />
                      </Checkbox>
                      <SizableText as="label" htmlFor={`ad-toggle-active-${a.id}`} size="$2" color="var(--text-muted)" fontFamily="$body">
                        {a.isActive ? t("table.yes") : t("table.no")}
                      </SizableText>
                    </XStack>
                  </td>
                  <td className="brew-table-cell-top">
                    <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onDelete(a.id)} disabled={loading}>
                      {t("table.delete")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </View>
      ) : null}
    </View>
  );
}
