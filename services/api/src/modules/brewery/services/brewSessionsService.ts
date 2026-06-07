import type { BrewSessionStepStatus, PrismaClient } from "@prisma/client";
import { BrewSessionsCreationService } from "./brewSessionsCreationService.js";
import {
  BrewSessionsLifecycleService,
  type BrewSessionStepInput,
} from "./brewSessionsLifecycleService.js";

export type { BrewSessionStepInput };

export class BrewSessionsService {
  private readonly creation: BrewSessionsCreationService;
  private readonly lifecycle: BrewSessionsLifecycleService;

  constructor(prisma: PrismaClient) {
    this.creation = new BrewSessionsCreationService(prisma);
    this.lifecycle = new BrewSessionsLifecycleService(prisma);
  }

  updateStepCustomTimerEnabled(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    customTimerEnabled: boolean
  ) {
    return this.lifecycle.updateStepCustomTimerEnabled(userId, workspaceId, brewSessionId, stepId, customTimerEnabled);
  }

  createSessionFromRecipe(userId: string, workspaceId: string, recipeId: string) {
    return this.creation.createSessionFromRecipe(userId, workspaceId, recipeId);
  }

  listSessionsForRecipe(userId: string, workspaceId: string, recipeId: string) {
    return this.lifecycle.listSessionsForRecipe(userId, workspaceId, recipeId);
  }

  getSessionDetail(userId: string, workspaceId: string, brewSessionId: string) {
    return this.lifecycle.getSessionDetail(userId, workspaceId, brewSessionId);
  }

  updateSessionDate(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    scheduledDate: Date | null
  ) {
    return this.lifecycle.updateSessionDate(userId, workspaceId, brewSessionId, scheduledDate);
  }

  saveSteps(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    steps: BrewSessionStepInput[]
  ) {
    return this.lifecycle.saveSteps(userId, workspaceId, brewSessionId, steps);
  }

  startSession(userId: string, workspaceId: string, brewSessionId: string) {
    return this.lifecycle.startSession(userId, workspaceId, brewSessionId);
  }

  pauseSession(userId: string, workspaceId: string, brewSessionId: string) {
    return this.lifecycle.pauseSession(userId, workspaceId, brewSessionId);
  }

  stopSession(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    args?: { reason: "manual" | "auto" | null }
  ) {
    return this.lifecycle.stopSession(userId, workspaceId, brewSessionId, args);
  }

  saveStepLog(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    args: { status: BrewSessionStepStatus; note: string | null; name: string | null; isDisabled: boolean | null }
  ) {
    return this.lifecycle.saveStepLog(userId, workspaceId, brewSessionId, stepId, args);
  }

  startStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return this.lifecycle.startStepTimer(userId, workspaceId, brewSessionId, stepId);
  }

  pauseStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return this.lifecycle.pauseStepTimer(userId, workspaceId, brewSessionId, stepId);
  }

  stopStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return this.lifecycle.stopStepTimer(userId, workspaceId, brewSessionId, stepId);
  }

  deleteSession(userId: string, workspaceId: string, brewSessionId: string) {
    return this.lifecycle.deleteSession(userId, workspaceId, brewSessionId);
  }
}
