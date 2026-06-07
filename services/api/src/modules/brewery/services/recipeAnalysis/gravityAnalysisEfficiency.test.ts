import { describe, expect, it } from "vitest";
import { computeRecipeGravityAnalysis } from "./gravityAnalysis.js";
import { beerJsonDoc } from "./gravityAnalysisTestHelpers.js";

describe("recipeAnalysis.gravityAnalysis (v1)", () => {
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
    expect(highEff.result.ogEstimatedSg as number).toBeGreaterThan(lowEff.result.ogEstimatedSg as number);

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
    expect(lowVol.result.ogEstimatedSg as number).toBeGreaterThan(highVol.result.ogEstimatedSg as number);
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

    expect(res.result.preBoilVolumeLiters).not.toBeNull();
    expect(res.result.preBoilVolumeLiters as number).toBeGreaterThan(20);
  });

});
