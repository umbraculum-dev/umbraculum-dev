import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

// Use test-only IDs so running tests doesn't pollute seeded dev data.
const TEST_USER_ID = "11111111-1111-1111-1111-111111111112";
const TEST_ACCOUNT_A = "22222222-2222-2222-2222-222222222223";
const TEST_ACCOUNT_B = "33333333-3333-3333-3333-333333333334";

describe("recipe water-settings", () => {
  const app = buildApp();
  let cookieA = "";
  let cookieB = "";
  let cookieNoAccount = "";
  let accountAId = "";
  let accountBId = "";

  beforeAll(async () => {
    await app.ready();

    const sessA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessA.cookie;
    accountAId = sessA.workspaceId;

    const sessB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessB.cookie;
    accountBId = sessB.workspaceId;

    const sessNo = await createSessionForTestUser(app, { activeWorkspace: false });
    cookieNoAccount = sessNo.cookie;

    await app.prisma.user.upsert({
      where: { id: TEST_USER_ID },
      create: { id: TEST_USER_ID, email: "test-water-settings@brewery.local" },
      update: { email: "test-water-settings@brewery.local" },
    });

    await app.prisma.workspace.upsert({
      where: { id: TEST_ACCOUNT_A },
      create: { id: TEST_ACCOUNT_A, name: "Test Brewery A (water-settings)" },
      update: { name: "Test Brewery A (water-settings)" },
    });
    await app.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: TEST_ACCOUNT_A, userId: TEST_USER_ID } },
      create: { workspaceId: TEST_ACCOUNT_A, userId: TEST_USER_ID, role: "brewery_admin" },
      update: { role: "brewery_admin" },
    });

    await app.prisma.workspace.upsert({
      where: { id: TEST_ACCOUNT_B },
      create: { id: TEST_ACCOUNT_B, name: "Test Brewery B (water-settings)" },
      update: { name: "Test Brewery B (water-settings)" },
    });
    await app.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: TEST_ACCOUNT_B, userId: TEST_USER_ID } },
      create: { workspaceId: TEST_ACCOUNT_B, userId: TEST_USER_ID, role: "brewery_admin" },
      update: { role: "brewery_admin" },
    });

    // Idempotence: wipe test data if it exists from earlier runs.
    await app.prisma.recipeWaterSettings.deleteMany({ where: { workspaceId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } } });
    await app.prisma.recipe.deleteMany({ where: { workspaceId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } } });
  });

  afterAll(async () => {
    // Cleanup: keep shared dev DB tidy.
    await app.prisma.recipeWaterSettings.deleteMany({
      where: { workspaceId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } },
    });
    await app.prisma.recipe.deleteMany({ where: { workspaceId: { in: [TEST_ACCOUNT_A, TEST_ACCOUNT_B] } } });
    await app.close();
  });

  it("returns 401 when active workspace is missing", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/recipes/some-recipe-id/water-settings",
      headers: { cookie: cookieNoAccount },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_active_workspace", message: "No active workspace selected" },
    });
  });

  it("upserts then fetches water settings for a recipe", async () => {
    const recipeId = crypto.randomUUID();
    const recipe = await app.prisma.recipe.create({
      data: { id: recipeId, workspaceId: accountAId, versionGroupId: recipeId, version: 0, name: "Water Settings Recipe", style: null, notes: null },
    });
    const spargeProfileA = await app.prisma.waterProfile.create({
      data: {
        key: `test:spargeProfileA:${Date.now()}`,
        scope: "account",
        type: "water",
        workspaceId: accountAId,
        name: "Sparge Water A",
        calcium: 1,
        magnesium: 1,
        sodium: 1,
        sulfate: 1,
        chloride: 1,
        bicarbonate: 61,
        verificationStatus: "unverified",
        source: "test",
      },
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
      headers: { cookie: cookieA },
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

        spargeWaterProfileId: spargeProfileA.id,
        spargeStartingAlkalinityPpmCaCO3: 12,
        spargeStartingPh: 7.1,
        spargeTargetPh: 5.6,
        spargeVolumeLiters: 18,
        spargeAcidType: "phosphoric",
        spargeStrengthKind: "percent",
        spargeStrengthValue: 10,
        spargeAcidificationMode: "manual",
        spargeManualAcidAddedMl: 1.1,
        spargeManualLastAchievedPh: 5.65,
        spargeManualLastFinalAlkalinityPpmCaCO3: 0.12,
        spargeManualLastSulfateAddedPpm: 0,
        spargeManualLastChlorideAddedPpm: 0,
        spargeManualLastCalculatedAt: nowIso,
        spargeSaltAdditionsJson: [{ saltKey: "gypsum", grams: 1.2 }],
        spargeLastAcidRequiredMl: 1.23,
        spargeLastFinalAlkalinityPpmCaCO3: 0.45,
      },
    });
    expect(put.statusCode).toBe(200);
    const putBody = put.json();
    expect(putBody.ok).toBe(true);
    expect(putBody.settings.recipeId).toBe(recipe.id);
    expect(putBody.settings.workspaceId).toBe(accountAId);

    const get = await app.inject({
      method: "GET",
      url: `/recipes/${recipe.id}/water-settings`,
      headers: { cookie: cookieA },
    });
    expect(get.statusCode).toBe(200);
    const body = get.json();
    expect(body.ok).toBe(true);
    expect(body.settings.tapWaterVolumeLiters).toBe(10);
    expect(body.settings.dilutionWaterVolumeLiters).toBe(5);
    expect(body.settings.mashStartingAlkalinityPpmCaCO3).toBe(40);
    expect(body.settings.mashTargetPh).toBe(5.4);
    // mashWaterVolumeLiters is now derived from mixing volumes (tap + dilution)
    expect(body.settings.mashWaterVolumeLiters).toBe(15);
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
    expect(body.settings.spargeWaterProfileId).toBe(spargeProfileA.id);
    expect(body.settings.spargeStartingAlkalinityPpmCaCO3).toBe(12);
    expect(body.settings.spargeLastAcidRequiredMl).toBe(1.23);
    expect(body.settings.spargeAcidificationMode).toBe("manual");
    expect(body.settings.spargeManualAcidAddedMl).toBe(1.1);
    expect(body.settings.spargeManualLastAchievedPh).toBe(5.65);
    expect(body.settings.spargeSaltAdditionsJson).toEqual([{ saltKey: "gypsum", grams: 1.2 }]);
  });

  it("does not leak settings across workspaces", async () => {
    const recipeAId = crypto.randomUUID();
    const recipeA = await app.prisma.recipe.create({
      data: { id: recipeAId, workspaceId: accountAId, versionGroupId: recipeAId, version: 0, name: "Scoped WS", style: null, notes: null },
    });

    await app.inject({
      method: "PUT",
      url: `/recipes/${recipeA.id}/water-settings`,
      headers: { cookie: cookieA },
      payload: { spargeStartingAlkalinityPpmCaCO3: 1 },
    });

    const getB = await app.inject({
      method: "GET",
      url: `/recipes/${recipeA.id}/water-settings`,
      headers: { cookie: cookieB },
    });
    expect(getB.statusCode).toBe(404);
    expect(getB.json()).toEqual({
      ok: false,
      error: { code: "recipe_not_found", message: "Recipe not found" },
    });
  });

  it("rejects saving an account-scoped profile from another account", async () => {
    const recipeId = crypto.randomUUID();
    const recipe = await app.prisma.recipe.create({
      data: { id: recipeId, workspaceId: accountAId, versionGroupId: recipeId, version: 0, name: "Profile Validation", style: null, notes: null },
    });
    const profileB = await app.prisma.waterProfile.create({
      data: {
        key: `test:accountB:${Date.now()}`,
        scope: "account",
        type: "water",
        workspaceId: accountBId,
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
      headers: { cookie: cookieA },
      payload: { targetWaterProfileId: profileB.id },
    });
    expect(put.statusCode).toBe(403);
    expect(put.json()).toEqual({
      ok: false,
      error: {
        code: "profile_not_accessible",
        message: "Water profile is not accessible to this workspace",
      },
    });

    const putSparge = await app.inject({
      method: "PUT",
      url: `/recipes/${recipe.id}/water-settings`,
      headers: { cookie: cookieA },
      payload: { spargeWaterProfileId: profileB.id },
    });
    expect(putSparge.statusCode).toBe(403);
    expect(putSparge.json()).toEqual({
      ok: false,
      error: {
        code: "profile_not_accessible",
        message: "Water profile is not accessible to this workspace",
      },
    });
  });
});

