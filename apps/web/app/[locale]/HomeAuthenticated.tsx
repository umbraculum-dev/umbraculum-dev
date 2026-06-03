"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Accordion, H1, SizableText, View, YStack } from "tamagui";
import { AppPermissionsContent, HealthStatusContent } from "../HealthPanel";
import { DashboardClient } from "../DashboardClient";
import { ImportExportPanel } from "../_components/ImportExportPanel";
import { Link } from "../../src/i18n/navigation";
import { BrewAccordionHeader } from "../_components/BrewAccordionHeader";

export function HomeAuthenticated() {
  const t = useTranslations("dashboard");
  const tHealth = useTranslations("health");
  const [openSections, setOpenSections] = useState<string[]>(["appPermissions"]);

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("subtitle")}
      </SizableText>

      <YStack gap="$0">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <Accordion.Item value="appPermissions">
            <View className="brew-panel" aria-labelledby="dashboard-app-permissions-heading">
              <BrewAccordionHeader
                headingId="dashboard-app-permissions-heading"
                title={tHealth("appPermissions.title")}
                open={openSections.includes("appPermissions")}
              />
              <Accordion.Content>
                <AppPermissionsContent />
              </Accordion.Content>
            </View>
          </Accordion.Item>

          <Accordion.Item value="health">
            <View className="brew-panel brew-section" aria-labelledby="dashboard-health-heading">
              <BrewAccordionHeader
                headingId="dashboard-health-heading"
                title={tHealth("title")}
                open={openSections.includes("health")}
              />
              <Accordion.Content>
                <HealthStatusContent />
              </Accordion.Content>
            </View>
          </Accordion.Item>

          <Accordion.Item value="importExport">
            <View className="brew-panel brew-section" aria-labelledby="dashboard-import-export-heading">
              <BrewAccordionHeader
                headingId="dashboard-import-export-heading"
                title={t("importExport.title")}
                open={openSections.includes("importExport")}
              />
              <Accordion.Content>
                <ImportExportPanel headingId="import-export-heading" variant="content" className="" />
              </Accordion.Content>
            </View>
          </Accordion.Item>

          <Accordion.Item value="links">
            <View className="brew-panel brew-section" aria-labelledby="dashboard-links-heading">
              <BrewAccordionHeader
                headingId="dashboard-links-heading"
                title={t("links.title")}
                open={openSections.includes("links")}
              />
              <Accordion.Content>
                <YStack gap="$2" mt="$2" mb={0}>
                  <Link href="/ferm-data-integration">{t("links.fermDataIntegration")}</Link>
                  <Link href="/brewday-steps-settings">{t("links.brewdayStepsSettings")}</Link>
                  <Link href="/water-profiles">{t("links.waterProfiles")}</Link>
                </YStack>
              </Accordion.Content>
            </View>
          </Accordion.Item>

          <Accordion.Item value="brewery">
            <View className="brew-panel brew-section" aria-labelledby="dashboard-brewery-heading">
              <BrewAccordionHeader
                headingId="dashboard-brewery-heading"
                title={t("links.brewery")}
                open={openSections.includes("brewery")}
              />
              <Accordion.Content>
                <YStack gap="$2" mt="$2" mb={0}>
                  <Link href="/equipment">{t("links.equipment")}</Link>
                  <Link href="/inventory">{t("links.inventory")}</Link>
                </YStack>
              </Accordion.Content>
            </View>
          </Accordion.Item>
        </Accordion>
      </YStack>

      <DashboardClient />
    </YStack>
  );
}
