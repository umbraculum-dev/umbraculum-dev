import type { RecipeEditPageModel } from "../../../_hooks/useRecipeEditPage";
import { buildRecipeAnalysisDerivationContext } from "./recipeAnalysisDerivationBlocks";
import { buildRecipeAnalysisDisplayContext } from "./recipeAnalysisDisplayBlocks";

export type RecipeAnalysisContext = ReturnType<typeof buildRecipeAnalysisContext>;

export function buildRecipeAnalysisContext(model: RecipeEditPageModel) {
  const display = buildRecipeAnalysisDisplayContext(model);
  const derivation = buildRecipeAnalysisDerivationContext(display);
  return { ...display, ...derivation };
}
