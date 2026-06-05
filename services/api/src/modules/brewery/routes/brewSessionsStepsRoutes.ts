import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  BrewSessionDetailResponseSchema,
  BrewSessionIdParamsSchema,
  BrewSessionStepLogRequestSchema,
  BrewSessionStepParamsSchema,
  BrewSessionStepResponseSchema,
  BrewSessionStepsPatchRequestSchema,
  BrewSessionStepsResponseSchema,
  BrewSessionStepTimerPatchRequestSchema,
  ErrorResponseSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import type { BrewSessionsRouteService } from "../../../services/brewSessionsRouteService.js";
import type { BrewSessionStepInput } from "../../../services/brewSessionsService.js";

export function registerBrewSessionsStepsRoutes(app: FastifyInstance, svc: BrewSessionsRouteService) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

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
      const updated = await svc.saveStepLog(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.params.stepId,
        req.body,
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
