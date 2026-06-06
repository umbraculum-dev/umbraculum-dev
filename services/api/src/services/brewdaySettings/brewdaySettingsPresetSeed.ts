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

export const DEFAULT_STEPS_SEED: BrewdayDefaultStep[] = [
  {
    id: crypto.randomUUID(),
    name: "Check ingredients are available",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Ensure tool and equipment are on hand; if using tank for suel ensuer available quantity.",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Make sure kettle, mash and quipment valves are closed.",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Ensure the requested water quantity is available.",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Prepare brewing salts additions.",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Prepare acids addition.",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Prepare hops additions.",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Make sure yeast is available, vital and viable.",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Begin heating mash water",
    sectionId: "pre_mash",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Add strike water volume to mash.",
    sectionId: "mash",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Begin heating mash.",
    sectionId: "mash",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Volauf.",
    sectionId: "mash",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Use bug filter for lautering.",
    sectionId: "mash",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Connect recirculating pump to mash.",
    sectionId: "mash",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Collect mash pH.",
    sectionId: "mash",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Check mash conversion (iodium can be used).",
    sectionId: "mash",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Begin heating sparge water",
    sectionId: "sparge",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Transfer sparge water to sparge container if using a 2 kettle system.",
    sectionId: "sparge",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Conenct pump for transferring sparge water to mash.",
    sectionId: "sparge",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Add first wort hops to boil.",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Collect pre boil gravituy sample.",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Fire kettle. Bring to a strong boil.",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Completely open kettlelid.",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Add yeast nutrients to boil.",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Remove bittering hops.",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Turn off boil kettle flame.",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Sanitize heat exchanger.",
    sectionId: "post_boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Cool wort to fermentation temparature or to desired pitching temperature.",
    sectionId: "post_boil",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Take final gravity reading.",
    sectionId: "post_boil",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Make sure primary fermenter is sanitized, empty and valves are closed.",
    sectionId: "fermentor",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Transfer cooled wort to fermenter.",
    sectionId: "fermentor",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Pitch yeast and add zinc or other yeast nutrients.",
    sectionId: "fermentor",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Set spunding valve to desired pressure or fit airlock.",
    sectionId: "fermentor",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "If registration/logginf tools must be put into fermenteer sanitize them, turn on and put in the fermenter.",
    sectionId: "fermentor",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Clean mill.",
    sectionId: "cleanup",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Clean mash and boil kettle.",
    sectionId: "cleanup",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Clean tools.",
    sectionId: "cleanup",
    exclude: false,
    minutes: null,
  },

  {
    id: crypto.randomUUID(),
    name: "Close LPG valve.",
    sectionId: "miscellaneous",
    exclude: false,
    minutes: null,
  },
];

