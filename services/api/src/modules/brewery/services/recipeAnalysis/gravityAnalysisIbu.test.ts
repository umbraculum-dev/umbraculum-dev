import { describe, expect, it } from "vitest";
import { computeRecipeGravityAnalysis } from "./gravityAnalysis.js";
import { beerJsonDoc, ragerUtilizationFraction, tinsethUtilization } from "./gravityAnalysisTestHelpers.js";

describe("recipeAnalysis.gravityAnalysis (v1)", () => {
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

    expect(res.result.kettleVolumeLiters).toBeCloseTo(20, 9);
    expect(res.result.preBoilVolumeLiters).toBeCloseTo(30, 9);
    expect(res.result.ogEstimatedSg).not.toBeNull();
    expect(res.result.pbgEstimatedSg).not.toBeNull();
    expect(res.result.pbgEstimatedSg as number).toBeLessThan(res.result.ogEstimatedSg as number);

    const vol = res.result.kettleVolumeLiters as number;
    const g = res.result.pbgEstimatedSg as number;

    const expectedTinseth = (10 * 0.1 * tinsethUtilization({ boilTimeMinutes: 60, boilGravitySg: g }) * 1000) / vol;
    const expectedRager = (10 * 0.1 * ragerUtilizationFraction({ boilTimeMinutes: 60, boilGravitySg: g }) * 1000) / vol;

    expect(res.result.ibuTinsethEstimated).toBeCloseTo(expectedTinseth, 9);
    expect(res.result.ibuRagerEstimated).toBeCloseTo(expectedRager, 9);

    const expectedBuGu = expectedTinseth / (((res.result.ogEstimatedSg as number) - 1) * 1000);
    expect(res.result.buGuRatio).toBeCloseTo(expectedBuGu, 9);
  });

  it("applies hop form factors for IBU (leaf vs pellet, wet vs pellet)", () => {
    const mk = (hop: any, ext: any = {}) =>
      computeRecipeGravityAnalysis({
        beerJsonRecipeJson: beerJsonDoc({
          fermentables: [{ amountKg: 5, yieldPercent: 80 }],
          yeasts: [{ id: "y-1", attenuationPercent: 75 }],
          hops: [hop],
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
          ...ext,
        },
        recipeWaterSettings: {
          mashWaterVolumeLiters: 20,
          spargeVolumeLiters: 10,
          boilWaterVolumeLiters: 0,
        },
      });

    const baseHop = { id: "h-1", name: "Hop", amountGrams: 10, alphaAcidPercent: 10, timeMinutes: 60, use: "boil" };

    const pellet = mk({ ...baseHop, form: "pellet" });
    const leaf = mk({ ...baseHop, form: "leaf" });
    const wet = mk({ ...baseHop, form: "leaf (wet)" });

    expect(pellet.result.ibuTinsethEstimated).not.toBeNull();
    expect(leaf.result.ibuTinsethEstimated).not.toBeNull();
    expect(wet.result.ibuTinsethEstimated).not.toBeNull();

    const ibuPellet = pellet.result.ibuTinsethEstimated as number;
    const ibuLeaf = leaf.result.ibuTinsethEstimated as number;
    const ibuWet = wet.result.ibuTinsethEstimated as number;

    expect(ibuLeaf / ibuPellet).toBeCloseTo(0.9, 9);
    expect(ibuWet / ibuPellet).toBeCloseTo(1 / 4.5, 9);

    const debittered = mk({ ...baseHop, form: "pellet" }, { hopFormOverrides: { "h-1": "debittered_leaf" } });
    expect((debittered.result.ibuTinsethEstimated as number) / ibuPellet).toBeCloseTo(0.5, 9);
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

    expect(boilRes.result.ibuTinsethEstimated).not.toBeNull();
    expect(whirlRes.result.ibuTinsethEstimated).not.toBeNull();
    expect(boilRes.result.ibuRagerEstimated).not.toBeNull();
    expect(whirlRes.result.ibuRagerEstimated).not.toBeNull();

    expect(whirlRes.result.ibuTinsethEstimated as number).toBeCloseTo((boilRes.result.ibuTinsethEstimated as number) * 0.5, 9);
    expect(whirlRes.result.ibuRagerEstimated as number).toBeCloseTo((boilRes.result.ibuRagerEstimated as number) * 0.5, 9);
  });
});
