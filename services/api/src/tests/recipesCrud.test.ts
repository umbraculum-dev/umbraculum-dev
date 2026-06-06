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
  it("returns 401 when active workspace is missing in session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: cookieNoAccount },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_active_workspace", message: "No active workspace selected" },
    });
  });

  it("can create then list recipes for active workspace", async () => {
    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Test Recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "l", value: 20 },
            ingredients: {
              fermentable_additions: [
                {
                  id: "row-1",
                  name: "Pale malt",
                  type: "grain",
                  yield: { potential: { unit: "sg", value: 1.037 } },
                  color: { unit: "Lovi", value: 2.0 },
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

    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Test Recipe",
        styleKey: "custom",
        beerJsonRecipeJson,
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json();
    expect(created.ok).toBe(true);
    expect(created.recipe.workspaceId).toBe(accountAId);
    expect(created.recipe.styleKey).toBe("custom");
    expect(created.recipe.style).toBe("Custom");
    expect(created.recipe.beerJsonRecipeJson?.beerjson?.version).toBe(1);
    expect(created.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.ingredients?.fermentable_additions?.[0]?.id).toBe(
      "row-1",
    );
    expect(created.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.ingredients?.fermentable_additions?.[0]?.name).toBe(
      "Pale malt",
    );

    const list = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: cookieA },
    });
    expect(list.statusCode).toBe(200);
    const body = list.json();
    expect(body.ok).toBe(true);
    expect(body.recipes.some((r: any) => r.id === created.recipe.id)).toBe(true);
  });

  it("normalizes US customary units when creating a recipe", async () => {
    const beerJsonRecipeJson = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Imperial Create",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "gal", value: 5 },
            ingredients: {
              fermentable_additions: [
                {
                  id: "row-imp-1",
                  name: "Pale malt",
                  type: "grain",
                  yield: { potential: { unit: "sg", value: 1.037 } },
                  color: { unit: "Lovi", value: 2.0 },
                  amount: { unit: "lb", value: 10 },
                },
              ],
              hop_additions: [
                {
                  name: "Cascade",
                  alpha_acid: { unit: "%", value: 5.5 },
                  amount: { unit: "oz", value: 2 },
                  timing: { use: "add_to_boil", duration: { unit: "min", value: 60 } },
                },
              ],
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
        name: "Imperial Create",
        styleKey: "custom",
        beerJsonRecipeJson,
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json();
    expect(created.ok).toBe(true);

    const r0 = created.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0] ?? null;
    expect(r0?.batch_size?.unit).toBe("l");
    expect(r0?.batch_size?.value).toBeCloseTo(18.927_058_92, 8);

    const f0 = r0?.ingredients?.fermentable_additions?.[0] ?? null;
    expect(f0?.amount?.unit).toBe("kg");
    expect(f0?.amount?.value).toBeCloseTo(4.535_923_7, 8);

    const h0 = r0?.ingredients?.hop_additions?.[0] ?? null;
    expect(h0?.amount?.unit).toBe("g");
    expect(h0?.amount?.value).toBeCloseTo(56.699_046_25, 8);
  });

  it("does not leak recipes across workspaces", async () => {
    // Create recipe in A
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Scoped Recipe",
        styleKey: "custom",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: "Scoped Recipe",
                type: "all grain",
                author: "brewery-app",
                efficiency: { brewhouse: { unit: "%", value: 75 } },
                batch_size: { unit: "l", value: 20 },
                ingredients: {
                  fermentable_additions: [],
                  hop_additions: [],
                  culture_additions: [],
                  miscellaneous_additions: [],
                },
              },
            ],
          },
        },
      },
    });
    const created = create.json();
    expect(created.ok).toBe(true);

    // List in B must not contain it
    const listB = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: cookieB },
    });
    expect(listB.statusCode).toBe(200);
    const bodyB = listB.json();
    expect(bodyB.ok).toBe(true);
    expect(bodyB.recipes.some((r: any) => r.id === created.recipe.id)).toBe(false);
  });

  it("can load and update a recipe (name/style/notes) within a workspace", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Editable Recipe",
        styleKey: "custom",
        notes: "Initial notes",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: "Editable Recipe",
                type: "all grain",
                author: "brewery-app",
                efficiency: { brewhouse: { unit: "%", value: 75 } },
                batch_size: { unit: "l", value: 20 },
                notes: "Initial notes",
                ingredients: {
                  fermentable_additions: [],
                  hop_additions: [],
                  culture_additions: [],
                  miscellaneous_additions: [],
                },
              },
            ],
          },
        },
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json();
    expect(created.ok).toBe(true);

    const getA = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieA },
    });
    expect(getA.statusCode).toBe(200);
    const gotA = getA.json();
    expect(gotA.ok).toBe(true);
    expect(gotA.recipe.workspaceId).toBe(accountAId);
    expect(gotA.recipe.notes).toBe("Initial notes");

    const patchA = await app.inject({
      method: "PATCH",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieA },
      payload: { name: "Renamed Recipe", styleKey: "custom", notes: "Updated notes" },
    });
    expect(patchA.statusCode).toBe(200);
    const patched = patchA.json();
    expect(patched.ok).toBe(true);
    expect(patched.recipe.name).toBe("Renamed Recipe");
    expect(patched.recipe.styleKey).toBe("custom");
    expect(patched.recipe.style).toBe("Custom");
    expect(patched.recipe.notes).toBe("Updated notes");

    const getB = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieB },
    });
    expect(getB.statusCode).toBe(404);
    expect(getB.json()).toEqual({
      ok: false,
      error: { code: "recipe_not_found", message: "Recipe not found" },
    });
  });

  it("can delete a recipe within a workspace", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Delete Me",
        styleKey: "custom",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: "Delete Me",
                type: "all grain",
                author: "brewery-app",
                efficiency: { brewhouse: { unit: "%", value: 75 } },
                batch_size: { unit: "l", value: 20 },
                ingredients: {
                  fermentable_additions: [],
                  hop_additions: [],
                  culture_additions: [],
                  miscellaneous_additions: [],
                },
              },
            ],
          },
        },
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json();
    expect(created.ok).toBe(true);

    const del = await app.inject({
      method: "DELETE",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieA },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json()).toEqual({ ok: true });

    const get = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieA },
    });
    expect(get.statusCode).toBe(404);
  });

  it("does not allow deleting across accounts", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Delete Scoped",
        styleKey: "custom",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: "Delete Scoped",
                type: "all grain",
                author: "brewery-app",
                efficiency: { brewhouse: { unit: "%", value: 75 } },
                batch_size: { unit: "l", value: 20 },
                ingredients: {
                  fermentable_additions: [],
                  hop_additions: [],
                  culture_additions: [],
                  miscellaneous_additions: [],
                },
              },
            ],
          },
        },
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json();
    expect(created.ok).toBe(true);

    const delWrong = await app.inject({
      method: "DELETE",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieB },
    });
    expect(delWrong.statusCode).toBe(404);
    expect(delWrong.json()).toEqual({
      ok: false,
      error: { code: "recipe_not_found", message: "Recipe not found" },
    });
  });
});
