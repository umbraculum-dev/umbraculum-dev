"use client";

import { SizableText, YStack } from "tamagui";

import type { InventorySectionProps } from "../inventorySectionTypes";
import { renderInventoryItemRow } from "../renderInventoryItemRow";

export function InventoryFermentablesItemListBlock(props: InventorySectionProps) {
  const { model: m } = props;
  const { t, itemsByCategory } = m;

  if (itemsByCategory("fermentable").length === 0) {
    return (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("noItems")}</SizableText>
    );
  }

  return (
    <YStack gap="$2">{itemsByCategory("fermentable").map((it) => renderInventoryItemRow(m, it))}</YStack>
  );
}
