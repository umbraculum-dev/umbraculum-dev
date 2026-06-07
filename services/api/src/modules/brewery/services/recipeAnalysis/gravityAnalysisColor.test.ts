import { describe, expect, it } from "vitest";
import { computeRecipeGravityAnalysis } from "./gravityAnalysis.js";
import { beerJsonDoc } from "./gravityAnalysisTestHelpers.js";

describe("recipeAnalysis.gravityAnalysis (v1)", () => {
  it("computes SRM (Morey + Daniels) from grist color and computed kettle volume", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1", attenuationPercent: 75 }],
      hops: [],
    });

    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: {
            kettleVolumeLiters: 20,
            kettleLossesLiters: 0,
            kettleHopsAbsorptionLiters: 0,
            kettleCoolingShrinkagePercent: 0,
            kettleBoilEvaporationRatePercentPerHour: 0,
          },
          mash: { mashEfficiencyPercent: 75, mashGrainAbsorptionLPerKg: 0, mashLossesLiters: 0, mashWaterLeftoverLiters: 0 },
          misc: { otherLossesLiters: 0 },
        },
      },
      recipeWaterSettings: { mashWaterVolumeLiters: 20, spargeVolumeLiters: 0, boilWaterVolumeLiters: 0 },
    });

    // With zero losses/evap/shrinkage, kettle volume == total water volume.
    expect(res.result.kettleVolumeLiters).toBeCloseTo(20, 9);

    // Test doc uses color=2 °L (see beerJsonDoc helper).
    const KG_TO_LB = 2.204_622_621_8;
    const L_TO_GAL = 0.264_172_052_4;
    const pounds = 5 * KG_TO_LB;
    const gallons = 20 * L_TO_GAL;
    const mcu = (pounds * 2) / gallons;
    const expectedMorey = 1.4922 * Math.pow(mcu, 0.6859);
    const expectedDaniels = 0.2 * mcu + 8.4;

    expect(res.result.colorSrmMoreyEstimated).toBeCloseTo(expectedMorey, 9);
    expect(res.result.colorSrmDanielsEstimated).toBeCloseTo(expectedDaniels, 9);
  });

  it("returns SRM as null when kettle volume is missing (insufficient data)", () => {
    const doc = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1", attenuationPercent: 75 }],
      hops: [],
    });
    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: { version: 1, equipment: { kettle: { kettleVolumeLiters: 20 }, mash: { mashEfficiencyPercent: 75 } } },
      recipeWaterSettings: null,
    });
    expect(res.result.colorSrmMoreyEstimated).toBeNull();
    expect(res.result.colorSrmDanielsEstimated).toBeNull();
    expect(res.result.warnings.map((w: any) => w.code)).toContain("missing_color_volume");
  });

  it("returns SRM as null when fermentable colors are missing (insufficient data)", () => {
    const doc: any = beerJsonDoc({
      fermentables: [{ amountKg: 5, yieldPercent: 80 }],
      yeasts: [{ id: "y-1", attenuationPercent: 75 }],
      hops: [],
    });
    delete doc.beerjson.recipes[0].ingredients.fermentable_additions[0].color;

    const res = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: doc,
      recipeExtJson: {
        version: 1,
        equipment: {
          kettle: {
            kettleVolumeLiters: 20,
            kettleLossesLiters: 0,
            kettleHopsAbsorptionLiters: 0,
            kettleCoolingShrinkagePercent: 0,
            kettleBoilEvaporationRatePercentPerHour: 0,
          },
          mash: { mashEfficiencyPercent: 75, mashGrainAbsorptionLPerKg: 0, mashLossesLiters: 0, mashWaterLeftoverLiters: 0 },
          misc: { otherLossesLiters: 0 },
        },
      },
      recipeWaterSettings: { mashWaterVolumeLiters: 20, spargeVolumeLiters: 0, boilWaterVolumeLiters: 0 },
    });

    expect(res.result.colorSrmMoreyEstimated).toBeNull();
    expect(res.result.colorSrmDanielsEstimated).toBeNull();
    expect(res.result.warnings.map((w: any) => w.code)).toContain("missing_fermentable_colors");
  });

});
