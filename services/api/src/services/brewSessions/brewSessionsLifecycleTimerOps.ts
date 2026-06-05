import type { Prisma, PrismaClient } from "@prisma/client";

import { BadRequestError, NotFoundError } from "../../errors.js";
import type { WorkspacesService } from "../workspacesService.js";

export async function addStepTimerDeltaSeconds(args: {
  tx: Prisma.TransactionClient;
  stepId: string;
  now: Date;
}) {
  const step = await args.tx.brewSessionStep.findUnique({ where: { id: args.stepId } });
  if (!step) throw new NotFoundError("step_not_found", "Step not found");
  if (!step.timerLastStartedAt) return step;
  const deltaSeconds = Math.max(0, Math.floor((args.now.getTime() - step.timerLastStartedAt.getTime()) / 1000));
  return args.tx.brewSessionStep.update({
    where: { id: args.stepId },
    data: {
      timerAccumulatedSeconds: step.timerAccumulatedSeconds + deltaSeconds,
    },
  });
}

export async function startStepTimer(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  stepId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const step = await prisma.brewSessionStep.findFirst({
    where: { id: stepId, brewSessionId },
  });
  if (!step) throw new NotFoundError("step_not_found", "Step not found");
  if (step.timerState === "stopped") throw new BadRequestError("timer_stopped", "Timer is already stopped");

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.brewSessionStep.update({
      where: { id: stepId },
      data: {
        timerState: "running",
        timerStartedAt: step.timerStartedAt ?? now,
        timerLastStartedAt: now,
        timerPausedAt: null,
      },
    });
    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        stepId,
        kind: "step_timer_started",
        message: `Step timer started at ${now.toISOString()}`,
      },
    });
    return u;
  });
  return updated;
}

export async function pauseStepTimer(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  stepId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const step = await prisma.brewSessionStep.findFirst({
    where: { id: stepId, brewSessionId },
  });
  if (!step) throw new NotFoundError("step_not_found", "Step not found");
  if (step.timerState !== "running") {
    throw new BadRequestError("timer_not_running", "Timer is not running");
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    await addStepTimerDeltaSeconds({ tx, stepId, now });
    const u = await tx.brewSessionStep.update({
      where: { id: stepId },
      data: {
        timerState: "paused",
        timerPausedAt: now,
        timerLastStartedAt: null,
      },
    });
    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        stepId,
        kind: "step_timer_paused",
        message: `Step timer paused at ${now.toISOString()}`,
      },
    });
    return u;
  });
  return updated;
}

export async function stopStepTimer(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  stepId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const step = await prisma.brewSessionStep.findFirst({
    where: { id: stepId, brewSessionId },
  });
  if (!step) throw new NotFoundError("step_not_found", "Step not found");
  if (step.timerState === "stopped") {
    throw new BadRequestError("timer_already_stopped", "Timer is already stopped");
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    if (step.timerState === "running") {
      await addStepTimerDeltaSeconds({ tx, stepId, now });
    }
    const u = await tx.brewSessionStep.update({
      where: { id: stepId },
      data: {
        timerState: "stopped",
        timerStoppedAt: now,
        timerLastStartedAt: null,
        timerPausedAt: null,
      },
    });
    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        stepId,
        kind: "step_timer_stopped",
        message: `Step timer stopped at ${now.toISOString()}`,
      },
    });
    return u;
  });
  return updated;
}
