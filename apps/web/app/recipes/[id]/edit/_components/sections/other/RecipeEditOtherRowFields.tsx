import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {formatFixed} from "../../../../../../../src/i18n/format";
import {BrewSelect} from "../../../../../../_components/BrewSelect";
import {RecipeEditFieldLabel, RecipeEditIngredientCard} from "../../../../../../_components/recipe-edit";
import {miscTypeOptions, miscUseOptions} from "../../../_lib/recipeEditConstants";
import type {MiscType, MiscUse} from "../../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditOtherRowFields({
  model,
  row,
  idx,
}: {
  model: RecipeEditPageModel;
  row: RecipeEditPageModel["miscRows"][number];
  idx: number;
}) {
  const {t, tUnits, locale, updateMiscRow, removeMiscRow} = model;
  const amountLabel = t("amountLabel", { unit: row.amountIsWeight ? tUnits("kg") : tUnits("L") });

  return (
    <RecipeEditIngredientCard>
      <XStack gap="$3" flexWrap="wrap" items="flex-end" w="100%" minWidth={0}>
        <View alignSelf="center" flexShrink={0}>
          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
            {idx + 1}
          </SizableText>
        </View>
        <YStack gap="$1" flex={1} minW={280} flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-name-${row.id}`}>Name</RecipeEditFieldLabel>
          <Input
            id={`misc-name-${row.id}`}
            value={row.name}
            onChangeText={(text) => updateMiscRow(row.id, { name: text })}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
            aria-label={`Other ingredient name ${idx + 1}`}
          />
        </YStack>

        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-type-${row.id}`}>Type</RecipeEditFieldLabel>
          <BrewSelect
            id={`misc-type-${row.id}`}
            value={row.type}
            onValueChange={(v) => updateMiscRow(row.id, { type: v as MiscType })}
            options={miscTypeOptions}
            aria-label={`Other ingredient type ${idx + 1}`}
            width="full"
          />
        </YStack>

        <YStack gap="$1" w={160} maxW="100%" flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-use-${row.id}`}>Use</RecipeEditFieldLabel>
          <BrewSelect
            id={`misc-use-${row.id}`}
            value={row.use}
            onValueChange={(v) => updateMiscRow(row.id, { use: v as MiscUse })}
            options={miscUseOptions}
            aria-label={`Other ingredient use ${idx + 1}`}
            width="full"
          />
        </YStack>

        <YStack gap="$1" w={140} maxW="100%" flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-time-${row.id}`}>Time (min)</RecipeEditFieldLabel>
          <Input
            id={`misc-time-${row.id}`}
            value={typeof row.timeMinutes === "number" ? String(row.timeMinutes) : ""}
            onChangeText={(text) =>
              updateMiscRow(row.id, { timeMinutes: text === "" ? null : Number(text) })
            }
            keyboardType="decimal-pad"
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
            aria-label={`Other ingredient time minutes ${idx + 1}`}
          />
        </YStack>

        <YStack gap="$1" w={200} maxW="100%" flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-amount-is-weight-${row.id}`}>Amount kind</RecipeEditFieldLabel>
          <BrewSelect
            id={`misc-amount-is-weight-${row.id}`}
            value={row.amountIsWeight ? "weight" : "volume"}
            onValueChange={(v) => updateMiscRow(row.id, { amountIsWeight: v === "weight" })}
            options={[
              { value: "weight", label: "Weight" },
              { value: "volume", label: "Volume" },
            ]}
            aria-label={`Other ingredient amount kind ${idx + 1}`}
            width="full"
          />
        </YStack>

        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-amount-${row.id}`}>{amountLabel}</RecipeEditFieldLabel>
          <Input
            id={`misc-amount-${row.id}`}
            value={
              Number.isFinite(row.amount)
                ? row.amountIsWeight
                  ? formatFixed(locale, row.amount, 3)
                  : formatFixed(locale, row.amount, 2)
                : ""
            }
            onChangeText={(text) => {
              const normalized = text.replace(",", ".");
              const parsed = parseFloat(normalized);
              updateMiscRow(row.id, {
                amount: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
              });
            }}
            onBlur={() => {
              if (!Number.isFinite(row.amount)) return;
              const decimals = row.amountIsWeight ? 3 : 2;
              const rounded =
                Math.round(row.amount * 10 ** decimals) / 10 ** decimals;
              if (rounded !== row.amount) {
                updateMiscRow(row.id, { amount: rounded });
              }
            }}
            keyboardType="decimal-pad"
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
            aria-label={`Other ingredient amount ${idx + 1}`}
          />
        </YStack>

        <YStack gap="$1" flex={1} minW={240} flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-use-for-${row.id}`}>Use for</RecipeEditFieldLabel>
          <Input
            id={`misc-use-for-${row.id}`}
            value={row.useFor ?? ""}
            onChangeText={(text) => updateMiscRow(row.id, { useFor: text || null })}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
            aria-label={`Other ingredient use for ${idx + 1}`}
          />
        </YStack>

        <YStack gap="$1" flex={1} minW={260} flexShrink={0}>
          <RecipeEditFieldLabel htmlFor={`misc-notes-${row.id}`}>Notes</RecipeEditFieldLabel>
          <Input
            id={`misc-notes-${row.id}`}
            value={row.notes ?? ""}
            onChangeText={(text) => updateMiscRow(row.id, { notes: text || null })}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
            aria-label={`Other ingredient notes ${idx + 1}`}
          />
        </YStack>

        <Button
          size="$2"
          flexShrink={0}
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={() => removeMiscRow(row.id)}
          aria-label={`Remove other ingredient row ${idx + 1}`}
        >
          Remove
        </Button>
      </XStack>
    </RecipeEditIngredientCard>
  );
}
