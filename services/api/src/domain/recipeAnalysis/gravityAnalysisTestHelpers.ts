export type TestHopInput = {
  id?: string;
  name?: string;
  form?: "extract" | "leaf" | "leaf (wet)" | "pellet" | "powder" | "plug";
  amountGrams: number;
  alphaAcidPercent: number;
  timeMinutes?: number | null;
  use?: "boil" | "whirlpool" | "dryhop";
};

export function beerJsonDoc(args: {
  fermentables: Array<{ amountKg: number; yieldPercent: number }>;
  yeasts?: Array<{ id: string; attenuationPercent?: number }>;
  boilMinutes?: number;
  hops?: TestHopInput[];
}) {
  const defaultHop: TestHopInput = {
    id: "h-1",
    name: "Hop",
    amountGrams: 10,
    alphaAcidPercent: 10,
    timeMinutes: args.boilMinutes ?? 60,
    use: "boil",
  };
  const hops = (args.hops ?? [defaultHop]).map((h, idx) => {
    const use = h.use ?? "boil";
    const timingUse = use === "dryhop" ? "add_to_fermentation" : "add_to_boil";
    const timing: { use: string; duration?: { unit: "min"; value: number } } = { use: timingUse };
    if (typeof h.timeMinutes === "number" && Number.isFinite(h.timeMinutes)) {
      timing.duration = { unit: "min", value: h.timeMinutes };
    }
    return {
      id: h.id ?? `h-${idx + 1}`,
      name: h.name ?? `Hop${idx + 1}`,
      ...(h.form ? { form: h.form } : {}),
      alpha_acid: { unit: "%", value: h.alphaAcidPercent },
      amount: { unit: "g", value: h.amountGrams },
      timing,
      brewery_app_use: use,
    };
  });

  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name: "Test",
          type: "all grain",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          ingredients: {
            fermentable_additions: args.fermentables.map((f, idx) => ({
              id: `f-${idx + 1}`,
              name: `F${idx + 1}`,
              type: "grain",
              grain_group: "base",
              yield: { fine_grind: { unit: "%", value: f.yieldPercent } },
              color: { unit: "Lovi", value: 2 },
              amount: { unit: "kg", value: f.amountKg },
            })),
            hop_additions: hops,
            culture_additions: (args.yeasts ?? []).map((y) => ({
              id: y.id,
              name: "Yeast",
              type: "ale",
              form: "dry",
              amount: { unit: "pkg", value: 1 },
              ...(typeof y.attenuationPercent === "number"
                ? { attenuation: { unit: "%", value: y.attenuationPercent } }
                : {}),
            })),
            miscellaneous_additions: [],
          },
        },
      ],
    },
  };
}

export function tinsethUtilization(args: { boilTimeMinutes: number; boilGravitySg: number }) {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);
  const bigness = 1.65 * Math.pow(0.000125, g - 1);
  const timeFactor = (1 - Math.exp(-0.04 * t)) / 4.15;
  return Math.max(0, bigness * timeFactor);
}

export function ragerUtilizationFraction(args: { boilTimeMinutes: number; boilGravitySg: number }) {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);
  const utilPercent = 18.11 + 13.86 * Math.tanh((t - 31.32) / 18.27);
  const utilPercentClamped = Math.min(30, Math.max(0, utilPercent));
  const gravityAdjustment = g > 1.05 ? (g - 1.05) / 0.2 : 0;
  const adjusted = utilPercentClamped / (1 + gravityAdjustment);
  return Math.min(1, Math.max(0, adjusted / 100));
}

