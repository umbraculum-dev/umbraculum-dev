import { parseBeerXmlMash } from "./beerxmlMash.js";
import {
  gristPotentialToBeerJsonYield,
  maltClassToGrainGroup,
  miscTypeToBeerJsonType,
  toTiming,
} from "./beerxmlNormalize.js";
import { extractBeerXmlRecipes, parseBeerXml } from "./beerxmlParse.js";
import {
  extractStyleCandidateFromBeerXmlRecipe,
  importBeerXmlRecipeToLegacy,
} from "./beerxmlLegacyImport.js";
import type {
  BeerJsonDocument,
  BeerJsonRecipeOut,
  BeerXmlGristRow,
  BeerXmlHopRow,
  BeerXmlMiscRow,
  BeerXmlYeastRow,
  ImportWarning,
  LegacyImportResult,
  StyleCandidate,
} from "./beerxmlTypes.js";

export type { StyleCandidate } from "./beerxmlTypes.js";

function legacyToBeerJsonRecipe(mapped: {
  recipeName: string;
  notes: string | null;
  batchSizeLiters: number;
  gristJson: BeerXmlGristRow[];
  hopsJson: BeerXmlHopRow[];
  yeastJson: BeerXmlYeastRow[];
  miscJson: BeerXmlMiscRow[];
}): BeerJsonRecipeOut {
  const recipe: BeerJsonRecipeOut = {
    name: mapped.recipeName,
    type: "all grain",
    author: "brewery-app",
    efficiency: { brewhouse: { unit: "%", value: 75 } },
    batch_size: { unit: "l", value: mapped.batchSizeLiters },
    ingredients: {
      fermentable_additions: mapped.gristJson.map((g) => ({
        id: g.id,
        name: g.name,
        type: "grain",
        grain_group: maltClassToGrainGroup(g.maltClass),
        yield: gristPotentialToBeerJsonYield(g.potential),
        ...(typeof g.colorLovibond === "number" &&
        Number.isFinite(g.colorLovibond) &&
        g.colorLovibond >= 0
          ? { color: { unit: "Lovi", value: g.colorLovibond } }
          : {}),
        amount: { unit: "kg", value: g.amountKg },
        timing: { use: g.addAfterBoil ? "add_to_boil" : "add_to_mash" },
      })),
      hop_additions: mapped.hopsJson.map((h) => ({
        id: h.id,
        name: h.name,
        origin: h.country ?? undefined,
        alpha_acid: {
          unit: "%",
          value:
            typeof h.alphaAcidPercent === "number" && Number.isFinite(h.alphaAcidPercent)
              ? h.alphaAcidPercent
              : 0,
        },
        amount: { unit: "g", value: h.amountGrams },
        timing: toTiming(h.use, h.timeMinutes),
      })),
      culture_additions: mapped.yeastJson.map((y) => {
        const attMin =
          typeof y.attenuationMin === "number" && Number.isFinite(y.attenuationMin)
            ? y.attenuationMin
            : null;
        const attMax =
          typeof y.attenuationMax === "number" && Number.isFinite(y.attenuationMax)
            ? y.attenuationMax
            : null;
        const attenuation =
          attMin != null && attMax != null
            ? (attMin + attMax) / 2
            : attMin != null
              ? attMin
              : attMax != null
                ? attMax
                : null;
        const out: Record<string, unknown> = {
          id: y.id,
          name: y.name,
          type: "ale",
          form: "dry",
          producer: y.lab ?? undefined,
          product_id: y.productId ?? undefined,
          amount: { unit: "pkg", value: 1 },
        };
        if (attenuation != null) out["attenuation"] = { unit: "%", value: attenuation };
        return out;
      }),
      miscellaneous_additions: mapped.miscJson.map((m) => {
        const out: Record<string, unknown> = {
          id: m.id,
          name: m.name,
          type: miscTypeToBeerJsonType(m.type),
          timing: toTiming(m.use, m.timeMinutes),
          amount: m.amountIsWeight
            ? { unit: "kg", value: m.amount }
            : { unit: "l", value: m.amount },
        };
        if (m.useFor) out["use_for"] = m.useFor;
        if (m.notes) out["notes"] = m.notes;
        return out;
      }),
    },
  };
  if (mapped.notes) recipe["notes"] = mapped.notes;
  return recipe;
}

export function importBeerXmlToLegacy(xml: string): LegacyImportResult {
  const doc = parseBeerXml(xml);
  const recipes = extractBeerXmlRecipes(doc);
  const recipe = recipes[0] ?? null;
  if (!recipe) throw new Error("BeerXML: missing RECIPES.RECIPE");

  return importBeerXmlRecipeToLegacy(recipe);
}

export function importBeerXmlToBeerJson(xml: string): {
  recipeName: string;
  notes: string | null;
  beerJsonRecipeJson: BeerJsonDocument;
  warnings: ImportWarning[];
} {
  const doc = parseBeerXml(xml);
  const recipes = extractBeerXmlRecipes(doc);
  const recipe = recipes[0] ?? null;
  if (!recipe) throw new Error("BeerXML: missing RECIPES.RECIPE");

  const mapped = importBeerXmlRecipeToLegacy(recipe);
  const out: BeerJsonRecipeOut = legacyToBeerJsonRecipe(mapped);

  const mash = parseBeerXmlMash(recipe);
  if (mash) out["mash"] = mash;

  return {
    recipeName: mapped.recipeName,
    notes: mapped.notes,
    beerJsonRecipeJson: { beerjson: { version: 1, recipes: [out] } },
    warnings: mapped.warnings,
  };
}

export function importBeerXmlToBeerJsonMany(xml: string): Array<{
  recipeName: string;
  notes: string | null;
  beerJsonRecipeJson: BeerJsonDocument;
  warnings: ImportWarning[];
  styleCandidate: StyleCandidate | null;
}> {
  const doc = parseBeerXml(xml);
  const recipes = extractBeerXmlRecipes(doc);
  if (recipes.length === 0) throw new Error("BeerXML: missing RECIPES.RECIPE");

  return recipes.map((r) => {
    const styleCandidate = extractStyleCandidateFromBeerXmlRecipe(r);
    const legacy = importBeerXmlRecipeToLegacy(r);
    const out: BeerJsonRecipeOut = legacyToBeerJsonRecipe(legacy);
    const mash = parseBeerXmlMash(r);
    if (mash) out["mash"] = mash;
    return {
      recipeName: legacy.recipeName,
      notes: legacy.notes,
      beerJsonRecipeJson: { beerjson: { version: 1, recipes: [out] } },
      warnings: legacy.warnings,
      styleCandidate,
    };
  });
}
