"use client";

import { Button, SizableText, XStack } from "tamagui";

import { RecipeEditSection } from "../../../_components/recipe-edit";
import type { useBrewdayStepsSettingsPage } from "../../_hooks/useBrewdayStepsSettingsPage";
import { BrewdayStepsCustomAddForm } from "./custom/BrewdayStepsCustomAddForm";
import { BrewdayStepsCustomStepRows } from "./custom/BrewdayStepsCustomStepRows";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayStepsCustomSection(props: { model: Model }) {
  const {
    t,
    openSections,
    setSectionOpen,
    onSave,
    saving,
    canCallAccountScoped,
  } = props.model;

  return (
    <RecipeEditSection
      id="brewday-steps-custom"
      headingId="brewday-steps-custom-heading"
      label={t("sections.brewdayStepsCustom.title")}
      open={openSections['brewdayStepsCustom']}
      onOpenChange={(open) => setSectionOpen("brewdayStepsCustom", open)}
    >
      <SizableText
        size="$2"
        color="var(--text-muted)"
        fontFamily="$body"
        mt={0}
        mb="$2"
      >
        {t("customSectionNote")}
      </SizableText>

      <BrewdayStepsCustomAddForm model={props.model} />

      <BrewdayStepsCustomStepRows model={props.model} />

      <XStack gap="$3" items="center" mt="$3">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={() => { void onSave(); }}
          disabled={!canCallAccountScoped || saving}
        >
          {saving
            ? t("saving")
            : t("save")}
        </Button>
      </XStack>
    </RecipeEditSection>
  );
}
