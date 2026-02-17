import { XMLParser } from "fast-xml-parser";

type ImportWarning = { code: string; message: string };

type LegacyGristRow = {
  id: string;
  name: string;
  amountKg: number;
  colorLovibond: number | null;
  potential: { kind: "ppg" | "yieldPercent" | "sg"; value: number } | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
};

type LegacyHopRow = {
  id: string;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: "boil" | "whirlpool" | "dryhop";
  timeMinutes: number | null;
};

type LegacyYeastRow = {
  id: string;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

type LegacyMiscRow = {
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

function normUseHop(useRaw: string | null): LegacyHopRow["use"] {
  const u = (useRaw ?? "").trim().toLowerCase();
  if (u.includes("dry")) return "dryhop";
  if (u.includes("whirlpool") || u.includes("flame")) return "whirlpool";
  return "boil";
}

function normMaltClass(typeRaw: string | null): LegacyGristRow["maltClass"] {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("crystal") || t.includes("caramel")) return "crystal";
  if (t.includes("roast") || t.includes("black") || t.includes("chocolate")) return "roast";
  if (t.includes("acid")) return "acid";
  return "base";
}

function normMiscType(typeRaw: string | null): LegacyMiscRow["type"] {
  const t = (typeRaw ?? "").trim().toLowerCase();
  if (t.includes("fin")) return "fining";
  if (t.includes("water")) return "water_agent";
  if (t.includes("herb")) return "herb";
  if (t.includes("flavor")) return "flavor";
  if (t.includes("spice")) return "spice";
  return "other";
}

function normMiscUse(useRaw: string | null): LegacyMiscRow["use"] {
  const u = (useRaw ?? "").trim().toLowerCase();
  if (u.includes("mash")) return "mash";
  if (u.includes("primary")) return "primary";
  if (u.includes("secondary")) return "secondary";
  if (u.includes("bott")) return "bottling";
  return "boil";
}

export function importBeerXmlToLegacy(xml: string): {
  recipeName: string;
  notes: string | null;
  gristJson: LegacyGristRow[];
  hopsJson: LegacyHopRow[];
  yeastJson: LegacyYeastRow[];
  miscJson: LegacyMiscRow[];
  warnings: ImportWarning[];
} {
  const warnings: ImportWarning[] = [];

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

  const doc = parser.parse(xml) as any;
  const recipe = doc?.RECIPES?.RECIPE ?? doc?.RECIPE ?? null;
  if (!recipe || typeof recipe !== "object") throw new Error("BeerXML: missing RECIPES.RECIPE");

  const recipeName = typeof recipe.NAME === "string" ? recipe.NAME.trim() : "";
  if (!recipeName) throw new Error("BeerXML: recipe NAME is required");
  const notes = typeof recipe.NOTES === "string" ? recipe.NOTES.trim() || null : null;

  const fermentables = asArray<any>(recipe.FERMENTABLES?.FERMENTABLE);
  const hops = asArray<any>(recipe.HOPS?.HOP);
  const yeasts = asArray<any>(recipe.YEASTS?.YEAST);
  const miscs = asArray<any>(recipe.MISCS?.MISC);

  const gristJson: LegacyGristRow[] = fermentables
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
      } as LegacyGristRow;
    })
    .filter(Boolean) as LegacyGristRow[];

  const hopsJson: LegacyHopRow[] = hops
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
      } as LegacyHopRow;
    })
    .filter(Boolean) as LegacyHopRow[];

  const yeastJson: LegacyYeastRow[] = yeasts
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
      } as LegacyYeastRow;
    })
    .filter(Boolean) as LegacyYeastRow[];

  const miscJson: LegacyMiscRow[] = miscs
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
      } as LegacyMiscRow;
    })
    .filter(Boolean) as LegacyMiscRow[];

  if (gristJson.length === 0) {
    warnings.push({ code: "no_fermentables", message: "No fermentables found in BeerXML; recipe will import with an empty grist." });
  }

  return { recipeName, notes, gristJson, hopsJson, yeastJson, miscJson, warnings };
}

