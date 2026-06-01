import type { Recipe } from "@prisma/client";
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

import { BadRequestError } from "../errors.js";
import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";
import { RecipesService } from "../services/recipesService.js";
import {
  parseSingleImportContent,
  parseBulkImportContent,
  resolveBjcp2021Style,
  type ImportFormat,
} from "../services/recipesImportService.js";
import { validateBeerJsonDoc } from "../beerjson/index.js";
import { exportRecipeFull } from "../beerjson/strictExport.js";
import { isObject } from "../lib/typeGuards.js";

const RECIPES_IMPORT_SINGLE_MAX_BYTES = 1 * 1024 * 1024;
const RECIPES_IMPORT_BULK_MAX_BYTES = 5 * 1024 * 1024;

function safeFilenamePart(v: string) {
  const trimmed = v.trim();
  if (!trimmed) return "";
  return trimmed
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function platformRecipesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const recipes = new RecipesService(app.prisma);

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

      const list = await app.prisma.workspace.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
        take: 500,
      });
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
      const list = await recipes.listRecipesForWorkspace(workspaceId);
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

      const recipe = await recipes.getRecipeForWorkspace(recipeId, workspaceId);
      const full = exportRecipeFull(recipe);

      const namePart = safeFilenamePart(recipe.name ?? "");
      const filename = namePart ? `${namePart}.beerjson.json` : `recipe-${recipeId}.beerjson.json`;

      reply.header("Content-Type", "application/json; charset=utf-8");
      reply.header("Content-Disposition", `attachment; filename="${filename}"`);
      return full;
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
      const list = await recipes.listRecipesForWorkspace(workspaceId);
      const outRecipes: unknown[] = [];
      for (const r of list) {
        const full = exportRecipeFull(r);
        const beerjsonContainer = isObject(full.beerjson) ? full.beerjson : null;
        const innerBeerjson = isObject(beerjsonContainer?.["beerjson"]) ? beerjsonContainer["beerjson"] : null;
        const recipesArr: unknown[] = Array.isArray(innerBeerjson?.["recipes"]) ? innerBeerjson["recipes"] : [];
        const r0 = recipesArr[0] ?? null;
        if (r0) outRecipes.push(r0);
      }

      const doc = { beerjson: { version: 1, recipes: outRecipes } };

      reply.header("Content-Type", "application/json; charset=utf-8");
      reply.header("Content-Disposition", `attachment; filename="recipes.beerjson.json"`);
      return doc;
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
      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 1 MB for single recipe import.");
      }

      const mapped = parseSingleImportContent(format as ImportFormat, content);
      const v2 = validateBeerJsonDoc(mapped.beerJsonRecipeJson);
      if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v2.errors}`);

      return PlatformRecipeImportPreviewResponseSchema.parse({
        ok: true,
        format,
        preview: {
          name: mapped.recipeName,
          notes: mapped.notes,
          beerJsonRecipeJson: mapped.beerJsonRecipeJson,
          warnings: mapped.warnings,
        },
        workspaceId,
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
      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 1 MB for single recipe import.");
      }

      const mapped = parseSingleImportContent(format as ImportFormat, content);
      const created = await recipes.createRecipeForWorkspace(workspaceId, {
        name: mapped.recipeName,
        styleKey: styleKey ?? "custom",
        notes: mapped.notes,
        beerJsonRecipeJson: mapped.beerJsonRecipeJson,
        recipeExtJson: recipeExtJson === undefined || recipeExtJson === null ? undefined : recipeExtJson,
      });

      return PlatformRecipeImportResponseSchema.parse({
        ok: true,
        recipe: created,
        warnings: mapped.warnings,
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
      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_BULK_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 5 MB for bulk import.");
      }

      const items = parseBulkImportContent(format as ImportFormat, content);
      const previewItems = [];
      for (const it of items) {
        const resolved = await resolveBjcp2021Style(app.prisma, it.styleCandidate);
        previewItems.push({
          index: it.index,
          name: it.recipeName,
          notes: it.notes,
          resolvedStyleKey: resolved.styleKey,
          resolvedStyleName: resolved.styleName,
          resolvedStyleCode: resolved.styleCode,
          warnings: [...(it.warnings ?? []), ...resolved.warnings],
        });
      }

      return PlatformRecipeBulkImportPreviewResponseSchema.parse({
        ok: true,
        format,
        previewItems,
        workspaceId,
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
      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_BULK_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 5 MB for bulk import.");
      }

      const items = parseBulkImportContent(format as ImportFormat, content);
      type ImportedItem = (typeof items)[number];
      type CreatedRow = {
        index: number;
        recipeId: string;
        name: string;
        styleKey: string;
        style: Recipe["style"];
        warnings: ImportedItem["warnings"];
      };
      type FailedRow = { index: number; name: string; error: string };
      const created: CreatedRow[] = [];
      const failed: FailedRow[] = [];

      for (const it of items) {
        try {
          const resolved = await resolveBjcp2021Style(app.prisma, it.styleCandidate);
          const recipe = await recipes.createRecipeForWorkspace(workspaceId, {
            name: it.recipeName,
            styleKey: resolved.styleKey,
            notes: it.notes,
            beerJsonRecipeJson: it.beerJsonRecipeJson,
          });
          created.push({
            index: it.index,
            recipeId: recipe.id,
            name: recipe.name,
            styleKey: recipe.styleKey ?? "custom",
            style: recipe.style ?? null,
            warnings: [...(it.warnings ?? []), ...resolved.warnings],
          });
        } catch (err) {
          failed.push({ index: it.index, name: it.recipeName, error: String(err) });
        }
      }

      return PlatformRecipeBulkImportResponseSchema.parse({ ok: true, created, failed });
    },
  );
}
