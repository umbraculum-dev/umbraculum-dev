"use client";

import { RecipesPageContent } from "./_components/RecipesPageContent";
import { useRecipesPage } from "./_hooks/useRecipesPage";

export default function RecipesPage() {
  const model = useRecipesPage();
  return <RecipesPageContent model={model} />;
}
