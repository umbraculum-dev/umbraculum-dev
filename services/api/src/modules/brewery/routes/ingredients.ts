import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  FermentablesListResponseSchema,
  HopsListResponseSchema,
  IngredientSyncResponseSchema,
  IngredientSyncRunsResponseSchema,
  IngredientsSearchQuerySchema,
  YeastsListResponseSchema,
} from "@umbraculum/contracts";

import { ForbiddenError } from "../../../errors.js";
import { requireActiveWorkspace, requireUser } from "../../../plugins/requestContext.js";
import { WorkspacesService } from "../../../services/workspacesService.js";
import { IngredientsService } from "../services/ingredients/ingredientsService.js";

function isAdminRole(role: string | null) {
  return role === "brewery_admin";
}

export function ingredientsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const workspaces = new WorkspacesService(app.prisma);
  const ingredients = new IngredientsService(app.prisma);

  zodApp.get(
    "/ingredients/fermentables",
    {
      schema: {
        tags: ["brewery"],
        querystring: IngredientsSearchQuerySchema,
        response: {
          200: FermentablesListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const result = await ingredients.searchFermentables(ctx.activeWorkspaceId, req.query);
      return FermentablesListResponseSchema.parse({ ok: true, ...result });
    },
  );

  zodApp.get(
    "/ingredients/hops",
    {
      schema: {
        tags: ["brewery"],
        querystring: IngredientsSearchQuerySchema,
        response: {
          200: HopsListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const result = await ingredients.searchHops(ctx.activeWorkspaceId, req.query);
      return HopsListResponseSchema.parse({ ok: true, ...result });
    },
  );

  zodApp.get(
    "/ingredients/yeasts",
    {
      schema: {
        tags: ["brewery"],
        querystring: IngredientsSearchQuerySchema.pick({ query: true }),
        response: {
          200: YeastsListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const result = await ingredients.listYeasts(ctx.activeWorkspaceId, req.query);
      return YeastsListResponseSchema.parse({ ok: true, ...result });
    },
  );

  zodApp.get(
    "/admin/ingredients/sync-runs",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: IngredientSyncRunsResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const role = await workspaces.assertMembership(ctx.userId, ctx.activeWorkspaceId);
      if (!isAdminRole(role)) throw new ForbiddenError("not_admin", "Admin role required");

      const runs = await ingredients.listSyncRuns();
      return IngredientSyncRunsResponseSchema.parse({ ok: true, runs });
    },
  );

  zodApp.post(
    "/admin/ingredients/sync",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: IngredientSyncResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const role = await workspaces.assertMembership(ctx.userId, ctx.activeWorkspaceId);
      if (!isAdminRole(role)) throw new ForbiddenError("not_admin", "Admin role required");

      const result = await ingredients.runBeerprotoSync();
      return IngredientSyncResponseSchema.parse({ ok: true, result });
    },
  );
}
