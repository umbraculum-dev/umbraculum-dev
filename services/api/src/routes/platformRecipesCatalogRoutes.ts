import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  PlatformRecipesListQuerySchema,
  PlatformRecipesListResponseSchema,
  PlatformWorkspacesListResponseSchema,
} from "@umbraculum/contracts";

import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";
import type { PlatformRecipesService } from "../services/platformRecipesService.js";

export function registerPlatformRecipesCatalogRoutes(
  app: FastifyInstance,
  platformRecipes: PlatformRecipesService,
) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

  zodApp.get(
    "/platform/workspaces",
    {
      schema: {
        tags: ["platform-admin"],
        response: {
          200: PlatformWorkspacesListResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);
      const list = await platformRecipes.listWorkspaces();
      return PlatformWorkspacesListResponseSchema.parse({ ok: true, workspaces: list });
    },
  );

  zodApp.get(
    "/platform/recipes/list",
    {
      schema: {
        tags: ["platform-admin"],
        querystring: PlatformRecipesListQuerySchema,
        response: {
          200: PlatformRecipesListResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);

      const { workspaceId } = req.query;
      const list = await platformRecipes.listRecipesForWorkspace(workspaceId);
      return PlatformRecipesListResponseSchema.parse({ ok: true, recipes: list });
    },
  );
}
