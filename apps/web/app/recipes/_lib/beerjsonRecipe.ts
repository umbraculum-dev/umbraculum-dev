type BeerJsonDocument = {
  beerjson: {
    version: number;
    recipes: any[];
  };
};

type GristPotential =
  | { kind: "ppg"; value: number }
  | { kind: "yieldPercent"; value: number }
  | { kind: "sg"; value: number }
  | null;

export type EditorGristRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  producer?: string | null;
  group?: string | null;
  mashDiPh?: number | null;
  mashTaToPh57_mEqPerKg?: number | null;
  mashRoastDehuskedOverride?: boolean | null;
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential;
  maltClass: "base" | "crystal" | "roast" | "acid";
};

export type EditorHopRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: "boil" | "whirlpool" | "dryhop";
  timeMinutes: number | null;
};

export type EditorYeastRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

export type EditorMiscRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  type: "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
  use: "boil" | "mash" | "primary" | "secondary" | "bottling";
  timeMinutes: number | null;
  /** If amountIsWeight=true: kilograms. If false: liters. */
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null;
  notes?: string | null;
};

function safeNum(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function ppgToSg(ppg: number) {
  return 1 + ppg / 1000;
}

function maltClassToGrainGroup(maltClass: EditorGristRow["maltClass"]) {
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

function hopUseToTiming(use: EditorHopRow["use"], timeMinutes: number | null) {
  const timing: any = { use: use === "dryhop" ? "add_to_fermentation" : "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing.duration = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}

function miscUseToTiming(use: EditorMiscRow["use"], timeMinutes: number | null) {
  const useMap: Record<EditorMiscRow["use"], string> = {
    mash: "add_to_mash",
    boil: "add_to_boil",
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

function miscTypeToBeerJsonType(t: EditorMiscRow["type"]) {
  return t === "water_agent" ? "water agent" : t;
}

function buildFermentableAddition(row: EditorGristRow) {
  const yieldObj =
    row.potential?.kind === "yieldPercent"
      ? { fine_grind: { unit: "%", value: row.potential.value } }
      : row.potential?.kind === "sg"
        ? { potential: { unit: "sg", value: row.potential.value } }
        : row.potential?.kind === "ppg"
          ? { potential: { unit: "sg", value: ppgToSg(row.potential.value) } }
          : { fine_grind: { unit: "%", value: 0 } };

  return {
    // Not in BeerJSON schema, but allowed (additionalProperties is not false on this type).
    id: row.id,
    name: row.name,
    type: "grain",
    producer: row.producer ?? undefined,
    grain_group: maltClassToGrainGroup(row.maltClass),
    yield: yieldObj,
    color: { unit: "Lovi", value: row.colorLovibond ?? 0 },
    amount: { unit: "kg", value: row.amountKg },
  };
}

function buildHopAddition(row: EditorHopRow) {
  return {
    id: row.id,
    name: row.name,
    origin: row.country ?? undefined,
    alpha_acid: { unit: "%", value: row.alphaAcidPercent ?? 0 },
    amount: { unit: "g", value: row.amountGrams },
    timing: hopUseToTiming(row.use, row.timeMinutes),
  };
}

function buildCultureAddition(row: EditorYeastRow) {
  const attMin = typeof row.attenuationMin === "number" && Number.isFinite(row.attenuationMin) ? row.attenuationMin : null;
  const attMax = typeof row.attenuationMax === "number" && Number.isFinite(row.attenuationMax) ? row.attenuationMax : null;
  const attenuation =
    attMin != null && attMax != null ? (attMin + attMax) / 2 : attMin != null ? attMin : attMax != null ? attMax : null;
  const out: any = {
    id: row.id,
    name: row.name,
    // BeerJSON required fields:
    type: "ale",
    form: "dry",
    producer: row.lab ?? undefined,
    product_id: row.productId ?? undefined,
    amount: { unit: "pkg", value: 1 },
  };
  if (attenuation != null) out.attenuation = { unit: "%", value: attenuation };
  return out;
}

function buildMiscAddition(row: EditorMiscRow) {
  const out: any = {
    id: row.id,
    name: row.name,
    type: miscTypeToBeerJsonType(row.type),
    timing: miscUseToTiming(row.use, row.timeMinutes),
    amount: row.amountIsWeight ? { unit: "kg", value: row.amount } : { unit: "l", value: row.amount },
  };
  if (row.useFor) out.use_for = row.useFor;
  if (row.notes) out.notes = row.notes;
  return out;
}

export function buildBeerJsonRecipeDocument(args: {
  name: string;
  notes: string | null;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  batchSizeLiters?: number | null;
  brewhouseEfficiencyPercent?: number | null;
}): BeerJsonDocument {
  const batchSizeLiters = typeof args.batchSizeLiters === "number" && Number.isFinite(args.batchSizeLiters) ? args.batchSizeLiters : 20;
  const efficiency = typeof args.brewhouseEfficiencyPercent === "number" && Number.isFinite(args.brewhouseEfficiencyPercent) ? args.brewhouseEfficiencyPercent : 75;

  const recipe: any = {
    name: args.name,
    type: "all grain",
    author: "brewery-app",
    efficiency: { brewhouse: { unit: "%", value: efficiency } },
    batch_size: { unit: "l", value: batchSizeLiters },
    ingredients: {
      fermentable_additions: args.gristRows.map(buildFermentableAddition),
      hop_additions: args.hopsRows.filter((h) => h.name).map(buildHopAddition),
      culture_additions: args.yeastRows.filter((y) => y.name).map(buildCultureAddition),
      miscellaneous_additions: args.miscRows.filter((m) => m.name).map(buildMiscAddition),
    },
  };
  if (args.notes) recipe.notes = args.notes;

  return { beerjson: { version: 1, recipes: [recipe] } };
}

export function buildRecipeExtJsonFromEditorState(args: {
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  extBase?: unknown;
}): unknown {
  const extBase =
    args.extBase && typeof args.extBase === "object" && !Array.isArray(args.extBase)
      ? (args.extBase as Record<string, unknown>)
      : null;
  const ingredientLinks = {
    grist: Object.fromEntries(
      args.gristRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
    hops: Object.fromEntries(
      args.hopsRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
    yeast: Object.fromEntries(
      args.yeastRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
    misc: Object.fromEntries(
      args.miscRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
  };

  const mashPhModel = Object.fromEntries(
    args.gristRows
      .map((r) => {
        const mashDiPh = typeof r.mashDiPh === "number" && Number.isFinite(r.mashDiPh) ? r.mashDiPh : undefined;
        const mashTaToPh57_mEqPerKg =
          typeof r.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(r.mashTaToPh57_mEqPerKg)
            ? r.mashTaToPh57_mEqPerKg
            : undefined;
        const roastDehuskedOverride =
          r.mashRoastDehuskedOverride === undefined ? undefined : r.mashRoastDehuskedOverride;
        if (mashDiPh === undefined && mashTaToPh57_mEqPerKg === undefined && roastDehuskedOverride === undefined) {
          return null;
        }
        return [
          r.id,
          {
            ...(mashDiPh === undefined ? {} : { mashDiPh }),
            ...(mashTaToPh57_mEqPerKg === undefined ? {} : { mashTaToPh57_mEqPerKg }),
            ...(roastDehuskedOverride === undefined ? {} : { roastDehuskedOverride }),
          },
        ] as const;
      })
      .filter(Boolean) as Array<readonly [string, unknown]>,
  );

  return {
    ...(extBase ? extBase : {}),
    version: 1,
    ingredientLinks,
    mashPhModel,
  };
}

export function editorStateFromBeerJson(doc: unknown): {
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
} {
  const d = (doc ?? {}) as any;
  const r0 = d?.beerjson?.recipes?.[0];
  const ing = r0?.ingredients ?? {};

  const fermentables = Array.isArray(ing?.fermentable_additions) ? ing.fermentable_additions : [];
  const hops = Array.isArray(ing?.hop_additions) ? ing.hop_additions : [];
  const cultures = Array.isArray(ing?.culture_additions) ? ing.culture_additions : [];
  const misc = Array.isArray(ing?.miscellaneous_additions) ? ing.miscellaneous_additions : [];

  const gristRows: EditorGristRow[] = fermentables
    .map((f: any) => {
      const id = typeof f?.id === "string" ? f.id : `${Date.now()}-${Math.random()}`;
      const name = typeof f?.name === "string" ? f.name : "";
      if (!name) return null;
      const amountKg =
        f?.amount?.unit === "kg" ? safeNum(f?.amount?.value, 0) : f?.amount?.unit === "g" ? safeNum(f?.amount?.value, 0) / 1000 : 0;
      const colorLovibond = f?.color?.unit === "Lovi" ? safeNum(f?.color?.value, 0) : 0;

      const potential: GristPotential =
        f?.yield?.potential?.unit === "sg" && typeof f?.yield?.potential?.value === "number"
          ? { kind: "sg", value: f.yield.potential.value }
          : f?.yield?.fine_grind?.unit === "%" && typeof f?.yield?.fine_grind?.value === "number"
            ? { kind: "yieldPercent", value: f.yield.fine_grind.value }
            : null;

      const grainGroup = typeof f?.grain_group === "string" ? f.grain_group : "";
      const maltClass: EditorGristRow["maltClass"] =
        grainGroup === "roasted" ? "roast" : grainGroup === "caramel" ? "crystal" : "base";

      return {
        id,
        ingredientId: null,
        name,
        producer: typeof f?.producer === "string" ? f.producer : null,
        // UI-only convenience: BeerProto had a "group" field; BeerJSON has `grain_group`.
        // We surface the BeerJSON grain_group here so the editor isn't blank.
        group: grainGroup || null,
        mashDiPh: null,
        mashTaToPh57_mEqPerKg: null,
        mashRoastDehuskedOverride: null,
        amountKg,
        colorLovibond,
        potential,
        maltClass,
      } as EditorGristRow;
    })
    .filter(Boolean) as EditorGristRow[];

  const hopsRows: EditorHopRow[] = hops
    .map((h: any) => {
      const id = typeof h?.id === "string" ? h.id : `${Date.now()}-${Math.random()}`;
      const name = typeof h?.name === "string" ? h.name : "";
      if (!name) return null;
      const amountGrams =
        h?.amount?.unit === "g" ? safeNum(h?.amount?.value, 0) : h?.amount?.unit === "kg" ? safeNum(h?.amount?.value, 0) * 1000 : 0;
      const alphaAcidPercent = h?.alpha_acid?.unit === "%" ? safeNum(h?.alpha_acid?.value, 0) : null;
      const timingUse = typeof h?.timing?.use === "string" ? h.timing.use : "";
      const use: EditorHopRow["use"] = timingUse === "add_to_fermentation" ? "dryhop" : "boil";
      const timeMinutes = h?.timing?.duration?.unit === "min" ? safeNum(h?.timing?.duration?.value, 0) : null;
      return {
        id,
        ingredientId: null,
        name,
        country: typeof h?.origin === "string" ? h.origin : null,
        amountGrams,
        alphaAcidPercent,
        use,
        timeMinutes,
      } as EditorHopRow;
    })
    .filter(Boolean) as EditorHopRow[];

  const yeastRows: EditorYeastRow[] = cultures
    .map((c: any) => {
      const id = typeof c?.id === "string" ? c.id : `${Date.now()}-${Math.random()}`;
      const name = typeof c?.name === "string" ? c.name : "";
      if (!name) return null;
      const att = c?.attenuation?.unit === "%" ? safeNum(c?.attenuation?.value, 0) : null;
      return {
        id,
        ingredientId: null,
        name,
        lab: typeof c?.producer === "string" ? c.producer : null,
        productId: typeof c?.product_id === "string" ? c.product_id : null,
        attenuationMin: att,
        attenuationMax: att,
      } as EditorYeastRow;
    })
    .filter(Boolean) as EditorYeastRow[];

  const miscRows: EditorMiscRow[] = misc
    .map((m: any) => {
      const id = typeof m?.id === "string" ? m.id : `${Date.now()}-${Math.random()}`;
      const name = typeof m?.name === "string" ? m.name : "";
      if (!name) return null;
      const amountIsWeight = m?.amount?.unit === "kg" || m?.amount?.unit === "g";
      const amount =
        m?.amount?.unit === "kg" ? safeNum(m?.amount?.value, 0) : m?.amount?.unit === "g" ? safeNum(m?.amount?.value, 0) / 1000 : m?.amount?.unit === "l" ? safeNum(m?.amount?.value, 0) : 0;
      const timingUse = typeof m?.timing?.use === "string" ? m.timing.use : "";
      const use: EditorMiscRow["use"] =
        timingUse === "add_to_mash"
          ? "mash"
          : timingUse === "add_to_fermentation"
            ? "secondary"
            : timingUse === "add_to_package"
              ? "bottling"
              : "boil";
      const timeMinutes = m?.timing?.duration?.unit === "min" ? safeNum(m?.timing?.duration?.value, 0) : null;
      const typeRaw = typeof m?.type === "string" ? m.type : "other";
      const type: EditorMiscRow["type"] = typeRaw === "water agent" ? "water_agent" : typeRaw;
      return {
        id,
        ingredientId: null,
        name,
        type,
        use,
        timeMinutes,
        amount,
        amountIsWeight,
        useFor: typeof m?.use_for === "string" ? m.use_for : null,
        notes: typeof m?.notes === "string" ? m.notes : null,
      } as EditorMiscRow;
    })
    .filter(Boolean) as EditorMiscRow[];

  return { gristRows, hopsRows, yeastRows, miscRows };
}

