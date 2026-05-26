/**
 * Recipe water settings API response shape.
 * GET /api/recipes/:id/water-settings returns { ok: true, settings: RecipeWaterSettings | null }.
 * PUT /api/recipes/:id/water-settings returns { ok: true, settings: RecipeWaterSettings }.
 *
 * Includes sparge configuration fields for native and web consumers.
 */
export interface RecipeWaterSettingsResponse {
  ok: true;
  settings: RecipeWaterSettings | null;
}

export interface RecipeWaterSettings {
  id: string;
  spargeStepTimeMin?: number | null;
  spargeStepRampMin?: number | null;
  spargeMethodType?: string | null;
  spargeStepTemperatureC?: number | null;
  [key: string]: unknown;
}
