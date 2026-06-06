export const PRESET_KEYS = [
  "preparation",
  "pre_mash",
  "mash",
  "lauter",
  "sparge",
  "boil",
  "post_boil",
  "fermentor",
  "cleanup",
  "quality",
  "miscellaneous",
] as const;

export type PresetSectionKey = (typeof PRESET_KEYS)[number];

/** Section config: preset excludes + custom sections + custom brewing methods. */
export type BrewdaySectionConfig = {
  presetExcludes: Record<string, boolean>;
  customSections: BrewdayCustomSectionConfig[];
  customBrewingMethods?: string[];
};

export type BrewdayCustomSectionConfig = {
  id: string;
  name: string;
  exclude: boolean;
};

/** Default step (fixed list, no add). */
export type BrewdayDefaultStep = {
  id: string;
  name: string;
  sectionId: string;
  exclude: boolean;
  minutes?: number | null;
};

/** Custom step (user-added). */
export type BrewdayCustomStep = {
  id: string;
  name: string;
  sectionId: string;
  exclude: boolean;
  minutes?: number | null;
};

export type BrewdaySettingsPayload = {
  brewingType: string;
  sections: BrewdaySectionConfig;
  defaultSteps: BrewdayDefaultStep[];
  customSteps: BrewdayCustomStep[];
  notes?: string | null;
};
