import type { FastifyInstance, FastifyRequest } from "fastify";
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

import { ForbiddenError, NotFoundError } from "../errors.js";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";

function integrationPublicPath(token: string): string {
  return `/api/integrations/tilt/${encodeURIComponent(token)}`;
}

export function integrationsTiltRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

  async function requireActiveWorkspaceParam(req: FastifyRequest): Promise<{ userId: string; workspaceId: string }> {
    const ctx = requireActiveWorkspace(req);
    const { workspaceId } = IntegrationWorkspaceIdParamsSchema.parse(req.params ?? {});
    if (workspaceId !== ctx.activeWorkspaceId) {
      throw new ForbiddenError("workspace_mismatch", "Active workspace does not match requested workspace");
    }
    await workspaces.assertMembership(ctx.userId, workspaceId);
    return { userId: ctx.userId, workspaceId };
  }

  zodApp.get(
    "/workspaces/:workspaceId/integrations/tilt",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceIdParamsSchema,
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

      const integration = await integrations.findWorkspaceIntegration(workspaceId, "tilt");
      return IntegrationGetResponseSchema.parse({
        ok: true,
        integration: integration
          ? {
              id: integration.id,
              workspaceId: integration.workspaceId,
              kind: integration.kind,
              revokedAt: integration.revokedAt,
              createdAt: integration.createdAt,
              updatedAt: integration.updatedAt,
            }
          : null,
      });
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceIdParamsSchema,
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

      const existing = await integrations.findWorkspaceIntegration(workspaceId, "tilt");
      if (existing && !existing.revokedAt) {
        const rotated = await integrations.rotateIntegrationToken(existing.id);
        return IntegrationCreateResponseSchema.parse({
          ok: true,
          integrationId: existing.id,
          token: rotated.token,
          publicPath: integrationPublicPath(rotated.token),
        });
      }

      const created = await integrations.createIntegration(workspaceId, "tilt");
      return IntegrationCreateResponseSchema.parse({
        ok: true,
        integrationId: created.integration.id,
        token: created.token,
        publicPath: integrationPublicPath(created.token),
      });
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt/rotate-token",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceIdParamsSchema,
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
      const integration = await integrations.findWorkspaceIntegration(workspaceId, "tilt");
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Tilt integration not configured");
      }
      const rotated = await integrations.rotateIntegrationToken(integration.id);
      return IntegrationCreateResponseSchema.parse({
        ok: true,
        integrationId: integration.id,
        token: rotated.token,
        publicPath: integrationPublicPath(rotated.token),
      });
    },
  );

  zodApp.post(
    "/workspaces/:workspaceId/integrations/tilt/revoke",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceIdParamsSchema,
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
      const integration = await integrations.findWorkspaceIntegration(workspaceId, "tilt");
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Tilt integration not configured");
      }
      await integrations.revokeIntegration(integration.id);
      return IntegrationOkResponseSchema.parse({ ok: true });
    },
  );

  zodApp.get(
    "/workspaces/:workspaceId/integrations/tilt/devices",
    {
      schema: {
        tags: ["integrations"],
        params: IntegrationWorkspaceIdParamsSchema,
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
      const integration = await integrations.findWorkspaceIntegration(workspaceId, "tilt");
      if (!integration || integration.revokedAt) {
        return IntegrationDevicesListResponseSchema.parse({ ok: true, devices: [] });
      }

      const devices = await integrations.listIntegrationDevices(integration.id);

      return IntegrationDevicesListResponseSchema.parse({
        ok: true,
        devices: devices.map((d) => ({
          id: d.id,
          deviceKey: d.deviceKey,
          displayName: d.displayName,
          metadataJson: d.metadataJson ?? null,
          lastSeenAt: d.lastSeenAt,
          createdAt: d.createdAt,
          activeAttachment: d.attachments?.[0]
            ? {
                id: d.attachments[0].id,
                attachedAt: d.attachments[0].attachedAt,
                brewSession: d.attachments[0].brewSession,
              }
            : null,
          lastReading: d.readings?.[0] ?? null,
        })),
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
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      const { deviceId } = req.params;
      const { brewSessionId } = req.body;

      const integration = await integrations.findWorkspaceIntegration(workspaceId, "tilt");
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Tilt integration not configured");
      }

      await integrations.assertIntegrationDevice(integration.id, deviceId);
      await integrations.assertBrewSessionInWorkspace(workspaceId, brewSessionId);
      const created = await integrations.attachDeviceToBrewSession(deviceId, brewSessionId);

      return IntegrationDeviceAttachResponseSchema.parse({ ok: true, attachment: created });
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
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      const { deviceId } = req.params;

      const integration = await integrations.findWorkspaceIntegration(workspaceId, "tilt");
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Tilt integration not configured");
      }

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
      const { workspaceId } = await requireActiveWorkspaceParam(req);
      const limit = req.query.limit ?? 20;

      const sessions = await integrations.listRecentBrewSessions(workspaceId, limit);

      return BrewSessionsRecentResponseSchema.parse({ ok: true, brewSessions: sessions });
    },
  );
}