/**
 * Phase 4b-4 — explicit L2 auth gate pins for the recipe-water-compute-and-save
 * and recipe-water-hub-summary routes.
 *
 * Why this block exists
 * ---------------------
 * Per the Phase 4a route surface audit (docs/TESTING.md → "Phase 4a route
 * surface audit"), `recipeWaterComputeAndSave.ts` (3 routes — mash + sparge
 * + boil compute-and-save) and `recipeWaterHubSummary.ts` (1 route) had
 * L4 contract-snapshot coverage (`services/api/src/tests/contracts/
 * recipeWaterCompute.contract.test.ts` + `recipeWater.contract.test.ts`)
 * but ZERO explicit L2 auth-gate assertions. The L4 tests happen to use a
 * real authenticated session, so an `await app.inject({ url, ... })`
 * regression that accidentally dropped `requireActiveWorkspace` from these
 * routes would silently pass at L4 (because the L4 test always has a
 * cookie) — it would only surface as a security incident in production.
 *
 * This block pins the auth gate explicitly: without a cookie or with a
 * cookie-no-workspace, all 4 routes must return 401. It does NOT re-pin
 * the response shape (that's L4's job) or behavior (that's the cross-
 * workspace tests in the main block above). One assertion per route per
 * unauth flavor: 4 routes × 2 flavors = 8 pins.
 *
 * Why a separate sibling describe (rather than extending the main one)
 * ---------------------------------------------------------------------
 * The main describe block above is about `/water-settings` (PUT/GET) and
 * already has a heavy beforeAll fixture set (recipes, profiles). The
 * compute-and-save + hub-summary routes are auth-gated BEFORE any DB
 * work (the route handler's first line is `requireActiveWorkspace(req)`),
 * so these assertions don't need the recipe/profile fixtures — using a
 * dedicated lightweight `describe` keeps the auth-pin layer cheap and
 * clearly separated from the round-trip-behavior tests. Same `app`
 * instance per buildApp() pattern to avoid double-bootstrapping the
 * Fastify server.
 */
