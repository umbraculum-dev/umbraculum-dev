import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

// Use test-only IDs so running tests doesn't pollute seeded dev data.
const TEST_USER_ID = "11111111-1111-1111-1111-111111111112";
const TEST_ACCOUNT_A = "22222222-2222-2222-2222-222222222223";
const TEST_ACCOUNT_B = "33333333-3333-3333-3333-333333333334";

describe("recipe water-settings", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();

    await app.prisma.user.upsert({
      where: { id: TEST_USER_ID },
      create: { id: TEST_USER_ID, email: "test-water-settings@brewery.local" },
      update: { email: "test-water-settings@brewery.local" },
    });

    await app.prisma.account.upsert({
      where: { id: TEST_ACCOUNT_A },
      create: { id: TEST_ACCOUNT_A, name: "Test Brewery A (water-settings)" },
      update: { name: "Test Brewery A (water-settings)" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: TEST_ACCOUNT_A, userId: TEST_USER_ID } },
      create: { accountId: TEST_ACCOUNT_A, userId: TEST_USER_ID, role: "owner" },
      update: { role: "owner" },
    });

    await app.prisma.account.upsert({
      where: { id: TEST_ACCOUNT_B },
      create: { id: TEST_ACCOUNT_B, name: "Test Brewery B (water-settings)" },
      update: { name: "Test Brewery B (water-settings)" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: TEST_ACCOUNT_B, userId: TEST_USER_ID } },
      create: { accountId: TEST_ACCOUNT_B, userId: TEST_USER_ID, role: "owner" },
      update: { role: "owner" },
    });

    // Idempotence: wipe test data if it exists from earlier runs.
    await app.prisma.recipeWaterSettings.deleteMany({ where: { accountId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } } });
    await app.prisma.recipe.deleteMany({ where: { accountId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } } });
  });

  afterAll(async () => {
    // Cleanup: keep shared dev DB tidy.
    await app.prisma.recipeWaterSettings.deleteMany({
      where: { accountId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } },
    });
    await app.prisma.recipe.deleteMany({ where: { accountId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } } });
    await app.close();
  });

  it("returns 400 when X-Account-Id is missing", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/recipes/some-recipe-id/water-settings",
      headers: { "x-user-id": TEST_USER_ID },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_account_id", message: "Missing header: X-Account-Id" },
    });
  });

  it("upserts then fetches water settings for a recipe", async () => {
    const recipe = await app.prisma.recipe.create({
      data: { accountId: TEST_ACCOUNT_A, name: "Water Settings Recipe", style: null, notes: null },
    });
    const nowIso = new Date().toISOString();
    const overall = {
      calculatedAt: nowIso,
      ionsPpm: {
        calcium: 1,
        magnesium: 2,
        sodium: 3,
        sulfate: 4,
        chloride: 5,
        bicarbonate: 6,
      },
      finalAlkalinityPpmCaCO3: 12.34,
      ph: { kind: "target", value: 5.4 },
      debug: {
        startingAlkalinityPpmCaCO3: 40,
        startingAlkalinityAfterSaltsPpmCaCO3: 41,
        saltsDeltaBicarbonatePpm: 1,
        acidSulfateAddedPpm: 0,
        acidChlorideAddedPpm: 0,
        mashMode: "targetPh",
      },
    };

    const put = await app.inject({
      method: "PUT",
      url: `/recipes/${recipe.id}/water-settings`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: {
        tapWaterVolumeLiters: 10,
        dilutionWaterVolumeLiters: 5,
        mashStartingAlkalinityPpmCaCO3: 40,
        mashStartingPh: 7.0,
        mashTargetPh: 5.4,
        mashWaterVolumeLiters: 12,
        mashAcidType: "lactic",
        mashStrengthKind: "percent",
        mashStrengthValue: 88,
        mashAcidificationMode: "manual",
        mashManualAcidAddedMl: 2.2,
        mashManualLastAchievedPh: 5.45,
        mashManualLastFinalAlkalinityPpmCaCO3: 12.3,
        mashManualLastSulfateAddedPpm: 0.1,
        mashManualLastChlorideAddedPpm: 0.2,
        mashManualLastCalculatedAt: nowIso,
        mashSaltAdditionsJson: [{ saltKey: "gypsum", grams: 2.5 }],
        mashOverallLastResultJson: overall,
        mashOverallLastCalculatedAt: nowIso,
        mashGristImportedJson: [
          {
            id: "g1",
            name: "Pilsner malt",
            amountKg: 5.0,
            colorLovibond: 1.5,
            potential: { kind: "ppg", value: 37 },
          },
        ],
        mashGristImportedAt: nowIso,
        mashGristSourceRecipeUpdatedAt: nowIso,

        spargeStartingAlkalinityPpmCaCO3: 12,
        spargeStartingPh: 7.1,
        spargeTargetPh: 5.6,
        spargeVolumeLiters: 18,
        spargeAcidType: "phosphoric",
        spargeStrengthKind: "percent",
        spargeStrengthValue: 10,
        spargeLastAcidRequiredMl: 1.23,
        spargeLastFinalAlkalinityPpmCaCO3: 0.45,
      },
    });
    expect(put.statusCode).toBe(200);
    const putBody = put.json() as any;
    expect(putBody.ok).toBe(true);
    expect(putBody.settings.recipeId).toBe(recipe.id);
    expect(putBody.settings.accountId).toBe(TEST_ACCOUNT_A);

    const get = await app.inject({
      method: "GET",
      url: `/recipes/${recipe.id}/water-settings`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
    });
    expect(get.statusCode).toBe(200);
    const body = get.json() as any;
    expect(body.ok).toBe(true);
    expect(body.settings.tapWaterVolumeLiters).toBe(10);
    expect(body.settings.dilutionWaterVolumeLiters).toBe(5);
    expect(body.settings.mashStartingAlkalinityPpmCaCO3).toBe(40);
    expect(body.settings.mashTargetPh).toBe(5.4);
    expect(body.settings.mashWaterVolumeLiters).toBe(12);
    expect(body.settings.mashAcidType).toBe("lactic");
    expect(body.settings.mashStrengthKind).toBe("percent");
    expect(body.settings.mashStrengthValue).toBe(88);
    expect(body.settings.mashAcidificationMode).toBe("manual");
    expect(body.settings.mashManualAcidAddedMl).toBe(2.2);
    expect(body.settings.mashManualLastAchievedPh).toBe(5.45);
    expect(body.settings.mashManualLastFinalAlkalinityPpmCaCO3).toBe(12.3);
    expect(body.settings.mashManualLastSulfateAddedPpm).toBe(0.1);
    expect(body.settings.mashManualLastChlorideAddedPpm).toBe(0.2);
    expect(body.settings.mashOverallLastCalculatedAt).toBe(nowIso);
    expect(body.settings.mashOverallLastResultJson).toEqual(overall);
    expect(body.settings.mashGristImportedAt).toBe(nowIso);
    expect(body.settings.mashGristSourceRecipeUpdatedAt).toBe(nowIso);
    expect(body.settings.mashGristImportedJson).toEqual([
      {
        id: "g1",
        name: "Pilsner malt",
        amountKg: 5,
        colorLovibond: 1.5,
        potential: { kind: "ppg", value: 37 },
      },
    ]);
    expect(body.settings.mashSaltAdditionsJson).toEqual([{ saltKey: "gypsum", grams: 2.5 }]);
    expect(body.settings.spargeStartingAlkalinityPpmCaCO3).toBe(12);
    expect(body.settings.spargeLastAcidRequiredMl).toBe(1.23);
  });

  it("does not leak settings across accounts", async () => {
    const recipeA = await app.prisma.recipe.create({
      data: { accountId: TEST_ACCOUNT_A, name: "Scoped WS", style: null, notes: null },
    });

    await app.inject({
      method: "PUT",
      url: `/recipes/${recipeA.id}/water-settings`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: { spargeStartingAlkalinityPpmCaCO3: 1 },
    });

    const getB = await app.inject({
      method: "GET",
      url: `/recipes/${recipeA.id}/water-settings`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_B },
    });
    expect(getB.statusCode).toBe(404);
    expect(getB.json()).toEqual({
      ok: false,
      error: { code: "recipe_not_found", message: "Recipe not found" },
    });
  });

  it("rejects saving an account-scoped profile from another account", async () => {
    const recipe = await app.prisma.recipe.create({
      data: { accountId: TEST_ACCOUNT_A, name: "Profile Validation", style: null, notes: null },
    });
    const profileB = await app.prisma.waterProfile.create({
      data: {
        key: `test:accountB:${Date.now()}`,
        scope: "account",
        type: "water",
        accountId: TEST_ACCOUNT_B,
        name: "Account B Water",
        calcium: 1,
        magnesium: 1,
        sodium: 1,
        sulfate: 1,
        chloride: 1,
        bicarbonate: 1,
        verificationStatus: "unverified",
        source: "test",
      },
    });

    const put = await app.inject({
      method: "PUT",
      url: `/recipes/${recipe.id}/water-settings`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: { targetWaterProfileId: profileB.id },
    });
    expect(put.statusCode).toBe(403);
    expect(put.json()).toEqual({
      ok: false,
      error: {
        code: "profile_not_accessible",
        message: "Water profile is not accessible to this account",
      },
    });
  });
});

