import type { FastifyInstance } from "fastify";

import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { IntegrationsService } from "../services/integrationsService.js";
import { WorkspacesService } from "../services/workspacesService.js";

function assertWorkspaceId(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) throw new BadRequestError("invalid_workspace_id", "Params.workspaceId is required");
  return s;
}

function assertKind(v: unknown): "tilt" {
  const s = typeof v === "string" ? v.trim() : "";
  if (s === "tilt") return "tilt";
  throw new BadRequestError("invalid_integration_kind", "Params.kind is invalid");
}

function integrationPublicPath(kind: string, token: string): string {
  return `/api/integrations/${encodeURIComponent(kind)}/${encodeURIComponent(token)}`;
}

export async function integrationsRevealRoutes(app: FastifyInstance) {
  const integrations = new IntegrationsService(app.prisma);
  const workspaces = new WorkspacesService(app.prisma);

  app.get("/workspaces/:workspaceId/integrations/:kind/reveal", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { workspaceId?: unknown; kind?: unknown };
    const workspaceId = assertWorkspaceId(params.workspaceId);
    const kind = assertKind(params.kind);

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

    return {
      ok: true,
      integrationId: integration.id,
      kind,
      token,
      publicPath: integrationPublicPath(kind, token),
    };
  });

  // Convenience alias for existing UI paths.
  app.get("/workspaces/:workspaceId/integrations/tilt/reveal", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { workspaceId?: unknown };
    const workspaceId = assertWorkspaceId(params.workspaceId);

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

    return {
      ok: true,
      integrationId: integration.id,
      kind: "tilt",
      token,
      publicPath: integrationPublicPath("tilt", token),
    };
  });
}

