import type { PrismaClient, Prisma } from "@prisma/client";
import { WorkspacesService } from "./workspacesService.js";

const PRESET_KEYS = [
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

function isLegacyDefaultStepsSeed(steps: BrewdayDefaultStep[]) {
  if (!Array.isArray(steps) || steps.length === 0) return true;
  // Back-compat: earlier seed contained just these steps.
  if (steps.some((s) => s?.name === "Start boil timer")) return true;
  if (steps.some((s) => s?.name === "Make sure all ingredients are on hand")) return true;
  return false;
}

function parseSectionsJson(val: unknown): BrewdaySectionConfig {
  if (!val || typeof val !== "object" || !("presetExcludes" in val)) {
    const presetExcludes: Record<string, boolean> = {};
    for (const k of PRESET_KEYS) {
      presetExcludes[k] = false;
    }
    return { presetExcludes, customSections: [], customBrewingMethods: [] };
  }
  const obj = val as Record<string, unknown>;
  const presetExcludes: Record<string, boolean> = {};
  for (const k of PRESET_KEYS) {
    presetExcludes[k] = obj['presetExcludes'] && typeof obj['presetExcludes'] === "object"
      ? (obj['presetExcludes'] as Record<string, unknown>)[k] === true
      : false;
  }
  const customRaw = Array.isArray(obj['customSections']) ? obj['customSections'] : [];
  const customSections = customRaw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map((item) => ({
      id: typeof item['id'] === "string" ? item['id'] : crypto.randomUUID(),
      name: typeof item['name'] === "string" ? item['name'] : "",
      exclude: item['exclude'] === true,
    }));
  const customBrewingMethods = Array.isArray(obj['customBrewingMethods'])
    ? (obj['customBrewingMethods'] as string[]).filter((x) => typeof x === "string")
    : [];
  return { presetExcludes, customSections, customBrewingMethods };
}

function parseStepArray(
  val: unknown,
  seed: BrewdayDefaultStep[] | null
): BrewdayDefaultStep[] | BrewdayCustomStep[] {
  if (!Array.isArray(val) || val.length === 0) {
    return seed ?? [];
  }
  return val
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map((item) => {
      const sectionId =
        typeof item['sectionId'] === "string" && item['sectionId']
          ? item['sectionId']
          : PRESET_KEYS[0];
      return {
        id: typeof item['id'] === "string" ? item['id'] : crypto.randomUUID(),
        name: typeof item['name'] === "string" ? item['name'] : "",
        sectionId,
        exclude: item['exclude'] === true,
        minutes:
          typeof item['minutes'] === "number" && Number.isInteger(item['minutes'])
            ? item['minutes']
            : item['minutes'] === null || item['minutes'] === undefined
              ? null
              : null,
      };
    });
}

export class BrewdaySettingsService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async getSettings(userId: string, workspaceId: string): Promise<BrewdaySettingsPayload | null> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const row = await this.prisma.brewdaySettings.findUnique({
      where: { workspaceId },
    });

    if (!row) return null;

    const sections = parseSectionsJson(row.sectionsJson);
    const defaultStepsRaw = parseStepArray(row.defaultStepsJson, DEFAULT_STEPS_SEED) as BrewdayDefaultStep[];
    const shouldUpgradeSeed = isLegacyDefaultStepsSeed(defaultStepsRaw);
    const defaultSteps = shouldUpgradeSeed
      ? DEFAULT_STEPS_SEED.map((s) => ({ ...s, id: crypto.randomUUID() }))
      : defaultStepsRaw;
    const customSteps = parseStepArray(row.customSectionsJson, null) as BrewdayCustomStep[];

    if (shouldUpgradeSeed) {
      await this.prisma.brewdaySettings.update({
        where: { workspaceId },
        data: { defaultStepsJson: defaultSteps },
      });
    }

    return {
      brewingType: row.brewingType,
      sections,
      defaultSteps,
      customSteps,
      notes: row.notes ?? null,
    };
  }

  async upsertSettings(
    userId: string,
    workspaceId: string,
    payload: BrewdaySettingsPayload
  ): Promise<BrewdaySettingsPayload> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const sectionsToStore =
      payload.sections && typeof payload.sections === "object" && "presetExcludes" in payload.sections
        ? payload.sections
        : parseSectionsJson(null);
    const sectionsJson = sectionsToStore as Prisma.InputJsonValue;
    const customSectionsJson = (Array.isArray(payload.customSteps) ? payload.customSteps : []) as Prisma.InputJsonValue;
    const defaultStepsJson = (Array.isArray(payload.defaultSteps) ? payload.defaultSteps : []) as Prisma.InputJsonValue;

    const notes =
      typeof payload.notes === "string" ? payload.notes : payload.notes === null ? null : undefined;

    const row = await this.prisma.brewdaySettings.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        brewingType: payload.brewingType,
        sectionsJson,
        customSectionsJson,
        defaultStepsJson,
        notes: notes ?? null,
      },
      update: {
        brewingType: payload.brewingType,
        sectionsJson,
        customSectionsJson,
        defaultStepsJson,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    const sections = parseSectionsJson(row.sectionsJson);
    const defaultSteps = parseStepArray(row.defaultStepsJson, DEFAULT_STEPS_SEED) as BrewdayDefaultStep[];
    const customSteps = parseStepArray(row.customSectionsJson, null) as BrewdayCustomStep[];

    return {
      brewingType: row.brewingType,
      sections,
      defaultSteps: defaultSteps.length === 0 ? DEFAULT_STEPS_SEED.map((s) => ({ ...s, id: crypto.randomUUID() })) : defaultSteps,
      customSteps,
      notes: row.notes ?? null,
    };
  }
}
