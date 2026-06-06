"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import type { InventorySectionProps } from "../inventorySectionTypes";

export function InventoryFermentablesCustomAddBlock(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t,
    tUnits,
    customName,
    setCustomName,
    customQty,
    setCustomQty,
    addCustom,
    customFermentableProducer,
    setCustomFermentableProducer,
    customFermentableLovibond,
    setCustomFermentableLovibond,
    customFermentableYieldPercent,
    setCustomFermentableYieldPercent,
    customFermentablePpg,
    setCustomFermentablePpg,
  } = m;

  return (
    <View
      borderWidth={1}
      borderColor="var(--border)"
      bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))"
      rounded="$2"
      p="$3"
    >
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$2">
        {t("addCustomGuidance")}
      </SizableText>
      <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
        <YStack minWidth={120} gap="$1">
          <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
          <Input
            value={customName['fermentable'] ?? ""}
            onChangeText={(v) => setCustomName((p) => ({ ...p, fermentable: v }))}
            placeholder={t("nameLabel")}
            size="$3"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
        <YStack minWidth={140} gap="$1">
          <RecipeEditFieldLabel>{t("producerLabel")}</RecipeEditFieldLabel>
          <Input
            value={customFermentableProducer}
            onChangeText={setCustomFermentableProducer}
            placeholder={t("producerLabel")}
            size="$3"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
        <YStack minWidth={80} gap="$1">
          <RecipeEditFieldLabel>{t("lovibondLabel", { unit: tUnits("lovibond") })}</RecipeEditFieldLabel>
          <Input
            value={customFermentableLovibond}
            onChangeText={setCustomFermentableLovibond}
            keyboardType="decimal-pad"
            size="$3"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
        <YStack minWidth={90} gap="$1">
          <RecipeEditFieldLabel>{t("yieldPercentLabel")}</RecipeEditFieldLabel>
          <Input
            value={customFermentableYieldPercent}
            onChangeText={setCustomFermentableYieldPercent}
            keyboardType="decimal-pad"
            size="$3"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
        <YStack minWidth={90} gap="$1">
          <RecipeEditFieldLabel>{t("ppgLabel")}</RecipeEditFieldLabel>
          <Input
            value={customFermentablePpg}
            onChangeText={setCustomFermentablePpg}
            keyboardType="decimal-pad"
            size="$3"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
        <YStack minWidth={80} gap="$1">
          <RecipeEditFieldLabel>{t("quantityLabel", { unit: tUnits("kg") })}</RecipeEditFieldLabel>
          <Input
            value={customQty['fermentable'] ?? ""}
            onChangeText={(v) => setCustomQty((p) => ({ ...p, fermentable: v }))}
            keyboardType="decimal-pad"
            size="$3"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
        <Button
          size="$3"
          onPress={() => void addCustom("fermentable")}
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
        >
          {t("addCustom")}
        </Button>
      </XStack>
    </View>
  );
}
