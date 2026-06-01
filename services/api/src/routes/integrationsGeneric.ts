import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { IntegrationKind } from "@prisma/client";
import {
  ErrorResponseSchema,
  IntegrationCreateResponseSchema,
  IntegrationDevicesListResponseSchema,
  IntegrationDevicesQuerySchema,
  IntegrationGetResponseSchema,
  IntegrationOkResponseSchema,
  IntegrationWorkspaceKindParamsSchema,
} from "@umbraculum/contracts";

import { ForbiddenError, NotFoundError } from "../errors.js";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";

function integrationPublicPath(kind: IntegrationKind, token: string): string {
  return `/api/integrations/${kind}/${encodeURIComponent(token)}`;
}

export function integrationsGenericRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

  async function requireActiveWorkspaceParam(req: FastifyRequest): Promise<{ userId: string; workspaceId: string }> {
    const ctx = requireActiveWorkspace(req);
    const params = IntegrationWorkspaceKindParamsSchema.parse(req.params ?? {});
    const { workspaceId } = params;
    if (workspaceId !== ctx.activeWorkspaceId) {
      throw new ForbiddenError("workspace_mismatch", "Active workspace does not match requested workspace");
    }
    await workspaces.assertMembership(ctx.userId, workspaceId);
    return { userId: ctx.userId, workspaceId };
  }

  async function findIntegrationForWorkspace(workspaceId: string, kind: IntegrationKind) {
    return app.prisma.integration.findFirst({
      where: { workspaceId, kind },
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
      const { kind } = req.params;

      const integration = await findIntegrationForWorkspace(workspaceId, kind);
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
      const { kind } = req.params;

      const existing = await findIntegrationForWorkspace(workspaceId, kind);
      if (existing && !existing.revokedAt) {
        const rotated = await integrations.rotateIntegrationToken(existing.id);
        return IntegrationCreateResponseSchema.parse({
          ok: true,
          integrationId: existing.id,
          token: rotated.token,
          publicPath: integrationPublicPath(kind, rotated.token),
        });
      }

      const created = await integrations.createIntegration(workspaceId, kind);
      return IntegrationCreateResponseSchema.parse({
        ok: true,
        integrationId: created.integration.id,
        token: created.token,
        publicPath: integrationPublicPath(kind, created.token),
      });
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
      const { kind } = req.params;

      const integration = await findIntegrationForWorkspace(workspaceId, kind);
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Integration not configured");
      }
      const rotated = await integrations.rotateIntegrationToken(integration.id);
      return IntegrationCreateResponseSchema.parse({
        ok: true,
        integrationId: integration.id,
        token: rotated.token,
        publicPath: integrationPublicPath(kind, rotated.token),
      });
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
      const { kind } = req.params;

      const integration = await findIntegrationForWorkspace(workspaceId, kind);
      if (!integration || integration.revokedAt) {
        throw new NotFoundError("missing_integration", "Integration not configured");
      }
      await integrations.revokeIntegration(integration.id);
      return IntegrationOkResponseSchema.parse({ ok: true });
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
      const { kind } = req.params;
      const includeReadings = req.query.includeReadings ?? false;
      const readingsLimit = req.query.readingsLimit ?? 50;
      const readingsTake = includeReadings ? readingsLimit : 1;

      const integration = await findIntegrationForWorkspace(workspaceId, kind);
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
            take: readingsTake,
            select: {
              id: true,
              brewSessionId: true,
              recordedAt: true,
              receivedAt: true,
              temperatureC: true,
              gravitySg: true,
            },
          },
        },
      });

      return IntegrationDevicesListResponseSchema.parse({
        ok: true,
        devices: devices.map((d) => {
          const lastReading = d.readings?.[0] ?? null;
          const recentReadings = includeReadings ? (d.readings ?? []) : null;
          return {
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
            lastReading,
            recentReadings,
          };
        }),
      });
    },
  );
}
