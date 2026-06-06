import {Button, Input, SizableText, XStack} from "tamagui";

import {RecipeEditField, RecipeEditSection} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditBoilSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    openSections,
    setSectionOpen,
    saving,
    boilTimeMinutes,
    setBoilTimeMinutes,
    canCallAccountScoped,
    onSave
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="boil"
            headingId="boil-heading"
            label={t("sections.boil")}
            open={openSections['boil']}
            onOpenChange={(open) => setSectionOpen("boil", open)}
          >
            <RecipeEditField id="recipe-boil-time" label={t("sections.boil")}>
              <Input
                id="recipe-boil-time"
                value={boilTimeMinutes}
                onChangeText={setBoilTimeMinutes}
                keyboardType="numeric"
                placeholder="60"
                size="$3"
                w={120}
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </RecipeEditField>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
              {t("boilTimeHelp")}
            </SizableText>
            <XStack mt="$3" justify="flex-end">
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
                {saving ? "Saving…" : t("boilSave")}
              </Button>
            </XStack>
          </RecipeEditSection>
  );
}
