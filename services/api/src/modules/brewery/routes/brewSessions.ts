import type { BrewSessionStepStatus } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  BrewSessionCreateResponseSchema,
  BrewSessionDetailResponseSchema,
  BrewSessionIdParamsSchema,
  BrewSessionPatchRequestSchema,
  BrewSessionStepLogRequestSchema,
  BrewSessionStepParamsSchema,
  BrewSessionStepResponseSchema,
  BrewSessionStepsPatchRequestSchema,
  BrewSessionStepsResponseSchema,
  BrewSessionStepTimerPatchRequestSchema,
  BrewSessionStopRequestSchema,
  BrewSessionsListResponseSchema,
  ErrorResponseSchema,
  IntegrationAttachRequestSchema,
  IntegrationAttachResponseSchema,
  IntegrationAttachmentsResponseSchema,
  IntegrationDetachRequestSchema,
  IntegrationDetachResponseSchema,
  IntegrationReadingsQuerySchema,
  IntegrationReadingsResponseSchema,
  OkResponseSchema,
  RecipeIdParamsSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import {
  assertIntegrationKind,
  assertReadingsLimit,
  BrewSessionIntegrationsService,
} from "../../../services/brewSessionIntegrationsService.js";
import { BrewSessionsService, type BrewSessionStepInput } from "../../../services/brewSessionsService.js";
import { BadRequestError } from "../../../errors.js";

