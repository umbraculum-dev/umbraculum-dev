import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import { RecipesService } from "../services/recipesService.js";
import { importBeerXmlToBeerJson, importBeerXmlToBeerJsonMany, type StyleCandidate } from "../importers/beerxmlImporter.js";
import { normalizeBeerJsonRecipeUnits, validateBeerJsonDoc } from "../beerjson/index.js";

type ImportFormat = "beerjson" | "beerxml";

export async function recipesImportRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

  function normStyleCode(raw: string) {
    return raw.trim().toUpperCase();
  }

  async function resolveBjcp2021Style(candidate: StyleCandidate | null): Promise<{
    styleKey: string;
    styleName: string;
    styleCode: string;
    warnings: Array<{ code: string; message: string }>;
  }> {
    if (!candidate) {
      return { styleKey: "custom", styleName: "Custom", styleCode: "custom", warnings: [] };
    }

    const warnings: Array<{ code: string; message: string }> = [];
    const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
    const code = typeof candidate.code === "string" ? normStyleCode(candidate.code) : "";

    if (name) {
      const found = await app.prisma.beerStyle.findMany({
        where: {
          source: "bjcp",
          version: "2021",
          isActive: true,
          name: { equals: name, mode: "insensitive" },
        },
        select: { key: true, name: true, code: true },
        take: 2,
      });
      if (found.length === 1) {
        return { styleKey: found[0].key, styleName: found[0].name, styleCode: found[0].code, warnings };
      }
      if (found.length > 1) {
        warnings.push({ code: "style_ambiguous", message: `Multiple BJCP 2021 styles match name "${name}". Using Custom.` });
        return { styleKey: "custom", styleName: "Custom", styleCode: "custom", warnings };
      }
    }

    if (code) {
      const found = await app.prisma.beerStyle.findMany({
        where: { source: "bjcp", version: "2021", isActive: true, code },
        select: { key: true, name: true, code: true },
        take: 2,
      });
      if (found.length === 1) {
        return { styleKey: found[0].key, styleName: found[0].name, styleCode: found[0].code, warnings };
      }
      if (found.length > 1) {
        warnings.push({ code: "style_ambiguous", message: `Multiple BJCP 2021 styles match code "${code}". Using Custom.` });
        return { styleKey: "custom", styleName: "Custom", styleCode: "custom", warnings };
      }
    }

    if (name || code) {
      const note = name && code ? `name="${name}" code="${code}"` : name ? `name="${name}"` : `code="${code}"`;
      warnings.push({ code: "style_unmatched", message: `Style in file did not match BJCP 2021 (${note}). Using Custom.` });
    }

    return { styleKey: "custom", styleName: "Custom", styleCode: "custom", warnings };
  }

  function extractStyleCandidateFromBeerJsonRecipe(r0: any): StyleCandidate | null {
    const style = r0?.style ?? null;
    if (!style || typeof style !== "object") return null;
    const name = typeof (style as any).name === "string" ? ((style as any).name as string).trim() : "";
    const categoryNumberRaw = (style as any).category_number;
    const styleLetter = typeof (style as any).style_letter === "string" ? ((style as any).style_letter as string).trim() : "";
    const categoryNumber =
      typeof categoryNumberRaw === "number" && Number.isFinite(categoryNumberRaw) ? String(categoryNumberRaw)
        : typeof categoryNumberRaw === "string" ? categoryNumberRaw.trim()
        : "";
    const code = categoryNumber && styleLetter ? `${categoryNumber}${styleLetter}` : "";
    if (!name && !code) return null;
    return { name: name || null, code: code || null };
  }

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
            const n = normalizeBeerJsonRecipeUnits(doc);
            if (n.warnings.length > 0) {
              const v2 = validateBeerJsonDoc(doc);
              if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v2.errors}`);
            }
            const meta = extractRecipeMetaFromBeerJson(doc);
            return { recipeName: meta.recipeName, notes: meta.notes, beerJsonRecipeJson: doc, warnings: n.warnings as any[] };
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
            const n = normalizeBeerJsonRecipeUnits(doc);
            if (n.warnings.length > 0) {
              const v2 = validateBeerJsonDoc(doc);
              if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v2.errors}`);
            }
            const meta = extractRecipeMetaFromBeerJson(doc);
            return { recipeName: meta.recipeName, notes: meta.notes, beerJsonRecipeJson: doc, warnings: n.warnings as any[] };
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

  app.post("/recipes/import/bulk/preview", async (req) => {
    const ctx = requireActiveAccount(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");

    const items =
      format === "beerxml"
        ? importBeerXmlToBeerJsonMany(content).map((it, idx) => ({
            index: idx,
            recipeName: it.recipeName,
            notes: it.notes,
            beerJsonRecipeJson: it.beerJsonRecipeJson,
            warnings: it.warnings,
            styleCandidate: it.styleCandidate,
          }))
        : (() => {
            const doc = parseBeerJsonContent(content);
            const v = validateBeerJsonDoc(doc);
            if (!v.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v.errors}`);
            const recipesArr = Array.isArray(doc?.beerjson?.recipes) ? (doc.beerjson.recipes as any[]) : [];
            if (recipesArr.length === 0) throw new BadRequestError("invalid_beerjson", "BeerJSON must contain at least one recipe");
            return recipesArr.map((r, idx) => {
              const singleDoc = { beerjson: { ...(doc.beerjson ?? {}), recipes: [r] } };
              const v2 = validateBeerJsonDoc(singleDoc);
              if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON recipe[${idx}] is invalid: ${v2.errors}`);
              const n = normalizeBeerJsonRecipeUnits(singleDoc);
              if (n.warnings.length > 0) {
                const v3 = validateBeerJsonDoc(singleDoc);
                if (!v3.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON recipe[${idx}] is invalid: ${v3.errors}`);
              }
              const meta = extractRecipeMetaFromBeerJson(singleDoc);
              const styleCandidate = extractStyleCandidateFromBeerJsonRecipe(r);
              return { index: idx, recipeName: meta.recipeName, notes: meta.notes, beerJsonRecipeJson: singleDoc, warnings: n.warnings, styleCandidate };
            });
          })();

    const previewItems = [];
    for (const it of items) {
      const resolved = await resolveBjcp2021Style(it.styleCandidate);
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

    return { ok: true, format, previewItems, accountId: ctx.activeAccountId };
  });

  app.post("/recipes/import/bulk", async (req) => {
    const ctx = requireActiveAccount(req);
    const body = (req.body ?? {}) as { format?: unknown; content?: unknown };
    const format = (typeof body.format === "string" ? body.format : "") as ImportFormat;
    const content = typeof body.content === "string" ? body.content : "";
    if (format !== "beerjson" && format !== "beerxml") {
      throw new BadRequestError("invalid_import_format", "Body.format must be beerjson|beerxml");
    }
    if (!content) throw new BadRequestError("invalid_import_content", "Body.content is required");

    const items =
      format === "beerxml"
        ? importBeerXmlToBeerJsonMany(content).map((it, idx) => ({
            index: idx,
            recipeName: it.recipeName,
            notes: it.notes,
            beerJsonRecipeJson: it.beerJsonRecipeJson,
            warnings: it.warnings,
            styleCandidate: it.styleCandidate,
          }))
        : (() => {
            const doc = parseBeerJsonContent(content);
            const v = validateBeerJsonDoc(doc);
            if (!v.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v.errors}`);
            const recipesArr = Array.isArray(doc?.beerjson?.recipes) ? (doc.beerjson.recipes as any[]) : [];
            if (recipesArr.length === 0) throw new BadRequestError("invalid_beerjson", "BeerJSON must contain at least one recipe");
            return recipesArr.map((r, idx) => {
              const singleDoc = { beerjson: { ...(doc.beerjson ?? {}), recipes: [r] } };
              const v2 = validateBeerJsonDoc(singleDoc);
              if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON recipe[${idx}] is invalid: ${v2.errors}`);
              const n = normalizeBeerJsonRecipeUnits(singleDoc);
              if (n.warnings.length > 0) {
                const v3 = validateBeerJsonDoc(singleDoc);
                if (!v3.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON recipe[${idx}] is invalid: ${v3.errors}`);
              }
              const meta = extractRecipeMetaFromBeerJson(singleDoc);
              const styleCandidate = extractStyleCandidateFromBeerJsonRecipe(r);
              return { index: idx, recipeName: meta.recipeName, notes: meta.notes, beerJsonRecipeJson: singleDoc, warnings: n.warnings, styleCandidate };
            });
          })();

    const created: any[] = [];
    const failed: any[] = [];

    for (const it of items) {
      try {
        const resolved = await resolveBjcp2021Style(it.styleCandidate);
        const recipe = await recipes.createRecipe(ctx.userId, ctx.activeAccountId, {
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

