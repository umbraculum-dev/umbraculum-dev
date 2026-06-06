import type { PlatformAdRow } from "@umbraculum/contracts";

export type Placement =
  | "global_top"
  | "global_bottom"
  | "recipe_edit_after_fermentables"
  | "recipe_edit_after_hops"
  | "recipe_edit_after_yeast";

export type PlatformAd = PlatformAdRow;

export const placements: Array<{ value: Placement; labelKey: string }> = [
  { value: "global_top", labelKey: "placements.globalTop" },
  { value: "global_bottom", labelKey: "placements.globalBottom" },
  { value: "recipe_edit_after_fermentables", labelKey: "placements.recipeEditAfterFermentables" },
  { value: "recipe_edit_after_hops", labelKey: "placements.recipeEditAfterHops" },
  { value: "recipe_edit_after_yeast", labelKey: "placements.recipeEditAfterYeast" },
];
