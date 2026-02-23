import type { FastifyInstance } from "fastify";
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

export async function platformRecipesRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

  app.get("/platform/workspaces", async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const list = await app.prisma.workspace.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 500,
    });
    return { ok: true, workspaces: list };
  });

  app.get("/platform/recipes/list", async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const query = (req.query ?? {}) as { workspaceId?: unknown; accountId?: unknown };
    const workspaceId =
      typeof query.workspaceId === "string"
        ? query.workspaceId
        : typeof query.accountId === "string"
          ? query.accountId
          : "";
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Query.workspaceId is required");

    const list = await recipes.listRecipesForWorkspace(workspaceId);
    return { ok: true, recipes: list };
  });

  app.get("/platform/recipes/:id/export/beerjson", async (req, reply) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const params = (req.params ?? {}) as { id?: unknown };
    const query = (req.query ?? {}) as { workspaceId?: unknown; accountId?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";
    const workspaceId =
      typeof query.workspaceId === "string"
        ? query.workspaceId
        : typeof query.accountId === "string"
          ? query.accountId
          : "";
    if (!recipeId) throw new BadRequestError("invalid_recipe_id", "Params.id is required");
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Query.workspaceId is required");

    const recipe = await recipes.getRecipeForWorkspace(recipeId, workspaceId);
    const full = exportRecipeFull(recipe as any);

    const namePart = safeFilenamePart((recipe as any)?.name ?? "");
    const filename = namePart ? `${namePart}.beerjson.json` : `recipe-${recipeId}.beerjson.json`;

    reply.header("Content-Type", "application/json; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="${filename}"`);
    return full;
  });

  app.get("/platform/recipes/export/beerjson", async (req, reply) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const query = (req.query ?? {}) as { workspaceId?: unknown; accountId?: unknown };
    const workspaceId =
      typeof query.workspaceId === "string"
        ? query.workspaceId
        : typeof query.accountId === "string"
          ? query.accountId
          : "";
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Query.workspaceId is required");

    const list = await recipes.listRecipesForWorkspace(workspaceId);
    const outRecipes: any[] = [];
    for (const r of list as any[]) {
      const full = exportRecipeFull(r);
      const r0 = (full.beerjson as any)?.beerjson?.recipes?.[0] ?? null;
      if (r0) outRecipes.push(r0);
    }

    const doc = { beerjson: { version: 1, recipes: outRecipes } };

    reply.header("Content-Type", "application/json; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="recipes.beerjson.json"`);
    return doc;
  });

  app.post("/platform/recipes/import/preview", { bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES }, async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const body = (req.body ?? {}) as { format?: unknown; content?: unknown; workspaceId?: unknown; accountId?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : typeof body.accountId === "string"
          ? body.accountId
          : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Body.workspaceId is required");
    if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
      throw new BadRequestError("file_too_large", "File too large. Maximum size is 1 MB for single recipe import.");
    }

    const mapped = parseSingleImportContent(format, content);
    const v2 = validateBeerJsonDoc(mapped.beerJsonRecipeJson as any);
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
      workspaceId,
    };
  });

  app.post("/platform/recipes/import", { bodyLimit: RECIPES_IMPORT_SINGLE_MAX_BYTES }, async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const body = (req.body ?? {}) as {
      format?: unknown;
      content?: unknown;
      styleKey?: unknown;
      workspaceId?: unknown;
      accountId?: unknown;
      recipeExtJson?: unknown;
    };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    const styleKey = typeof body.styleKey === "string" ? body.styleKey : "custom";
    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : typeof body.accountId === "string"
          ? body.accountId
          : "";
    const recipeExtJson = body.recipeExtJson;

    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Body.workspaceId is required");
    if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
      throw new BadRequestError("file_too_large", "File too large. Maximum size is 1 MB for single recipe import.");
    }

    const mapped = parseSingleImportContent(format, content);
    const created = await recipes.createRecipeForWorkspace(workspaceId, {
      name: mapped.recipeName,
      styleKey,
      notes: mapped.notes,
      beerJsonRecipeJson: mapped.beerJsonRecipeJson,
      recipeExtJson: recipeExtJson === undefined || recipeExtJson === null ? undefined : recipeExtJson,
    });

    return { ok: true, recipe: created, warnings: mapped.warnings };
  });

  app.post("/platform/recipes/import/bulk/preview", { bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES }, async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const body = (req.body ?? {}) as { format?: unknown; content?: unknown; workspaceId?: unknown; accountId?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : typeof body.accountId === "string"
          ? body.accountId
          : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Body.workspaceId is required");
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

    return { ok: true, format, previewItems, workspaceId };
  });

  app.post("/platform/recipes/import/bulk", { bodyLimit: RECIPES_IMPORT_BULK_MAX_BYTES }, async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const body = (req.body ?? {}) as { format?: unknown; content?: unknown; workspaceId?: unknown; accountId?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : typeof body.accountId === "string"
          ? body.accountId
          : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Body.workspaceId is required");
    if (Buffer.byteLength(content, "utf8") > RECIPES_IMPORT_BULK_MAX_BYTES) {
      throw new BadRequestError("file_too_large", "File too large. Maximum size is 5 MB for bulk import.");
    }

    const items = parseBulkImportContent(format, content);
    const created: any[] = [];
    const failed: any[] = [];

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
          recipeId: (recipe as any).id,
          name: (recipe as any).name,
          styleKey: (recipe as any).styleKey ?? "custom",
          style: (recipe as any).style ?? null,
          warnings: [...(it.warnings ?? []), ...resolved.warnings],
        });
      } catch (err) {
        failed.push({ index: it.index, name: it.recipeName, error: String(err) });
      }
    }

    return { ok: true, created, failed };
  });
}
