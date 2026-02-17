import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import { RecipesService } from "../services/recipesService.js";
import { importBeerXmlToLegacy } from "../importers/beerxmlImporter.js";
import { importBeerJsonToLegacy } from "../importers/beerjsonImporter.js";
import { buildBeerJsonDocumentFromLegacy, validateBeerJsonDoc } from "../beerjson/index.js";

type ImportFormat = "beerjson" | "beerxml";

export async function recipesImportRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

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
        ? importBeerXmlToLegacy(content)
        : importBeerJsonToLegacy((() => {
            try {
              return JSON.parse(content);
            } catch {
              throw new BadRequestError("invalid_beerjson", "Body.content must be valid JSON for format=beerjson");
            }
          })());

    const beerJson = buildBeerJsonDocumentFromLegacy({
      recipe: { name: mapped.recipeName, notes: mapped.notes },
      gristJson: mapped.gristJson,
      hopsJson: mapped.hopsJson,
      yeastJson: mapped.yeastJson,
      miscJson: mapped.miscJson,
    });
    const v = validateBeerJsonDoc(beerJson);
    if (!v.ok) throw new BadRequestError("invalid_beerjson_recipe", `Generated BeerJSON invalid: ${v.errors}`);

    // Best-effort: no DB writes here.
    return {
      ok: true,
      format,
      preview: {
        name: mapped.recipeName,
        notes: mapped.notes,
        gristJson: mapped.gristJson,
        hopsJson: mapped.hopsJson,
        yeastJson: mapped.yeastJson,
        miscJson: mapped.miscJson,
        beerJsonRecipeJson: beerJson,
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
        ? importBeerXmlToLegacy(content)
        : importBeerJsonToLegacy((() => {
            try {
              return JSON.parse(content);
            } catch {
              throw new BadRequestError("invalid_beerjson", "Body.content must be valid JSON for format=beerjson");
            }
          })());

    // Create the recipe using existing validation/snapshotting.
    const created = await recipes.createRecipe(ctx.userId, ctx.activeAccountId, {
      name: mapped.recipeName,
      styleKey,
      notes: mapped.notes,
      gristJson: mapped.gristJson,
      hopsJson: mapped.hopsJson,
      yeastJson: mapped.yeastJson,
      miscJson: mapped.miscJson,
    });

    return { ok: true, recipe: created, warnings: mapped.warnings };
  });
}

