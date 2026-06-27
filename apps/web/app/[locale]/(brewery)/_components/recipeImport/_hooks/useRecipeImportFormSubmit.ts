"use client";

import type { RecipeImportFormProps } from "../_lib/recipeImportTypes";
import type { RecipeImportFormState } from "./useRecipeImportFormState";
import { createRecipeImportSubmitActions } from "./useRecipeImportFormSubmitActions";
import { createRecipeImportPickHandlers } from "./useRecipeImportFormSubmitPickOps";

type SubmitDeps = Pick<RecipeImportFormProps, "apiBasePath" | "workspaceId" | "accountId" | "canCall" | "onSingleImportSuccess">;

export function useRecipeImportFormSubmit(state: RecipeImportFormState, deps: SubmitDeps) {
  const pickHandlers = createRecipeImportPickHandlers(state);
  const submitActions = createRecipeImportSubmitActions(state, deps);

  return {
    ...pickHandlers,
    ...submitActions,
  };
}
