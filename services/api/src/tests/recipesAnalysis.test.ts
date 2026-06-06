import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

// Use test-only IDs so running tests doesn't pollute seeded dev data.
const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
const TEST_ACCOUNT_A = "22222222-2222-2222-2222-222222222222";
const TEST_ACCOUNT_B = "33333333-3333-3333-3333-333333333333";

describe("recipes (workspace scoped)", () => {
  const app = buildApp();
  let cookieA = "";
  let _cookieB = "";
  let _cookieNoAccount = "";
  let accountAId = "";
  let accountBId = "";

  beforeAll(async () => {
    await app.ready();

    const sessA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessA.cookie;
    accountAId = sessA.workspaceId;

    const sessB = await createSessionForTestUser(app, { activeWorkspace: true });
    _cookieB = sessB.cookie;
    accountBId = sessB.workspaceId;

    const sessNo = await createSessionForTestUser(app, { activeWorkspace: false });
    _cookieNoAccount = sessNo.cookie;

    // Keep recipe tests focused on BeerJSON/recipe behavior, not tier limits.
    await app.prisma.workspaceBilling.upsert({
      where: { workspaceId: accountAId },
      create: { workspaceId: accountAId, tier: "pro_plus", source: "manual" },
      update: { tier: "pro_plus", source: "manual" },
    });
    await app.prisma.workspaceBilling.upsert({
      where: { workspaceId: accountBId },
      create: { workspaceId: accountBId, tier: "pro_plus", source: "manual" },
      update: { tier: "pro_plus", source: "manual" },
    });

    await app.prisma.user.upsert({
      where: { id: TEST_USER_ID },
      create: { id: TEST_USER_ID, email: "test-recipes@brewery.local" },
      update: { email: "test-recipes@brewery.local" },
    });

    await app.prisma.workspace.upsert({
      where: { id: TEST_ACCOUNT_A },
      create: { id: TEST_ACCOUNT_A, name: "Test Brewery A (recipes)" },
      update: { name: "Test Brewery A (recipes)" },
    });
    await app.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: TEST_ACCOUNT_A, userId: TEST_USER_ID } },
      create: { workspaceId: TEST_ACCOUNT_A, userId: TEST_USER_ID, role: "brewery_admin" },
      update: { role: "brewery_admin" },
    });

    await app.prisma.workspace.upsert({
      where: { id: TEST_ACCOUNT_B },
      create: { id: TEST_ACCOUNT_B, name: "Test Brewery B (recipes)" },
      update: { name: "Test Brewery B (recipes)" },
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
  it("rejects missing beerJsonRecipeJson", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Missing beerjson",
        styleKey: "custom",
      },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("invalid_recipe_payload");
  });

  it("snapshots roasted dehusked override/provenance and uses the TA curve defaults", async () => {
    const f = await app.prisma.fermentable.create({
      data: {
        name: "Weyermann CARAFA SPECIAL II",
        producer: "Weyermann",
        group: "Roasted",
        type: "Malt",
        notes: "Dehusked",
        colorEbc: 1000,
        mashDiPh: null,
        mashTaToPh57_mEqPerKg: null,
      },
    });

    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Roast dehusked snapshot recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "l", value: 20 },
            ingredients: {
              fermentable_additions: [
                {
                  id: "row-1",
                  name: "Carafa Special II",
                  type: "grain",
                  producer: "Weyermann",
                  grain_group: "roasted",
                  yield: { fine_grind: { unit: "%", value: 80 } },
                  color: { unit: "Lovi", value: 500 },
                  amount: { unit: "kg", value: 0.5 },
                },
                {
                  id: "row-2",
                  name: "Carafa Special II",
                  type: "grain",
                  producer: "Weyermann",
                  grain_group: "roasted",
                  yield: { fine_grind: { unit: "%", value: 80 } },
                  color: { unit: "Lovi", value: 500 },
                  amount: { unit: "kg", value: 0.5 },
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

    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Roast dehusked snapshot recipe",
        styleKey: "custom",
        beerJsonRecipeJson,
        recipeExtJson: {
          version: 1,
          ingredientLinks: { grist: { "row-1": f.id, "row-2": f.id } },
          mashPhModel: {
            "row-2": { roastDehuskedOverride: false },
          },
        },
      },
    });
    expect(create.statusCode).toBe(200);
    const body = create.json();
    expect(body.ok).toBe(true);
    expect(body.recipe.beerJsonRecipeJson?.beerjson?.version).toBe(1);
    expect(body.recipe.recipeExtJson?.version).toBe(1);
    expect(body.recipe.recipeExtJson?.ingredientLinks?.grist?.["row-1"]).toBe(f.id);
    expect(body.recipe.recipeExtJson?.mashPhModel?.["row-2"]?.roastDehuskedOverride).toBe(false);
  });

  it("accepts yeastJson with productId + attenuation fields", async () => {
    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Yeast snapshot recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "l", value: 20 },
            ingredients: {
              fermentable_additions: [],
              hop_additions: [],
              culture_additions: [
                {
                  id: "y-1",
                  name: "SafAle US-05",
                  type: "ale",
                  form: "dry",
                  producer: "Fermentis",
                  product_id: "US-05",
                  amount: { unit: "pkg", value: 1 },
                  attenuation: { unit: "%", value: 75 },
                },
              ],
              miscellaneous_additions: [],
            },
          },
        ],
      },
    };
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Yeast snapshot recipe",
        styleKey: "custom",
        beerJsonRecipeJson,
      },
    });
    expect(create.statusCode).toBe(200);
    const body = create.json();
    expect(body.ok).toBe(true);
    expect(body.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.ingredients?.culture_additions?.[0]?.id).toBe("y-1");
    expect(body.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.ingredients?.culture_additions?.[0]?.product_id).toBe(
      "US-05",
    );
  });

  it("rejects invalid BeerJSON", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Bad beerjson",
        styleKey: "custom",
        beerJsonRecipeJson: { beerjson: { version: 1, recipes: [] } },
      },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("invalid_beerjson_recipe");
  });

  it("accepts miscJson with weight and volume amounts", async () => {
    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Misc recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "l", value: 20 },
            ingredients: {
              fermentable_additions: [],
              hop_additions: [],
              culture_additions: [],
              miscellaneous_additions: [
                {
                  id: "m-1",
                  name: "Irish moss",
                  type: "fining",
                  timing: { use: "add_to_boil", duration: { unit: "min", value: 10 } },
                  amount: { unit: "kg", value: 0.01 },
                  use_for: "clarity",
                  notes: "kettle fining",
                },
                {
                  id: "m-2",
                  name: "Vanilla extract",
                  type: "flavor",
                  timing: { use: "add_to_fermentation" },
                  amount: { unit: "l", value: 0.05 },
                },
              ],
            },
          },
        ],
      },
    };
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Misc recipe",
        styleKey: "custom",
        beerJsonRecipeJson,
      },
    });
    expect(create.statusCode).toBe(200);
    const body = create.json();
    expect(body.ok).toBe(true);
    expect(body.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.ingredients?.miscellaneous_additions?.length).toBe(2);
    expect(body.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.ingredients?.miscellaneous_additions?.[0]?.id).toBe("m-1");
    expect(body.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.ingredients?.miscellaneous_additions?.[1]?.id).toBe("m-2");
  });

  it("rejects invalid BeerJSON (non-positive misc amount)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Bad misc",
        styleKey: "custom",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: "Bad misc",
                type: "all grain",
                author: "brewery-app",
                efficiency: { brewhouse: { unit: "%", value: 75 } },
                batch_size: { unit: "l", value: 20 },
                ingredients: {
                  fermentable_additions: [],
                  hop_additions: [],
                  culture_additions: [],
                  miscellaneous_additions: [
                    {
                      id: "m-1",
                      name: "Some spice",
                      type: "spice",
                      timing: { use: "add_to_boil", duration: { unit: "min", value: 10 } },
                      amount: { unit: "kg", value: 0 },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("invalid_misc_row_amount");
  });
});
