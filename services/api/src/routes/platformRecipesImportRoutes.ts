import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  PlatformRecipeBulkImportPreviewRequestSchema,
  PlatformRecipeBulkImportPreviewResponseSchema,
  PlatformRecipeBulkImportRequestSchema,
  PlatformRecipeBulkImportResponseSchema,
  PlatformRecipeImportPreviewRequestSchema,
  PlatformRecipeImportPreviewResponseSchema,
  PlatformRecipeImportRequestSchema,
  PlatformRecipeImportResponseSchema,
} from "@umbraculum/contracts";

import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";
import {
  RECIPES_IMPORT_BULK_MAX_BYTES,
  RECIPES_IMPORT_SINGLE_MAX_BYTES,
} from "../services/platformRecipesService.js";
import type { PlatformRecipesService } from "../services/platformRecipesService.js";
import type { ImportFormat } from "../services/recipesImportService.js";

export function registerPlatformRecipesImportRoutes(
  app: FastifyInstance,
  platformRecipes: PlatformRecipesService,
) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

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
