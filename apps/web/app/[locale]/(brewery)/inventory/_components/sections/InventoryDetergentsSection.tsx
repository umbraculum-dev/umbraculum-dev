"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditSection } from "../../../../../_components/recipe-edit";
import { StripedRow } from "../../../../../_components/StripedRow";
import { PUBLIC_DB_PAGE_SIZE } from "../../_lib/inventoryTypes";
import type { InventorySectionProps } from "./inventorySectionTypes";
import { renderInventoryItemRow } from "./renderInventoryItemRow";

export function InventoryDetergentsSection(props: InventorySectionProps) {
  const { model: m } = props;
  const {
    t, tUnits, canCall, openSections, setSectionOpen,
    customName, setCustomName, customQty, setCustomQty,
    itemsByCategory, addCustom,
  } = m;

  return (
    <RecipeEditSection
      id="detergentsSanitizers"
      headingId="inv-detergents"
      label={t("sections.detergentsSanitizers")}
      open={openSections['detergentsSanitizers']}
      onOpenChange={(o) => setSectionOpen("detergentsSanitizers", o)}
    >
<YStack gap="$2">
              <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
                <YStack minWidth={120} gap="$1">
                  <RecipeEditFieldLabel>{t("nameLabel")}</RecipeEditFieldLabel>
                  <Input
                    value={customName['detergent_sanitizer'] ?? ""}
                    onChangeText={(v) => setCustomName((p) => ({ ...p, detergent_sanitizer: v }))}
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
                  <RecipeEditFieldLabel>{t("quantityLabel", { unit: tUnits("mL") })}</RecipeEditFieldLabel>
                  <Input
                    value={customQty['detergent_sanitizer'] ?? ""}
                    onChangeText={(v) => setCustomQty((p) => ({ ...p, detergent_sanitizer: v }))}
                    keyboardType="decimal-pad"
                    size="$3"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </YStack>
                <Button size="$3" onPress={() => void addCustom("detergent_sanitizer")} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)">
                  {t("addCustom")}
                </Button>
              </XStack>
              {itemsByCategory("detergent_sanitizer").length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
              ) : (
                <YStack gap="$2">{itemsByCategory("detergent_sanitizer").map((it) => renderInventoryItemRow(m, it))}</YStack>
              )}
            </YStack>
              </RecipeEditSection>
  );
}
