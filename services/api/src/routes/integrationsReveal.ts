import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  IntegrationRevealResponseSchema,
  IntegrationWorkspaceIdParamsSchema,
  IntegrationWorkspaceKindParamsSchema,
} from "@umbraculum/contracts";

import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";
import {
  buildIntegrationRevealPayload,
  requireIntegrationWorkspaceIdParam,
  requireIntegrationWorkspaceParam,
} from "./_helpers/integrationRouteHelpers.js";

export function integrationsRevealRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

  const requireActiveWorkspaceParam = (req: Parameters<typeof requireIntegrationWorkspaceParam>[0]) =>
    requireIntegrationWorkspaceParam(req, workspaces);

  zodApp.get(
    "/workspaces/:workspaceId/integrations/:kind/reveal",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceKindParamsSchema,
        response: {
          200: IntegrationRevealResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      const { kind } = req.params;
      const payload = await buildIntegrationRevealPayload(integrations, workspaceId, kind);
      return IntegrationRevealResponseSchema.parse(payload);
    },
  );

  // Convenience alias for existing UI paths.
  zodApp.get(
    "/workspaces/:workspaceId/integrations/tilt/reveal",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceIdParamsSchema,
        response: {
          200: IntegrationRevealResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireIntegrationWorkspaceIdParam(req, workspaces);
      const payload = await buildIntegrationRevealPayload(integrations, workspaceId, "tilt");
      return IntegrationRevealResponseSchema.parse(payload);
    },
  );
}
