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

export type PresetKey = (typeof PRESET_KEYS)[number];

export interface BrewdaySectionConfig {
  presetExcludes: Record<string, boolean>;
  customSections: { id: string; name: string; exclude: boolean }[];
  customBrewingMethods?: string[];
}

export interface BrewdayStep {
  id: string;
  name: string;
  sectionId: string;
  exclude: boolean;
  minutes?: number | null;
}

export const BREWING_TYPE_OPTIONS = [
  { value: "all_grain", labelKey: "brewingTypeAllGrain" },
  { value: "extract_partial_biab", labelKey: "brewingTypeExtractPartialBiab" },
] as const;

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export const DEFAULT_STEPS_SEED: BrewdayStep[] = [
  { id: newId(), name: "Check ingredients are available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure tool and equipment are on hand; if using tank for suel ensuer available quantity.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure kettle, mash and quipment valves are closed.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure the requested water quantity is available.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare brewing salts additions.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare acids addition.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare hops additions.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure yeast is available, vital and viable.", sectionId: "preparation", exclude: false, minutes: null },

  { id: newId(), name: "Begin heating mash water", sectionId: "pre_mash", exclude: false, minutes: null },

  { id: newId(), name: "Add strike water volume to mash.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating mash.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Volauf.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Use bug filter for lautering.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Connect recirculating pump to mash.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Collect mash pH.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Check mash conversion (iodium can be used).", sectionId: "mash", exclude: false, minutes: null },

  { id: newId(), name: "Begin heating sparge water", sectionId: "sparge", exclude: false, minutes: null },
  { id: newId(), name: "Transfer sparge water to sparge container if using a 2 kettle system.", sectionId: "sparge", exclude: false, minutes: null },
  { id: newId(), name: "Conenct pump for transferring sparge water to mash.", sectionId: "sparge", exclude: false, minutes: null },

  { id: newId(), name: "Add first wort hops to boil.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Collect pre boil gravituy sample.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Fire kettle. Bring to a strong boil.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Completely open kettlelid.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Add yeast nutrients to boil.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Remove bittering hops.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Turn off boil kettle flame.", sectionId: "boil", exclude: false, minutes: null },

  { id: newId(), name: "Sanitize heat exchanger.", sectionId: "post_boil", exclude: false, minutes: null },
  { id: newId(), name: "Cool wort to fermentation temparature or to desired pitching temperature.", sectionId: "post_boil", exclude: false, minutes: null },
  { id: newId(), name: "Take final gravity reading.", sectionId: "post_boil", exclude: false, minutes: null },

  { id: newId(), name: "Make sure primary fermenter is sanitized, empty and valves are closed.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Transfer cooled wort to fermenter.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Pitch yeast and add zinc or other yeast nutrients.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Set spunding valve to desired pressure or fit airlock.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "If registration/logginf tools must be put into fermenteer sanitize them, turn on and put in the fermenter.", sectionId: "fermentor", exclude: false, minutes: null },

  { id: newId(), name: "Clean mill.", sectionId: "cleanup", exclude: false, minutes: null },
  { id: newId(), name: "Clean mash and boil kettle.", sectionId: "cleanup", exclude: false, minutes: null },
  { id: newId(), name: "Clean tools.", sectionId: "cleanup", exclude: false, minutes: null },

  { id: newId(), name: "Close LPG valve.", sectionId: "miscellaneous", exclude: false, minutes: null },
];

export function parseMinutes(val: string): number | null {
  const n = parseInt(val, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}
