import type { FastifyInstance } from "fastify";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { BrewSessionsService } from "../services/brewSessionsService.js";
import { BadRequestError } from "../errors.js";

export async function brewSessionsRoutes(app: FastifyInstance) {
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
    const res = await svc.saveSteps(ctx.userId, ctx.activeWorkspaceId, brewSessionId, body.steps as any);
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
    const reason = reasonRaw === "auto" || reasonRaw === "manual" ? (reasonRaw as "auto" | "manual") : null;
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
      status: status as any,
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

