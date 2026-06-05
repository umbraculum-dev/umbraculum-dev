"use client";

import { Button, Input, SizableText, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditSection } from "../../../../../_components/recipe-edit";
import type { InventorySectionProps } from "./inventorySectionTypes";
import { renderInventoryItemRow } from "./renderInventoryItemRow";

export function InventorySpecialitiesSection(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t, tUnits, openSections, setSectionOpen,
    customName, setCustomName, customQty, setCustomQty,
    itemsByCategory, addCustom,
  } = m;

  return (
    <RecipeEditSection
      id="specialities"
      headingId="inv-specialities"
      label={t("sections.specialities")}
      open={openSections['specialities']}
      onOpenChange={(o) => setSectionOpen("specialities", o)}
    >
<YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName['speciality'] ?? ""}
                    onChangeText={(v) => setCustomName((p) => ({ ...p, speciality: v }))}
                    placeholder={t("nameLabel")}
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
                    value={customQty['speciality'] ?? ""}
                    onChangeText={(v) => setCustomQty((p) => ({ ...p, speciality: v }))}
                    keyboardType="decimal-pad"
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <Button size="$3" onPress={() => void addCustom("speciality")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
              {itemsByCategory("speciality").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("speciality").map((it) => renderInventoryItemRow(m, it))}</YStack>
              )}
            </YStack>
              </RecipeEditSection>
  );
}
