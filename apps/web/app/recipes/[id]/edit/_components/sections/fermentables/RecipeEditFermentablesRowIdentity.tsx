import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
} from "../../../../../../_components/recipe-edit";
import type {GristRow} from "../../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditFermentablesRowIdentity({
  model,
  row,
  idx,
}: {
  model: RecipeEditPageModel;
  row: GristRow;
  idx: number;
}) {
  const {updateGristRow, removeGristRow} = model;

  return (
    <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
      <View alignSelf="center">
        <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
          {idx + 1}
        </SizableText>
      </View>
      <YStack gap="$1" flex={1} minW={240} minWidth={0}>
        <RecipeEditFieldLabel htmlFor={`grist-name-${row.id}`}>Name</RecipeEditFieldLabel>
        <Input
          id={`grist-name-${row.id}`}
          value={row.name}
          onChangeText={(text) =>
            updateGristRow(row.id, {
              name: text,
              ingredientId: null,
              producer: null,
              group: null,
              mashDiPh: null,
              mashTaToPh57_mEqPerKg: null,
              mashRoastDehuskedOverride: null,
              mashRoastDehuskedSource: "unknown",
              mashPhModelSource: "unknown",
            })
          }
          autoComplete="off"
          size="$3"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
      </YStack>
      {(row.producer ?? "") ? (
        <YStack gap="$1" minW={100}>
          <RecipeEditFieldLabel>Producer</RecipeEditFieldLabel>
          <RecipeEditReadOnlyValue>{row.producer}</RecipeEditReadOnlyValue>
        </YStack>
      ) : null}
      {(row.group ?? "") ? (
        <YStack gap="$1" minW={100}>
          <RecipeEditFieldLabel>Group</RecipeEditFieldLabel>
          <RecipeEditReadOnlyValue>{row.group}</RecipeEditReadOnlyValue>
        </YStack>
      ) : null}
      <Button
        size="$2"
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        color="var(--text)"
        fontFamily="$body"
        onPress={() => removeGristRow(row.id)}
        aria-label={`Remove fermentable row ${idx + 1}`}
      >
        Remove
      </Button>
    </XStack>
  );
}
