import {Button, SizableText, XStack} from "tamagui";

import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditOtherHeaderBlock({model}: {model: RecipeEditPageModel}) {
  const {t, addMiscRow} = model;

  return (
    <XStack jc="space-between" gap="$3" flexWrap="wrap">
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
        {t("otherHelp")}
      </SizableText>
      <Button
        onPress={addMiscRow}
        size="$3"
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        color="var(--text)"
        fontFamily="$body"
      >
        {t("buttons.addOtherIngredient")}
      </Button>
    </XStack>
  );
}
