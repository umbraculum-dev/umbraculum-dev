import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

// Use test-only IDs so running tests doesn't pollute seeded dev data.
const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
const TEST_ACCOUNT_A = "22222222-2222-2222-2222-222222222222";
const TEST_ACCOUNT_B = "33333333-3333-3333-3333-333333333333";

describe("recipes (account scoped)", () => {
  const app = buildApp();
  let cookieA = "";
  let cookieB = "";
  let cookieNoAccount = "";
  let accountAId = "";
  let accountBId = "";

  beforeAll(async () => {
    await app.ready();

    const sessA = await createSessionForTestUser(app, { activeAccount: true });
    cookieA = sessA.cookie;
    accountAId = sessA.accountId;

    const sessB = await createSessionForTestUser(app, { activeAccount: true });
    cookieB = sessB.cookie;
    accountBId = sessB.accountId;

    const sessNo = await createSessionForTestUser(app, { activeAccount: false });
    cookieNoAccount = sessNo.cookie;

    await app.prisma.user.upsert({
      where: { id: TEST_USER_ID },
      create: { id: TEST_USER_ID, email: "test-recipes@brewery.local" },
      update: { email: "test-recipes@brewery.local" },
    });

    await app.prisma.account.upsert({
      where: { id: TEST_ACCOUNT_A },
      create: { id: TEST_ACCOUNT_A, name: "Test Brewery A (recipes)" },
      update: { name: "Test Brewery A (recipes)" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: TEST_ACCOUNT_A, userId: TEST_USER_ID } },
      create: { accountId: TEST_ACCOUNT_A, userId: TEST_USER_ID, role: "owner" },
      update: { role: "owner" },
    });

    await app.prisma.account.upsert({
      where: { id: TEST_ACCOUNT_B },
      create: { id: TEST_ACCOUNT_B, name: "Test Brewery B (recipes)" },
      update: { name: "Test Brewery B (recipes)" },
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
      url: "/recipes",
      headers: { cookie: cookieNoAccount },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_active_account", message: "No active account selected" },
    });
  });

  it("can create then list recipes for active account", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Test Recipe",
        styleKey: "custom",
        gristJson: [
          {
            id: "row-1",
            name: "Pale malt",
            amountKg: 4.5,
            colorLovibond: 2.0,
            potential: { kind: "ppg", value: 37 },
          },
        ],
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);
    expect(created.recipe.accountId).toBe(accountAId);
    expect(created.recipe.styleKey).toBe("custom");
    expect(created.recipe.style).toBe("Custom");
    expect(created.recipe.gristJson).toEqual([
      {
        id: "row-1",
        name: "Pale malt",
        amountKg: 4.5,
        colorLovibond: 2,
        maltClass: "base",
        potential: { kind: "ppg", value: 37 },
      },
    ]);

    const list = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: cookieA },
    });
    expect(list.statusCode).toBe(200);
    const body = list.json() as any;
    expect(body.ok).toBe(true);
    expect(body.recipes.some((r: any) => r.id === created.recipe.id)).toBe(true);
  });

  it("does not leak recipes across accounts", async () => {
    // Create recipe in A
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: { name: "Scoped Recipe", styleKey: "custom" },
    });
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    // List in B must not contain it
    const listB = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: cookieB },
    });
    expect(listB.statusCode).toBe(200);
    const bodyB = listB.json() as any;
    expect(bodyB.ok).toBe(true);
    expect(bodyB.recipes.some((r: any) => r.id === created.recipe.id)).toBe(false);
  });

  it("can load and update a recipe (name/style/notes) within an account", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: { name: "Editable Recipe", styleKey: "custom", notes: "Initial notes" },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    const getA = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieA },
    });
    expect(getA.statusCode).toBe(200);
    const gotA = getA.json() as any;
    expect(gotA.ok).toBe(true);
    expect(gotA.recipe.accountId).toBe(accountAId);
    expect(gotA.recipe.notes).toBe("Initial notes");

    const patchA = await app.inject({
      method: "PATCH",
      url: `/recipes/${created.recipe.id}`,
      headers: { cookie: cookieA },
      payload: { name: "Renamed Recipe", styleKey: "custom", notes: "Updated notes" },
    });
    expect(patchA.statusCode).toBe(200);
    const patched = patchA.json() as any;
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

  it("can delete a recipe within an account", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: { name: "Delete Me", styleKey: "custom" },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
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
      payload: { name: "Delete Scoped", styleKey: "custom" },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
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

  it("rejects invalid gristJson", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Bad grist",
        styleKey: "custom",
        gristJson: [{ id: "x", name: "Malt", amountKg: -1, colorLovibond: 2, potential: null }],
      },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as any;
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("invalid_grist_row_amount");
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

    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Roast dehusked snapshot recipe",
        styleKey: "custom",
        gristJson: [
          {
            id: "row-1",
            ingredientId: f.id,
            name: "Carafa Special II",
            amountKg: 0.5,
            colorLovibond: 500,
            potential: null,
            maltClass: "roast",
          },
          {
            id: "row-2",
            ingredientId: f.id,
            name: "Carafa Special II",
            amountKg: 0.5,
            colorLovibond: 500,
            potential: null,
            maltClass: "roast",
            mashRoastDehuskedOverride: false,
          },
        ],
      },
    });
    expect(create.statusCode).toBe(200);
    const body = create.json() as any;
    expect(body.ok).toBe(true);

    const rows = body.recipe.gristJson as any[];
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(2);

    // Row 1: inferred dehusked -> lower TA
    expect(rows[0].mashRoastDehuskedSource).toBe("inferred");
    expect(rows[0].mashRoastDehuskedOverride).toBe(null);
    expect(rows[0].mashTaToPh57_mEqPerKg).toBeCloseTo(27.733, 3);

    // Row 2: override to husked -> higher TA
    expect(rows[1].mashRoastDehuskedSource).toBe("override");
    expect(rows[1].mashRoastDehuskedOverride).toBe(false);
    expect(rows[1].mashTaToPh57_mEqPerKg).toBeCloseTo(41.733, 3);
  });

  it("accepts yeastJson with productId + attenuation fields", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Yeast snapshot recipe",
        styleKey: "custom",
        yeastJson: [
          {
            id: "y-1",
            name: "SafAle US-05",
            ingredientId: null,
            lab: "Fermentis",
            productId: "US-05",
            attenuationMin: 72,
            attenuationMax: 78,
          },
        ],
      },
    });
    expect(create.statusCode).toBe(200);
    const body = create.json() as any;
    expect(body.ok).toBe(true);
    expect(body.recipe.yeastJson).toEqual([
      {
        id: "y-1",
        name: "SafAle US-05",
        ingredientId: null,
        lab: "Fermentis",
        productId: "US-05",
        attenuationMin: 72,
        attenuationMax: 78,
      },
    ]);
  });

  it("rejects yeastJson with out-of-range attenuation", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Bad yeast",
        styleKey: "custom",
        yeastJson: [
          {
            id: "y-1",
            name: "Some yeast",
            ingredientId: null,
            attenuationMin: 101,
          },
        ],
      },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as any;
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("invalid_yeast_row_attenuation_min");
  });

  it("accepts miscJson with weight and volume amounts", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Misc recipe",
        styleKey: "custom",
        miscJson: [
          {
            id: "m-1",
            name: "Irish moss",
            type: "fining",
            use: "boil",
            timeMinutes: 10,
            amount: 0.01,
            amountIsWeight: true,
            useFor: "clarity",
            notes: "kettle fining",
          },
          {
            id: "m-2",
            name: "Vanilla extract",
            type: "flavor",
            use: "secondary",
            timeMinutes: null,
            amount: 0.05,
            amountIsWeight: false,
          },
        ],
      },
    });
    expect(create.statusCode).toBe(200);
    const body = create.json() as any;
    expect(body.ok).toBe(true);
    expect(body.recipe.miscJson).toEqual([
      {
        id: "m-1",
        name: "Irish moss",
        type: "fining",
        use: "boil",
        timeMinutes: 10,
        amount: 0.01,
        amountIsWeight: true,
        useFor: "clarity",
        notes: "kettle fining",
      },
      {
        id: "m-2",
        name: "Vanilla extract",
        type: "flavor",
        use: "secondary",
        timeMinutes: null,
        amount: 0.05,
        amountIsWeight: false,
      },
    ]);
  });

  it("rejects miscJson with non-positive amount", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie: cookieA },
      payload: {
        name: "Bad misc",
        styleKey: "custom",
        miscJson: [
          {
            id: "m-1",
            name: "Some spice",
            type: "spice",
            use: "boil",
            timeMinutes: 10,
            amount: 0,
            amountIsWeight: true,
          },
        ],
      },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as any;
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("invalid_misc_row_amount");
  });
});

