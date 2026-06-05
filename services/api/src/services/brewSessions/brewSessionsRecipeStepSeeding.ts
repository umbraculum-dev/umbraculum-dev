import type { BuildRecipeDrivenStepsArgs } from "./brewSessionStepSeedingTypes.js";
import { buildStepsFromParsedRecipe, buildStepSeedFromSettings } from "./brewSessionStepSeedingBuilders.js";
import { parseRecipeStepContext } from "./brewSessionStepSeedingParsers.js";

export type { RecipeDrivenStepSeed } from "./brewSessionStepSeedingTypes.js";
export { buildStepSeedFromSettings } from "./brewSessionStepSeedingBuilders.js";

export function buildRecipeDrivenSteps(args: BuildRecipeDrivenStepsArgs) {
  const ctx = parseRecipeStepContext({
    beerJsonRecipeJson: args.beerJsonRecipeJson,
    recipeExtJson: args.recipeExtJson,
    waterSettings: args.waterSettings,
  });
  return buildStepsFromParsedRecipe(ctx);
}
