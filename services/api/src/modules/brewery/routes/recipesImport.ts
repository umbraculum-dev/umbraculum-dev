import type { FastifyInstance } from "fastify";
import type { Recipe } from "@prisma/client";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { RecipeBulkImportPreviewResponseSchema, RecipeBulkImportRequestSchema, RecipeBulkImportResponseSchema, RecipeImportPreviewResponseSchema, RecipeImportRequestSchema, RecipeImportResponseSchema } from "@umbraculum/brewery-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { BadRequestError } from "../../../errors.js";
import { RecipesService } from "../services/recipesService.js";
import { RecipesImportService } from "../services/recipes/recipesImportOps.js";
import {
  parseSingleImportContent,
  parseBulkImportContent,
  type ImportFormat,
} from "../services/recipesImportService.js";
import { validateBeerJsonDoc } from "../../../beerjson/index.js";

const RECIPES_IMPORT_SINGLE_MAX_BYTES = 1 * 1024 * 1024;
const RECIPES_IMPORT_BULK_MAX_BYTES = 5 * 1024 * 1024;

export function recipesImportRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const recipes = new RecipesService(app.prisma);
  const recipeImport = new RecipesImportService(app.prisma);

  zodApp.post(
    "/recipes/import/preview",
    {
      bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES,
      schema: {
        tags: ["brewery"],
        body: RecipeImportRequestSchema,
        response: {
          200: RecipeImportPreviewResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const format = body.format as ImportFormat;
      const content = body.content;
      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 1 MB for single recipe import.");
      }

      const mapped = parseSingleImportContent(format, content);
      const v2 = validateBeerJsonDoc(mapped.beerJsonRecipeJson);
      if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v2.errors}`);

      return RecipeImportPreviewResponseSchema.parse({
        ok: true,
        format,
        preview: {
          name: mapped.recipeName,
          notes: mapped.notes,
          beerJsonRecipeJson: mapped.beerJsonRecipeJson,
          warnings: mapped.warnings,
        },
        workspaceId: ctx.activeWorkspaceId,
      });
    },
  );

  zodApp.post(
    "/recipes/import",
    {
      bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES,
      schema: {
        tags: ["brewery"],
        body: RecipeImportRequestSchema,
        response: {
          200: RecipeImportResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const format = body.format as ImportFormat;
      const content = body.content;
      const styleKey = body.styleKey ?? "custom";

      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 1 MB for single recipe import.");
      }

      const mapped = parseSingleImportContent(format, content);
      const created = await recipes.createRecipe(ctx.userId, ctx.activeWorkspaceId, {
        name: mapped.recipeName,
        styleKey,
        notes: mapped.notes,
        beerJsonRecipeJson: mapped.beerJsonRecipeJson,
      });

      return RecipeImportResponseSchema.parse({ ok: true, recipe: created, warnings: mapped.warnings });
    },
  );

  zodApp.post(
    "/recipes/import/bulk/preview",
    {
      bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES,
      schema: {
        tags: ["brewery"],
        body: RecipeBulkImportRequestSchema,
        response: {
          200: RecipeBulkImportPreviewResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const format = body.format as ImportFormat;
      const content = body.content;
      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_BULK_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 5 MB for bulk import.");
      }

      const items = parseBulkImportContent(format, content);
      const previewItems = [];
      for (const it of items) {
        const resolved = await recipeImport.resolveStyle(it.styleCandidate);
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

      return RecipeBulkImportPreviewResponseSchema.parse({
        ok: true,
        format,
        previewItems,
        workspaceId: ctx.activeWorkspaceId,
      });
    },
  );

  zodApp.post(
    "/recipes/import/bulk",
    {
      bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES,
      schema: {
        tags: ["brewery"],
        body: RecipeBulkImportRequestSchema,
        response: {
          200: RecipeBulkImportResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const format = body.format as ImportFormat;
      const content = body.content;
      if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_BULK_MAX_BYTES) {
        throw new BadRequestError("file_too_large", "File too large. Maximum size is 5 MB for bulk import.");
      }

      const items = parseBulkImportContent(format, content);
      type ImportedItem = (typeof items)[number];
      type CreatedRow = {
        index: number;
        recipeId: string;
        name: string;
        styleKey: string;
        style: Recipe["style"] | null;
        warnings: ImportedItem["warnings"];
      };
      type FailedRow = { index: number; name: string; error: string };
      const created: CreatedRow[] = [];
      const failed: FailedRow[] = [];

      for (const it of items) {
        try {
          const resolved = await recipeImport.resolveStyle(it.styleCandidate);
          const recipe = await recipes.createRecipe(ctx.userId, ctx.activeWorkspaceId, {
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

      return RecipeBulkImportResponseSchema.parse({ ok: true, created, failed });
    },
  );
}
