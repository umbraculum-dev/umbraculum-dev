import type { AiTool } from "@brewery/contracts";
import type { PrismaClient } from "@prisma/client";

import { WorkspacesService } from "../../../workspacesService.js";

/** Empty input — the tool returns the workspace's most-recent session. */
type CurrentBrewSessionStatusInput = Record<string, never>;

interface CurrentBrewSessionStatusOutput {
  sessionId: string | null;
  code: string | null;
  recipeId: string | null;
  status: string | null;
  scheduledDate: string | null;
  startedAt: string | null;
  pausedAt: string | null;
  stoppedAt: string | null;
  /** Most-recent step that is not yet `done` (or `null` if everything is done). */
  currentStep: { name: string; status: string; sortOrder: number } | null;
  /** Total number of steps in the session (or `null` if no session exists). */
  totalSteps: number | null;
}

export function createCurrentBrewSessionStatusTool(
  prisma: PrismaClient,
): AiTool<CurrentBrewSessionStatusInput, CurrentBrewSessionStatusOutput> {
  const workspaces = new WorkspacesService(prisma);

  return {
    name: "brewery.currentBrewSessionStatus",
    description:
      "Return the most-recent brew session for the user's workspace and its current step. Empty input.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: async (_input, ctx) => {
      await workspaces.assertMembership(ctx.userId, ctx.workspaceId);
      const session = await prisma.brewSession.findFirst({
        where: { workspaceId: ctx.workspaceId },
        orderBy: [{ updatedAt: "desc" }],
        include: {
          steps: {
            orderBy: [{ sortOrder: "asc" }],
            select: { name: true, status: true, sortOrder: true },
          },
        },
      });
      if (!session) {
        return {
          sessionId: null,
          code: null,
          recipeId: null,
          status: null,
          scheduledDate: null,
          startedAt: null,
          pausedAt: null,
          stoppedAt: null,
          currentStep: null,
          totalSteps: null,
        };
      }
      const currentStep =
        session.steps.find((s) => s.status !== "done" && s.status !== "skipped" && s.status !== "not_applicable") ??
        null;
      return {
        sessionId: session.id,
        code: session.code,
        recipeId: session.recipeId,
        status: session.status,
        scheduledDate: session.scheduledDate ? session.scheduledDate.toISOString() : null,
        startedAt: session.startedAt ? session.startedAt.toISOString() : null,
        pausedAt: session.pausedAt ? session.pausedAt.toISOString() : null,
        stoppedAt: session.stoppedAt ? session.stoppedAt.toISOString() : null,
        currentStep,
        totalSteps: session.steps.length,
      };
    },
  };
}
