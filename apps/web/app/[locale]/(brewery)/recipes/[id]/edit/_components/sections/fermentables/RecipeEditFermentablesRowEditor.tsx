import {RecipeEditIngredientCard} from "../../../../../../../../_components/recipe-edit";
import type {GristRow} from "../../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";
import {RecipeEditFermentablesRowAmount} from "./RecipeEditFermentablesRowAmount";
import {RecipeEditFermentablesRowIdentity} from "./RecipeEditFermentablesRowIdentity";
import {RecipeEditFermentablesRowMash} from "./RecipeEditFermentablesRowMash";

export function RecipeEditFermentablesRowEditor({
  model,
  row,
  idx,
}: {
  model: RecipeEditPageModel;
  row: GristRow;
  idx: number;
}) {
  return (
    <RecipeEditIngredientCard>
      <RecipeEditFermentablesRowIdentity model={model} row={row} idx={idx} />
      <RecipeEditFermentablesRowAmount model={model} row={row} />
      <RecipeEditFermentablesRowMash model={model} row={row} />
    </RecipeEditIngredientCard>
  );
}
