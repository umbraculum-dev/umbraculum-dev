import type { FastifyInstance } from "fastify";
import { BadRequestError } from "../errors.js";
import { requireActiveWorkspace, requireUser } from "../plugins/requestContext.js";
import { WorkspacesService } from "../services/workspacesService.js";

const ALLOWED_BRAND_KEYS = ["default", "acme", "forest"] as const;
type BrandKey = (typeof ALLOWED_BRAND_KEYS)[number];

function assertBrandKey(v: unknown): BrandKey {
  return typeof v === "string" && (ALLOWED_BRAND_KEYS as readonly string[]).includes(v) ? (v as BrandKey) : "default";
}

export async function workspacesRoutes(app: FastifyInstance) {
  const workspaces = new WorkspacesService(app.prisma);

  app.get("/me", async (req) => {
    const ctx = requireUser(req);
    const role = ctx.activeWorkspaceId ? await workspaces.getMembershipRole(ctx.userId, ctx.activeWorkspaceId) : null;

    return {
      ok: true,
      userId: ctx.userId,
      activeWorkspaceId: ctx.activeWorkspaceId,
      role,
    };
  });

  app.get("/workspaces", async (req) => {
    const ctx = requireUser(req);
    const list = await workspaces.listWorkspacesForUser(ctx.userId);
    return { ok: true, workspaces: list };
  });

  app.post("/workspaces", async (req) => {
    const ctx = requireUser(req);
    const body = (req.body ?? {}) as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    const created = await workspaces.createWorkspaceForUser(ctx.userId, name);
    return { ok: true, workspace: created };
  });

  app.patch("/workspaces/:id/brand", async (req) => {
    const ctx = requireUser(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const workspaceId = typeof params.id === "string" ? params.id : "";
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Params.id is required");

    const role = await workspaces.assertMembership(ctx.userId, workspaceId);
    if (role !== "brewery_admin") {
      throw new BadRequestError("not_admin", "Admin role required");
    }

    const body = (req.body ?? {}) as { brandKey?: unknown };
    const brandKey = assertBrandKey(body.brandKey);

    const updated = await app.prisma.workspace.update({
      where: { id: workspaceId },
      data: { brandKey },
      select: { id: true, name: true, brandKey: true },
    });
    return { ok: true, workspace: updated };
  });

  // Example workspace-scoped endpoint pattern (not used yet):
  app.get("/workspaces/active", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const role = await workspaces.assertMembership(ctx.userId, ctx.activeWorkspaceId);
    return { ok: true, activeWorkspaceId: ctx.activeWorkspaceId, role };
  });
}

