"use client";

import { BrewAccordionSection } from "../../BrewAccordionSection";
import { ImportExportPanel } from "../../ImportExportPanel";
import type { UseRecipeImportFormModel } from "../_hooks/useRecipeImportForm";

export function RecipeImportExportSection({ model }: { model: UseRecipeImportFormModel }) {
  const { tDash, openSections } = model;

  return (
    <BrewAccordionSection
      value="importExport"
      headingId="import-export-panel-heading"
      title={tDash("importExport.title")}
      open={openSections.includes("importExport")}
      spaced
    >
      <ImportExportPanel headingId="import-export-panel-heading-inner" className="" variant="content" />
    </BrewAccordionSection>
  );
}
