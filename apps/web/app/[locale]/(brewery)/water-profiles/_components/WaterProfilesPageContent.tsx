"use client";

import { Accordion, H1, SizableText, View, YStack } from "tamagui";

import { Link } from "../../../../../src/i18n/navigation";
import type { useWaterProfilesPage } from "../_hooks/useWaterProfilesPage";
import { WaterProfileCreateForm } from "./WaterProfileCreateForm";
import { WaterProfileListSection } from "./WaterProfileListSection";

type Model = ReturnType<typeof useWaterProfilesPage>;

export function WaterProfilesPageContent(props: { model: Model }) {
  const { model } = props;
  const { t, tEquipment, admin, openSections, setOpenSectionsFromAccordion } = model;

  return (
    <>
      <YStack width="100%" gap="$1" mb="$2">
        <H1 mt={0} mb={0}>{t("title")}</H1>
        <SizableText size="$2" fontFamily="$body" mt={0} mb={0} display="block">
          <Link href="/recipes">{tEquipment("backToRecipes")}</Link>
        </SizableText>
      </YStack>

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSectionsFromAccordion}
      >
        <WaterProfileListSection model={model} />

        {admin ? (
          <WaterProfileCreateForm model={model} />
        ) : null}
      </Accordion>

      <View className="brew-panel" mt="$3">
        <ul className="brew-recipe-edit-list-disc brew-list-mb0">
          <li>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("rawMaterialsCtaPrefix")} <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
            </SizableText>
          </li>
        </ul>
      </View>
    </>
  );
}
