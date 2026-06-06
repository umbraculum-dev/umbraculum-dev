"use client";

import { Accordion, H1, SizableText, YStack } from "tamagui";

import { DashboardClient } from "../../../../DashboardClient";
import { Link } from "../../../../../src/i18n/navigation";
import { BrewAccordionSection } from "../../_components/BrewAccordionSection";
import type { UseFermDataIntegrationPageModel } from "../_hooks/useFermDataIntegrationPage";
import { FermIntegrationSetupSection } from "./sections/FermIntegrationSetupSection";

type Model = UseFermDataIntegrationPageModel;

export function FermDataIntegrationPageContent(props: { model: Model }) {
  const { model } = props;
  const { t, openSections, setOpenSections } = model;

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
            <FermIntegrationSetupSection model={model} />
          </BrewAccordionSection>
        </Accordion>
      </YStack>
    </YStack>
  );
}
