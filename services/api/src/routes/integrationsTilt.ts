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

  async function findTiltIntegrationForWorkspace(workspaceId: string) {
    return app.prisma.integration.findFirst({
      where: { workspaceId, kind: "tilt" },
      orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        workspaceId: true,
        kind: true,
        revokedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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

      const integration = await findTiltIntegrationForWorkspace(workspaceId);
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

      const existing = await findTiltIntegrationForWorkspace(workspaceId);
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
      const integration = await findTiltIntegrationForWorkspace(workspaceId);
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
      const integration = await findTiltIntegrationForWorkspace(workspaceId);
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
      const integration = await findTiltIntegrationForWorkspace(workspaceId);
      if (!integration || integration.revokedAt) {
        return IntegrationDevicesListResponseSchema.parse({ ok: true, devices: [] });
      }

      const devices = await app.prisma.integrationDevice.findMany({
        where: { integrationId: integration.id },
        orderBy: [{ lastSeenAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          deviceKey: true,
          displayName: true,
          metadataJson: true,
          lastSeenAt: true,
          createdAt: true,
          attachments: {
            where: { detachedAt: null },
            orderBy: [{ attachedAt: "desc" }, { id: "desc" }],
            take: 1,
            select: {
              id: true,
              attachedAt: true,
              brewSession: {
                select: {
                  id: true,
                  code: true,
                  status: true,
                  createdAt: true,
                  startedAt: true,
                  recipe: { select: { id: true, name: true, version: true } },
                },
              },
            },
          },
          readings: {
            orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
            take: 1,
            select: {
              id: true,
              brewSessionId: true,
              recordedAt: true,
              receivedAt: true,
              temperatureC: true,
              gravitySg: true,
              rawJson: true,
            },
          },
        },
      });

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

      const integration = await findTiltIntegrationForWorkspace(workspaceId);
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Tilt integration not configured");
      }

      const device = await app.prisma.integrationDevice.findFirst({
        where: { id: deviceId, integrationId: integration.id },
        select: { id: true },
      });
      if (!device) throw new NotFoundError("missing_device", "Device not found");

      const session = await app.prisma.brewSession.findFirst({
        where: { id: brewSessionId, workspaceId },
        select: { id: true },
      });
      if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");

      const now = new Date();
      await app.prisma.integrationDeviceAttachment.updateMany({
        where: { deviceId, detachedAt: null },
        data: { detachedAt: now },
      });
      const created = await app.prisma.integrationDeviceAttachment.create({
        data: { deviceId, brewSessionId, attachedAt: now },
        select: { id: true, attachedAt: true, brewSessionId: true },
      });

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

      const integration = await findTiltIntegrationForWorkspace(workspaceId);
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Tilt integration not configured");
      }

      const device = await app.prisma.integrationDevice.findFirst({
        where: { id: deviceId, integrationId: integration.id },
        select: { id: true },
      });
      if (!device) throw new NotFoundError("missing_device", "Device not found");

      const now = new Date();
      const res = await app.prisma.integrationDeviceAttachment.updateMany({
        where: { deviceId, detachedAt: null },
        data: { detachedAt: now },
      });

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

      const sessions = await app.prisma.brewSession.findMany({
        where: { workspaceId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        select: {
          id: true,
          recipeId: true,
          code: true,
          status: true,
          startedAt: true,
          pausedAt: true,
          stoppedAt: true,
          scheduledDate: true,
          createdAt: true,
          recipe: { select: { id: true, name: true, version: true } },
        },
      });

      return BrewSessionsRecentResponseSchema.parse({ ok: true, brewSessions: sessions });
    },
  );
}
