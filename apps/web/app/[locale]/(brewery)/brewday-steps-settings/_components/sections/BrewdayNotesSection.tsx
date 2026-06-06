"use client";

import { TextArea } from "tamagui";

import { RecipeEditField, RecipeEditSection } from "../../../_components/recipe-edit";
import type { useBrewdayStepsSettingsPage } from "../../_hooks/useBrewdayStepsSettingsPage";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayNotesSection(props: { model: Model }) {
  const { t, openSections, setSectionOpen, brewdayNotes, setBrewdayNotes } = props.model;

  return (
    <RecipeEditSection
      id="brewday-notes"
      headingId="brewday-notes-heading"
      label={t("sections.brewdayNotes.title")}
      open={openSections['brewdayNotes']}
      onOpenChange={(open) => setSectionOpen("brewdayNotes", open)}
    >
      <RecipeEditField id="brewday-notes" label={t("sections.brewdayNotes.title")}>
        <TextArea
          id="brewday-notes"
          numberOfLines={6}
          value={brewdayNotes}
          onChangeText={setBrewdayNotes}
          size="$3"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
      </RecipeEditField>
    </RecipeEditSection>
  );
}
