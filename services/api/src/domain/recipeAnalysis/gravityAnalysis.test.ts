import { describe, expect, it } from "vitest";
import { computeRecipeGravityAnalysis } from "./gravityAnalysis.js";

function beerJsonDoc(args: {
  fermentables: Array<{ amountKg: number; yieldPercent: number }>;
  yeasts?: Array<{ id: string; attenuationPercent?: number }>;
  boilMinutes?: number;
  hops?: Array<{
    id?: string;
    name?: string;
    amountGrams: number;
    alphaAcidPercent: number;
    timeMinutes?: number | null;
    use?: "boil" | "whirlpool" | "dryhop";
  }>;
}) {
  const defaultHop = {
    id: "h-1",
    name: "Hop",
    amountGrams: 10,
    alphaAcidPercent: 10,
    timeMinutes: args.boilMinutes ?? 60,
    use: "boil" as const,
  };
  const hops = (args.hops ?? [defaultHop]).map((h, idx) => {
    const use = h.use ?? "boil";
    const timingUse = use === "dryhop" ? "add_to_fermentation" : "add_to_boil";
    const timing: any = { use: timingUse };
    if (typeof h.timeMinutes === "number" && Number.isFinite(h.timeMinutes)) {
      timing.duration = { unit: "min", value: h.timeMinutes };
    }
    return {
      id: h.id ?? `h-${idx + 1}`,
      name: h.name ?? `Hop${idx + 1}`,
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

function tinsethUtilization(args: { boilTimeMinutes: number; boilGravitySg: number }) {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);
  const bigness = 1.65 * Math.pow(0.000125, g - 1);
  const timeFactor = (1 - Math.exp(-0.04 * t)) / 4.15;
  return Math.max(0, bigness * timeFactor);
}

function ragerUtilizationFraction(args: { boilTimeMinutes: number; boilGravitySg: number }) {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);
  const utilPercent = 18.11 + 13.86 * Math.tanh((t - 31.32) / 18.27);
  const utilPercentClamped = Math.min(30, Math.max(0, utilPercent));
  const gravityAdjustment = g > 1.05 ? (g - 1.05) / 0.2 : 0;
  const adjusted = utilPercentClamped / (1 + gravityAdjustment);
  return Math.min(1, Math.max(0, adjusted / 100));
}

describe("recipeAnalysis.gravityAnalysis (v0)", () => {
  it("uses per-yeast override in preference to BeerJSON attenuation; top-2 average", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [
        { id: "y-1", attenuationPercent: 70 },
        { id: "y-2", attenuationPercent: 80 },
      ],
    });

    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: { kettleVolumeLiters: 20 },
          mash: { mashEfficiencyPercent: 75 },
        },
        yeastAttenuationOverridesPercent: { "y-1": 90 },
      },
      recipeWaterSettings: {
        mashWaterVolumeLiters: 20,
        spargeVolumeLiters: 10,
        boilWaterVolumeLiters: 0,
      },
    });

    expect(res.attenuationEffectivePercent).toBeCloseTo((90 + 80) / 2, 9);
    expect(res.ogEstimatedSg).not.toBeNull();
    expect(res.fgEstimatedSg).not.toBeNull();
    expect(res.abvEstimatedPercent).not.toBeNull();
  });

  it("averages the top-2 highest effective attenuations across multiple yeasts", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [
        { id: "y-1", attenuationPercent: 60 },
        { id: "y-2", attenuationPercent: 70 },
        { id: "y-3", attenuationPercent: 80 },
      ],
    });

    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: { kettleVolumeLiters: 20 },
          mash: { mashEfficiencyPercent: 75 },
        },
      },
      recipeWaterSettings: {
        mashWaterVolumeLiters: 20,
        spargeVolumeLiters: 10,
        boilWaterVolumeLiters: 0,
      },
    });

    expect(res.attenuationEffectivePercent).toBeCloseTo((80 + 70) / 2, 9);
  });

  it("returns nulls when inputs are insufficient", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1" }],
    });

    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: { version: 1, equipment: { kettle: {} } },
      recipeWaterSettings: null,
    });

    expect(res.ogEstimatedSg).toBeNull();
    expect(res.fgEstimatedSg).toBeNull();
    expect(res.abvEstimatedPercent).toBeNull();
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  it("gates kettle/pre-boil volumes on saved water settings", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1", attenuationPercent: 75 }],
    });
    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: { version: 1, equipment: { kettle: { kettleVolumeLiters: 20 }, mash: { mashEfficiencyPercent: 75 } } },
      recipeWaterSettings: null,
    });
    expect(res.preBoilVolumeLiters).toBeNull();
    expect(res.kettleVolumeLiters).toBeNull();
    expect(res.warnings.map((w) => w.code)).toContain("missing_water_settings");
  });

  it("OG increases with efficiency and decreases with volume", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1", attenuationPercent: 75 }],
    });

    const lowEff = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: { kettleVolumeLiters: 20 },
          mash: { mashEfficiencyPercent: 60 },
        },
      },
      recipeWaterSettings: { mashWaterVolumeLiters: 20, spargeVolumeLiters: 10, boilWaterVolumeLiters: 0 },
    });
    const highEff = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: { kettleVolumeLiters: 20 },
          mash: { mashEfficiencyPercent: 80 },
        },
      },
      recipeWaterSettings: { mashWaterVolumeLiters: 20, spargeVolumeLiters: 10, boilWaterVolumeLiters: 0 },
    });
    expect(highEff.ogEstimatedSg as number).toBeGreaterThan(lowEff.ogEstimatedSg as number);

    const lowVol = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: { kettleVolumeLiters: 18 },
          mash: { mashEfficiencyPercent: 75 },
        },
      },
      recipeWaterSettings: { mashWaterVolumeLiters: 18, spargeVolumeLiters: 10, boilWaterVolumeLiters: 0 },
    });
    const highVol = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: { kettleVolumeLiters: 25 },
          mash: { mashEfficiencyPercent: 75 },
        },
      },
      recipeWaterSettings: { mashWaterVolumeLiters: 25, spargeVolumeLiters: 10, boilWaterVolumeLiters: 0 },
    });
    expect(lowVol.ogEstimatedSg as number).toBeGreaterThan(highVol.ogEstimatedSg as number);
  });

  it("pre-boil volume increases with evaporation and losses", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1", attenuationPercent: 75 }],
      boilMinutes: 60,
    });

    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: {
            kettleVolumeLiters: 20,
            kettleLossesLiters: 1,
            // Semantics: coefficient (L/g). Test doc uses 10 g in boil hops.
            kettleHopsAbsorptionLiters: 0.1,
            kettleCoolingShrinkagePercent: 4,
            kettleBoilEvaporationRatePercentPerHour: 10,
          },
          mash: { mashEfficiencyPercent: 75, mashGrainAbsorptionLPerKg: 0.8 },
          misc: { otherLossesLiters: 1 },
        },
      },
      recipeWaterSettings: {
        mashWaterVolumeLiters: 20,
        spargeVolumeLiters: 10,
        boilWaterVolumeLiters: 0,
      },
    });

    expect(res.preBoilVolumeLiters).not.toBeNull();
    expect(res.preBoilVolumeLiters as number).toBeGreaterThan(20);
  });

  it("computes Tinseth + Rager IBU using PBG gravity and kettle volume", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1", attenuationPercent: 75 }],
      hops: [
        {
          id: "h-1",
          name: "Hop",
          amountGrams: 10,
          alphaAcidPercent: 10,
          timeMinutes: 60,
          use: "boil",
        },
      ],
    });

    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: {
            kettleVolumeLiters: 30,
            kettleLossesLiters: 10,
            kettleHopsAbsorptionLiters: 0,
            kettleCoolingShrinkagePercent: 0,
            kettleBoilEvaporationRatePercentPerHour: 0,
          },
          mash: { mashEfficiencyPercent: 75, mashGrainAbsorptionLPerKg: 0 },
          misc: { otherLossesLiters: 0 },
        },
      },
      recipeWaterSettings: {
        mashWaterVolumeLiters: 20,
        spargeVolumeLiters: 10,
        boilWaterVolumeLiters: 0,
      },
    });

    expect(res.kettleVolumeLiters).toBeCloseTo(20, 9);
    expect(res.preBoilVolumeLiters).toBeCloseTo(30, 9);
    expect(res.ogEstimatedSg).not.toBeNull();
    expect(res.pbgEstimatedSg).not.toBeNull();
    expect(res.pbgEstimatedSg as number).toBeLessThan(res.ogEstimatedSg as number);

    const vol = res.kettleVolumeLiters as number;
    const g = res.pbgEstimatedSg as number;

    const expectedTinseth = (10 * 0.1 * tinsethUtilization({ boilTimeMinutes: 60, boilGravitySg: g }) * 1000) / vol;
    const expectedRager = (10 * 0.1 * ragerUtilizationFraction({ boilTimeMinutes: 60, boilGravitySg: g }) * 1000) / vol;

    expect(res.ibuTinsethEstimated).toBeCloseTo(expectedTinseth, 9);
    expect(res.ibuRagerEstimated).toBeCloseTo(expectedRager, 9);
  });

  it("applies whirlpool utilization multiplier (0.5x) for IBU", () => {
    const baseArgs = {
      beerJsonRecipeJson: beerJsonDoc({
        fermentables: [{ amountKg: 5, yieldPercent: 80 }],
        yeasts: [{ id: "y-1", attenuationPercent: 75 }],
        hops: [
          { id: "h-1", name: "Hop", amountGrams: 10, alphaAcidPercent: 10, timeMinutes: 20, use: "boil" },
        ],
      }),
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: {
            kettleVolumeLiters: 30,
            kettleLossesLiters: 10,
            kettleHopsAbsorptionLiters: 0,
            kettleCoolingShrinkagePercent: 0,
            kettleBoilEvaporationRatePercentPerHour: 0,
          },
          mash: { mashEfficiencyPercent: 75, mashGrainAbsorptionLPerKg: 0 },
          misc: { otherLossesLiters: 0 },
        },
      },
      recipeWaterSettings: {
        mashWaterVolumeLiters: 20,
        spargeVolumeLiters: 10,
        boilWaterVolumeLiters: 0,
      },
    };

    const boilRes = computeRecipeGravityAnalysis(baseArgs);
    const whirlRes = computeRecipeGravityAnalysis({
      ...baseArgs,
      beerJsonRecipeJson: beerJsonDoc({
        fermentables: [{ amountKg: 5, yieldPercent: 80 }],
        yeasts: [{ id: "y-1", attenuationPercent: 75 }],
        hops: [
          { id: "h-1", name: "Hop", amountGrams: 10, alphaAcidPercent: 10, timeMinutes: 20, use: "whirlpool" },
        ],
      }),
    });

    expect(boilRes.ibuTinsethEstimated).not.toBeNull();
    expect(whirlRes.ibuTinsethEstimated).not.toBeNull();
    expect(boilRes.ibuRagerEstimated).not.toBeNull();
    expect(whirlRes.ibuRagerEstimated).not.toBeNull();

    expect(whirlRes.ibuTinsethEstimated as number).toBeCloseTo((boilRes.ibuTinsethEstimated as number) * 0.5, 9);
    expect(whirlRes.ibuRagerEstimated as number).toBeCloseTo((boilRes.ibuRagerEstimated as number) * 0.5, 9);
  });
});

