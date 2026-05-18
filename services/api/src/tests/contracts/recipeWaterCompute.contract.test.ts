/**
 * Contract snapshots: the three recipe-scoped compute-and-save endpoints
 *   - POST /recipes/:id/water-settings/mash/compute-and-save
 *   - POST /recipes/:id/water-settings/sparge/compute-and-save
 *   - POST /recipes/:id/water-settings/boil/compute-and-save
 *
 * Each endpoint computes the full water-calc result for a stream (mash,
 * sparge, or boil) AND persists it server-side in `recipeWaterSettings`,
 * returning a synthesized payload that apps/native consumes to render the
 * result on the corresponding water-calc page.
 *
 * These three endpoints already have COMPANION L1 PARSER TESTS at
 * `packages/contracts/src/water/parseComputeAndSave.test.ts` covering
 * `parseMashComputeAndSaveResponse`, `parseSpargeComputeAndSaveResponse`,
 * and `parseBoilComputeAndSaveResponse`. The L4 snapshots here pin the
 * WIRE SHAPE those parsers consume, closing the L1+L4 alignment for the
 * entire water-calc surface (mash/sparge/boil compute-and-save +
 * water-hub-summary).
 *
 * To intentionally update:
 *   UPDATE_CONTRACTS=1 npm test -w @brewery/api -- contracts/recipeWaterCompute.contract.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";
import { assertSnapshotShape } from "./shapeHelpers.js";

const RECIPE_NAME = "Contract Compute Recipe";

function buildBeerJsonRecipe(name: string) {
  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name,
          type: "all grain",
          author: "brewery-app-contract",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          ingredients: {
            fermentable_additions: [
              {
                id: "contract-grain-1",
                name: "Pale Ale Malt",
                type: "grain",
                yield: { potential: { unit: "sg", value: 1.037 } },
                color: { unit: "Lovi", value: 3.0 },
                amount: { unit: "kg", value: 4.5 },
              },
            ],
            hop_additions: [],
            culture_additions: [],
            miscellaneous_additions: [],
          },
        },
      ],
    },
  };
}

describe("contract: recipe water compute-and-save (mash + sparge + boil)", () => {
  const app = buildApp();
  let cookie = "";
  let workspaceId = "";
  let recipeId = "";
  let createdProfileId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;

    const createRecipe = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: {
        name: RECIPE_NAME,
        styleKey: "custom",
        beerJsonRecipeJson: buildBeerJsonRecipe(RECIPE_NAME),
      },
    });
    if (createRecipe.statusCode !== 200) {
      throw new Error(
        `recipe create failed (${createRecipe.statusCode}): ${createRecipe.body}`,
      );
    }
    recipeId = createRecipe.json().recipe.id;

    const profile = await app.prisma.waterProfile.create({
      data: {
        key: `contract:compute:${Date.now()}`,
        scope: "account",
        type: "water",
        workspaceId,
        name: "Contract Compute Source Water",
        calcium: 25,
        magnesium: 5,
        sodium: 10,
        sulfate: 20,
        chloride: 15,
        bicarbonate: 30,
        verificationStatus: "unverified",
        source: "test",
      },
    });
    createdProfileId = profile.id;
  });

  afterAll(async () => {
    if (recipeId) {
      await app.prisma.recipeWaterSettings
        .deleteMany({ where: { recipeId } })
        .catch(() => undefined);
      await app.prisma.recipe
        .deleteMany({ where: { id: recipeId } })
        .catch(() => undefined);
    }
    if (createdProfileId) {
      await app.prisma.waterProfile
        .deleteMany({ where: { id: createdProfileId } })
        .catch(() => undefined);
    }
    await app.close();
  });

  it("POST /recipes/:id/water-settings/mash/compute-and-save shape is stable", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/water-settings/mash/compute-and-save`,
      headers: { cookie },
      payload: {
        sourceWaterProfileId: createdProfileId,
        dilutionWaterProfileId: null,
        tapWaterVolumeLiters: 12,
        dilutionWaterVolumeLiters: 0,

        mashStartingAlkalinityPpmCaCO3: 30,
        mashStartingPh: 7.0,
        mashTargetPh: 5.4,
        mashAcidType: "lactic",
        mashStrengthKind: "percent",
        mashStrengthValue: 88,
        mashAcidificationMode: "targetPh",
        mashManualAcidAddedMl: null,
        mashManualAcidAddedGrams: null,

        mashSaltAdditionsJson: [{ saltKey: "gypsum", grams: 2 }],
      },
    });
    if (res.statusCode !== 200) {
      throw new Error(`mash compute-and-save failed (${res.statusCode}): ${res.body}`);
    }
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.version).toBe(1);
    assertSnapshotShape("recipeWaterCompute.mash", body);
  });

  it("POST /recipes/:id/water-settings/sparge/compute-and-save shape is stable", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/water-settings/sparge/compute-and-save`,
      headers: { cookie },
      payload: {
        spargeWaterProfileId: createdProfileId,
        spargeSaltAdditionsJson: [{ saltKey: "gypsum", grams: 1 }],

        spargeStartingAlkalinityPpmCaCO3: 30,
        spargeStartingPh: 7.0,
        spargeTargetPh: 5.6,
        spargeVolumeLiters: 18,
        spargeAcidType: "phosphoric",
        spargeStrengthKind: "percent",
        spargeStrengthValue: 10,
        spargeAcidificationMode: "targetPh",
        spargeManualAcidAddedMl: null,
        spargeManualAcidAddedGrams: null,
      },
    });
    if (res.statusCode !== 200) {
      throw new Error(`sparge compute-and-save failed (${res.statusCode}): ${res.body}`);
    }
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.version).toBe(1);
    assertSnapshotShape("recipeWaterCompute.sparge", body);
  });

  it("POST /recipes/:id/water-settings/boil/compute-and-save shape is stable", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/recipes/${recipeId}/water-settings/boil/compute-and-save`,
      headers: { cookie },
      payload: {
        boilSourceWaterProfileId: createdProfileId,
        boilDilutionWaterProfileId: null,
        boilTapWaterVolumeLiters: 22,
        boilDilutionWaterVolumeLiters: 0,

        boilStartingAlkalinityPpmCaCO3: 30,
        boilStartingPh: 7.0,
        boilTargetPh: 5.2,
        boilAcidType: "lactic",
        boilStrengthKind: "percent",
        boilStrengthValue: 88,
        boilAcidificationMode: "targetPh",
        boilManualAcidAddedMl: null,
        boilManualAcidAddedGrams: null,

        boilSaltAdditionsJson: [{ saltKey: "gypsum", grams: 1 }],
      },
    });
    if (res.statusCode !== 200) {
      throw new Error(`boil compute-and-save failed (${res.statusCode}): ${res.body}`);
    }
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.version).toBe(1);
    assertSnapshotShape("recipeWaterCompute.boil", body);
  });
});
