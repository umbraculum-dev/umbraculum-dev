import type { PrismaClient } from "@prisma/client";

import { BadRequestError, NotFoundError } from "../../../../errors.js";
import type { WorkspacesService } from "../../../../services/workspacesService.js";
import { addStepTimerDeltaSeconds } from "./brewSessionsLifecycleTimerOps.js";

export async function startSession(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const session = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
  });
  if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
  if (session.status === "stopped") {
    throw new BadRequestError("session_already_stopped", "Session is already stopped");
  }

  const now = new Date();
  const nextStartedAt = session.startedAt ?? now;
  const next = await prisma.$transaction(async (tx) => {
    let resumedCount = 0;
    if (session.status === "paused" && session.pausedAt) {
      const pausedBySession = await tx.brewSessionStep.findMany({
        where: {
          brewSessionId,
          timerState: "paused",
          timerPausedAt: session.pausedAt,
        },
        select: { id: true },
      });
      for (const st of pausedBySession) {
        await tx.brewSessionStep.update({
          where: { id: st.id },
          data: {
            timerState: "running",
            timerLastStartedAt: now,
            timerPausedAt: null,
          },
        });
      }
      resumedCount = pausedBySession.length;
    }

    const updated = await tx.brewSession.update({
      where: { id: brewSessionId },
      data: {
        status: "running",
        startedAt: nextStartedAt,
        pausedAt: null,
      },
    });
    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        kind: "session_started",
        message: `Brewing started at ${now.toISOString()}`,
        payloadJson: { resumedStepTimers: resumedCount },
      },
    });
    return updated;
  });
  return next;
}

export async function pauseSession(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const session = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
  });
  if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
  if (session.status !== "running") {
    throw new BadRequestError("session_not_running", "Session is not running");
  }

  const now = new Date();
  const next = await prisma.$transaction(async (tx) => {
    const runningSteps = await tx.brewSessionStep.findMany({
      where: { brewSessionId, timerState: "running" },
      select: { id: true },
    });
    for (const st of runningSteps) {
      await addStepTimerDeltaSeconds({ tx, stepId: st.id, now });
      await tx.brewSessionStep.update({
        where: { id: st.id },
        data: {
          timerState: "paused",
          timerPausedAt: now,
          timerLastStartedAt: null,
        },
      });
    }

    const updated = await tx.brewSession.update({
      where: { id: brewSessionId },
      data: {
        status: "paused",
        pausedAt: now,
      },
    });
    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        kind: "session_paused",
        message: `Brewing paused at ${now.toISOString()}`,
        payloadJson: { pausedStepTimers: runningSteps.length },
      },
    });
    return updated;
  });
  return next;
}

export async function stopSession(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  args?: { reason: "manual" | "auto" | null },
) {
  await workspaces.assertMembership(userId, workspaceId);
  const session = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
  });
  if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
  if (session.status === "stopped") {
    throw new BadRequestError("session_already_stopped", "Session is already stopped");
  }

  const now = new Date();
  const next = await prisma.$transaction(async (tx) => {
    const activeSteps = await tx.brewSessionStep.findMany({
      where: { brewSessionId, timerState: { in: ["running", "paused"] } },
      select: { id: true, timerState: true },
    });
    for (const st of activeSteps) {
      if (st.timerState === "running") {
        await addStepTimerDeltaSeconds({ tx, stepId: st.id, now });
      }
      await tx.brewSessionStep.update({
        where: { id: st.id },
        data: {
          timerState: "stopped",
          timerStoppedAt: now,
          timerLastStartedAt: null,
          timerPausedAt: null,
        },
      });
    }

    const updated = await tx.brewSession.update({
      where: { id: brewSessionId },
      data: {
        status: "stopped",
        stoppedAt: now,
        pausedAt: null,
      },
    });
    await tx.brewSessionLog.create({
      data: {
        brewSessionId,
        kind: "session_stopped",
        message: `Brewing stopped at ${now.toISOString()}`,
        payloadJson: { stoppedStepTimers: activeSteps.length, reason: args?.reason ?? null },
      },
    });
    return updated;
  });
  return next;
}
