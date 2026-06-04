import { asRecord } from "../../../../_lib/typeGuards";
import type { Recipe } from "./recipeEditTypes";

/**
 * Compute the brewhouse efficiency to display in math bodies. Tries, in order:
 *  1. `recipeExtJson.equipment.mash.mashEfficiencyPercent`
 *  2. `recipeExtJson.brewhouseEfficiencyPercent`
 *  3. `beerJsonRecipeJson.beerjson.recipes[0].efficiency.brewhouse` (when unit is %)
 */
export function getRecipeEfficiencyPercent(recipe: Recipe | null): number | null {
  if (!recipe) return null;
  const ext = asRecord(recipe.recipeExtJson);
  const equipment = ext ? asRecord(ext['equipment']) : null;
  const mash = equipment ? asRecord(equipment['mash']) : null;
  const mashEff =
    mash && typeof mash['mashEfficiencyPercent'] === "number" && Number.isFinite(mash['mashEfficiencyPercent'])
      ? (mash['mashEfficiencyPercent'])
      : null;
  if (mashEff != null) return mashEff;

  const brewEff =
    ext && typeof ext['brewhouseEfficiencyPercent'] === "number" && Number.isFinite(ext['brewhouseEfficiencyPercent'])
      ? (ext['brewhouseEfficiencyPercent'])
      : null;
  if (brewEff != null) return brewEff;

  const bj = asRecord(recipe.beerJsonRecipeJson);
  const bjRoot = bj ? asRecord(bj['beerjson']) : null;
  const bjRecipes = bjRoot && Array.isArray(bjRoot['recipes']) ? bjRoot['recipes'] : null;
  const r0 = bjRecipes && bjRecipes.length > 0 ? asRecord(bjRecipes[0]) : null;
  const efficiency = r0 ? asRecord(r0['efficiency']) : null;
  const brewhouse = efficiency ? asRecord(efficiency['brewhouse']) : null;
  if (brewhouse && brewhouse['unit'] === "%" && typeof brewhouse['value'] === "number" && Number.isFinite(brewhouse['value'])) {
    return brewhouse['value'];
  }
  return null;
}

/**
 * Read the BeerJSON `batch_size` for the first recipe (used as a volume fallback
 * when the gravity analysis emits the `used_batch_size_volume` warning).
 */
export function getBeerJsonBatchSize(recipe: Recipe | null): { unit: string; value: number | null } {
  if (!recipe) return { unit: "", value: null };
  const bj = asRecord(recipe.beerJsonRecipeJson);
  const bjRoot = bj ? asRecord(bj['beerjson']) : null;
  const bjRecipes = bjRoot && Array.isArray(bjRoot['recipes']) ? bjRoot['recipes'] : null;
  const r0 = bjRecipes && bjRecipes.length > 0 ? asRecord(bjRecipes[0]) : null;
  const batch = r0 ? asRecord(r0['batch_size']) : null;
  const unit = batch && typeof batch['unit'] === "string" ? batch['unit'] : "";
  const value =
    batch && typeof batch['value'] === "number" && Number.isFinite(batch['value']) ? (batch['value']) : null;
  return { unit, value };
}

export function newRowId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}
