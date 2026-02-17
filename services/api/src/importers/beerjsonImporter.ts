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
    const id = typeof f?.id === "string" && f.id.trim() ? f.id.trim() : newId();
    const amount = f?.amount;
    const amountKg =
      amount?.unit === "kg" && typeof amount.value === "number" ? amount.value : amount?.unit === "g" && typeof amount.value === "number" ? amount.value / 1000 : null;
    if (amountKg == null) warnings.push({ code: "fermentable_amount_unknown", message: `Fermentable amount missing/unknown for ${String(f?.name ?? "")}` });

    const color = f?.color;
    const colorLovibond = color?.unit === "Lovi" ? toNumber(color.value) : null;

    const y = f?.yield;
    const potentialSg =
      y?.potential?.unit === "sg" && typeof y.potential.value === "number" ? y.potential.value : null;
    const fineGrindYieldPercent =
      y?.fine_grind?.unit === "%" && typeof y.fine_grind.value === "number" ? y.fine_grind.value : null;

    // We treat 0 as "unknown" here because the web editor uses 0 as a placeholder to satisfy BeerJSON required fields.
    // This prevents server-side legacy validation from rejecting "potential.value must be > 0".
    const potential =
      potentialSg !== null && potentialSg > 0
        ? { kind: "sg", value: potentialSg }
        : fineGrindYieldPercent !== null && fineGrindYieldPercent > 0
          ? { kind: "yieldPercent", value: fineGrindYieldPercent }
          : null;
    if (potentialSg !== null && !(potentialSg > 0)) {
      warnings.push({ code: "fermentable_yield_unknown", message: `Fermentable yield/potential is 0/invalid for ${String(f?.name ?? "")}` });
    } else if (fineGrindYieldPercent !== null && !(fineGrindYieldPercent > 0)) {
      warnings.push({ code: "fermentable_yield_unknown", message: `Fermentable yield/potential is 0/invalid for ${String(f?.name ?? "")}` });
    }

    return {
      id,
      name: typeof f?.name === "string" ? f.name : "",
      amountKg: amountKg ?? 0,
      colorLovibond,
      potential,
      maltClass: "base",
    };
  });

  const hopsJson = hops.map((h) => {
    const id = typeof h?.id === "string" && h.id.trim() ? h.id.trim() : newId();
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
      id,
      name: typeof h?.name === "string" ? h.name : "",
      amountGrams,
      alphaAcidPercent: alpha,
      use,
      timeMinutes,
    };
  });

  const yeastJson = cultures.map((c) => {
    const id = typeof c?.id === "string" && c.id.trim() ? c.id.trim() : newId();
    const att = c?.attenuation?.unit === "%" ? toNumber(c?.attenuation?.value) : null;
    return {
      id,
      name: typeof c?.name === "string" ? c.name : "",
      lab: typeof c?.producer === "string" ? c.producer : null,
      productId: typeof c?.product_id === "string" ? c.product_id : null,
      attenuationMin: att,
      attenuationMax: att,
    };
  });

  const miscJson = misc.map((m) => {
    const id = typeof m?.id === "string" && m.id.trim() ? m.id.trim() : newId();
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
    const timingUse = typeof m?.timing?.use === "string" ? m.timing.use : null;
    const use: "boil" | "mash" | "primary" | "secondary" | "bottling" =
      timingUse === "add_to_mash"
        ? "mash"
        : timingUse === "add_to_fermentation"
          ? "secondary"
          : timingUse === "add_to_package"
            ? "bottling"
            : "boil";
    const timeMinutes =
      m?.timing?.duration?.unit === "min" ? toNumber(m?.timing?.duration?.value) : null;
    const t = typeof m?.type === "string" ? m.type : "other";
    return {
      id,
      name: typeof m?.name === "string" ? m.name : "",
      type: t === "water agent" ? "water_agent" : t,
      use,
      timeMinutes,
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

