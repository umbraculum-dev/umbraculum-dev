import type { PrismaClient } from "@prisma/client";
import { AccountsService } from "./accountsService.js";

const PRESET_KEYS = [
  "preparation",
  "mash",
  "lauter",
  "sparge",
  "boil",
  "fermentor",
  "cleanup",
  "quality",
  "miscellaneous",
] as const;

export type PresetSectionKey = (typeof PRESET_KEYS)[number];

/** Section config: preset excludes + custom sections. */
export type BrewdaySectionConfig = {
  presetExcludes: Record<string, boolean>;
  customSections: BrewdayCustomSectionConfig[];
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
};

const DEFAULT_STEPS_SEED: BrewdayDefaultStep[] = [
  {
    id: crypto.randomUUID(),
    name: "Make sure all ingredients are on hand",
    sectionId: "preparation",
    exclude: false,
    minutes: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Start boil timer",
    sectionId: "boil",
    exclude: false,
    minutes: null,
  },
];

function parseSectionsJson(val: unknown): BrewdaySectionConfig {
  if (!val || typeof val !== "object" || !("presetExcludes" in val)) {
    const presetExcludes: Record<string, boolean> = {};
    for (const k of PRESET_KEYS) {
      presetExcludes[k] = false;
    }
    return { presetExcludes, customSections: [] };
  }
  const obj = val as Record<string, unknown>;
  const presetExcludes: Record<string, boolean> = {};
  for (const k of PRESET_KEYS) {
    presetExcludes[k] = obj.presetExcludes && typeof obj.presetExcludes === "object"
      ? (obj.presetExcludes as Record<string, unknown>)[k] === true
      : false;
  }
  const customRaw = Array.isArray(obj.customSections) ? obj.customSections : [];
  const customSections = customRaw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      name: typeof item.name === "string" ? item.name : "",
      exclude: item.exclude === true,
    }));
  return { presetExcludes, customSections };
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
        typeof item.sectionId === "string" && item.sectionId
          ? item.sectionId
          : PRESET_KEYS[0];
      return {
        id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
        name: typeof item.name === "string" ? item.name : "",
        sectionId,
        exclude: item.exclude === true,
        minutes:
          typeof item.minutes === "number" && Number.isInteger(item.minutes)
            ? item.minutes
            : item.minutes === null || item.minutes === undefined
              ? null
              : null,
      };
    });
}

export class BrewdaySettingsService {
  private readonly accounts: AccountsService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
  }

  async getSettings(userId: string, accountId: string): Promise<BrewdaySettingsPayload | null> {
    await this.accounts.assertMembership(userId, accountId);

    const row = await this.prisma.brewdaySettings.findUnique({
      where: { accountId },
    });

    if (!row) return null;

    const sections = parseSectionsJson(row.sectionsJson);
    const defaultStepsRaw = parseStepArray(row.defaultStepsJson, DEFAULT_STEPS_SEED);
    const defaultSteps =
      defaultStepsRaw.length === 0 ? DEFAULT_STEPS_SEED.map((s) => ({ ...s, id: crypto.randomUUID() })) : defaultStepsRaw as BrewdayDefaultStep[];
    const customSteps = parseStepArray(row.customSectionsJson, null) as BrewdayCustomStep[];

    return {
      brewingType: row.brewingType,
      sections,
      defaultSteps,
      customSteps,
    };
  }

  async upsertSettings(
    userId: string,
    accountId: string,
    payload: BrewdaySettingsPayload
  ): Promise<BrewdaySettingsPayload> {
    await this.accounts.assertMembership(userId, accountId);

    const sectionsToStore =
      payload.sections && typeof payload.sections === "object" && "presetExcludes" in payload.sections
        ? payload.sections
        : parseSectionsJson(null);
    const sectionsJson = sectionsToStore as unknown;
    const customSectionsJson = Array.isArray(payload.customSteps) ? payload.customSteps : [];
    const defaultStepsJson = Array.isArray(payload.defaultSteps) ? payload.defaultSteps : [];

    const row = await this.prisma.brewdaySettings.upsert({
      where: { accountId },
      create: {
        accountId,
        brewingType: payload.brewingType,
        sectionsJson,
        customSectionsJson,
        defaultStepsJson,
      },
      update: {
        brewingType: payload.brewingType,
        sectionsJson,
        customSectionsJson,
        defaultStepsJson,
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
    };
  }
}
