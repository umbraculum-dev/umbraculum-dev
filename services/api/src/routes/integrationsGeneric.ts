import type { FastifyInstance, FastifyRequest } from "fastify";
import type { IntegrationKind } from "@prisma/client";

import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";

const SUPPORTED_KINDS: IntegrationKind[] = ["tilt", "ispindel", "rapt"];

function assertWorkspaceId(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) throw new BadRequestError("invalid_workspace_id", "Params.workspaceId is required");
  return s;
}

function assertIntegrationKind(v: unknown): IntegrationKind {
  const raw = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!raw) throw new BadRequestError("invalid_integration_kind", "Params.kind is required");
  if (!SUPPORTED_KINDS.includes(raw as IntegrationKind)) {
    throw new BadRequestError("invalid_integration_kind", "Integration kind is not supported");
  }
  return raw as IntegrationKind;
}

function assertLimit(v: unknown, fallback = 20, max = 200): number {
  const raw = typeof v === "string" ? v.trim() : "";
  const n = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.max(1, Math.min(max, n));
}

function readBoolean(v: unknown): boolean {
  if (v === true || v === "true" || v === "1") return true;
  return false;
}

function integrationPublicPath(kind: IntegrationKind, token: string): string {
  return `/api/integrations/${kind}/${encodeURIComponent(token)}`;
}

export function integrationsGenericRoutes(app: FastifyInstance) {
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

  app.get("/workspaces/:workspaceId/integrations/:kind", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const params = (req.params ?? {}) as { kind?: unknown };
    const kind = assertIntegrationKind(params.kind);

    const integration = await findIntegrationForWorkspace(workspaceId, kind);
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

  app.post("/workspaces/:workspaceId/integrations/:kind", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const params = (req.params ?? {}) as { kind?: unknown };
    const kind = assertIntegrationKind(params.kind);

    const existing = await findIntegrationForWorkspace(workspaceId, kind);
    if (existing && !existing.revokedAt) {
      const rotated = await integrations.rotateIntegrationToken(existing.id);
      return {
        ok: true,
        integrationId: existing.id,
        token: rotated.token,
        publicPath: integrationPublicPath(kind, rotated.token),
      };
    }

    const created = await integrations.createIntegration(workspaceId, kind);
    return {
      ok: true,
      integrationId: created.integration.id,
      token: created.token,
      publicPath: integrationPublicPath(kind, created.token),
    };
  });

  app.post("/workspaces/:workspaceId/integrations/:kind/rotate-token", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const params = (req.params ?? {}) as { kind?: unknown };
    const kind = assertIntegrationKind(params.kind);

    const integration = await findIntegrationForWorkspace(workspaceId, kind);
    if (!integration || integration.revokedAt) {
      throw new NotFoundError("missing_integration", "Integration not configured");
    }
    const rotated = await integrations.rotateIntegrationToken(integration.id);
    return { ok: true, integrationId: integration.id, token: rotated.token, publicPath: integrationPublicPath(kind, rotated.token) };
  });

  app.post("/workspaces/:workspaceId/integrations/:kind/revoke", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const params = (req.params ?? {}) as { kind?: unknown };
    const kind = assertIntegrationKind(params.kind);

    const integration = await findIntegrationForWorkspace(workspaceId, kind);
    if (!integration || integration.revokedAt) {
      throw new NotFoundError("missing_integration", "Integration not configured");
    }
    await integrations.revokeIntegration(integration.id);
    return { ok: true };
  });

  app.get("/workspaces/:workspaceId/integrations/:kind/devices", async (req) => {
    const { workspaceId } = await requireActiveWorkspaceParam(req);
    const params = (req.params ?? {}) as { kind?: unknown };
    const kind = assertIntegrationKind(params.kind);
    const query = (req.query ?? {}) as { includeReadings?: unknown; readingsLimit?: unknown };
    const includeReadings = readBoolean(query.includeReadings);
    const readingsLimit = assertLimit(query.readingsLimit, 50, 200);
    const readingsTake = includeReadings ? readingsLimit : 1;

    const integration = await findIntegrationForWorkspace(workspaceId, kind);
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

    return {
      ok: true,
      devices: devices.map((d) => {
        const lastReading = d.readings?.[0] ?? null;
        const recentReadings = includeReadings ? d.readings ?? [] : null;
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
    };
  });
}
