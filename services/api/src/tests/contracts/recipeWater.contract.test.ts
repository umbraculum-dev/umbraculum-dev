/**
 * Contract snapshots:
 *   - GET /recipes/:id/water-settings
 *   - GET /recipes/:id/water-hub-summary
 *
 * apps/native consumes both payloads to render the water-calculator UIs
 * (mash, sparge, boil pages + the water hub overview). The two endpoints
 * share a recipe fixture in this file to keep setup cheap and to validate
 * that they stay shape-stable against the same persisted state.
 *
 * - `/water-settings` is the raw persistence shape: every saveable field
 *   under the `recipeWaterSettings` row, returned for client-side
 *   reconciliation with optimistic updates.
 * - `/water-hub-summary` is the synthesized snapshot used by the hub
 *   overview page; its parser already has L1 unit coverage at
 *   `packages/contracts/src/water/parseHubSummary.test.ts`. The L4 snapshot
 *   here pins the wire payload that the L1 parser is meant to consume.
 *
 * To intentionally update:
 *   UPDATE_CONTRACTS=1 npm test -w @brewery/api -- contracts/recipeWater.contract.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";
import { assertSnapshotShape } from "./shapeHelpers.js";

const RECIPE_NAME = "Contract Water Recipe";

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

describe("contract: recipe water endpoints", () => {
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

    // Create a recipe owned by this workspace.
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

    // Create a workspace water profile to reference from the settings.
    const profile = await app.prisma.waterProfile.create({
      data: {
        key: `contract:water:${Date.now()}`,
        scope: "account",
        type: "water",
        workspaceId,
        name: "Contract Source Water",
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

    // Persist a representative settings payload so /water-settings and
    // /water-hub-summary both have meaningful (non-default) state.
    const nowIso = new Date().toISOString();
    const overall = {
      calculatedAt: nowIso,
      ionsPpm: {
        calcium: 50,
        magnesium: 7,
        sodium: 12,
        sulfate: 80,
        chloride: 60,
        bicarbonate: 25,
      },
      finalAlkalinityPpmCaCO3: 20.5,
      ph: { kind: "target", value: 5.4 },
      debug: {
        startingAlkalinityPpmCaCO3: 30,
        startingAlkalinityAfterSaltsPpmCaCO3: 28,
        saltsDeltaBicarbonatePpm: -2,
        acidSulfateAddedPpm: 0,
        acidChlorideAddedPpm: 0,
        mashMode: "targetPh",
      },
    };
    const put = await app.inject({
      method: "PUT",
      url: `/recipes/${recipeId}/water-settings`,
      headers: { cookie },
      payload: {
        sourceWaterProfileId: createdProfileId,
        tapWaterVolumeLiters: 12,
        dilutionWaterVolumeLiters: 3,

        mashStartingAlkalinityPpmCaCO3: 30,
        mashStartingPh: 7.0,
        mashTargetPh: 5.4,
        mashWaterVolumeLiters: 15,
        mashAcidType: "lactic",
        mashStrengthKind: "percent",
        mashStrengthValue: 88,
        mashAcidificationMode: "targetPh",
        mashSaltAdditionsJson: [{ saltKey: "gypsum", grams: 2 }],
        mashOverallLastResultJson: overall,
        mashOverallLastCalculatedAt: nowIso,

        spargeWaterProfileId: createdProfileId,
        spargeStartingAlkalinityPpmCaCO3: 30,
        spargeStartingPh: 7.0,
        spargeTargetPh: 5.6,
        spargeVolumeLiters: 18,
        spargeAcidType: "phosphoric",
        spargeStrengthKind: "percent",
        spargeStrengthValue: 10,
        spargeAcidificationMode: "targetPh",

        boilSourceWaterProfileId: createdProfileId,
        boilTapWaterVolumeLiters: 22,
        boilStartingAlkalinityPpmCaCO3: 30,
        boilStartingPh: 7.0,
        boilTargetPh: 5.2,
        boilWaterVolumeLiters: 22,
        boilAcidType: "lactic",
        boilStrengthKind: "percent",
        boilStrengthValue: 88,
        boilAcidificationMode: "targetPh",
      },
    });
    if (put.statusCode !== 200) {
      throw new Error(
        `water-settings PUT failed (${put.statusCode}): ${put.body}`,
      );
    }
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

  it("GET /recipes/:id/water-settings shape is stable", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/recipes/${recipeId}/water-settings`,
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.settings.recipeId).toBe(recipeId);
    expect(body.settings.workspaceId).toBe(workspaceId);
    assertSnapshotShape("recipeWater.settings", body);
  });

  it("GET /recipes/:id/water-hub-summary shape is stable", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/recipes/${recipeId}/water-hub-summary`,
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    // The hub-summary parser pins the shape contract on the client side
    // (packages/contracts/src/water/parseHubSummary.test.ts). The L4
    // snapshot here pins the WIRE FORMAT that parser is meant to consume.
    expect(body.summary.version).toBe(1);
    assertSnapshotShape("recipeWater.hubSummary", body);
  });
});
