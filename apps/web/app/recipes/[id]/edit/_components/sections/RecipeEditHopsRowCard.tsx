import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {BrewSelect} from "../../../../../_components/BrewSelect";
import {RecipeEditFieldLabel, RecipeEditIngredientCard, RecipeEditReadOnlyValue} from "../../../../../_components/recipe-edit";
import type {HopRow, HopUse} from "../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditHopsRowCard({
  model,
  row,
  idx,
}: {
  model: RecipeEditPageModel;
  row: HopRow;
  idx: number;
}) {
  const { t, tHops, tUnits, updateHopRow, removeHopRow } = model;

  return (
    <RecipeEditIngredientCard>
      <XStack gap="$3" flexWrap="wrap" items="flex-end">
        <View alignSelf="center">
          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
            {idx + 1}
          </SizableText>
        </View>
        <YStack gap="$1" flex={1} minW={280} minWidth={0}>
          <RecipeEditFieldLabel htmlFor={`hop-name-${row.id}`}>Name</RecipeEditFieldLabel>
          <Input
            id={`hop-name-${row.id}`}
            value={row.name}
            onChangeText={(text) =>
              updateHopRow(row.id, { name: text, ingredientId: null, country: null })
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
        {(row.country ?? "") ? (
          <YStack gap="$1" w={240} maxW="100%">
            <RecipeEditFieldLabel>Country</RecipeEditFieldLabel>
            <RecipeEditReadOnlyValue>{row.country}</RecipeEditReadOnlyValue>
          </YStack>
        ) : null}
        <Button
          size="$2"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={() => removeHopRow(row.id)}
          aria-label={`Remove hop row ${idx + 1}`}
        >
          Remove
        </Button>
      </XStack>

      <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
        <YStack gap="$1" minW={100}>
          <RecipeEditFieldLabel htmlFor={`hop-g-${row.id}`}>
            {t("amountLabel", { unit: tUnits("g") })}
          </RecipeEditFieldLabel>
          <Input
            id={`hop-g-${row.id}`}
            value={String(row.amountGrams)}
            onChangeText={(text) =>
              updateHopRow(row.id, { amountGrams: text === "" ? 0 : Number(text) })
            }
            keyboardType="decimal-pad"
            size="$3"
            w={120}
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>

        <YStack gap="$1" minW={90}>
          <RecipeEditFieldLabel htmlFor={`hop-aa-${row.id}`}>Alpha (%)</RecipeEditFieldLabel>
          <Input
            id={`hop-aa-${row.id}`}
            value={row.alphaAcidPercent ?? ""}
            onChangeText={(text) =>
              updateHopRow(row.id, {
                alphaAcidPercent: text === "" ? null : Number(text),
              })
            }
            keyboardType="decimal-pad"
            size="$3"
            w={110}
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>

        <YStack gap="$1" minW={170}>
          <RecipeEditFieldLabel htmlFor={`hop-form-${row.id}`}>{tHops("typeLabel")}</RecipeEditFieldLabel>
          <BrewSelect
            id={`hop-form-${row.id}`}
            value={row.form ?? "pellet"}
            onValueChange={(v) =>
              updateHopRow(row.id, {
                form: v as NonNullable<HopRow["form"]>,
              })
            }
            options={[
              { value: "pellet", label: tHops("typeOptions.pellet") },
              { value: "leaf", label: tHops("typeOptions.leaf") },
              { value: "leaf (wet)", label: tHops("typeOptions.leafWet") },
              { value: "powder", label: tHops("typeOptions.powder") },
              { value: "extract", label: tHops("typeOptions.extract") },
              { value: "hop_extract", label: tHops("typeOptions.hopExtract") },
              { value: "plug", label: tHops("typeOptions.plug") },
              { value: "debittered_leaf", label: tHops("typeOptions.debitteredLeaf") },
            ]}
          />
        </YStack>

        <YStack gap="$1" minW={130}>
          <RecipeEditFieldLabel htmlFor={`hop-use-${row.id}`}>Use</RecipeEditFieldLabel>
          <BrewSelect
            id={`hop-use-${row.id}`}
            value={row.use}
            onValueChange={(v) => updateHopRow(row.id, { use: v as HopUse })}
            options={[
              { value: "boil", label: "Boil" },
              { value: "whirlpool", label: "Whirlpool" },
              { value: "dryhop", label: "Dry hop" },
            ]}
          />
        </YStack>

        <YStack gap="$1" minW={90}>
          <RecipeEditFieldLabel htmlFor={`hop-min-${row.id}`}>{tHops("timeBeforeEndOfBoilMin")}</RecipeEditFieldLabel>
          <Input
            id={`hop-min-${row.id}`}
            value={row.timeMinutes ?? ""}
            onChangeText={(text) =>
              updateHopRow(row.id, { timeMinutes: text === "" ? null : Number(text) })
            }
            keyboardType="decimal-pad"
            size="$3"
            w={110}
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
      </XStack>
    </RecipeEditIngredientCard>
  );
}
