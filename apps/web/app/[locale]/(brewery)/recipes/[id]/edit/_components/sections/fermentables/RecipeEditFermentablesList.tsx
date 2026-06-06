import {SizableText, View, YStack} from "tamagui";

import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {RecipeEditFermentablesRowEditor} from "./RecipeEditFermentablesRowEditor";

export function RecipeEditFermentablesList({model}: {model: RecipeEditPageModel}) {
  const {gristRows} = model;

  if (!gristRows.length) {
    return (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
        No fermentables yet.
      </SizableText>
    );
  }

  return (
    <View overflowX="auto" mt="$2">
      <YStack gap="$3">
        {gristRows.map((r, idx) => (
          <RecipeEditFermentablesRowEditor key={r.id} model={model} row={r} idx={idx} />
        ))}
      </YStack>
    </View>
  );
}
