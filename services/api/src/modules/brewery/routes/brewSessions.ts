import type { FastifyInstance } from "fastify";
import type { BrewSessionStepStatus, IntegrationKind } from "@prisma/client";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { BrewSessionsService, type BrewSessionStepInput } from "../../../services/brewSessionsService.js";
import { BadRequestError, NotFoundError } from "../../../errors.js";

const SUPPORTED_KINDS: IntegrationKind[] = ["tilt", "ispindel", "rapt"];

function assertIntegrationKind(v: unknown): IntegrationKind {
  const raw = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!raw) throw new BadRequestError("invalid_integration_kind", "Integration kind is required");
  if (!SUPPORTED_KINDS.includes(raw as IntegrationKind)) {
    throw new BadRequestError("invalid_integration_kind", "Integration kind is not supported");
  }
  return raw as IntegrationKind;
}

function assertLimit(v: unknown, fallback = 200, max = 500): number {
  const raw = typeof v === "string" ? v.trim() : "";
  const n = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.max(1, Math.min(max, n));
}

export function brewSessionsRoutes(app: FastifyInstance) {
  const svc = new BrewSessionsService(app.prisma);

  app.post("/recipes/:recipeId/brew-sessions", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { recipeId?: unknown };
    const recipeId = typeof params.recipeId === "string" ? params.recipeId : "";
    const created = await svc.createSessionFromRecipe(ctx.userId, ctx.activeWorkspaceId, recipeId);
    return { ok: true, brewSession: created.session, steps: created.steps };
  });

  app.get("/recipes/:recipeId/brew-sessions", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { recipeId?: unknown };
    const recipeId = typeof params.recipeId === "string" ? params.recipeId : "";
    const list = await svc.listSessionsForRecipe(ctx.userId, ctx.activeWorkspaceId, recipeId);
    return { ok: true, brewSessions: list };
  });

  app.get("/brew-sessions/:brewSessionId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const session = await svc.getSessionDetail(ctx.userId, ctx.activeWorkspaceId, brewSessionId);
    return { ok: true, brewSession: session };
  });

  app.get("/brew-sessions/:brewSessionId/integrations/attachments", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

    const session = await app.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId: ctx.activeWorkspaceId },
      select: { id: true },
    });
    if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");

    const attachments = await app.prisma.integrationDeviceAttachment.findMany({
      where: { brewSessionId, detachedAt: null },
      orderBy: [{ attachedAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        attachedAt: true,
        device: {
          select: {
            id: true,
            deviceKey: true,
            displayName: true,
            lastSeenAt: true,
            metadataJson: true,
            integration: { select: { id: true, kind: true } },
          },
        },
      },
    });

    return {
      ok: true,
      attachments: attachments.map((a) => ({
        id: a.id,
        attachedAt: a.attachedAt,
        device: {
          id: a.device.id,
          deviceKey: a.device.deviceKey,
          displayName: a.device.displayName,
          lastSeenAt: a.device.lastSeenAt,
          metadataJson: a.device.metadataJson ?? null,
          integrationId: a.device.integration.id,
          kind: a.device.integration.kind,
        },
      })),
    };
  });

  app.post("/brew-sessions/:brewSessionId/integrations/attach", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

    const body = (req.body ?? {}) as { kind?: unknown; deviceId?: unknown };
    const kind = assertIntegrationKind(body.kind);
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
    if (!deviceId) throw new BadRequestError("invalid_device_id", "Body.deviceId is required");

    const session = await app.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId: ctx.activeWorkspaceId },
      select: { id: true },
    });
    if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");

    const integration = await app.prisma.integration.findFirst({
      where: { workspaceId: ctx.activeWorkspaceId, kind, revokedAt: null },
      select: { id: true },
    });
    if (!integration) {
      throw new NotFoundError("missing_integration", "Integration not configured");
    }

    const device = await app.prisma.integrationDevice.findFirst({
      where: { id: deviceId, integrationId: integration.id },
      select: { id: true },
    });
    if (!device) throw new NotFoundError("missing_device", "Device not found");

    const now = new Date();
    await app.prisma.integrationDeviceAttachment.updateMany({
      where: { deviceId, detachedAt: null },
      data: { detachedAt: now },
    });
    const created = await app.prisma.integrationDeviceAttachment.create({
      data: { deviceId, brewSessionId, attachedAt: now },
      select: { id: true, attachedAt: true, brewSessionId: true },
    });

    return { ok: true, attachment: created };
  });

  app.post("/brew-sessions/:brewSessionId/integrations/detach", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

    const body = (req.body ?? {}) as { deviceId?: unknown };
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
    if (!deviceId) throw new BadRequestError("invalid_device_id", "Body.deviceId is required");

    const session = await app.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId: ctx.activeWorkspaceId },
      select: { id: true },
    });
    if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");

    const res = await app.prisma.integrationDeviceAttachment.updateMany({
      where: { deviceId, brewSessionId, detachedAt: null },
      data: { detachedAt: new Date() },
    });
    return { ok: true, detachedCount: res.count };
  });

  app.get("/brew-sessions/:brewSessionId/integrations/readings", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

    const query = (req.query ?? {}) as { kind?: unknown; limit?: unknown };
    const kind = assertIntegrationKind(query.kind);
    const limit = assertLimit(query.limit);

    const session = await app.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId: ctx.activeWorkspaceId },
      select: { id: true },
    });
    if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");

    const readings = await app.prisma.integrationReading.findMany({
      where: {
        brewSessionId,
        device: { integration: { workspaceId: ctx.activeWorkspaceId, kind } },
      },
      orderBy: [{ recordedAt: "desc" }, { receivedAt: "desc" }, { id: "desc" }],
      take: limit,
      select: {
        id: true,
        deviceId: true,
        recordedAt: true,
        receivedAt: true,
        temperatureC: true,
        gravitySg: true,
      },
    });

    return { ok: true, readings };
  });

  app.delete("/brew-sessions/:brewSessionId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    await svc.deleteSession(ctx.userId, ctx.activeWorkspaceId, brewSessionId);
    return { ok: true };
  });

  app.patch("/brew-sessions/:brewSessionId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const body = (req.body ?? {}) as { scheduledDate?: string | null };
    const raw = body.scheduledDate;
    const scheduledDate =
      raw === null || raw === undefined
        ? null
        : typeof raw === "string" && raw.trim()
          ? new Date(raw.trim())
          : null;
    if (scheduledDate !== null && Number.isNaN(scheduledDate.getTime())) {
      throw new BadRequestError("invalid_scheduled_date", "scheduledDate must be a valid ISO date string");
    }
    const updated = await svc.updateSessionDate(ctx.userId, ctx.activeWorkspaceId, brewSessionId, scheduledDate);
    return { ok: true, brewSession: updated };
  });

  app.patch("/brew-sessions/:brewSessionId/steps", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const body = (req.body ?? {}) as { steps?: unknown };
    if (!Array.isArray(body.steps)) {
      throw new BadRequestError("invalid_steps_payload", "Body.steps must be an array");
    }
    const res = await svc.saveSteps(ctx.userId, ctx.activeWorkspaceId, brewSessionId, body.steps as BrewSessionStepInput[]);
    return { ok: true, steps: res.steps };
  });

  app.patch("/brew-sessions/:brewSessionId/steps/:stepId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const body = (req.body ?? {}) as { customTimerEnabled?: unknown };
    const enabled = body.customTimerEnabled === true ? true : body.customTimerEnabled === false ? false : null;
    if (enabled === null) {
      throw new BadRequestError("invalid_custom_timer_enabled", "Body.customTimerEnabled must be a boolean");
    }
    const step = await svc.updateStepCustomTimerEnabled(ctx.userId, ctx.activeWorkspaceId, brewSessionId, stepId, enabled);
    return { ok: true, step };
  });

  app.post("/brew-sessions/:brewSessionId/start", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const updated = await svc.startSession(ctx.userId, ctx.activeWorkspaceId, brewSessionId);
    return { ok: true, brewSession: updated };
  });

  app.post("/brew-sessions/:brewSessionId/pause", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const updated = await svc.pauseSession(ctx.userId, ctx.activeWorkspaceId, brewSessionId);
    return { ok: true, brewSession: updated };
  });

  app.post("/brew-sessions/:brewSessionId/stop", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const body = (req.body ?? {}) as { reason?: unknown };
    const reasonRaw = typeof body.reason === "string" ? body.reason : "";
    const reason = reasonRaw === "auto" || reasonRaw === "manual" ? (reasonRaw) : null;
    const updated = await svc.stopSession(ctx.userId, ctx.activeWorkspaceId, brewSessionId, { reason });
    return { ok: true, brewSession: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/log", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const body = (req.body ?? {}) as { status?: unknown; note?: unknown; name?: unknown; isDisabled?: unknown };
    const status = typeof body.status === "string" ? body.status : "";
    if (!["pending", "in_progress", "done", "skipped", "not_applicable"].includes(status)) {
      throw new BadRequestError("invalid_step_status", "Body.status is invalid");
    }
    const note = body.note === null ? null : typeof body.note === "string" ? body.note : null;
    const name = typeof body.name === "string" ? body.name.trim() : null;
    const isDisabled =
      body.isDisabled === true ? true : body.isDisabled === false ? false : null;
    const updated = await svc.saveStepLog(ctx.userId, ctx.activeWorkspaceId, brewSessionId, stepId, {
      status: status as BrewSessionStepStatus,
      note,
      name,
      isDisabled,
    });
    return { ok: true, step: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/timer/start", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const updated = await svc.startStepTimer(ctx.userId, ctx.activeWorkspaceId, brewSessionId, stepId);
    return { ok: true, step: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/timer/pause", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const updated = await svc.pauseStepTimer(ctx.userId, ctx.activeWorkspaceId, brewSessionId, stepId);
    return { ok: true, step: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/timer/stop", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const updated = await svc.stopStepTimer(ctx.userId, ctx.activeWorkspaceId, brewSessionId, stepId);
    return { ok: true, step: updated };
  });
}

