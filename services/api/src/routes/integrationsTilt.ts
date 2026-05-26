import type { FastifyInstance, FastifyRequest } from "fastify";

import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";

function assertWorkspaceId(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) throw new BadRequestError("invalid_workspace_id", "Params.workspaceId is required");
  return s;
}

function assertLimit(v: unknown): number {
  const raw = typeof v === "string" ? v.trim() : "";
  const n = raw ? Number.parseInt(raw, 10) : 20;
  if (!Number.isFinite(n) || Number.isNaN(n)) return 20;
  return Math.max(1, Math.min(100, n));
}

function integrationPublicPath(token: string): string {
  // Nginx exposes the API at /api/* and rewrites to the Fastify root.
  return `/api/integrations/tilt/${encodeURIComponent(token)}`;
}

export function integrationsTiltRoutes(app: FastifyInstance) {
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

  async function requireActiveWorkspaceParam(req: FastifyRequest): Promise<{ userId: string; workspaceId: string }> {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { workspaceId?: unknown };
    const workspaceId = assertWorkspaceId(params.workspaceId);
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

  app.get("/workspaces/:workspaceId/integrations/tilt", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);

    const integration = await findTiltIntegrationForWorkspace(workspaceId);
    return {
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
    };
  });

  app.post("/workspaces/:workspaceId/integrations/tilt", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);

    const existing = await findTiltIntegrationForWorkspace(workspaceId);
    if (existing && !existing.revokedAt) {
      const rotated = await integrations.rotateIntegrationToken(existing.id);
      return {
        ok: true,
        integrationId: existing.id,
        token: rotated.token,
        publicPath: integrationPublicPath(rotated.token),
      };
    }

    const created = await integrations.createIntegration(workspaceId, "tilt");
    return {
      ok: true,
      integrationId: created.integration.id,
      token: created.token,
      publicPath: integrationPublicPath(created.token),
    };
  });

  app.post("/workspaces/:workspaceId/integrations/tilt/rotate-token", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const integration = await findTiltIntegrationForWorkspace(workspaceId);
    if (!integration || integration.revokedAt) {
      throw new NotFoundError("missing_integration", "Tilt integration not configured");
    }
    const rotated = await integrations.rotateIntegrationToken(integration.id);
    return { ok: true, integrationId: integration.id, token: rotated.token, publicPath: integrationPublicPath(rotated.token) };
  });

  app.post("/workspaces/:workspaceId/integrations/tilt/revoke", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const integration = await findTiltIntegrationForWorkspace(workspaceId);
    if (!integration || integration.revokedAt) {
      throw new NotFoundError("missing_integration", "Tilt integration not configured");
    }
    await integrations.revokeIntegration(integration.id);
    return { ok: true };
  });

  app.get("/workspaces/:workspaceId/integrations/tilt/devices", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const integration = await findTiltIntegrationForWorkspace(workspaceId);
    if (!integration || integration.revokedAt) {
      return { ok: true, devices: [] };
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

    return {
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
    };
  });

  app.post("/workspaces/:workspaceId/integrations/tilt/devices/:deviceId/attach", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const params = (req.params ?? {}) as { deviceId?: unknown };
    const deviceId = typeof params.deviceId === "string" ? params.deviceId : "";
    if (!deviceId) throw new BadRequestError("invalid_device_id", "Params.deviceId is required");

    const integration = await findTiltIntegrationForWorkspace(workspaceId);
    if (!integration || integration.revokedAt) {
      throw new NotFoundError("missing_integration", "Tilt integration not configured");
    }

    const device = await app.prisma.integrationDevice.findFirst({
      where: { id: deviceId, integrationId: integration.id },
      select: { id: true },
    });
    if (!device) throw new NotFoundError("missing_device", "Device not found");

    const body = (req.body ?? {}) as { brewSessionId?: unknown };
    const brewSessionId = typeof body.brewSessionId === "string" ? body.brewSessionId.trim() : "";
    if (!brewSessionId) throw new BadRequestError("invalid_brew_session_id", "Body.brewSessionId is required");

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

    return { ok: true, attachment: created };
  });

  app.post("/workspaces/:workspaceId/integrations/tilt/devices/:deviceId/detach", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const params = (req.params ?? {}) as { deviceId?: unknown };
    const deviceId = typeof params.deviceId === "string" ? params.deviceId : "";
    if (!deviceId) throw new BadRequestError("invalid_device_id", "Params.deviceId is required");

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

    return { ok: true, detachedCount: res.count };
  });

  app.get("/workspaces/:workspaceId/brew-sessions/recent", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const query = (req.query ?? {}) as { limit?: unknown };
    const limit = assertLimit(query.limit);

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

    return { ok: true, brewSessions: sessions };
  });
}

