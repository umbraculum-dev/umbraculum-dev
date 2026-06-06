import {Button, SizableText, YStack} from "tamagui";

import {ErrorBox, RecipeEditSection} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditBrewSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    openSections,
    setSectionOpen,
    creatingBrewSession,
    brewSessionError,
    canCallAccountScoped,
    onBrewRecipe
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="brew"
            headingId="brew-heading"
            label={t("sections.brew")}
            open={openSections['brew']}
            onOpenChange={(open) => setSectionOpen("brew", open)}
          >
            <YStack gap="$2" mt="$2">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("brewNote")}
              </SizableText>
              <Button
                onPress={() => { void onBrewRecipe(); }}
                disabled={!canCallAccountScoped || creatingBrewSession}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {t("brewButton")}
              </Button>
              {brewSessionError ? <ErrorBox mt="$1.5">{brewSessionError}</ErrorBox> : null}
            </YStack>
          </RecipeEditSection>
  );
}
