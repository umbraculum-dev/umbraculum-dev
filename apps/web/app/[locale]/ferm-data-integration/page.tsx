"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Accordion, H1, SizableText, YStack } from "tamagui";

import { DashboardClient } from "../../DashboardClient";
import { Link } from "../../../src/i18n/navigation";
import { BrewAccordionSection } from "../../_components/BrewAccordionSection";

export default function FermDataIntegrationPage() {
  const t = useTranslations("dashboard.fermDataIntegration");
  const [openSections, setOpenSections] = useState<string[]>([]);

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

      <YStack gap="$0">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <BrewAccordionSection
            value="integrations"
            headingId="integrations-heading"
            title={t("sections.integration.title")}
            open={openSections.includes("integrations")}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0} mt="$3">
              {t("sections.integration.empty")}
            </SizableText>
          </BrewAccordionSection>
        </Accordion>
      </YStack>
    </YStack>
  );
}

