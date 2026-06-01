import type { FastifyInstance } from "fastify";
import type { BrewSessionStepStatus, IntegrationKind } from "@prisma/client";
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
  const raw = typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
  const n = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.max(1, Math.min(max, n));
}

export function brewSessionsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new BrewSessionsService(app.prisma);

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

      return IntegrationAttachmentsResponseSchema.parse({
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

      const session = await app.prisma.brewSession.findFirst({
        where: { id: brewSessionId, workspaceId: ctx.activeWorkspaceId },
        select: { id: true },
      });
      if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");

      const res = await app.prisma.integrationDeviceAttachment.updateMany({
        where: { deviceId, brewSessionId, detachedAt: null },
        data: { detachedAt: new Date() },
      });
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
      const limit = assertLimit(req.query.limit);

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
