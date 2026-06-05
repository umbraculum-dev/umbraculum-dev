export type CreateRecipeInput = {
  name: string;
  styleKey: string;
  notes?: string | null | undefined;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
};

export type UpdateRecipeInput = {
  name?: string | null | undefined;
  styleKey?: string | null | undefined;
  notes?: string | null | undefined;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
};
