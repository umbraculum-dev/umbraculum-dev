import type { BrewSessionStepStatus, PrismaClient } from "@prisma/client";

import { WorkspacesService } from "../workspacesService.js";
import { getSessionDetail, listSessionsForRecipe } from "./brewSessionsLifecycleReadOps.js";
import {
  deleteSession,
  pauseSession,
  startSession,
  stopSession,
  updateSessionDate,
} from "./brewSessionsLifecycleStateOps.js";
import { saveStepLog, saveSteps, updateStepCustomTimerEnabled } from "./brewSessionsLifecycleStepsOps.js";
import { pauseStepTimer, startStepTimer, stopStepTimer } from "./brewSessionsLifecycleTimerOps.js";
import type { BrewSessionStepInput } from "./brewSessionsLifecycleTypes.js";

export type { BrewSessionStepInput } from "./brewSessionsLifecycleTypes.js";

export class BrewSessionsLifecycleService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  updateStepCustomTimerEnabled(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    customTimerEnabled: boolean,
  ) {
    return updateStepCustomTimerEnabled(
      this.prisma,
      this.workspaces,
      userId,
      workspaceId,
      brewSessionId,
      stepId,
      customTimerEnabled,
    );
  }

  listSessionsForRecipe(userId: string, workspaceId: string, recipeId: string) {
    return listSessionsForRecipe(this.prisma, this.workspaces, userId, workspaceId, recipeId);
  }

  getSessionDetail(userId: string, workspaceId: string, brewSessionId: string) {
    return getSessionDetail(this.prisma, this.workspaces, userId, workspaceId, brewSessionId);
  }

  updateSessionDate(userId: string, workspaceId: string, brewSessionId: string, scheduledDate: Date | null) {
    return updateSessionDate(this.prisma, this.workspaces, userId, workspaceId, brewSessionId, scheduledDate);
  }

  saveSteps(userId: string, workspaceId: string, brewSessionId: string, steps: BrewSessionStepInput[]) {
    return saveSteps(this.prisma, this.workspaces, userId, workspaceId, brewSessionId, steps);
  }

  startSession(userId: string, workspaceId: string, brewSessionId: string) {
    return startSession(this.prisma, this.workspaces, userId, workspaceId, brewSessionId);
  }

  pauseSession(userId: string, workspaceId: string, brewSessionId: string) {
    return pauseSession(this.prisma, this.workspaces, userId, workspaceId, brewSessionId);
  }

  stopSession(userId: string, workspaceId: string, brewSessionId: string, args?: { reason: "manual" | "auto" | null }) {
    return stopSession(this.prisma, this.workspaces, userId, workspaceId, brewSessionId, args);
  }

  saveStepLog(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    args: { status: BrewSessionStepStatus; note: string | null; name: string | null; isDisabled: boolean | null },
  ) {
    return saveStepLog(this.prisma, this.workspaces, userId, workspaceId, brewSessionId, stepId, args);
  }

  startStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return startStepTimer(this.prisma, this.workspaces, userId, workspaceId, brewSessionId, stepId);
  }

  pauseStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return pauseStepTimer(this.prisma, this.workspaces, userId, workspaceId, brewSessionId, stepId);
  }

  stopStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return stopStepTimer(this.prisma, this.workspaces, userId, workspaceId, brewSessionId, stepId);
  }

  deleteSession(userId: string, workspaceId: string, brewSessionId: string) {
    return deleteSession(this.prisma, this.workspaces, userId, workspaceId, brewSessionId);
  }
}
