import type { BrewSessionStepStatus, PrismaClient } from "@prisma/client";

import { NotFoundError } from "../../../../errors.js";
import type { WorkspacesService } from "../../../../services/workspacesService.js";
import type { BrewSessionStepInput } from "./brewSessionsLifecycleTypes.js";

export async function updateStepCustomTimerEnabled(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  stepId: string,
  customTimerEnabled: boolean,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const session = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
    select: { id: true },
  });
  if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");

  const step = await prisma.brewSessionStep.findFirst({
    where: { id: stepId, brewSessionId },
    select: { id: true },
  });
  if (!step) throw new NotFoundError("step_not_found", "Step not found");

  return prisma.brewSessionStep.update({
    where: { id: stepId },
    data: { customTimerEnabled },
  });
}

export async function saveSteps(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  steps: BrewSessionStepInput[],
) {
  await workspaces.assertMembership(userId, workspaceId);
  const existing = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
    include: { steps: { select: { id: true } } },
  });
  if (!existing) throw new NotFoundError("brew_session_not_found", "Brew session not found");

  const normalizedBase = steps
    .filter((s) => s && typeof s === "object")
    .map((s, idx) => {
      const id = typeof s.id === "string" && s.id.trim() ? s.id.trim() : crypto.randomUUID();
      const sectionId = typeof s.sectionId === "string" && s.sectionId.trim() ? s.sectionId.trim() : "preparation";
      const sectionName =
        s.sectionName === null ? null : typeof s.sectionName === "string" ? s.sectionName.trim() || null : null;
      const name = typeof s.name === "string" ? s.name.trim() : "";
      const isDisabled = s.isDisabled === true;
      const minutesPlanned =
        typeof s.minutesPlanned === "number" && Number.isInteger(s.minutesPlanned) && s.minutesPlanned >= 0
          ? s.minutesPlanned
          : s.minutesPlanned === null
            ? null
            : null;
      const relativeToStepId =
        typeof s.relativeToStepId === "string" && s.relativeToStepId.trim() ? s.relativeToStepId.trim() : null;
      const offsetMinutesFromEnd =
        typeof s.offsetMinutesFromEnd === "number" && Number.isInteger(s.offsetMinutesFromEnd)
          ? s.offsetMinutesFromEnd
          : s.offsetMinutesFromEnd === null
            ? null
            : null;
      const customTimerEnabled = s.customTimerEnabled === true;
      return {
        id,
        sectionId,
        sectionName,
        name,
        isDisabled,
        sortOrder: idx,
        minutesPlanned,
        relativeToStepId,
        offsetMinutesFromEnd,
        customTimerEnabled,
      };
    })
    .filter((s) => s.name.length > 0);

  const keepIds = new Set(normalizedBase.map((s) => s.id));
  const normalized = normalizedBase.map((s) => {
    if (!s.relativeToStepId) return s;
    if (s.relativeToStepId === s.id) {
      return { ...s, relativeToStepId: null, offsetMinutesFromEnd: null };
    }
    if (!keepIds.has(s.relativeToStepId)) {
      return { ...s, relativeToStepId: null, offsetMinutesFromEnd: null };
    }
    return s;
  });
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await tx.brewSessionStep.deleteMany({
      where: { brewSessionId, id: { notIn: [...keepIds] } },
    });

    for (const s of normalized) {
      const exists = existing.steps.some((e) => e.id === s.id);
      if (exists) {
        await tx.brewSessionStep.update({
          where: { id: s.id },
          data: {
            sectionId: s.sectionId,
            sectionName: s.sectionName,
            name: s.name,
            isDisabled: s.isDisabled,
            sortOrder: s.sortOrder,
            minutesPlanned: s.minutesPlanned,
            relativeToStepId: s.relativeToStepId,
            offsetMinutesFromEnd: s.offsetMinutesFromEnd,
            customTimerEnabled: s.customTimerEnabled,
          },
        });
      } else {
        await tx.brewSessionStep.create({
          data: {
            id: s.id,
            brewSessionId,
            sectionId: s.sectionId,
            sectionName: s.sectionName,
            name: s.name,
            isDisabled: s.isDisabled,
            sortOrder: s.sortOrder,
            minutesPlanned: s.minutesPlanned,
            relativeToStepId: s.relativeToStepId,
            offsetMinutesFromEnd: s.offsetMinutesFromEnd,
            customTimerEnabled: s.customTimerEnabled,
            status: "pending",
            note: null,
            timerState: "idle",
            timerAccumulatedSeconds: 0,
          },
        });
      }
    }

    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        kind: "steps_saved",
        message: `Steps saved at ${now.toISOString()}`,
        payloadJson: { count: normalized.length },
      },
    });

    const stepsOut = await tx.brewSessionStep.findMany({
      where: { brewSessionId },
      orderBy: { sortOrder: "asc" },
    });

    return { steps: stepsOut };
  });

  return result;
}

export async function saveStepLog(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  stepId: string,
  args: { status: BrewSessionStepStatus; note: string | null; name: string | null; isDisabled: boolean | null },
) {
  await workspaces.assertMembership(userId, workspaceId);
  const step = await prisma.brewSessionStep.findFirst({
    where: { id: stepId, brewSessionId },
  });
  if (!step) throw new NotFoundError("step_not_found", "Step not found");

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.brewSessionStep.update({
      where: { id: stepId },
      data: {
        status: args.status,
        note: args.note,
        name: args.name != null && args.name.trim() ? args.name.trim() : step.name,
        isDisabled: args.isDisabled ?? step.isDisabled,
      },
    });
    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        stepId,
        kind: "step_status_saved",
        message: `Step saved (${args.status}) at ${now.toISOString()}`,
        payloadJson: {
          status: args.status,
          nameChanged: args.name != null,
          isDisabledChanged: args.isDisabled != null,
        },
      },
    });
    return u;
  });

  return updated;
}
