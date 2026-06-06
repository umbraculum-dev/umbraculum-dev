import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  BrewSessionsRecentQuerySchema,
  BrewSessionsRecentResponseSchema,
  ErrorResponseSchema,
  IntegrationCreateResponseSchema,
  IntegrationDeviceAttachRequestSchema,
  IntegrationDeviceAttachResponseSchema,
  IntegrationDeviceDetachResponseSchema,
  IntegrationDeviceIdParamsSchema,
  IntegrationDevicesListResponseSchema,
  IntegrationGetResponseSchema,
  IntegrationOkResponseSchema,
  IntegrationWorkspaceIdParamsSchema,
} from "@umbraculum/contracts";

import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";
import {
  createOrRotateIntegration,
  getIntegrationForWorkspace,
  listIntegrationDevices,
  revokeIntegration,
  rotateIntegrationToken,
} from "./_helpers/integrationCrudHandlers.js";
import { requireActiveWorkspaceIntegration, requireIntegrationWorkspaceIdParam } from "./_helpers/integrationRouteHelpers.js";

const TILT = "tilt" as const;
const TILT_MISSING = "Tilt integration not configured";

export function integrationsTiltRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

  const requireWorkspace = (req: Parameters<typeof requireIntegrationWorkspaceIdParam>[0]) =>
    requireIntegrationWorkspaceIdParam(req, workspaces);

  const crudSchema = {
    params: IntegrationWorkspaceIdParamsSchema,
    response: {
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
    },
  };

  zodApp.get(
    "/workspaces/:workspaceId/integrations/tilt",
    { schema: { tags: ["integrations"], ...crudSchema, response: { ...crudSchema.response, 200: IntegrationGetResponseSchema } } },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      return getIntegrationForWorkspace(integrations, workspaceId, TILT);
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt",
    { schema: { tags: ["integrations"], ...crudSchema, response: { ...crudSchema.response, 200: IntegrationCreateResponseSchema } } },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      return createOrRotateIntegration(integrations, workspaceId, TILT);
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt/rotate-token",
    {
      schema: {
        tags: ["integrations"],
        ...crudSchema,
        response: { ...crudSchema.response, 200: IntegrationCreateResponseSchema, 404: ErrorResponseSchema },
      },
    },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      return rotateIntegrationToken(integrations, workspaceId, TILT, TILT_MISSING);
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt/revoke",
    {
      schema: {
        tags: ["integrations"],
        ...crudSchema,
        response: { ...crudSchema.response, 200: IntegrationOkResponseSchema, 404: ErrorResponseSchema },
      },
    },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      return revokeIntegration(integrations, workspaceId, TILT, TILT_MISSING);
    },
  );

  zodApp.get(
    "/workspaces/:workspaceId/integrations/tilt/devices",
    {
      schema: {
        tags: ["integrations"],
        ...crudSchema,
        response: { ...crudSchema.response, 200: IntegrationDevicesListResponseSchema },
      },
    },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      return listIntegrationDevices(integrations, workspaceId, TILT, {
        includeReadings: false,
        readingsTake: 1,
      });
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt/devices/:deviceId/attach",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationDeviceIdParamsSchema,
        body: IntegrationDeviceAttachRequestSchema,
        response: {
          200: IntegrationDeviceAttachResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      const { deviceId } = req.params;
      const { brewSessionId } = req.body;
      const integration = await requireActiveWorkspaceIntegration(integrations, workspaceId, TILT, TILT_MISSING);
      await integrations.assertIntegrationDevice(integration.id, deviceId);
      await integrations.assertBrewSessionInWorkspace(workspaceId, brewSessionId);
      const attachment = await integrations.attachDeviceToBrewSession(deviceId, brewSessionId);
      return IntegrationDeviceAttachResponseSchema.parse({ ok: true, attachment });
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt/devices/:deviceId/detach",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationDeviceIdParamsSchema,
        response: {
          200: IntegrationDeviceDetachResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      const { deviceId } = req.params;
      const integration = await requireActiveWorkspaceIntegration(integrations, workspaceId, TILT, TILT_MISSING);
      await integrations.assertIntegrationDevice(integration.id, deviceId);
      const res = await integrations.detachDevice(deviceId);
      return IntegrationDeviceDetachResponseSchema.parse({ ok: true, detachedCount: res.count });
    },
  );

  zodApp.get(
    "/workspaces/:workspaceId/brew-sessions/recent",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceIdParamsSchema,
        querystring: BrewSessionsRecentQuerySchema,
        response: {
          200: BrewSessionsRecentResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { workspaceId } = await requireWorkspace(req);
      const sessions = await integrations.listRecentBrewSessions(workspaceId, req.query.limit ?? 20);
      return BrewSessionsRecentResponseSchema.parse({ ok: true, brewSessions: sessions });
    },
  );
}
