import { RecipeEditScreenContent } from "../components/recipeEdit/RecipeEditScreenContent";
import { useRecipeEditScreen } from "../hooks/useRecipeEditScreen";

export function RecipeEditScreen() {
  const model = useRecipeEditScreen();
  return <RecipeEditScreenContent model={model} />;
}
