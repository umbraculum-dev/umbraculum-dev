type BeerJsonDocument = {
  beerjson?: {
    recipes?: Array<{
      ingredients?: {
        fermentable_additions?: any[];
        hop_additions?: any[];
        culture_additions?: any[];
        miscellaneous_additions?: any[];
      };
    }>;
  };
};

function cloneJson<T>(v: T): T {
  // BeerJSON documents are JSON-safe; a JSON roundtrip is a simple, reliable deep clone.
  return JSON.parse(JSON.stringify(v)) as T;
}

function stripInternalFieldsOnAdditions(arr: any[] | undefined) {
  if (!Array.isArray(arr)) return;
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    if ("id" in item) delete (item as any).id;
    if ("brewery_app_late_addition" in item) delete (item as any).brewery_app_late_addition;
  }
}

/**
 * Returns a strict BeerJSON document for export.
 *
 * Our editor stores stable row identity as `id` on BeerJSON addition objects (a pragmatic extension).
 * For maximum interoperability, strict exports strip those `id` fields.
 */
export function strictBeerJsonExport(doc: unknown): unknown {
  const out = cloneJson(doc as any) as BeerJsonDocument;
  const r0 = out?.beerjson?.recipes?.[0];
  const ing = r0?.ingredients;

  stripInternalFieldsOnAdditions(ing?.fermentable_additions);
  stripInternalFieldsOnAdditions(ing?.hop_additions);
  stripInternalFieldsOnAdditions(ing?.culture_additions);
  stripInternalFieldsOnAdditions(ing?.miscellaneous_additions);

  return out as unknown;
}

export type RecipeForExport = { beerJsonRecipeJson: unknown; recipeExtJson?: unknown };

/**
 * Export recipe in strict mode (strips addition row `id` fields for interoperability).
 */
export function exportRecipeStrict(recipe: RecipeForExport): unknown {
  return strictBeerJsonExport(recipe.beerJsonRecipeJson);
}

/**
 * Export recipe in full mode (keeps `id` fields, includes recipeExtJson).
 */
export function exportRecipeFull(recipe: RecipeForExport): { beerjson: unknown; recipeExtJson?: unknown } {
  return {
    beerjson: recipe.beerJsonRecipeJson,
    recipeExtJson: recipe.recipeExtJson,
  };
}

