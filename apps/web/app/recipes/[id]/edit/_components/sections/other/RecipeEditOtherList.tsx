import {SizableText, YStack} from "tamagui";

import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {RecipeEditOtherRowFields} from "./RecipeEditOtherRowFields";

export function RecipeEditOtherList({model}: {model: RecipeEditPageModel}) {
  const {miscRows} = model;

  if (!miscRows.length) {
    return (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
        No other ingredients yet.
      </SizableText>
    );
  }

  return (
    <YStack gap="$3" mt="$3" w="100%" minWidth={0}>
      {miscRows.map((r, idx) => (
        <RecipeEditOtherRowFields key={r.id} model={model} row={r} idx={idx} />
      ))}
    </YStack>
  );
}
