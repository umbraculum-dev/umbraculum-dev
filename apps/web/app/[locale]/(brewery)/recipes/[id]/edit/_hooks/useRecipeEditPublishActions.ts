"use client";

import { useState } from "react";

import { createRecipeVersion, duplicateRecipe } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../../_lib/breweryWaterClient";

export function useRecipeEditPublishActions(params: {
  recipeId: string;
  canCall: boolean;
  routerPush: (path: string) => void;
}) {
  const { recipeId, canCall, routerPush } = params;

  const [creatingVersion, setCreatingVersion] = useState(false);
  const [createVersionError, setCreateVersionError] = useState<string | null>(null);
  const [duplicatingRecipe, setDuplicatingRecipe] = useState(false);
  const [duplicateRecipeError, setDuplicateRecipeError] = useState<string | null>(null);

  const onCreateAnotherVersion = async () => {
    if (!recipeId || !canCall) return;
    setCreateVersionError(null);
    setCreatingVersion(true);
    try {
      const data = await createRecipeVersion(webBreweryApiClient(), recipeId);
      const newId = data.recipe?.["id"];
      if (typeof newId !== "string" || !newId) {
        throw new Error("Version create response is missing recipe.id");
      }
      routerPush(`/recipes/${newId}/edit`);
    } catch (err) {
      setCreateVersionError(String(err));
    } finally {
      setCreatingVersion(false);
    }
  };

  const onDuplicateRecipe = async () => {
    if (!recipeId || !canCall) return;
    setDuplicateRecipeError(null);
    setDuplicatingRecipe(true);
    try {
      const data = await duplicateRecipe(webBreweryApiClient(), recipeId);
      const newId = data.recipe?.["id"];
      if (typeof newId !== "string" || !newId) {
        throw new Error("Duplicate response is missing recipe.id");
      }
      routerPush(`/recipes/${newId}/edit`);
    } catch (err) {
      setDuplicateRecipeError(String(err));
    } finally {
      setDuplicatingRecipe(false);
    }
  };

  return {
    creatingVersion,
    createVersionError,
    duplicatingRecipe,
    duplicateRecipeError,
    onCreateAnotherVersion,
    onDuplicateRecipe,
  };
}
