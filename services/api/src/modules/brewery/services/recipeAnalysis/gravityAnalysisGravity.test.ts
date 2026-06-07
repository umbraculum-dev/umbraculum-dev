import { describe, expect, it } from "vitest";
import { computeRecipeGravityAnalysis } from "./gravityAnalysis.js";
import { beerJsonDoc } from "./gravityAnalysisTestHelpers.js";

describe("recipeAnalysis.gravityAnalysis (v1)", () => {
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

    expect(res.canonicalModels).toEqual({ ibu: "tinseth", srm: "morey" });
    expect(res.result.attenuationEffectivePercent).toBeCloseTo((90 + 80) / 2, 9);
    expect(res.result.ogEstimatedSg).not.toBeNull();
    expect(res.result.fgEstimatedSg).not.toBeNull();
    expect(res.result.abvEstimatedPercent).not.toBeNull();
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

    expect(res.result.attenuationEffectivePercent).toBeCloseTo((80 + 70) / 2, 9);
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

    expect(res.result.ogEstimatedSg).toBeNull();
    expect(res.result.fgEstimatedSg).toBeNull();
    expect(res.result.abvEstimatedPercent).toBeNull();
    expect(res.result.warnings.length).toBeGreaterThan(0);
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
    expect(res.result.preBoilVolumeLiters).toBeNull();
    expect(res.result.kettleVolumeLiters).toBeNull();
    expect(res.result.warnings.map((w: any) => w.code)).toContain("missing_water_settings");
  });

});
