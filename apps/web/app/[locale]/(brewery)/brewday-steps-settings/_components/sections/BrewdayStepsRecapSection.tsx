"use client";

import { SizableText } from "tamagui";

import { RecipeEditSection } from "../../../_components/recipe-edit";
import type { useBrewdayStepsSettingsPage } from "../../_hooks/useBrewdayStepsSettingsPage";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayStepsRecapSection(props: { model: Model }) {
  const { t, openSections, setSectionOpen } = props.model;

  return (
    <RecipeEditSection
      id="brewday-steps-recap"
      headingId="brewday-steps-recap-heading"
      label={t("sections.brewdayStepsRecap.title")}
      open={openSections['brewdayStepsRecap']}
      onOpenChange={(open) => setSectionOpen("brewdayStepsRecap", open)}
    >
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("sections.brewdayStepsRecap.empty")}
      </SizableText>
    </RecipeEditSection>
  );
}
