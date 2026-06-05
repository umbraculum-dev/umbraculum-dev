import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  BeerJsonLooseSchema,
  ErrorResponseSchema,
  PlatformRecipeBulkImportPreviewRequestSchema,
  PlatformRecipeBulkImportPreviewResponseSchema,
  PlatformRecipeBulkImportRequestSchema,
  PlatformRecipeBulkImportResponseSchema,
  PlatformRecipeExportQuerySchema,
  PlatformRecipeIdParamsSchema,
  PlatformRecipeImportPreviewRequestSchema,
  PlatformRecipeImportPreviewResponseSchema,
  PlatformRecipeImportRequestSchema,
  PlatformRecipeImportResponseSchema,
  PlatformRecipesListQuerySchema,
  PlatformRecipesListResponseSchema,
  PlatformWorkspacesListResponseSchema,
} from "@umbraculum/contracts";

import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";
import {
  PlatformRecipesService,
  RECIPES_IMPORT_BULK_MAX_BYTES,
  RECIPES_IMPORT_SINGLE_MAX_BYTES,
} from "../services/platformRecipesService.js";
import type { ImportFormat } from "../services/recipesImportService.js";

export function platformRecipesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const platformRecipes = new PlatformRecipesService(app.prisma);

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

  zodApp.post(
    "/platform/recipes/import/preview",
    {
      bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES,
      schema: {
        tags: ["platform-admin"],
        body: PlatformRecipeImportPreviewRequestSchema,
        response: {
          200: PlatformRecipeImportPreviewResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);

      const { format, content, workspaceId } = req.body;
      const preview = platformRecipes.previewSingleImport(format as ImportFormat, content, workspaceId);

      return PlatformRecipeImportPreviewResponseSchema.parse({
        ok: true,
        ...preview,
      });
    },
  );

  zodApp.post(
    "/platform/recipes/import",
    {
      bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES,
      schema: {
        tags: ["platform-admin"],
        body: PlatformRecipeImportRequestSchema,
        response: {
          200: PlatformRecipeImportResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);

      const { format, content, styleKey, workspaceId, recipeExtJson } = req.body;
      const imported = await platformRecipes.importSingleRecipe({
        format: format as ImportFormat,
        content,
        styleKey: styleKey ?? null,
        workspaceId,
        recipeExtJson,
      });

      return PlatformRecipeImportResponseSchema.parse({
        ok: true,
        ...imported,
      });
    },
  );

  zodApp.post(
    "/platform/recipes/import/bulk/preview",
    {
      bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES,
      schema: {
        tags: ["platform-admin"],
        body: PlatformRecipeBulkImportPreviewRequestSchema,
        response: {
          200: PlatformRecipeBulkImportPreviewResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);

      const { format, content, workspaceId } = req.body;
      const preview = await platformRecipes.previewBulkImport(format as ImportFormat, content, workspaceId);

      return PlatformRecipeBulkImportPreviewResponseSchema.parse({
        ok: true,
        ...preview,
      });
    },
  );

  zodApp.post(
    "/platform/recipes/import/bulk",
    {
      bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES,
      schema: {
        tags: ["platform-admin"],
        body: PlatformRecipeBulkImportRequestSchema,
        response: {
          200: PlatformRecipeBulkImportResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);

      const { format, content, workspaceId } = req.body;
      const imported = await platformRecipes.importBulkRecipes(format as ImportFormat, content, workspaceId);

      return PlatformRecipeBulkImportResponseSchema.parse({ ok: true, ...imported });
    },
  );
}
