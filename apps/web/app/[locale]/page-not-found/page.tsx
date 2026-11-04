"use client";

import { useTranslations } from "next-intl";
import { H1, SizableText, View, YStack } from "tamagui";

import { Link } from "../../../src/i18n/navigation";

/**
 * In-app HTTP 404 page. Middleware rewrites gated deep links here so browsers
 * show Umbraculum UI instead of a blank-body generic error (e.g. Firefox).
 * Client + Tamagui — same pattern as About / dashboard panels (`brew-panel`).
 */
export default function HttpNotFoundPage() {
  const t = useTranslations("common");

  return (
    <View className="brew-panel" aria-labelledby="http-not-found-title">
      <YStack gap="3">
        <H1 id="http-not-found-title" mb="0">
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
