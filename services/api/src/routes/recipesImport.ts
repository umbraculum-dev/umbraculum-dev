import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import { RecipesService } from "../services/recipesService.js";
import { importBeerXmlToBeerJson } from "../importers/beerxmlImporter.js";
import { validateBeerJsonDoc } from "../beerjson/index.js";

type ImportFormat = "beerjson" | "beerxml";

export async function recipesImportRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

  function parseBeerJsonContent(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      throw new BadRequestError("invalid_beerjson", "Body.content must be valid JSON for format=beerjson");
    }
  }

  function extractRecipeMetaFromBeerJson(doc: any): { recipeName: string; notes: string | null } {
    const r0 = doc?.beerjson?.recipes?.[0];
    const recipeName = typeof r0?.name === "string" ? r0.name.trim() : "";
    if (!recipeName) throw new BadRequestError("invalid_beerjson", "BeerJSON recipe name is required");
    const notes = typeof r0?.notes === "string" ? r0.notes.trim() || null : null;
    return { recipeName, notes };
  }

  app.post("/recipes/import/preview", async (req) => {
    const ctx = requireActiveAccount(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");

    const mapped =
      format === "beerxml"
        ? importBeerXmlToBeerJson(content)
        : (() => {
            const doc = parseBeerJsonContent(content);
            const v = validateBeerJsonDoc(doc);
            if (!v.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v.errors}`);
            const meta = extractRecipeMetaFromBeerJson(doc);
            return { recipeName: meta.recipeName, notes: meta.notes, beerJsonRecipeJson: doc, warnings: [] as any[] };
          })();

    const v2 = validateBeerJsonDoc(mapped.beerJsonRecipeJson);
    if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v2.errors}`);

    // Best-effort: no DB writes here.
    return {
      ok: true,
      format,
      preview: {
        name: mapped.recipeName,
        notes: mapped.notes,
        beerJsonRecipeJson: mapped.beerJsonRecipeJson,
        warnings: mapped.warnings,
      },
      accountId: ctx.activeAccountId,
    };
  });

  app.post("/recipes/import", async (req) => {
    const ctx = requireActiveAccount(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown; styleKey?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    const styleKey = typeof body.styleKey === "string" ? body.styleKey : "custom";

    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");

    const mapped =
      format === "beerxml"
        ? importBeerXmlToBeerJson(content)
        : (() => {
            const doc = parseBeerJsonContent(content);
            const v = validateBeerJsonDoc(doc);
            if (!v.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v.errors}`);
            const meta = extractRecipeMetaFromBeerJson(doc);
            return { recipeName: meta.recipeName, notes: meta.notes, beerJsonRecipeJson: doc, warnings: [] as any[] };
          })();

    // Create the recipe (BeerJSON-first).
    const created = await recipes.createRecipe(ctx.userId, ctx.activeAccountId, {
      name: mapped.recipeName,
      styleKey,
      notes: mapped.notes,
      beerJsonRecipeJson: mapped.beerJsonRecipeJson,
    });

    return { ok: true, recipe: created, warnings: mapped.warnings };
  });
}

