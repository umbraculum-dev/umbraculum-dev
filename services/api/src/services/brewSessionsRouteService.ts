import type { BrewSessionStepStatus, PrismaClient } from "@prisma/client";

import { BadRequestError } from "../errors.js";
import {
  assertIntegrationKind,
  assertReadingsLimit,
  BrewSessionIntegrationsService,
} from "./brewSessionIntegrationsService.js";
import { BrewSessionsService, type BrewSessionStepInput } from "./brewSessionsService.js";

function requireId(value: string | null | undefined, code: string, message: string): string {
  if (typeof value !== "string" || !value.trim()) throw new BadRequestError(code, message);
  return value;
}

function parseScheduledDate(raw: unknown): Date | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestError("invalid_scheduled_date", "scheduledDate must be a valid ISO date string");
  }
  return parsed;
}

function parseStopReason(raw: unknown): "auto" | "manual" | null {
  return raw === "auto" || raw === "manual" ? raw : null;
}

export class BrewSessionsRouteService {
  private readonly sessions: BrewSessionsService;
  private readonly integrations: BrewSessionIntegrationsService;

  constructor(prisma: PrismaClient) {
    this.sessions = new BrewSessionsService(prisma);
    this.integrations = new BrewSessionIntegrationsService(prisma);
  }

  createSessionFromRecipe(userId: string, workspaceId: string, recipeId: string) {
    return this.sessions.createSessionFromRecipe(userId, workspaceId, recipeId);
  }

  listSessionsForRecipe(userId: string, workspaceId: string, recipeId: string) {
    return this.sessions.listSessionsForRecipe(userId, workspaceId, recipeId);
  }

  getSessionDetail(userId: string, workspaceId: string, brewSessionId: string) {
    return this.sessions.getSessionDetail(userId, workspaceId, brewSessionId);
  }

  deleteSession(userId: string, workspaceId: string, brewSessionId: string) {
    return this.sessions.deleteSession(userId, workspaceId, brewSessionId);
  }

  updateSessionDate(userId: string, workspaceId: string, brewSessionId: string, raw: unknown) {
    return this.sessions.updateSessionDate(userId, workspaceId, brewSessionId, parseScheduledDate(raw));
  }

  saveSteps(userId: string, workspaceId: string, brewSessionId: string, steps: BrewSessionStepInput[]) {
    return this.sessions.saveSteps(userId, workspaceId, brewSessionId, steps);
  }

  updateStepCustomTimerEnabled(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    customTimerEnabled: boolean,
  ) {
    return this.sessions.updateStepCustomTimerEnabled(
      userId,
      workspaceId,
      brewSessionId,
      stepId,
      customTimerEnabled,
    );
  }

  startSession(userId: string, workspaceId: string, brewSessionId: string) {
    return this.sessions.startSession(userId, workspaceId, brewSessionId);
  }

  pauseSession(userId: string, workspaceId: string, brewSessionId: string) {
    return this.sessions.pauseSession(userId, workspaceId, brewSessionId);
  }

  stopSession(userId: string, workspaceId: string, brewSessionId: string, reasonRaw: unknown) {
    return this.sessions.stopSession(userId, workspaceId, brewSessionId, { reason: parseStopReason(reasonRaw) });
  }

  saveStepLog(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    body: { status: unknown; note?: unknown; name?: unknown; isDisabled?: unknown },
  ) {
    const note = body.note === null ? null : typeof body.note === "string" ? body.note : null;
    const name = typeof body.name === "string" ? body.name.trim() : null;
    const isDisabled = body.isDisabled === true ? true : body.isDisabled === false ? false : null;

    return this.sessions.saveStepLog(userId, workspaceId, brewSessionId, stepId, {
      status: body.status as BrewSessionStepStatus,
      note,
      name,
      isDisabled,
    });
  }

  startStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return this.sessions.startStepTimer(userId, workspaceId, brewSessionId, stepId);
  }

  pauseStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return this.sessions.pauseStepTimer(userId, workspaceId, brewSessionId, stepId);
  }

  stopStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    return this.sessions.stopStepTimer(userId, workspaceId, brewSessionId, stepId);
  }

  listAttachments(workspaceId: string, brewSessionId: string | null | undefined) {
    const id = requireId(brewSessionId, "invalid_brew_session_id", "Params.brewSessionId is required");
    return this.integrations.listAttachments(workspaceId, id);
  }

  attachDevice(
    workspaceId: string,
    brewSessionId: string | null | undefined,
    body: { kind: unknown; deviceId: string },
  ) {
    const id = requireId(brewSessionId, "invalid_brew_session_id", "Params.brewSessionId is required");
    const kind = assertIntegrationKind(body.kind);
    const deviceId = body.deviceId.trim();
    if (!deviceId) throw new BadRequestError("invalid_device_id", "Body.deviceId is required");
    return this.integrations.attachDevice(workspaceId, id, kind, deviceId);
  }

  detachDevice(workspaceId: string, brewSessionId: string | null | undefined, deviceIdRaw: string) {
    const id = requireId(brewSessionId, "invalid_brew_session_id", "Params.brewSessionId is required");
    const deviceId = deviceIdRaw.trim();
    if (!deviceId) throw new BadRequestError("invalid_device_id", "Body.deviceId is required");
    return this.integrations.detachDevice(workspaceId, id, deviceId);
  }

  listReadings(
    workspaceId: string,
    brewSessionId: string | null | undefined,
    query: { kind: unknown; limit?: unknown },
  ) {
    const id = requireId(brewSessionId, "invalid_brew_session_id", "Params.brewSessionId is required");
    const kind = assertIntegrationKind(query.kind);
    const limit = assertReadingsLimit(query.limit);
    return this.integrations.listReadings(workspaceId, id, kind, limit);
  }
}
