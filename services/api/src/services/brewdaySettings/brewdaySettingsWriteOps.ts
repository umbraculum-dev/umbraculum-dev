import type { Prisma, PrismaClient } from "@prisma/client";

import type { WorkspacesService } from "../workspacesService.js";
import {
  DEFAULT_STEPS_SEED,
  parseSectionsJson,
  parseStepArray,
  type BrewdayCustomStep,
  type BrewdayDefaultStep,
  type BrewdaySettingsPayload,
} from "./brewdaySettingsReadOps.js";

export async function upsertSettings(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  payload: BrewdaySettingsPayload,
): Promise<BrewdaySettingsPayload> {
  await workspaces.assertMembership(userId, workspaceId);

  const sectionsToStore =
    payload.sections && typeof payload.sections === "object" && "presetExcludes" in payload.sections
      ? payload.sections
      : parseSectionsJson(null);
  const sectionsJson = sectionsToStore as Prisma.InputJsonValue;
  const customSectionsJson = (Array.isArray(payload.customSteps) ? payload.customSteps : []) as Prisma.InputJsonValue;
  const defaultStepsJson = (Array.isArray(payload.defaultSteps) ? payload.defaultSteps : []) as Prisma.InputJsonValue;

  const notes =
    typeof payload.notes === "string" ? payload.notes : payload.notes === null ? null : undefined;

  const row = await prisma.brewdaySettings.upsert({
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
      ...(notes !== undefined ? { notes } : {}),
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
