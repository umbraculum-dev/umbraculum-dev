import { XMLParser } from "fast-xml-parser";

type ImportWarning = { code: string; message: string };
export type StyleCandidate = { name?: string | null; code?: string | null };

type BeerJsonDocument = {
  beerjson: {
    version: number;
    recipes: any[];
  };
};

type BeerXmlGristRow = {
  id: string;
  name: string;
  amountKg: number;
  colorLovibond: number | null;
  potential: { kind: "ppg" | "yieldPercent" | "sg"; value: number } | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
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

function asArray<T>(v: any): T[] {
  if (!v) return [];
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

  const timing: any = { use: useMap[use] ?? "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing.duration = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
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

function parseBeerXml(xml: string): any {
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

  return parser.parse(xml) as any;
}

function extractBeerXmlRecipes(doc: any): any[] {
  const raw = doc?.RECIPES?.RECIPE ?? doc?.RECIPE ?? null;
  return asArray<any>(raw).filter((r) => r && typeof r === "object");
}

function extractStyleCandidateFromBeerXmlRecipe(recipe: any): StyleCandidate | null {
  const style = recipe?.STYLE ?? null;
  if (!style || typeof style !== "object") return null;

  const name = typeof style?.NAME === "string" ? style.NAME.trim() : "";

  const categoryNumberRaw = style?.CATEGORY_NUMBER;
  const categoryNumber =
    typeof categoryNumberRaw === "number" && Number.isFinite(categoryNumberRaw) ? String(categoryNumberRaw)
      : typeof categoryNumberRaw === "string" ? categoryNumberRaw.trim()
      : "";

  const styleLetter = typeof style?.STYLE_LETTER === "string" ? style.STYLE_LETTER.trim() : "";
  const code = categoryNumber && styleLetter ? `${categoryNumber}${styleLetter}` : "";

  if (!name && !code) return null;
  return { name: name || null, code: code || null };
}

function importBeerXmlRecipeToLegacy(recipe: any): {
  recipeName: string;
  notes: string | null;
  gristJson: BeerXmlGristRow[];
  hopsJson: BeerXmlHopRow[];
  yeastJson: BeerXmlYeastRow[];
  miscJson: BeerXmlMiscRow[];
  warnings: ImportWarning[];
} {
  const warnings: ImportWarning[] = [];

  const recipeName = typeof recipe.NAME === "string" ? recipe.NAME.trim() : "";
  if (!recipeName) throw new Error("BeerXML: recipe NAME is required");
  const notes = typeof recipe.NOTES === "string" ? recipe.NOTES.trim() || null : null;

  const fermentables = asArray<any>(recipe.FERMENTABLES?.FERMENTABLE);
  const hops = asArray<any>(recipe.HOPS?.HOP);
  const yeasts = asArray<any>(recipe.YEASTS?.YEAST);
  const miscs = asArray<any>(recipe.MISCS?.MISC);

  const gristJson: BeerXmlGristRow[] = fermentables
    .map((f) => {
      const name = typeof f?.NAME === "string" ? f.NAME.trim() : "";
      const amountKg = toNumber(f?.AMOUNT);
      if (!name || amountKg == null) {
        warnings.push({ code: "fermentable_skipped", message: `Skipped fermentable missing NAME/AMOUNT: ${String(name)}` });
        return null;
      }
      const colorLovibond = toNumber(f?.COLOR);
      const yieldPercent = toNumber(f?.YIELD);
      const potential =
        yieldPercent != null ? ({ kind: "yieldPercent", value: yieldPercent } as const) : null;
      const typeRaw = typeof f?.TYPE === "string" ? f.TYPE : null;
      return {
        id: newId(),
        name,
        amountKg,
        colorLovibond: colorLovibond != null ? colorLovibond : null,
        potential,
        maltClass: normMaltClass(typeRaw),
      } as BeerXmlGristRow;
    })
    .filter(Boolean) as BeerXmlGristRow[];

  const hopsJson: BeerXmlHopRow[] = hops
    .map((h) => {
      const name = typeof h?.NAME === "string" ? h.NAME.trim() : "";
      const amountKg = toNumber(h?.AMOUNT);
      if (!name || amountKg == null) {
        warnings.push({ code: "hop_skipped", message: `Skipped hop missing NAME/AMOUNT: ${String(name)}` });
        return null;
      }
      const alpha = toNumber(h?.ALPHA);
      const timeMinutes = toNumber(h?.TIME);
      const use = normUseHop(typeof h?.USE === "string" ? h.USE : null);
      return {
        id: newId(),
        name,
        amountGrams: amountKg * 1000,
        alphaAcidPercent: alpha != null ? alpha : null,
        use,
        timeMinutes: timeMinutes != null ? timeMinutes : null,
      } as BeerXmlHopRow;
    })
    .filter(Boolean) as BeerXmlHopRow[];

  const yeastJson: BeerXmlYeastRow[] = yeasts
    .map((y) => {
      const name = typeof y?.NAME === "string" ? y.NAME.trim() : "";
      if (!name) {
        warnings.push({ code: "yeast_skipped", message: "Skipped yeast missing NAME" });
        return null;
      }
      const lab = typeof y?.LABORATORY === "string" ? y.LABORATORY.trim() || null : null;
      const productId = typeof y?.PRODUCT_ID === "string" ? y.PRODUCT_ID.trim() || null : null;
      const attenuation = toNumber(y?.ATTENUATION);
      return {
        id: newId(),
        name,
        lab,
        productId,
        attenuationMin: attenuation != null ? attenuation : null,
        attenuationMax: attenuation != null ? attenuation : null,
      } as BeerXmlYeastRow;
    })
    .filter(Boolean) as BeerXmlYeastRow[];

  const miscJson: BeerXmlMiscRow[] = miscs
    .map((m) => {
      const name = typeof m?.NAME === "string" ? m.NAME.trim() : "";
      const amount = toNumber(m?.AMOUNT);
      if (!name || amount == null) {
        warnings.push({ code: "misc_skipped", message: `Skipped misc missing NAME/AMOUNT: ${String(name)}` });
        return null;
      }
      const type = normMiscType(typeof m?.TYPE === "string" ? m.TYPE : null);
      const use = normMiscUse(typeof m?.USE === "string" ? m.USE : null);
      const timeMinutes = toNumber(m?.TIME);
      const useFor = typeof m?.USE_FOR === "string" ? m.USE_FOR.trim() || null : null;
      const notes = typeof m?.NOTES === "string" ? m.NOTES.trim() || null : null;
      // BeerXML misc AMOUNT is usually in kg (weight), but can be volume depending on type.
      // For v1, assume weight unless AMOUNT_IS_WEIGHT is explicitly false.
      const amountIsWeightRaw = typeof m?.AMOUNT_IS_WEIGHT === "string" ? m.AMOUNT_IS_WEIGHT.trim().toLowerCase() : null;
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
    .filter(Boolean) as BeerXmlMiscRow[];

  if (gristJson.length === 0) {
    warnings.push({ code: "no_fermentables", message: "No fermentables found in BeerXML; recipe will import with an empty grist." });
  }

  return { recipeName, notes, gristJson, hopsJson, yeastJson, miscJson, warnings };
}

export function importBeerXmlToLegacy(xml: string): {
  recipeName: string;
  notes: string | null;
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
  const mapped = importBeerXmlToLegacy(xml);

  const recipe: any = legacyToBeerJsonRecipe(mapped);

  return {
    recipeName: mapped.recipeName,
    notes: mapped.notes,
    beerJsonRecipeJson: { beerjson: { version: 1, recipes: [recipe] } },
    warnings: mapped.warnings,
  };
}

function legacyToBeerJsonRecipe(mapped: {
  recipeName: string;
  notes: string | null;
  gristJson: BeerXmlGristRow[];
  hopsJson: BeerXmlHopRow[];
  yeastJson: BeerXmlYeastRow[];
  miscJson: BeerXmlMiscRow[];
}) {
  const recipe: any = {
    name: mapped.recipeName,
    type: "all grain",
    author: "brewery-app",
    efficiency: { brewhouse: { unit: "%", value: 75 } },
    batch_size: { unit: "l", value: 20 },
    ingredients: {
      fermentable_additions: mapped.gristJson.map((g) => ({
        // Not in BeerJSON schema, but allowed (additionalProperties is not false on this type).
        id: g.id,
        name: g.name,
        type: "grain",
        grain_group: maltClassToGrainGroup(g.maltClass),
        yield: gristPotentialToBeerJsonYield(g.potential),
        color: { unit: "Lovi", value: typeof g.colorLovibond === "number" && Number.isFinite(g.colorLovibond) ? g.colorLovibond : 0 },
        amount: { unit: "kg", value: g.amountKg },
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
        const out: any = {
          id: y.id,
          name: y.name,
          // BeerJSON required fields:
          type: "ale",
          form: "dry",
          producer: y.lab ?? undefined,
          product_id: y.productId ?? undefined,
          amount: { unit: "pkg", value: 1 },
        };
        if (attenuation != null) out.attenuation = { unit: "%", value: attenuation };
        return out;
      }),
      miscellaneous_additions: mapped.miscJson.map((m) => {
        const out: any = {
          id: m.id,
          name: m.name,
          type: miscTypeToBeerJsonType(m.type),
          timing: toTiming(m.use, m.timeMinutes),
          amount: m.amountIsWeight ? { unit: "kg", value: m.amount } : { unit: "l", value: m.amount },
        };
        if (m.useFor) out.use_for = m.useFor;
        if (m.notes) out.notes = m.notes;
        return out;
      }),
    },
  };
  if (mapped.notes) recipe.notes = mapped.notes;
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
    const recipe = legacyToBeerJsonRecipe(legacy);
    return {
      recipeName: legacy.recipeName,
      notes: legacy.notes,
      beerJsonRecipeJson: { beerjson: { version: 1, recipes: [recipe] } },
      warnings: legacy.warnings,
      styleCandidate,
    };
  });
}
