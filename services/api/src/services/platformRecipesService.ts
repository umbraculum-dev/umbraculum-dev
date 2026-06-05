import type { Recipe, PrismaClient } from "@prisma/client";

import { validateBeerJsonDoc } from "../beerjson/index.js";
import { exportRecipeFull } from "../beerjson/strictExport.js";
import { BadRequestError } from "../errors.js";
import { isObject } from "../lib/typeGuards.js";
import {
  parseBulkImportContent,
  parseSingleImportContent,
  resolveBjcp2021Style,
  type ImportFormat,
} from "./recipesImportService.js";
import { RecipesService } from "./recipesService.js";

export const RECIPES_IMPORT_SINGLE_MAX_BYTES = 1 * 1024 * 1024;
export const RECIPES_IMPORT_BULK_MAX_BYTES = 5 * 1024 * 1024;

type ImportedItem = ReturnType<typeof parseBulkImportContent>[number];
type CreatedRow = {
  index: number;
  recipeId: string;
  name: string;
  styleKey: string;
  style: Recipe["style"];
  warnings: ImportedItem["warnings"];
};

function safeFilenamePart(v: string) {
  const trimmed = v.trim();
  if (!trimmed) return "";
  return trimmed
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function assertImportSize(content: string, maxBytes: number, message: string): void {
  if (Buffer.byteLength(content, "utf8") > maxBytes) {
    throw new BadRequestError("file_too_large", message);
  }
}

export class PlatformRecipesService {
  private readonly recipes: RecipesService;

  constructor(private readonly prisma: PrismaClient) {
    this.recipes = new RecipesService(prisma);
  }

  listWorkspaces() {
    return this.prisma.workspace.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 500,
    });
  }

  async exportRecipeBeerJson(recipeId: string, workspaceId: string) {
    const recipe = await this.recipes.getRecipeForWorkspace(recipeId, workspaceId);
    const doc = exportRecipeFull(recipe);
    const namePart = safeFilenamePart(recipe.name ?? "");
    const filename = namePart ? `${namePart}.beerjson.json` : `recipe-${recipeId}.beerjson.json`;
    return { filename, doc };
  }

  async exportRecipesBeerJson(workspaceId: string) {
    const list = await this.recipes.listRecipesForWorkspace(workspaceId);
    const outRecipes: unknown[] = [];
    for (const row of list) {
      const full = exportRecipeFull(row);
      const beerjsonContainer = isObject(full.beerjson) ? full.beerjson : null;
      const innerBeerjson = isObject(beerjsonContainer?.["beerjson"]) ? beerjsonContainer["beerjson"] : null;
      const recipesArr: unknown[] = Array.isArray(innerBeerjson?.["recipes"]) ? innerBeerjson["recipes"] : [];
      const firstRecipe = recipesArr[0] ?? null;
      if (firstRecipe) outRecipes.push(firstRecipe);
    }
    return {
      filename: "recipes.beerjson.json",
      doc: { beerjson: { version: 1, recipes: outRecipes } },
    };
  }

  previewSingleImport(format: ImportFormat, content: string, workspaceId: string) {
    assertImportSize(content, RECIPES_IMPORT_SINGLE_MAX_BYTES, "File too large. Maximum size is 1 MB for single recipe import.");
    const mapped = parseSingleImportContent(format, content);
    const validation = validateBeerJsonDoc(mapped.beerJsonRecipeJson);
    if (!validation.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${validation.errors}`);
    return {
      format,
      preview: {
        name: mapped.recipeName,
        notes: mapped.notes,
        beerJsonRecipeJson: mapped.beerJsonRecipeJson,
        warnings: mapped.warnings,
      },
      workspaceId,
    };
  }

  async importSingleRecipe(args: {
    format: ImportFormat;
    content: string;
    styleKey?: string | null;
    workspaceId: string;
    recipeExtJson?: unknown;
  }) {
    assertImportSize(
      args.content,
      RECIPES_IMPORT_SINGLE_MAX_BYTES,
      "File too large. Maximum size is 1 MB for single recipe import.",
    );

    const mapped = parseSingleImportContent(args.format, args.content);
    const created = await this.recipes.createRecipeForWorkspace(args.workspaceId, {
      name: mapped.recipeName,
      styleKey: args.styleKey ?? "custom",
      notes: mapped.notes,
      beerJsonRecipeJson: mapped.beerJsonRecipeJson,
      recipeExtJson: args.recipeExtJson === undefined || args.recipeExtJson === null ? undefined : args.recipeExtJson,
    });

    return { recipe: created, warnings: mapped.warnings };
  }

  async previewBulkImport(format: ImportFormat, content: string, workspaceId: string) {
    assertImportSize(content, RECIPES_IMPORT_BULK_MAX_BYTES, "File too large. Maximum size is 5 MB for bulk import.");
    const items = parseBulkImportContent(format, content);
    const previewItems = [];
    for (const row of items) {
      const resolved = await resolveBjcp2021Style(this.prisma, row.styleCandidate);
      previewItems.push({
        index: row.index,
        name: row.recipeName,
        notes: row.notes,
        resolvedStyleKey: resolved.styleKey,
        resolvedStyleName: resolved.styleName,
        resolvedStyleCode: resolved.styleCode,
        warnings: [...(row.warnings ?? []), ...resolved.warnings],
      });
    }
    return { format, previewItems, workspaceId };
  }

  async importBulkRecipes(format: ImportFormat, content: string, workspaceId: string) {
    assertImportSize(content, RECIPES_IMPORT_BULK_MAX_BYTES, "File too large. Maximum size is 5 MB for bulk import.");
    const items = parseBulkImportContent(format, content);
    const created: CreatedRow[] = [];
    const failed: { index: number; name: string; error: string }[] = [];

    for (const row of items) {
      try {
        const resolved = await resolveBjcp2021Style(this.prisma, row.styleCandidate);
        const recipe = await this.recipes.createRecipeForWorkspace(workspaceId, {
          name: row.recipeName,
          styleKey: resolved.styleKey,
          notes: row.notes,
          beerJsonRecipeJson: row.beerJsonRecipeJson,
        });
        created.push({
          index: row.index,
          recipeId: recipe.id,
          name: recipe.name,
          styleKey: recipe.styleKey ?? "custom",
          style: recipe.style ?? null,
          warnings: [...(row.warnings ?? []), ...resolved.warnings],
        });
      } catch (err) {
        failed.push({ index: row.index, name: row.recipeName, error: String(err) });
      }
    }

    return { created, failed };
  }

  listRecipesForWorkspace(workspaceId: string) {
    return this.recipes.listRecipesForWorkspace(workspaceId);
  }
}
