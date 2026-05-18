import { XMLParser } from "fast-xml-parser";
import { isObject } from "../lib/typeGuards.js";

type ImportWarning = { code: string; message: string };
export type StyleCandidate = { name?: string | null; code?: string | null };

/**
 * BeerJSON output is intentionally typed as `Record<string, unknown>` here:
 * the BeerJSON spec is large and we only assemble a minimal subset, while
 * downstream consumers (DB Json columns, contracts validators) tolerate any
 * additional fields. A full BeerJSON type is out of scope for this importer
 * and would conflict with the "additionalProperties is not false" comment
 * below on grain rows.
 */
type BeerJsonRecipeOut = Record<string, unknown>;
type BeerJsonDocument = {
  beerjson: {
    version: number;
    recipes: BeerJsonRecipeOut[];
  };
};

/**
 * Shapes returned by `fast-xml-parser` for BeerXML — a forgiving "anything
 * goes" tree with all leaves typed as `unknown`. Each consumer narrows the
 * fields it touches via type guards (`isObject`, `typeof`, etc.) — the same
 * pattern used elsewhere in the codebase for untrusted JSON.
 */
type XmlNode = Record<string, unknown>;
type BeerXmlRecipe = XmlNode;

type BeerXmlGristRow = {
  id: string;
  name: string;
  amountKg: number;
  colorLovibond: number | null;
  potential: { kind: "ppg" | "yieldPercent" | "sg"; value: number } | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
  addAfterBoil?: boolean;
};

type BeerXmlHopRow = {
  id: string;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: "boil" | "whirlpool" | "dryhop";
  timeMinutes: number | null;
};

type BeerXmlYeastRow = {
  id: string;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

type BeerXmlMiscRow = {
  id: string;
  name: string;
  type: "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
  use: "boil" | "mash" | "primary" | "secondary" | "bottling";
  timeMinutes: number | null;
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null;
  notes?: string | null;
};

function newId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

function asArray<T>(v: unknown): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? (v as T[]) : ([v] as T[]);
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normUseHop(useRaw: string | null): BeerXmlHopRow["use"] {
  const u = (useRaw ?? "").trim().toLowerCase();
  if (u.includes("dry")) return "dryhop";
  if (u.includes("whirlpool") || u.includes("flame")) return "whirlpool";
  return "boil";
}

function normMaltClass(typeRaw: string | null): BeerXmlGristRow["maltClass"] {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("crystal") || t.includes("caramel")) return "crystal";
  if (t.includes("roast") || t.includes("black") || t.includes("chocolate")) return "roast";
  if (t.includes("acid")) return "acid";
  return "base";
}

function normMiscType(typeRaw: string | null): BeerXmlMiscRow["type"] {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("fin")) return "fining";
  if (t.includes("water")) return "water_agent";
  if (t.includes("herb")) return "herb";
  if (t.includes("flavor")) return "flavor";
  if (t.includes("spice")) return "spice";
  return "other";
}

function normMiscUse(useRaw: string | null): BeerXmlMiscRow["use"] {
  const u = (useRaw ?? "").trim().toLowerCase();
  if (u.includes("mash")) return "mash";
  if (u.includes("primary")) return "primary";
  if (u.includes("secondary")) return "secondary";
  if (u.includes("bott")) return "bottling";
  return "boil";
}

