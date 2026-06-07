"use client";

import { useTranslations } from "next-intl";
import { H1, SizableText, YStack } from "tamagui";
import { Link } from "../../../src/i18n/navigation";

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("translationsRowPrefix")}{" "}
        <Link href="/contributing?topic=i18n">{t("translationsRowLinkText")}</Link> {t("translationsRowSuffix")}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("translationsSideNote")}
      </SizableText>
    </YStack>
  );
}

