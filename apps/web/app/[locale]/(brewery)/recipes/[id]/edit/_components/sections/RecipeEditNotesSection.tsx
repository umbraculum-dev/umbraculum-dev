import {TextArea} from "tamagui";

import {RecipeEditField, RecipeEditSection} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditNotesSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    openSections,
    setSectionOpen,
    notes,
    setNotes
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="notes"
            headingId="notes-heading"
            label={t("sections.notes")}
            open={openSections['notes']}
            onOpenChange={(open) => setSectionOpen("notes", open)}
          >
            <RecipeEditField id="recipe-notes" label={t("sections.notes")}>
              <TextArea
          id="recipe-notes"
          numberOfLines={6}
          size="md"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="2"
          fontFamily="body"
          value={notes}
          onChangeText={setNotes}
        />
            </RecipeEditField>
          </RecipeEditSection>
  );
}
