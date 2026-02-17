type LegacyGristRow = {
  name: string;
  producer?: string | null;
  amountKg: number;
  colorLovibond: number | null;
  potential: { kind: "ppg" | "yieldPercent" | "sg"; value: number } | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
};

type LegacyHopRow = {
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: "boil" | "whirlpool" | "dryhop";
  timeMinutes: number | null;
};

type LegacyYeastRow = {
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

type LegacyMiscRow = {
  name: string;
  type: "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
  use: "boil" | "mash" | "primary" | "secondary" | "bottling";
  timeMinutes: number | null;
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null;
  notes?: string | null;
};

type LegacyRecipeMeta = {
  name: string;
  notes: string | null;
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
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

function gristPotentialToBeerJsonYield(p: LegacyGristRow["potential"]) {
  if (!p) return { fine_grind: { unit: "%", value: 0 } };
  if (p.kind === "yieldPercent") return { fine_grind: { unit: "%", value: p.value } };
  if (p.kind === "sg") return { potential: { unit: "sg", value: p.value } };
  // ppg: 37 => 1.037
  return { potential: { unit: "sg", value: 1 + p.value / 1000 } };
}

function maltClassToGrainGroup(maltClass: LegacyGristRow["maltClass"]) {
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

function miscTypeToBeerJsonType(t: LegacyMiscRow["type"]) {
  if (t === "water_agent") return "water agent";
  return t;
}

export function buildBeerJsonDocumentFromLegacy(input: {
  recipe: LegacyRecipeMeta;
  gristJson: unknown;
  hopsJson: unknown;
  yeastJson: unknown;
  miscJson: unknown;
}) {
  const grist = asArray<LegacyGristRow>(input.gristJson);
  const hops = asArray<LegacyHopRow>(input.hopsJson);
  const yeast = asArray<LegacyYeastRow>(input.yeastJson);
  const misc = asArray<LegacyMiscRow>(input.miscJson);

  const recipe: any = {
    name: input.recipe.name,
    type: "all grain",
    author: "brewery-app",
    efficiency: { brewhouse: { unit: "%", value: 75 } },
    batch_size: { unit: "l", value: 20 },
    ingredients: {
      fermentable_additions: grist.map((g) => ({
        name: g.name,
        type: "grain",
        producer: g.producer ?? undefined,
        grain_group: maltClassToGrainGroup(g.maltClass),
        yield: gristPotentialToBeerJsonYield(g.potential),
        color: { unit: "Lovi", value: typeof g.colorLovibond === "number" && Number.isFinite(g.colorLovibond) ? g.colorLovibond : 0 },
        amount: { unit: "kg", value: g.amountKg },
      })),
      hop_additions: hops.map((h) => ({
        name: h.name,
        origin: h.country ?? undefined,
        alpha_acid: { unit: "%", value: typeof h.alphaAcidPercent === "number" && Number.isFinite(h.alphaAcidPercent) ? h.alphaAcidPercent : 0 },
        amount: { unit: "g", value: h.amountGrams },
        timing: toTiming(h.use, h.timeMinutes),
      })),
      culture_additions: yeast.map((y) => {
        const attMin = typeof y.attenuationMin === "number" && Number.isFinite(y.attenuationMin) ? y.attenuationMin : null;
        const attMax = typeof y.attenuationMax === "number" && Number.isFinite(y.attenuationMax) ? y.attenuationMax : null;
        const attenuation =
          attMin != null && attMax != null ? (attMin + attMax) / 2 : attMin != null ? attMin : attMax != null ? attMax : null;
        const out: any = {
          name: y.name,
          type: "ale",
          form: "dry",
          producer: y.lab ?? undefined,
          product_id: y.productId ?? undefined,
          amount: { unit: "pkg", value: 1 },
        };
        if (attenuation != null) out.attenuation = { unit: "%", value: attenuation };
        return out;
      }),
      miscellaneous_additions: misc.map((m) => {
        const out: any = {
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
  if (input.recipe.notes) recipe.notes = input.recipe.notes;

  return {
    beerjson: {
      version: 1,
      recipes: [recipe],
    },
  };
}

