"use client";

import { YStack } from "tamagui";

import { RecipeEditSection } from "../../../_components/recipe-edit";
import type { InventorySectionProps } from "./inventorySectionTypes";
import { InventoryFermentablesCustomAddBlock } from "./fermentables/InventoryFermentablesCustomAddBlock";
import { InventoryFermentablesItemListBlock } from "./fermentables/InventoryFermentablesItemListBlock";
import { InventoryFermentablesSearchBlock } from "./fermentables/InventoryFermentablesSearchBlock";

export function InventoryFermentablesSection(props: InventorySectionProps) {
  const { model: m } = props;
  const { t, openSections, setSectionOpen } = m;

  return (
    <RecipeEditSection
      id="fermentables"
      headingId="inv-fermentables"
      label={t("sections.fermentables")}
      open={openSections['fermentables']}
      onOpenChange={(o) => setSectionOpen("fermentables", o)}
    >
      <YStack gap="$2">
        <InventoryFermentablesSearchBlock {...props} />
        <InventoryFermentablesCustomAddBlock {...props} />
        <InventoryFermentablesItemListBlock {...props} />
      </YStack>
    </RecipeEditSection>
  );
}
