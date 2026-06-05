"use client";

import { useRecipeImportForm } from "./recipeImport/_hooks/useRecipeImportForm";
import type { RecipeImportFormProps } from "./recipeImport/_lib/recipeImportTypes";
import { RecipeImportFormContent } from "./recipeImport/RecipeImportFormContent";

export type { RecipeImportFormProps };

export function RecipeImportForm({
  showImportExportPanel = true,
  ...props
}: RecipeImportFormProps) {
  const model = useRecipeImportForm({ showImportExportPanel, ...props });
  return <RecipeImportFormContent model={model} showImportExportPanel={showImportExportPanel} />;
}
