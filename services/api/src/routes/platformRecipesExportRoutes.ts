import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  BeerJsonLooseSchema,
  ErrorResponseSchema,
  PlatformRecipeExportQuerySchema,
  PlatformRecipeIdParamsSchema,
} from "@umbraculum/contracts";

import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";
import type { PlatformRecipesService } from "../services/platformRecipesService.js";

export function registerPlatformRecipesExportRoutes(
  app: FastifyInstance,
  platformRecipes: PlatformRecipesService,
) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

  zodApp.get(
    "/platform/recipes/:id/export/beerjson",
    {
      schema: {
        tags: ["platform-admin"],
        params: PlatformRecipeIdParamsSchema,
        querystring: PlatformRecipeExportQuerySchema,
        response: {
          200: BeerJsonLooseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);

      const { id: recipeId } = req.params;
      const { workspaceId } = req.query;

      const exported = await platformRecipes.exportRecipeBeerJson(recipeId, workspaceId);

      reply.header("Content-Type", "application/json; charset=utf-8");
      reply.header("Content-Disposition", `attachment; filename="${exported.filename}"`);
      return exported.doc;
    },
  );

  zodApp.get(
    "/platform/recipes/export/beerjson",
    {
      schema: {
        tags: ["platform-admin"],
        querystring: PlatformRecipeExportQuerySchema,
        response: {
          200: BeerJsonLooseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);

      const { workspaceId } = req.query;
      const exported = await platformRecipes.exportRecipesBeerJson(workspaceId);

      reply.header("Content-Type", "application/json; charset=utf-8");
      reply.header("Content-Disposition", `attachment; filename="${exported.filename}"`);
      return exported.doc;
    },
  );
}
