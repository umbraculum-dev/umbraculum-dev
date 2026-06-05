import { Screen } from "@umbraculum/ui";

import { RecipesListScreenContent } from "../components/recipesList/RecipesListScreenContent";
import { useNativeRecipesListScreen } from "../hooks/recipesList/useNativeRecipesListScreen";

export function RecipesListScreen() {
  const model = useNativeRecipesListScreen();
  return (
    <Screen>
      <RecipesListScreenContent model={model} />
    </Screen>
  );
}
