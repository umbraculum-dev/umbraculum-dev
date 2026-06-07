import type { PrismaClient } from "@prisma/client";

import { BadRequestError, NotFoundError } from "../../../../errors.js";
import type { WorkspacesService } from "../../../../services/workspacesService.js";

export async function updateSessionDate(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
  scheduledDate: Date | null,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const existing = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
  });
  if (!existing) throw new NotFoundError("brew_session_not_found", "Brew session not found");
  const updated = await prisma.brewSession.update({
    where: { id: brewSessionId },
    data: { scheduledDate },
  });
  return updated;
}

export async function deleteSession(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  brewSessionId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);
  const session = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
    select: { id: true, status: true },
  });
  if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
  if (session.status === "running" || session.status === "paused") {
    throw new BadRequestError("session_not_stopped", "Session must be stopped before deletion");
  }

  await prisma.brewSession.delete({
    where: { id: brewSessionId },
  });
  return { ok: true };
}
