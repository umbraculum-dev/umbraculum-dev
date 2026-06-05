import type { BrewdaySettingsService } from "../brewdaySettingsService.js";
import type { RecipeWaterSettingsService } from "../recipeWaterSettingsService.js";

/**
 * Loose structural shapes for the BeerJSON document and related extension JSON
 * blobs that brew session step seeding walks.
 */
export type AmtUnit = { unit?: unknown; value?: unknown };
export type FermentableNode = {
  name?: unknown;
  amount?: AmtUnit;
  brewery_app_late_addition?: unknown;
};
export type HopNode = {
  name?: unknown;
  amount?: AmtUnit;
  brewery_app_use?: unknown;
  timing?: { use?: unknown; duration?: AmtUnit; time?: unknown };
};
export type CultureNode = { name?: unknown };
export type MiscNode = {
  name?: unknown;
  amount?: AmtUnit;
  timing?: { use?: unknown; duration?: AmtUnit; time?: unknown };
};
export type MashStepNode = {
  name?: unknown;
  type?: unknown;
  step_time?: unknown;
  duration?: unknown;
};
export type MashNode = {
  mash_steps?: unknown;
  mashSteps?: unknown;
};
export type RecipeNode = {
  ingredients?: {
    fermentable_additions?: unknown;
    hop_additions?: unknown;
    culture_additions?: unknown;
    miscellaneous_additions?: unknown;
  };
  mash?: unknown;
};
export type BeerJsonDoc = { beerjson?: { recipes?: unknown } };
export type RecipeExtLoose = { boilTimeMinutesOverride?: unknown };
export type WaterSettingsLoose = {
  mashWaterVolumeLiters?: unknown;
  mashSaltAdditionsJson?: unknown;
  mashLastAcidRequiredMl?: unknown;
  mashAcidType?: unknown;
  spargeVolumeLiters?: unknown;
  spargeMethodType?: unknown;
  spargeSaltAdditionsJson?: unknown;
  boilWaterVolumeLiters?: unknown;
};

export type RecipeDrivenStepSeed = {
  id?: string;
  sectionId: string;
  sectionName?: string | null;
  name: string;
  minutesPlanned?: number | null;
  relativeToStepId?: string | null;
  offsetMinutesFromEnd?: number | null;
  breweryAppStepKind?: "fermentable_early" | "fermentable_late" | null;
};

export type ParsedRecipeStepContext = {
  boilTimeMinutes: number;
  boilBaseStepId: string;
  fermentables: FermentableNode[];
  hops: HopNode[];
  cultures: CultureNode[];
  misc: MiscNode[];
  mashScheduleSteps: { name: string; minutes: number }[];
  hasBoilHops: boolean;
  hasBoilMiscWithTiming: boolean;
  waterSettings: WaterSettingsLoose | null;
};

export type BuildRecipeDrivenStepsArgs = {
  beerJsonRecipeJson: unknown;
  recipeExtJson: unknown;
  waterSettings: Awaited<ReturnType<RecipeWaterSettingsService["get"]>>;
};

export type BuildStepSeedFromSettingsArgs = {
  settings: Awaited<ReturnType<BrewdaySettingsService["getSettings"]>>;
};
