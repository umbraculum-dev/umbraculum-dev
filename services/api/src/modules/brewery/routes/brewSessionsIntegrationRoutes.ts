import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { BrewSessionIdParamsSchema, IntegrationAttachRequestSchema, IntegrationAttachResponseSchema, IntegrationAttachmentsResponseSchema, IntegrationDetachRequestSchema, IntegrationDetachResponseSchema, IntegrationReadingsQuerySchema, IntegrationReadingsResponseSchema } from "@umbraculum/brewery-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import type { BrewSessionsRouteService } from "../services/brewSessionsRouteService.js";

export function registerBrewSessionsIntegrationRoutes(app: FastifyInstance, svc: BrewSessionsRouteService) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

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
      const attachments = await svc.listAttachments(ctx.activeWorkspaceId, req.params.brewSessionId);

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
      const created = await svc.attachDevice(ctx.activeWorkspaceId, req.params.brewSessionId, req.body);

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
      const res = await svc.detachDevice(ctx.activeWorkspaceId, req.params.brewSessionId, req.body.deviceId);
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
      const readings = await svc.listReadings(ctx.activeWorkspaceId, req.params.brewSessionId, req.query);

      return IntegrationReadingsResponseSchema.parse({ ok: true, readings });
    },
  );
}
