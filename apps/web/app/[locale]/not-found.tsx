"use client";

import { useTranslations } from "next-intl";
import { H1, SizableText, View, YStack } from "tamagui";

import { Link } from "../../src/i18n/navigation";

/** App Router `notFound()` UI — Tamagui client page (same chrome as page-not-found). */
export default function LocaleNotFound() {
  const t = useTranslations("common");

  return (
    <View className="brew-panel" aria-labelledby="locale-not-found-title">
      <YStack gap="3">
        <H1 id="locale-not-found-title" mb="0">
          {t("httpNotFoundTitle")}
        </H1>
        <SizableText size="3" color="var(--text-muted)" fontFamily="body">
          {t("httpNotFoundBody")}
        </SizableText>
        <SizableText size="3" fontFamily="body">
          <Link href="/">{t("httpNotFoundHome")}</Link>
        </SizableText>
      </YStack>
    </View>
  );
}