function toTiming(use: string, timeMinutes: number | null) {
  const useMap: Record<string, "add_to_mash" | "add_to_boil" | "add_to_fermentation" | "add_to_package"> = {
    mash: "add_to_mash",
    boil: "add_to_boil",
    whirlpool: "add_to_boil",
    dryhop: "add_to_fermentation",
    primary: "add_to_fermentation",
    secondary: "add_to_fermentation",
    bottling: "add_to_package",
  };

  const timing: Record<string, unknown> = { use: useMap[use] ?? "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing['duration'] = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}

function gristPotentialToBeerJsonYield(p: BeerXmlGristRow["potential"]) {
  if (!p) return { fine_grind: { unit: "%", value: 0 } };
  if (p.kind === "yieldPercent") return { fine_grind: { unit: "%", value: p.value } };
  if (p.kind === "sg") return { potential: { unit: "sg", value: p.value } };
  // ppg: 37 => 1.037
  return { potential: { unit: "sg", value: 1 + p.value / 1000 } };
}

function maltClassToGrainGroup(maltClass: BeerXmlGristRow["maltClass"]) {
  switch (maltClass) {
    case "base":
      return "base";
    case "crystal":
      return "caramel";
    case "roast":
      return "roasted";
    case "acid":
      return "specialty";
    default:
      return "base";
  }
}

function miscTypeToBeerJsonType(t: BeerXmlMiscRow["type"]) {
  if (t === "water_agent") return "water agent";
  return t;
}

function parseBeerXml(xml: string): XmlNode {
  // Basic hardening: avoid DTD/DOCTYPE usage. (fast-xml-parser doesn't resolve external entities,
  // but rejecting these early keeps risk lower.)
  if (xml.includes("<!DOCTYPE") || xml.includes("<!ENTITY")) {
    throw new Error("BeerXML: DOCTYPE/ENTITY is not allowed");
  }

  const parser = new XMLParser({
    ignoreAttributes: true,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    trimValues: true,
    parseTagValue: true,
  });

  const parsed: unknown = parser.parse(xml);
  return isObject(parsed) ? parsed : {};
}

function extractBeerXmlRecipes(doc: XmlNode): BeerXmlRecipe[] {
  const recipesNode = isObject(doc['RECIPES']) ? doc['RECIPES'] : null;
  const raw = recipesNode?.['RECIPE'] ?? doc['RECIPE'] ?? null;
  return asArray<unknown>(raw).filter((r): r is BeerXmlRecipe => isObject(r));
}

function normMashStepType(typeRaw: string | null): "infusion" | "temperature" | "decoction" {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("infusion")) return "infusion";
  if (t.includes("decoction")) return "decoction";
  return "temperature";
}

function parseBeerXmlMash(
  recipe: BeerXmlRecipe
): { name: string; grain_temperature: { unit: "C"; value: number }; mash_steps: Record<string, unknown>[] } | null {
  const mash = isObject(recipe['MASH']) ? recipe['MASH'] : null;
  if (!mash) return null;

  const name = typeof mash['NAME'] === "string" ? mash['NAME'].trim() : "Imported Mash";
  const grainTempC = toNumber(mash['GRAIN_TEMP']);
  if (grainTempC == null || !Number.isFinite(grainTempC)) return null;

  const mashStepsContainer = isObject(mash['MASH_STEPS']) ? mash['MASH_STEPS'] : null;
  const stepsRaw = mashStepsContainer?.['MASH_STEP'] ?? null;
  const stepsArr = asArray<unknown>(stepsRaw).filter((s): s is XmlNode => isObject(s));
  if (stepsArr.length === 0) return null;

  const mashSteps = stepsArr
    .map((s) => {
      const stepName = typeof s['NAME'] === "string" ? s['NAME'].trim() : "";
      const stepTempC = toNumber(s['STEP_TEMP']);
      const stepTimeMin = toNumber(s['STEP_TIME']);
      if (!stepName || stepTempC == null || stepTimeMin == null) return null;

      const type = normMashStepType(typeof s['TYPE'] === "string" ? s['TYPE'] : null);
      const step: Record<string, unknown> = {
        name: stepName,
        type,
        step_temperature: { unit: "C" as const, value: stepTempC },
        step_time: { unit: "min" as const, value: Math.max(0, stepTimeMin) },
      };

      const rampTime = toNumber(s['RAMP_TIME']);
      if (rampTime != null && rampTime >= 0) {
        step['ramp_time'] = { unit: "min" as const, value: rampTime };
      }

      const endTemp = toNumber(s['END_TEMP']);
      if (endTemp != null && Number.isFinite(endTemp)) {
        step['end_temperature'] = { unit: "C" as const, value: endTemp };
      }

      if (type === "infusion") {
        const infuseAmount = toNumber(s['INFUSE_AMOUNT']);
        if (infuseAmount != null && infuseAmount >= 0) {
          step['amount'] = { unit: "l" as const, value: infuseAmount };
        }
        const infuseTemp = toNumber(s['INFUSE_TEMP']);
        if (infuseTemp != null && Number.isFinite(infuseTemp)) {
          step['infuse_temperature'] = { unit: "C" as const, value: infuseTemp };
        }
      }

      const description = typeof s['DESCRIPTION'] === "string" ? s['DESCRIPTION'].trim() : null;
      if (description) {
        step['description'] = description;
      }

      return step;
    })
    .filter((s): s is Record<string, unknown> => s != null);

  if (mashSteps.length === 0) return null;

  return {
    name,
    grain_temperature: { unit: "C" as const, value: grainTempC },
    mash_steps: mashSteps,
  };
}

function extractStyleCandidateFromBeerXmlRecipe(recipe: BeerXmlRecipe): StyleCandidate | null {
  const style = isObject(recipe['STYLE']) ? recipe['STYLE'] : null;
  if (!style) return null;

  const nameRaw = typeof style['NAME'] === "string" ? style['NAME'].trim() : "";
  const category = typeof style['CATEGORY'] === "string" ? style['CATEGORY'].trim() : "";

  const categoryNumberRaw = style['CATEGORY_NUMBER'];
  const categoryNumber =
    typeof categoryNumberRaw === "number" && Number.isFinite(categoryNumberRaw) ? String(categoryNumberRaw)
      : typeof categoryNumberRaw === "string" ? categoryNumberRaw.trim()
      : "";

  const styleLetter = typeof style['STYLE_LETTER'] === "string" ? style['STYLE_LETTER'].trim() : "";
  const code = categoryNumber && styleLetter ? `${categoryNumber}${styleLetter}` : "";

  const name =
    nameRaw ||
    (category && code ? `${category} ${code}` : category || "");

  if (!name && !code) return null;
  return { name: name || null, code: code || null };
}

function importBeerXmlRecipeToLegacy(recipe: BeerXmlRecipe): {
  recipeName: string;
  notes: string | null;
  batchSizeLiters: number;
  gristJson: BeerXmlGristRow[];
  hopsJson: BeerXmlHopRow[];
  yeastJson: BeerXmlYeastRow[];
  miscJson: BeerXmlMiscRow[];
  warnings: ImportWarning[];
} {
  const warnings: ImportWarning[] = [];

  const recipeName = typeof recipe['NAME'] === "string" ? recipe['NAME'].trim() : "";
  if (!recipeName) throw new Error("BeerXML: recipe NAME is required");
  const notes = typeof recipe['NOTES'] === "string" ? recipe['NOTES'].trim() || null : null;

  const batchSizeLitersRaw = toNumber(recipe['BATCH_SIZE']);
  if (batchSizeLitersRaw == null || !(batchSizeLitersRaw > 0)) {
    throw new Error("BeerXML: recipe BATCH_SIZE is required and must be > 0 (liters)");
  }
  const batchSizeLiters = batchSizeLitersRaw;

  const fermentablesContainer = isObject(recipe['FERMENTABLES']) ? recipe['FERMENTABLES'] : null;
  const hopsContainer = isObject(recipe['HOPS']) ? recipe['HOPS'] : null;
  const yeastsContainer = isObject(recipe['YEASTS']) ? recipe['YEASTS'] : null;
  const miscsContainer = isObject(recipe['MISCS']) ? recipe['MISCS'] : null;
  const fermentables = asArray<unknown>(fermentablesContainer?.['FERMENTABLE']).filter((f): f is XmlNode => isObject(f));
  const hops = asArray<unknown>(hopsContainer?.['HOP']).filter((h): h is XmlNode => isObject(h));
  const yeasts = asArray<unknown>(yeastsContainer?.['YEAST']).filter((y): y is XmlNode => isObject(y));
  const miscs = asArray<unknown>(miscsContainer?.['MISC']).filter((m): m is XmlNode => isObject(m));

  const gristJson: BeerXmlGristRow[] = fermentables
    .map((f) => {
      const name = typeof f['NAME'] === "string" ? f['NAME'].trim() : "";
      const amountKg = toNumber(f['AMOUNT']);
      if (!name || amountKg == null) {
        warnings.push({ code: "fermentable_skipped", message: `Skipped fermentable missing NAME/AMOUNT: ${String(name)}` });
        return null;
      }
      const colorLovibond = toNumber(f['COLOR']);
      const yieldPercent = toNumber(f['YIELD']);
      const potential =
        yieldPercent != null ? ({ kind: "yieldPercent", value: yieldPercent } as const) : null;
      const typeRaw = typeof f['TYPE'] === "string" ? f['TYPE'] : null;
      const addAfterBoilRaw = typeof f['ADD_AFTER_BOIL'] === "string" ? f['ADD_AFTER_BOIL'].trim().toUpperCase() : "";
      const addAfterBoil = addAfterBoilRaw === "TRUE" || addAfterBoilRaw === "1" || addAfterBoilRaw === "YES";
      return {
        id: newId(),
        name,
        amountKg,
        colorLovibond: colorLovibond != null ? colorLovibond : null,
        potential,
        maltClass: normMaltClass(typeRaw),
        addAfterBoil: addAfterBoil || undefined,
      } as BeerXmlGristRow;
    })
    .filter((g): g is BeerXmlGristRow => g != null);

  const hopsJson: BeerXmlHopRow[] = hops
    .map((h) => {
      const name = typeof h['NAME'] === "string" ? h['NAME'].trim() : "";
      const amountKg = toNumber(h['AMOUNT']);
      if (!name || amountKg == null) {
        warnings.push({ code: "hop_skipped", message: `Skipped hop missing NAME/AMOUNT: ${String(name)}` });
        return null;
      }
      const alpha = toNumber(h['ALPHA']);
      const timeMinutes = toNumber(h['TIME']);
      const use = normUseHop(typeof h['USE'] === "string" ? h['USE'] : null);
      return {
        id: newId(),
        name,
        amountGrams: amountKg * 1000,
        alphaAcidPercent: alpha != null ? alpha : null,
        use,
        timeMinutes: timeMinutes != null ? timeMinutes : null,
      } as BeerXmlHopRow;
    })
    .filter((h): h is BeerXmlHopRow => h != null);

  const yeastJson: BeerXmlYeastRow[] = yeasts
    .map((y) => {
      const name = typeof y['NAME'] === "string" ? y['NAME'].trim() : "";
      if (!name) {
        warnings.push({ code: "yeast_skipped", message: "Skipped yeast missing NAME" });
        return null;
      }
      const lab = typeof y['LABORATORY'] === "string" ? y['LABORATORY'].trim() || null : null;
      const productId = typeof y['PRODUCT_ID'] === "string" ? y['PRODUCT_ID'].trim() || null : null;
      const attenuation = toNumber(y['ATTENUATION']);
      return {
        id: newId(),
        name,
        lab,
        productId,
        attenuationMin: attenuation != null ? attenuation : null,
        attenuationMax: attenuation != null ? attenuation : null,
      } as BeerXmlYeastRow;
    })
    .filter((y): y is BeerXmlYeastRow => y != null);

  const miscJson: BeerXmlMiscRow[] = miscs
    .map((m) => {
      const name = typeof m['NAME'] === "string" ? m['NAME'].trim() : "";
      const amount = toNumber(m['AMOUNT']);
      if (!name || amount == null) {
        warnings.push({ code: "misc_skipped", message: `Skipped misc missing NAME/AMOUNT: ${String(name)}` });
        return null;
      }
      const type = normMiscType(typeof m['TYPE'] === "string" ? m['TYPE'] : null);
      const use = normMiscUse(typeof m['USE'] === "string" ? m['USE'] : null);
      const timeMinutes = toNumber(m['TIME']);
      const useFor = typeof m['USE_FOR'] === "string" ? m['USE_FOR'].trim() || null : null;
      const notes = typeof m['NOTES'] === "string" ? m['NOTES'].trim() || null : null;
      // BeerXML misc AMOUNT is usually in kg (weight), but can be volume depending on type.
      // For v1, assume weight unless AMOUNT_IS_WEIGHT is explicitly false.
      const amountIsWeightRaw = typeof m['AMOUNT_IS_WEIGHT'] === "string" ? m['AMOUNT_IS_WEIGHT'].trim().toLowerCase() : null;
      const amountIsWeight = amountIsWeightRaw === "false" ? false : true;

      return {
        id: newId(),
        name,
        type,
        use,
        timeMinutes: timeMinutes != null ? timeMinutes : null,
        amount,
        amountIsWeight,
        useFor,
        notes,
      } as BeerXmlMiscRow;
    })
    .filter((m): m is BeerXmlMiscRow => m != null);

  if (gristJson.length === 0) {
    warnings.push({ code: "no_fermentables", message: "No fermentables found in BeerXML; recipe will import with an empty grist." });
  }

  return { recipeName, notes, batchSizeLiters, gristJson, hopsJson, yeastJson, miscJson, warnings };
}

export function importBeerXmlToLegacy(xml: string): {
  recipeName: string;
  notes: string | null;
  batchSizeLiters: number;
  gristJson: BeerXmlGristRow[];
  hopsJson: BeerXmlHopRow[];
  yeastJson: BeerXmlYeastRow[];
  miscJson: BeerXmlMiscRow[];
  warnings: ImportWarning[];
} {
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
  if (mash) out['mash'] = mash;

  return {
    recipeName: mapped.recipeName,
    notes: mapped.notes,
    beerJsonRecipeJson: { beerjson: { version: 1, recipes: [out] } },
    warnings: mapped.warnings,
  };
}

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
        // Not in BeerJSON schema, but allowed (additionalProperties is not false on this type).
        id: g.id,
        name: g.name,
        type: "grain",
        grain_group: maltClassToGrainGroup(g.maltClass),
        yield: gristPotentialToBeerJsonYield(g.potential),
        ...(typeof g.colorLovibond === "number" && Number.isFinite(g.colorLovibond) && g.colorLovibond >= 0
          ? { color: { unit: "Lovi", value: g.colorLovibond } }
          : {}),
        amount: { unit: "kg", value: g.amountKg },
        timing: { use: g.addAfterBoil ? "add_to_boil" : "add_to_mash" },
      })),
      hop_additions: mapped.hopsJson.map((h) => ({
        id: h.id,
        name: h.name,
        origin: h.country ?? undefined,
        alpha_acid: { unit: "%", value: typeof h.alphaAcidPercent === "number" && Number.isFinite(h.alphaAcidPercent) ? h.alphaAcidPercent : 0 },
        amount: { unit: "g", value: h.amountGrams },
        timing: toTiming(h.use, h.timeMinutes),
      })),
      culture_additions: mapped.yeastJson.map((y) => {
        const attMin = typeof y.attenuationMin === "number" && Number.isFinite(y.attenuationMin) ? y.attenuationMin : null;
        const attMax = typeof y.attenuationMax === "number" && Number.isFinite(y.attenuationMax) ? y.attenuationMax : null;
        const attenuation =
          attMin != null && attMax != null ? (attMin + attMax) / 2 : attMin != null ? attMin : attMax != null ? attMax : null;
        const out: Record<string, unknown> = {
          id: y.id,
          name: y.name,
          // BeerJSON required fields:
          type: "ale",
          form: "dry",
          producer: y.lab ?? undefined,
          product_id: y.productId ?? undefined,
          amount: { unit: "pkg", value: 1 },
        };
        if (attenuation != null) out['attenuation'] = { unit: "%", value: attenuation };
        return out;
      }),
      miscellaneous_additions: mapped.miscJson.map((m) => {
        const out: Record<string, unknown> = {
          id: m.id,
          name: m.name,
          type: miscTypeToBeerJsonType(m.type),
          timing: toTiming(m.use, m.timeMinutes),
          amount: m.amountIsWeight ? { unit: "kg", value: m.amount } : { unit: "l", value: m.amount },
        };
        if (m.useFor) out['use_for'] = m.useFor;
        if (m.notes) out['notes'] = m.notes;
        return out;
      }),
    },
  };
  if (mapped.notes) recipe['notes'] = mapped.notes;
  return recipe;
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
    if (mash) out['mash'] = mash;
    return {
      recipeName: legacy.recipeName,
      notes: legacy.notes,
      beerJsonRecipeJson: { beerjson: { version: 1, recipes: [out] } },
      warnings: legacy.warnings,
      styleCandidate,
    };
  });
}