describe("recipe water compute-and-save + hub-summary auth gates (Phase 4b-4)", () => {
  const app = buildApp();
  let cookieNoWorkspace = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeWorkspace: false });
    cookieNoWorkspace = sess.cookie;
  });

  afterAll(async () => {
    await app.close();
  });

  // Recipe id can be any string — `requireActiveWorkspace` fires before
  // the route handler ever reads :id, so the auth gate trips on a fake
  // id just as it would on a real one.
  const fakeRecipeId = "00000000-0000-0000-0000-000000000000";

  // All 4 routes that previously had L4-only coverage. The route table
  // and HTTP methods exactly match what's in
  // `services/api/src/modules/brewery/routes/recipeWaterComputeAndSave.ts` and
  // `services/api/src/modules/brewery/routes/recipeWaterHubSummary.ts`
  // (relocated in Week 1 audit per RFC-0006).
  const routes: Array<{ method: "POST" | "GET"; url: string }> = [
    { method: "POST", url: `/recipes/${fakeRecipeId}/water-settings/mash/compute-and-save` },
    { method: "POST", url: `/recipes/${fakeRecipeId}/water-settings/sparge/compute-and-save` },
    { method: "POST", url: `/recipes/${fakeRecipeId}/water-settings/boil/compute-and-save` },
    { method: "GET", url: `/recipes/${fakeRecipeId}/water-hub-summary` },
  ];

  for (const route of routes) {
    it(`${route.method} ${route.url} returns 401 missing_session without cookie`, async () => {
      const res = await app.inject({ method: route.method, url: route.url });
      expect(res.statusCode).toBe(401);
      const body = res.json() as { ok: boolean; error: { code: string } };
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("missing_session");
    });

    it(`${route.method} ${route.url} returns 401 missing_active_workspace with no-workspace session`, async () => {
      const res = await app.inject({
        method: route.method,
        url: route.url,
        headers: { cookie: cookieNoWorkspace },
      });
      expect(res.statusCode).toBe(401);
      const body = res.json() as { error: { code: string } };
      expect(body.error.code).toBe("missing_active_workspace");
    });
  }
});

