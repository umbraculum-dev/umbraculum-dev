"use client";

import { Accordion, YStack } from "tamagui";

import type { UseRecipeImportFormModel } from "./_hooks/useRecipeImportForm";
import { RecipeImportBulkSection } from "./sections/RecipeImportBulkSection";
import { RecipeImportExportSection } from "./sections/RecipeImportExportSection";
import { RecipeImportSingleSection } from "./sections/RecipeImportSingleSection";

export function RecipeImportFormContent({
  model,
  showImportExportPanel,
}: {
  model: UseRecipeImportFormModel;
  showImportExportPanel: boolean;
}) {
  const { openSections, setOpenSections } = model;

  return (
    <>
      <YStack gap="$0">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <RecipeImportSingleSection model={model} />
          <RecipeImportBulkSection model={model} />
          {showImportExportPanel ? <RecipeImportExportSection model={model} /> : null}
        </Accordion>
      </YStack>
    </>
  );
}
