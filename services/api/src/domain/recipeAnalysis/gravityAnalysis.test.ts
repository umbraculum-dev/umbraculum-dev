import { describe, expect, it } from "vitest";
import { computeRecipeGravityAnalysis } from "./gravityAnalysis.js";

function beerJsonDoc(args: {
  fermentables: Array<{ amountKg: number; yieldPercent: number }>;
  yeasts?: Array<{ id: string; attenuationPercent?: number }>;
  boilMinutes?: number;
}) {
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
            hop_additions: [
              {
                id: "h-1",
                name: "Hop",
                alpha_acid: { unit: "%", value: 10 },
                amount: { unit: "g", value: 10 },
                timing: {
                  use: "add_to_boil",
                  duration: { unit: "min", value: args.boilMinutes ?? 60 },
                },
              },
            ],
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
});

