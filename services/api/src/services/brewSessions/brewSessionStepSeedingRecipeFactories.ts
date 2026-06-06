import type {
  ParsedRecipeStepContext,
  RecipeDrivenStepSeed,
} from "./brewSessionStepSeedingTypes.js";
import { buildRecipeIngredientSteps } from "./brewSessionStepSeedingRecipeIngredientSteps.js";
import { buildRecipeMashScheduleSteps } from "./brewSessionStepSeedingRecipeMashScheduleSteps.js";
import { buildRecipeWaterSteps } from "./brewSessionStepSeedingRecipeWaterSteps.js";

export function buildStepsFromParsedRecipe(ctx: ParsedRecipeStepContext): RecipeDrivenStepSeed[] {
  const steps: RecipeDrivenStepSeed[] = [];

  buildRecipeIngredientSteps(steps, ctx);
  buildRecipeMashScheduleSteps(steps, ctx.mashScheduleSteps);
  buildRecipeWaterSteps(steps, ctx.waterSettings);

  return steps;
}
