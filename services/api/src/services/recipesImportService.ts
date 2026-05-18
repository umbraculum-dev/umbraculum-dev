import type { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../errors.js";
import { importBeerXmlToBeerJson, importBeerXmlToBeerJsonMany, type StyleCandidate } from "../importers/beerxmlImporter.js";
import { normalizeBeerJsonRecipeUnits, validateBeerJsonDoc } from "../beerjson/index.js";
import { isObject } from "../lib/typeGuards.js";

export type ImportFormat = "beerjson" | "beerxml";

export type SingleImportResult = {
  recipeName: string;
  notes: string | null;
  beerJsonRecipeJson: unknown;
  warnings: Array<{ code: string; message: string }>;
  styleCandidate: StyleCandidate | null;
};

export type BulkImportItem = {
  index: number;
  recipeName: string;
  notes: string | null;
  beerJsonRecipeJson: unknown;
  warnings: Array<{ code: string; message: string }>;
  styleCandidate: StyleCandidate | null;
};

export type ResolveStyleResult = {
  styleKey: string;
  styleName: string;
  styleCode: string;
  warnings: Array<{ code: string; message: string }>;
};

export function parseBeerJsonContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    throw new BadRequestError("invalid_beerjson", "Body.content must be valid JSON for format=beerjson");
  }
}

function getFirstRecipe(doc: unknown): Record<string, unknown> | null {
  if (!isObject(doc)) return null;
  const beerjson = isObject(doc.beerjson) ? doc.beerjson : null;
  const recipesArr: unknown[] = Array.isArray(beerjson?.recipes) ? beerjson.recipes : [];
  const r0 = recipesArr[0];
  return isObject(r0) ? r0 : null;
}

export function extractRecipeMetaFromBeerJson(doc: unknown): { recipeName: string; notes: string | null } {
  const r0 = getFirstRecipe(doc);
  const recipeName = typeof r0?.name === "string" ? r0.name.trim() : "";
  if (!recipeName) throw new BadRequestError("invalid_beerjson", "BeerJSON recipe name is required");
  const notes = typeof r0?.notes === "string" ? r0.notes.trim() || null : null;
  return { recipeName, notes };
}

export function extractStyleCandidateFromBeerJsonRecipe(r0: unknown): StyleCandidate | null {
  if (!isObject(r0)) return null;
  const style = isObject(r0.style) ? r0.style : null;
  if (!style) return null;
  const name = typeof style.name === "string" ? style.name.trim() : "";
  const categoryNumberRaw = style.category_number;
  const styleLetter = typeof style.style_letter === "string" ? style.style_letter.trim() : "";
  const categoryNumber =
    typeof categoryNumberRaw === "number" && Number.isFinite(categoryNumberRaw) ? String(categoryNumberRaw)
      : typeof categoryNumberRaw === "string" ? categoryNumberRaw.trim()
      : "";
  const code = categoryNumber && styleLetter ? `${categoryNumber}${styleLetter}` : "";
  if (!name && !code) return null;
  return { name: name || null, code: code || null };
}

export function parseSingleImportContent(format: ImportFormat, content: string): SingleImportResult {
  if (format === "beerxml") {
    const out = importBeerXmlToBeerJson(content);
    return {
      recipeName: out.recipeName,
      notes: out.notes,
      beerJsonRecipeJson: out.beerJsonRecipeJson,
      warnings: out.warnings,
      styleCandidate: null,
    };
  }

  const doc = parseBeerJsonContent(content);
  const v = validateBeerJsonDoc(doc);
  if (!v.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v.errors}`);
  const n = normalizeBeerJsonRecipeUnits(doc);
  if (n.warnings.length > 0) {
    const v2 = validateBeerJsonDoc(doc);
    if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v2.errors}`);
  }
  const meta = extractRecipeMetaFromBeerJson(doc);
  const r0 = getFirstRecipe(doc);
  return {
    recipeName: meta.recipeName,
    notes: meta.notes,
    beerJsonRecipeJson: doc,
    warnings: n.warnings.map((w) => ({
      code: w.code,
      message: `${w.path}: ${w.fromUnit} → ${w.toUnit}`,
    })),
    styleCandidate: extractStyleCandidateFromBeerJsonRecipe(r0),
  };
}

export function parseBulkImportContent(format: ImportFormat, content: string): BulkImportItem[] {
  if (format === "beerxml") {
    return importBeerXmlToBeerJsonMany(content).map((it, idx) => ({
      index: idx,
      recipeName: it.recipeName,
      notes: it.notes,
      beerJsonRecipeJson: it.beerJsonRecipeJson,
      warnings: it.warnings,
      styleCandidate: it.styleCandidate ?? null,
    }));
  }

  const doc = parseBeerJsonContent(content);
  const v = validateBeerJsonDoc(doc);
  if (!v.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${v.errors}`);
  const beerjsonNode = isObject(doc) && isObject(doc.beerjson) ? doc.beerjson : null;
  const recipesArr: unknown[] = beerjsonNode && Array.isArray(beerjsonNode.recipes) ? beerjsonNode.recipes : [];
  if (recipesArr.length === 0) throw new BadRequestError("invalid_beerjson", "BeerJSON must contain at least one recipe");

  return recipesArr.map((r, idx) => {
    const singleDoc = { beerjson: { ...(beerjsonNode ?? {}), recipes: [r] } };
    const v2 = validateBeerJsonDoc(singleDoc);
    if (!v2.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON recipe[${idx}] is invalid: ${v2.errors}`);
    const n = normalizeBeerJsonRecipeUnits(singleDoc);
    if (n.warnings.length > 0) {
      const v3 = validateBeerJsonDoc(singleDoc);
      if (!v3.ok) throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON recipe[${idx}] is invalid: ${v3.errors}`);
    }
    const meta = extractRecipeMetaFromBeerJson(singleDoc);
    return {
      index: idx,
      recipeName: meta.recipeName,
      notes: meta.notes,
      beerJsonRecipeJson: singleDoc,
      warnings: n.warnings.map((w) => ({
        code: w.code,
        message: `${w.path}: ${w.fromUnit} → ${w.toUnit}`,
      })),
      styleCandidate: extractStyleCandidateFromBeerJsonRecipe(r),
    };
  });
}

function normStyleCode(raw: string) {
  return raw.trim().toUpperCase();
}

export async function resolveBjcp2021Style(prisma: PrismaClient, candidate: StyleCandidate | null): Promise<ResolveStyleResult> {
  if (!candidate) {
    return { styleKey: "custom", styleName: "Custom", styleCode: "custom", warnings: [] };
  }

  const warnings: Array<{ code: string; message: string }> = [];
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const code = typeof candidate.code === "string" ? normStyleCode(candidate.code) : "";

  if (name) {
    const found = await prisma.beerStyle.findMany({
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
    const found = await prisma.beerStyle.findMany({
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
