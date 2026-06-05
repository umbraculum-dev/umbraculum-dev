import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  BrewSessionCreateResponseSchema,
  BrewSessionDetailResponseSchema,
  BrewSessionIdParamsSchema,
  BrewSessionPatchRequestSchema,
  BrewSessionStopRequestSchema,
  BrewSessionsListResponseSchema,
  ErrorResponseSchema,
  OkResponseSchema,
  RecipeIdParamsSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import type { BrewSessionsRouteService } from "../../../services/brewSessionsRouteService.js";

export function registerBrewSessionsCrudRoutes(app: FastifyInstance, svc: BrewSessionsRouteService) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

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
      const updated = await svc.updateSessionDate(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.body.scheduledDate,
      );
      return BrewSessionDetailResponseSchema.parse({ ok: true, brewSession: updated });
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
      const updated = await svc.stopSession(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.brewSessionId,
        req.body.reason,
      );
      return BrewSessionDetailResponseSchema.parse({ ok: true, brewSession: updated });
    },
  );
}
