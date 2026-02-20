"use client";

import { useTranslations } from "next-intl";
import { H1, H2, SizableText, View, YStack } from "tamagui";
import { HealthPanel } from "../HealthPanel";
import { DashboardClient } from "../DashboardClient";
import { ImportExportPanel } from "../_components/ImportExportPanel";
import { Link } from "../../src/i18n/navigation";

export default function Home() {
  const t = useTranslations("dashboard");
  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>
      <HealthPanel />
      <ImportExportPanel headingId="import-export-heading" className="" />

      <View
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
        aria-labelledby="dashboard-links-heading"
      >
        <H2 id="dashboard-links-heading" mt={0}>
          {t("links.title")}
        </H2>
        <YStack gap="$2" mt="$2" mb={0}>
          <Link href="/ferm-data-integration">{t("links.fermDataIntegration")}</Link>
          <Link href="/brewday-steps">{t("links.brewdaySteps")}</Link>
          <Link href="/water-profiles">{t("links.waterProfiles")}</Link>
        </YStack>
      </View>

      <DashboardClient />
    </YStack>
  );
}

