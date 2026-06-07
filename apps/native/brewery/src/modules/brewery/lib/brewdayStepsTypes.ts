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

type _PresetKey = (typeof PRESET_KEYS)[number];

export type BrewdaySectionConfig = {
  presetExcludes: Record<string, boolean>;
  customSections: { id: string; name: string; exclude: boolean }[];
  customBrewingMethods?: string[];
};

export type BrewdayStep = {
  id: string;
  name: string;
  sectionId: string;
  exclude: boolean;
  minutes?: number | null;
};

export const BREWING_TYPE_OPTIONS = [
  { value: "all_grain", labelKey: "brewingTypeAllGrain" },
  { value: "extract_partial_biab", labelKey: "brewingTypeExtractPartialBiab" },
] as const;

export function newId() {
  try {
    const g = globalThis as { crypto?: { randomUUID?: () => string } };
    return g.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

export const DEFAULT_STEPS_SEED: BrewdayStep[] = [
  { id: newId(), name: "Check ingredients are available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure tool and equipment are on hand", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure kettle and mash valves are closed", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure the requested water quantity is available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare brewing salts additions", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare acids addition", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare hops additions", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure yeast is available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating mash water", sectionId: "pre_mash", exclude: false, minutes: null },
  { id: newId(), name: "Add strike water volume to mash", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating mash", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Vorlauf", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Collect mash pH", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating sparge water", sectionId: "sparge", exclude: false, minutes: null },
  { id: newId(), name: "Add first wort hops to boil", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Bring to a strong boil", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Cool wort to fermentation temperature", sectionId: "post_boil", exclude: false, minutes: null },
  { id: newId(), name: "Transfer cooled wort to fermenter", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Pitch yeast", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Clean mash and boil kettle", sectionId: "cleanup", exclude: false, minutes: null },
];

export function parseMinutes(val: string): number | null {
  const n = parseInt(val, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}