export function brewSessionsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new BrewSessionsService(app.prisma);
  const integrations = new BrewSessionIntegrationsService(app.prisma);

  zodApp.post(
    "/recipes/:recipeId/brew-sessions",
    {
      schema: {
        tags: ["brewery"],
        params: RecipeIdParamsSchema,
        response: {
          200: BrewSessionCreateResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const created = await svc.createSessionFromRecipe(ctx.userId, ctx.activeWorkspaceId, req.params.recipeId);
      return BrewSessionCreateResponseSchema.parse({
        ok: true,
        brewSession: created.session,
        steps: created.steps,
      });
    },
  );

  zodApp.get(
    "/recipes/:recipeId/brew-sessions",
    {
      schema: {
        tags: ["brewery"],
        params: RecipeIdParamsSchema,
        response: {
          200: BrewSessionsListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const list = await svc.listSessionsForRecipe(ctx.userId, ctx.activeWorkspaceId, req.params.recipeId);
      return BrewSessionsListResponseSchema.parse({ ok: true, brewSessions: list });
    },
  );

  zodApp.get(
    "/brew-sessions/:brewSessionId",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        response: {
          200: BrewSessionDetailResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const session = await svc.getSessionDetail(ctx.userId, ctx.activeWorkspaceId, req.params.brewSessionId);
      return BrewSessionDetailResponseSchema.parse({ ok: true, brewSession: session });
    },
  );

  zodApp.get(
    "/brew-sessions/:brewSessionId/integrations/attachments",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        response: {
          200: IntegrationAttachmentsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const brewSessionId = req.params.brewSessionId;
      if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

      const attachments = await integrations.listAttachments(ctx.activeWorkspaceId, brewSessionId);

      return IntegrationAttachmentsResponseSchema.parse({
        ok: true,
        attachments,
      });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/integrations/attach",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        body: IntegrationAttachRequestSchema,
        response: {
          200: IntegrationAttachResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const brewSessionId = req.params.brewSessionId;
      if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

      const body = req.body;
      const kind = assertIntegrationKind(body.kind);
      const deviceId = body.deviceId.trim();
      if (!deviceId) throw new BadRequestError("invalid_device_id", "Body.deviceId is required");

      const created = await integrations.attachDevice(
        ctx.activeWorkspaceId,
        brewSessionId,
        kind,
        deviceId,
      );

      return IntegrationAttachResponseSchema.parse({ ok: true, attachment: created });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/integrations/detach",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        body: IntegrationDetachRequestSchema,
        response: {
          200: IntegrationDetachResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const brewSessionId = req.params.brewSessionId;
      if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

      const deviceId = req.body.deviceId.trim();
      if (!deviceId) throw new BadRequestError("invalid_device_id", "Body.deviceId is required");

      const res = await integrations.detachDevice(ctx.activeWorkspaceId, brewSessionId, deviceId);
      return IntegrationDetachResponseSchema.parse({ ok: true, detachedCount: res.count });
    },
  );

  zodApp.get(
    "/brew-sessions/:brewSessionId/integrations/readings",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        querystring: IntegrationReadingsQuerySchema,
        response: {
          200: IntegrationReadingsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const brewSessionId = req.params.brewSessionId;
      if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Params.brewSessionId is required");

      const kind = assertIntegrationKind(req.query.kind);
      const limit = assertReadingsLimit(req.query.limit);

      const readings = await integrations.listReadings(
        ctx.activeWorkspaceId,
        brewSessionId,
        kind,
        limit,
      );

      return IntegrationReadingsResponseSchema.parse({ ok: true, readings });
    },
  );

  zodApp.delete(
    "/brew-sessions/:brewSessionId",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        response: {
          200: OkResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteSession(ctx.userId, ctx.activeWorkspaceId, req.params.brewSessionId);
      return { ok: true as const };
    },
  );

  zodApp.patch(
    "/brew-sessions/:brewSessionId",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        body: BrewSessionPatchRequestSchema,
        response: {
          200: BrewSessionDetailResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const raw = req.body.scheduledDate;
      const scheduledDate =
        raw === null || raw === undefined
          ? null
          : typeof raw === "string" && raw.trim()
            ? new Date(raw.trim())
            : null;
      if (scheduledDate !== null && Number.isNaN(scheduledDate.getTime())) {
        throw new BadRequestError("invalid_scheduled_date", "scheduledDate must be a valid ISO date string");
      }
      const updated = await svc.updateSessionDate(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        scheduledDate,
      );
      return BrewSessionDetailResponseSchema.parse({ ok: true, brewSession: updated });
    },
  );

  zodApp.patch(
    "/brew-sessions/:brewSessionId/steps",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        body: BrewSessionStepsPatchRequestSchema,
        response: {
          200: BrewSessionStepsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const res = await svc.saveSteps(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.body.steps as BrewSessionStepInput[],
      );
      return BrewSessionStepsResponseSchema.parse({ ok: true, steps: res.steps });
    },
  );

  zodApp.patch(
    "/brew-sessions/:brewSessionId/steps/:stepId",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionStepParamsSchema,
        body: BrewSessionStepTimerPatchRequestSchema,
        response: {
          200: BrewSessionStepResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const step = await svc.updateStepCustomTimerEnabled(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.params.stepId,
        req.body.customTimerEnabled,
      );
      return BrewSessionStepResponseSchema.parse({ ok: true, step });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/start",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        response: {
          200: BrewSessionDetailResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const updated = await svc.startSession(ctx.userId, ctx.activeWorkspaceId, req.params.brewSessionId);
      return BrewSessionDetailResponseSchema.parse({ ok: true, brewSession: updated });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/pause",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        response: {
          200: BrewSessionDetailResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const updated = await svc.pauseSession(ctx.userId, ctx.activeWorkspaceId, req.params.brewSessionId);
      return BrewSessionDetailResponseSchema.parse({ ok: true, brewSession: updated });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/stop",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionIdParamsSchema,
        body: BrewSessionStopRequestSchema,
        response: {
          200: BrewSessionDetailResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const reasonRaw = req.body.reason ?? "";
      const reason = reasonRaw === "auto" || reasonRaw === "manual" ? reasonRaw : null;
      const updated = await svc.stopSession(ctx.userId, ctx.activeWorkspaceId, req.params.brewSessionId, { reason });
      return BrewSessionDetailResponseSchema.parse({ ok: true, brewSession: updated });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/steps/:stepId/log",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionStepParamsSchema,
        body: BrewSessionStepLogRequestSchema,
        response: {
          200: BrewSessionStepResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const note = body.note === null ? null : typeof body.note === "string" ? body.note : null;
      const name = typeof body.name === "string" ? body.name.trim() : null;
      const isDisabled = body.isDisabled === true ? true : body.isDisabled === false ? false : null;
      const updated = await svc.saveStepLog(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.params.stepId,
        {
          status: body.status as BrewSessionStepStatus,
          note,
          name,
          isDisabled,
        },
      );
      return BrewSessionStepResponseSchema.parse({ ok: true, step: updated });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/steps/:stepId/timer/start",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionStepParamsSchema,
        response: {
          200: BrewSessionStepResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const updated = await svc.startStepTimer(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.params.stepId,
      );
      return BrewSessionStepResponseSchema.parse({ ok: true, step: updated });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/steps/:stepId/timer/pause",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionStepParamsSchema,
        response: {
          200: BrewSessionStepResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const updated = await svc.pauseStepTimer(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.params.stepId,
      );
      return BrewSessionStepResponseSchema.parse({ ok: true, step: updated });
    },
  );

  zodApp.post(
    "/brew-sessions/:brewSessionId/steps/:stepId/timer/stop",
    {
      schema: {
        tags: ["brewery"],
        params: BrewSessionStepParamsSchema,
        response: {
          200: BrewSessionStepResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const updated = await svc.stopStepTimer(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.params.stepId,
      );
      return BrewSessionStepResponseSchema.parse({ ok: true, step: updated });
    },
  );
}
