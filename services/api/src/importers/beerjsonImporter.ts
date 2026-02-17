import { validateBeerJsonDoc } from "../beerjson/index.js";

type ImportWarning = { code: string; message: string };

function newId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

export function importBeerJsonToLegacy(doc: unknown): {
  recipeName: string;
  notes: string | null;
  gristJson: any[];
  hopsJson: any[];
  yeastJson: any[];
  miscJson: any[];
  warnings: ImportWarning[];
} {
  const warnings: ImportWarning[] = [];
  const v = validateBeerJsonDoc(doc);
  if (!v.ok) throw new Error(v.errors);

  const d = doc as any;
  const recipes = asArray<any>(d?.beerjson?.recipes);
  const r = recipes[0];
  if (!r || typeof r !== "object") throw new Error("BeerJSON: missing beerjson.recipes[0]");

  const recipeName = typeof r.name === "string" ? r.name : "";
  if (!recipeName) throw new Error("BeerJSON: recipe name is required");
  const notes = typeof r.notes === "string" ? r.notes : null;

  const ing = r.ingredients ?? {};
  const fermentables = asArray<any>(ing.fermentable_additions);
  const hops = asArray<any>(ing.hop_additions);
  const cultures = asArray<any>(ing.culture_additions);
  const misc = asArray<any>(ing.miscellaneous_additions);

  const gristJson = fermentables.map((f) => {
    const amount = f?.amount;
    const amountKg =
      amount?.unit === "kg" && typeof amount.value === "number" ? amount.value : amount?.unit === "g" && typeof amount.value === "number" ? amount.value / 1000 : null;
    if (amountKg == null) warnings.push({ code: "fermentable_amount_unknown", message: `Fermentable amount missing/unknown for ${String(f?.name ?? "")}` });

    const color = f?.color;
    const colorLovibond = color?.unit === "Lovi" ? toNumber(color.value) : null;

    const y = f?.yield;
    const potential = y?.potential?.unit === "sg" && typeof y.potential.value === "number"
      ? { kind: "sg", value: y.potential.value }
      : y?.fine_grind?.unit === "%" && typeof y.fine_grind.value === "number"
        ? { kind: "yieldPercent", value: y.fine_grind.value }
        : null;

    return {
      id: newId(),
      name: typeof f?.name === "string" ? f.name : "",
      amountKg: amountKg ?? 0,
      colorLovibond,
      potential,
      maltClass: "base",
    };
  });

  const hopsJson = hops.map((h) => {
    const amount = h?.amount;
    const amountGrams =
      amount?.unit === "g" && typeof amount.value === "number"
        ? amount.value
        : amount?.unit === "kg" && typeof amount.value === "number"
          ? amount.value * 1000
          : 0;
    const alpha = h?.alpha_acid?.unit === "%" ? toNumber(h?.alpha_acid?.value) : null;
    const timingUse = h?.timing?.use;
    const use = timingUse === "add_to_fermentation" ? "dryhop" : "boil";
    const timeMinutes = h?.timing?.duration?.unit === "min" ? toNumber(h?.timing?.duration?.value) : null;
    return {
      id: newId(),
      name: typeof h?.name === "string" ? h.name : "",
      amountGrams,
      alphaAcidPercent: alpha,
      use,
      timeMinutes,
    };
  });

  const yeastJson = cultures.map((c) => {
    const att = c?.attenuation?.unit === "%" ? toNumber(c?.attenuation?.value) : null;
    return {
      id: newId(),
      name: typeof c?.name === "string" ? c.name : "",
      lab: typeof c?.producer === "string" ? c.producer : null,
      productId: typeof c?.product_id === "string" ? c.product_id : null,
      attenuationMin: att,
      attenuationMax: att,
    };
  });

  const miscJson = misc.map((m) => {
    const amount = m?.amount;
    const amountIsWeight = amount?.unit === "kg" || amount?.unit === "g";
    const amountValue =
      amount?.unit === "kg" && typeof amount.value === "number"
        ? amount.value
        : amount?.unit === "g" && typeof amount.value === "number"
          ? amount.value / 1000
          : amount?.unit === "l" && typeof amount.value === "number"
            ? amount.value
            : 0;
    const t = typeof m?.type === "string" ? m.type : "other";
    return {
      id: newId(),
      name: typeof m?.name === "string" ? m.name : "",
      type: t === "water agent" ? "water_agent" : t,
      use: "boil",
      timeMinutes: null,
      amount: amountValue,
      amountIsWeight,
      useFor: typeof m?.use_for === "string" ? m.use_for : null,
      notes: typeof m?.notes === "string" ? m.notes : null,
    };
  });

  if (gristJson.length === 0) {
    warnings.push({ code: "no_fermentables", message: "BeerJSON recipe had no fermentable_additions; imported grist will be empty." });
  }

  return { recipeName, notes, gristJson, hopsJson, yeastJson, miscJson, warnings };
}

