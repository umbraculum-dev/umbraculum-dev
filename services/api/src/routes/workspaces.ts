import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ActiveWorkspaceContextResponseSchema,
  ContextMeResponseSchema,
  ErrorResponseSchema,
  WorkspaceBrandPatchRequestSchema,
  WorkspaceBrandPatchResponseSchema,
  WorkspaceCreateRequestSchema,
  WorkspaceCreateResponseSchema,
  WorkspaceIdParamsSchema,
  WorkspacesListResponseSchema,
} from "@umbraculum/contracts";

import { BadRequestError } from "../errors.js";
import { requireActiveWorkspace, requireUser } from "../plugins/requestContext.js";
import { WorkspacesService } from "../services/workspacesService.js";

export function workspacesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const workspaces = new WorkspacesService(app.prisma);

  zodApp.get(
    "/me",
    {
      schema: {
        tags: ["platform"],
        response: {
          200: ContextMeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const role = ctx.activeWorkspaceId
        ? await workspaces.getMembershipRole(ctx.userId, ctx.activeWorkspaceId)
        : null;

      return ContextMeResponseSchema.parse({
        ok: true,
        userId: ctx.userId,
        activeWorkspaceId: ctx.activeWorkspaceId,
        role,
      });
    },
  );

  zodApp.get(
    "/workspaces",
    {
      schema: {
        tags: ["platform"],
        response: {
          200: WorkspacesListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const list = await workspaces.listWorkspacesForUser(ctx.userId);
      return WorkspacesListResponseSchema.parse({ ok: true, workspaces: list });
    },
  );

  zodApp.post(
    "/workspaces",
    {
      schema: {
        tags: ["platform"],
        body: WorkspaceCreateRequestSchema,
        response: {
          200: WorkspaceCreateResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const created = await workspaces.createWorkspaceForUser(ctx.userId, req.body.name);
      return WorkspaceCreateResponseSchema.parse({ ok: true, workspace: created });
    },
  );

  zodApp.patch(
    "/workspaces/:id/brand",
    {
      schema: {
        tags: ["platform"],
        params: WorkspaceIdParamsSchema,
        body: WorkspaceBrandPatchRequestSchema,
        response: {
          200: WorkspaceBrandPatchResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const workspaceId = req.params.id;

      const role = await workspaces.assertMembership(ctx.userId, workspaceId);
      if (role !== "brewery_admin") {
        throw new BadRequestError("not_admin", "Admin role required");
      }

      const updated = await workspaces.patchBrandKey(workspaceId, req.body.brandKey);
      return WorkspaceBrandPatchResponseSchema.parse({ ok: true, workspace: updated });
    },
  );

  zodApp.get(
    "/workspaces/active",
    {
      schema: {
        tags: ["platform"],
        response: {
          200: ActiveWorkspaceContextResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const role = await workspaces.assertMembership(ctx.userId, ctx.activeWorkspaceId);
      return ActiveWorkspaceContextResponseSchema.parse({
        ok: true,
        activeWorkspaceId: ctx.activeWorkspaceId,
        role,
      });
    },
  );
}
