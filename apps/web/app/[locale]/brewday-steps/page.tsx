"use client";

import { useTranslations } from "next-intl";
import { H1, H2, SizableText, View, YStack } from "tamagui";

import { DashboardClient } from "../../DashboardClient";
import { Link } from "../../../src/i18n/navigation";

export default function BrewdayStepsPage() {
  const t = useTranslations("dashboard.brewdaySteps");

  return (
    <YStack gap="$3">
      <DashboardClient />

      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        <Link href="/">{t("backToDashboard")}</Link>
      </SizableText>

      <View
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
        aria-labelledby="brew-steps-heading"
      >
        <H2 id="brew-steps-heading" mt={0}>
          {t("sections.brewSteps.title")}
        </H2>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
          {t("sections.brewSteps.empty")}
        </SizableText>
      </View>
    </YStack>
  );
}

