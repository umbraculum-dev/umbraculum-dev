import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  IntegrationRevealResponseSchema,
  IntegrationWorkspaceIdParamsSchema,
  IntegrationWorkspaceKindParamsSchema,
} from "@umbraculum/contracts";

import { ForbiddenError, NotFoundError } from "../errors.js";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";

function integrationPublicPath(kind: string, token: string): string {
  return `/api/integrations/${encodeURIComponent(kind)}/${encodeURIComponent(token)}`;
}

export function integrationsRevealRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

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
      const ctx = requireActiveWorkspace(req);
      const { workspaceId, kind } = req.params;

      if (workspaceId !== ctx.activeWorkspaceId) {
        throw new ForbiddenError("workspace_mismatch", "Active workspace does not match requested workspace");
      }
      await workspaces.assertMembership(ctx.userId, workspaceId);

      const integration = await app.prisma.integration.findFirst({
        where: { workspaceId, kind, revokedAt: null },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { id: true, tokenVersion: true },
      });
      if (!integration) throw new NotFoundError("missing_integration", "Integration not configured");

      const token = integrations.deriveToken({
        integrationId: integration.id,
        tokenVersion: integration.tokenVersion,
      });

      return IntegrationRevealResponseSchema.parse({
        ok: true,
        integrationId: integration.id,
        kind,
        token,
        publicPath: integrationPublicPath(kind, token),
      });
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
      const ctx = requireActiveWorkspace(req);
      const { workspaceId } = req.params;

      if (workspaceId !== ctx.activeWorkspaceId) {
        throw new ForbiddenError("workspace_mismatch", "Active workspace does not match requested workspace");
      }
      await workspaces.assertMembership(ctx.userId, workspaceId);

      const integration = await app.prisma.integration.findFirst({
        where: { workspaceId, kind: "tilt", revokedAt: null },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { id: true, tokenVersion: true },
      });
      if (!integration) throw new NotFoundError("missing_integration", "Integration not configured");

      const token = integrations.deriveToken({
        integrationId: integration.id,
        tokenVersion: integration.tokenVersion,
      });

      return IntegrationRevealResponseSchema.parse({
        ok: true,
        integrationId: integration.id,
        kind: "tilt",
        token,
        publicPath: integrationPublicPath("tilt", token),
      });
    },
  );
}
