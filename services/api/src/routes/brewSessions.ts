import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BrewSessionsService } from "../services/brewSessionsService.js";
import { BadRequestError } from "../errors.js";

export async function brewSessionsRoutes(app: FastifyInstance) {
  const svc = new BrewSessionsService(app.prisma);

  app.post("/recipes/:recipeId/brew-sessions", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { recipeId?: unknown };
    const recipeId = typeof params.recipeId === "string" ? params.recipeId : "";
    const created = await svc.createSessionFromRecipe(ctx.userId, ctx.activeAccountId, recipeId);
    return { ok: true, brewSession: created.session, steps: created.steps };
  });

  app.get("/recipes/:recipeId/brew-sessions", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { recipeId?: unknown };
    const recipeId = typeof params.recipeId === "string" ? params.recipeId : "";
    const list = await svc.listSessionsForRecipe(ctx.userId, ctx.activeAccountId, recipeId);
    return { ok: true, brewSessions: list };
  });

  app.get("/brew-sessions/:brewSessionId", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const session = await svc.getSessionDetail(ctx.userId, ctx.activeAccountId, brewSessionId);
    return { ok: true, brewSession: session };
  });

  app.delete("/brew-sessions/:brewSessionId", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    await svc.deleteSession(ctx.userId, ctx.activeAccountId, brewSessionId);
    return { ok: true };
  });

  app.patch("/brew-sessions/:brewSessionId/steps", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const body = (req.body ?? {}) as { steps?: unknown };
    if (!Array.isArray(body.steps)) {
      throw new BadRequestError("invalid_steps_payload", "Body.steps must be an array");
    }
    const res = await svc.saveSteps(ctx.userId, ctx.activeAccountId, brewSessionId, body.steps as any);
    return { ok: true, steps: res.steps };
  });

  app.post("/brew-sessions/:brewSessionId/start", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const updated = await svc.startSession(ctx.userId, ctx.activeAccountId, brewSessionId);
    return { ok: true, brewSession: updated };
  });

  app.post("/brew-sessions/:brewSessionId/pause", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const updated = await svc.pauseSession(ctx.userId, ctx.activeAccountId, brewSessionId);
    return { ok: true, brewSession: updated };
  });

  app.post("/brew-sessions/:brewSessionId/stop", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const updated = await svc.stopSession(ctx.userId, ctx.activeAccountId, brewSessionId);
    return { ok: true, brewSession: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/log", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const body = (req.body ?? {}) as { status?: unknown; note?: unknown };
    const status = typeof body.status === "string" ? body.status : "";
    if (!["pending", "done", "skipped", "not_applicable"].includes(status)) {
      throw new BadRequestError("invalid_step_status", "Body.status is invalid");
    }
    const note = body.note === null ? null : typeof body.note === "string" ? body.note : null;
    const updated = await svc.saveStepLog(ctx.userId, ctx.activeAccountId, brewSessionId, stepId, {
      status: status as any,
      note,
    });
    return { ok: true, step: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/timer/start", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const updated = await svc.startStepTimer(ctx.userId, ctx.activeAccountId, brewSessionId, stepId);
    return { ok: true, step: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/timer/pause", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const updated = await svc.pauseStepTimer(ctx.userId, ctx.activeAccountId, brewSessionId, stepId);
    return { ok: true, step: updated };
  });

  app.post("/brew-sessions/:brewSessionId/steps/:stepId/timer/stop", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { brewSessionId?: unknown; stepId?: unknown };
    const brewSessionId = typeof params.brewSessionId === "string" ? params.brewSessionId : "";
    const stepId = typeof params.stepId === "string" ? params.stepId : "";
    const updated = await svc.stopStepTimer(ctx.userId, ctx.activeAccountId, brewSessionId, stepId);
    return { ok: true, step: updated };
  });
}

