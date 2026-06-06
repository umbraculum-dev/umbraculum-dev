import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  IntegrationCreateResponseSchema,
  IntegrationDevicesListResponseSchema,
  IntegrationDevicesQuerySchema,
  IntegrationGetResponseSchema,
  IntegrationOkResponseSchema,
  IntegrationWorkspaceKindParamsSchema,
} from "@umbraculum/contracts";

import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";
import {
  createOrRotateIntegration,
  getIntegrationForWorkspace,
  listIntegrationDevices,
  revokeExistingIntegration,
  rotateExistingIntegration,
} from "./_helpers/integrationCrudHandlers.js";
import { requireIntegrationWorkspaceParam } from "./_helpers/integrationRouteHelpers.js";

export function integrationsGenericRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

  const requireActiveWorkspaceParam = (req: Parameters<typeof requireIntegrationWorkspaceParam>[0]) =>
    requireIntegrationWorkspaceParam(req, workspaces);

  zodApp.get(
    "/workspaces/:workspaceId/integrations/:kind",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceKindParamsSchema,
        response: {
          200: IntegrationGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      return getIntegrationForWorkspace(integrations, workspaceId, req.params.kind);
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/:kind",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceKindParamsSchema,
        response: {
          200: IntegrationCreateResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      return createOrRotateIntegration(integrations, workspaceId, req.params.kind);
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/:kind/rotate-token",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceKindParamsSchema,
        response: {
          200: IntegrationCreateResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      return rotateExistingIntegration(integrations, workspaceId, req.params.kind);
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/:kind/revoke",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceKindParamsSchema,
        response: {
          200: IntegrationOkResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      return revokeExistingIntegration(integrations, workspaceId, req.params.kind);
    },
  );

  zodApp.get(
    "/workspaces/:workspaceId/integrations/:kind/devices",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceKindParamsSchema,
        querystring: IntegrationDevicesQuerySchema,
        response: {
          200: IntegrationDevicesListResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      const includeReadings = req.query.includeReadings ?? false;
      const readingsLimit = req.query.readingsLimit ?? 50;
      return listIntegrationDevices(integrations, workspaceId, req.params.kind, {
        includeReadings,
        readingsTake: includeReadings ? readingsLimit : 1,
      });
    },
  );
}
