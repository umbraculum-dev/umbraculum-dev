import type { MiscType, MiscUse } from "./recipeEditTypes";

export const miscTypeOptions: { value: MiscType; label: string }[] = [
  { value: "spice", label: "Spice" },
  { value: "fining", label: "Fining" },
  { value: "water_agent", label: "Water agent" },
  { value: "herb", label: "Herb" },
  { value: "flavor", label: "Flavor" },
  { value: "other", label: "Other" },
];

export const miscUseOptions: { value: MiscUse; label: string }[] = [
  { value: "mash", label: "Mash" },
  { value: "boil", label: "Boil" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "bottling", label: "Bottling" },
];

export const COLLAPSIBLE_SECTION_IDS = ["basics", "analysis", "brewingHistory", "brew", "equipment", "mashing", "fermentables", "hops", "yeast", "other", "boil", "notes", "water"] as const;

export const DESKTOP_RAIL_REQUIRED_GUTTER_PX = 320;
