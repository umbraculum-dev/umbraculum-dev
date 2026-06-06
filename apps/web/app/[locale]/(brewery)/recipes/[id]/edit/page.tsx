"use client";

import { RecipeEditPageContent } from "./_components/RecipeEditPageContent";
import { useRecipeEditPage } from "./_hooks/useRecipeEditPage";

export default function RecipeEditPage() {
  const model = useRecipeEditPage();
  return <RecipeEditPageContent model={model} />;
}
