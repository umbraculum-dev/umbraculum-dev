import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";
import { mapBoilFieldsFromPutBody } from "./recipeWaterSettingsMapperBoil.js";
import { mapMashFieldsFromPutBody } from "./recipeWaterSettingsMapperMash.js";
import { mapSpargeFieldsFromPutBody } from "./recipeWaterSettingsMapperSparge.js";

export { mapBoilFieldsFromPutBody } from "./recipeWaterSettingsMapperBoil.js";
export { mapMashFieldsFromPutBody } from "./recipeWaterSettingsMapperMash.js";
export { mapSpargeFieldsFromPutBody } from "./recipeWaterSettingsMapperSparge.js";

export function toUpsertInputFromPutBody(body: Record<string, unknown>): UpsertRecipeWaterSettingsInput {
  return {
    ...mapMashFieldsFromPutBody(body),
    ...mapSpargeFieldsFromPutBody(body),
    ...mapBoilFieldsFromPutBody(body),
  };
}
