import type { FastifyInstance } from "fastify";
import type { Recipe } from "@prisma/client";
import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { BadRequestError } from "../../../errors.js";
import { RecipesService } from "../../../services/recipesService.js";
import {
  parseSingleImportContent,
  parseBulkImportContent,
  resolveBjcp2021Style,
  type ImportFormat,
} from "../../../services/recipesImportService.js";
import { validateBeerJsonDoc } from "../../../beerjson/index.js";

const RECIPES_IMPORT_SINGLE_MAX_BYTES = 1 * 1024 * 1024;
const RECIPES_IMPORT_BULK_MAX_BYTES = 5 * 1024 * 1024;

export function recipesImportRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

  app.post("/recipes/import/preview", { bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES }, (req) => {
    const ctx = requireActiveWorkspace(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
    if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
      throw new BadRequestError("file_too_large", "File too large. Maximum size is 1 MB for single recipe import.");
    }

    const mapped = parseSingleImportContent(format, content);
    const v2 = validateBeerJsonDoc(mapped.beerJsonRecipeJson);
    if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v2.errors}`);

    return {
      ok: true,
      format,
      preview: {
        name: mapped.recipeName,
        notes: mapped.notes,
        beerJsonRecipeJson: mapped.beerJsonRecipeJson,
        warnings: mapped.warnings,
      },
      workspaceId: ctx.activeWorkspaceId,
    };
  });

  app.post("/recipes/import", { bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES }, async (req) => {
    const ctx = requireActiveWorkspace(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown; styleKey?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    const styleKey = typeof body.styleKey === "string" ? body.styleKey : "custom";

    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
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

    return { ok: true, recipe: created, warnings: mapped.warnings };
  });

  app.post("/recipes/import/bulk/preview", { bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES }, async (req) => {
    const ctx = requireActiveWorkspace(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
    if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_BULK_MAX_BYTES) {
      throw new BadRequestError("file_too_large", "File too large. Maximum size is 5 MB for bulk import.");
    }

    const items = parseBulkImportContent(format, content);
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

    return { ok: true, format, previewItems, workspaceId: ctx.activeWorkspaceId };
  });

  app.post("/recipes/import/bulk", { bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES }, async (req) => {
    const ctx = requireActiveWorkspace(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
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
        const resolved = await resolveBjcp2021Style(app.prisma, it.styleCandidate);
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

    return { ok: true, created, failed };
  });
}
