import type { PrismaClient } from "@prisma/client";

import type { WorkspacesService } from "../workspacesService.js";

import {
  DEFAULT_STEPS_SEED,
  isLegacyDefaultStepsSeed,
  PRESET_KEYS,
  type BrewdayCustomStep,
  type BrewdayDefaultStep,
  type BrewdaySectionConfig,
  type BrewdaySettingsPayload,
} from "./brewdaySettingsPresetOps.js";

export function parseSectionsJson(val: unknown): BrewdaySectionConfig {
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

export function parseStepArray(
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

export async function getSettings(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
): Promise<BrewdaySettingsPayload | null> {
  await workspaces.assertMembership(userId, workspaceId);

  const row = await prisma.brewdaySettings.findUnique({
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
    await prisma.brewdaySettings.update({
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
