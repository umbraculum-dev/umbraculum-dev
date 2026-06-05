"use client";

import { Button, Input, SizableText, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditSection } from "../../../../../_components/recipe-edit";
import type { InventorySectionProps } from "./inventorySectionTypes";
import { renderInventoryItemRow } from "./renderInventoryItemRow";

export function InventoryKeggingSection(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t, openSections, setSectionOpen,
    customName, setCustomName, customQty, setCustomQty,
    itemsByCategory, addCustom,
  } = m;

  return (
    <RecipeEditSection
      id="kegging"
      headingId="inv-kegging"
      label={t("sections.kegging")}
      open={openSections['kegging']}
      onOpenChange={(o) => setSectionOpen("kegging", o)}
    >
<YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName['kegging'] ?? ""}
                    onChangeText={(v) => setCustomName((p) => ({ ...p, kegging: v }))}
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
                  <RecipeEditFieldLabel>{t("quantityLabel", { unit: "count" })}</RecipeEditFieldLabel>
                  <Input
                    value={customQty['kegging'] ?? ""}
                    onChangeText={(v) => setCustomQty((p) => ({ ...p, kegging: v }))}
                    keyboardType="decimal-pad"
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <Button size="$3" onPress={() => void addCustom("kegging")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
              {itemsByCategory("kegging").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("kegging").map((it) => renderInventoryItemRow(m, it))}</YStack>
              )}
            </YStack>
              </RecipeEditSection>
  );
}
