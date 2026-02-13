import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

// Use test-only IDs so running tests doesn't pollute seeded dev data.
const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
const TEST_ACCOUNT_A = "22222222-2222-2222-2222-222222222222";
const TEST_ACCOUNT_B = "33333333-3333-3333-3333-333333333333";

describe("recipes (account scoped)", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();

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
      headers: { "x-user-id": TEST_USER_ID },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_account_id", message: "Missing header: X-Account-Id" },
    });
  });

  it("can create then list recipes for active account", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: {
        name: "Test Recipe",
        style: "IPA",
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
    expect(created.recipe.accountId).toBe(TEST_ACCOUNT_A);
    expect(created.recipe.gristJson).toEqual([
      {
        id: "row-1",
        name: "Pale malt",
        amountKg: 4.5,
        colorLovibond: 2,
        potential: { kind: "ppg", value: 37 },
      },
    ]);

    const list = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
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
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: { name: "Scoped Recipe", style: null },
    });
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    // List in B must not contain it
    const listB = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_B },
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
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: { name: "Editable Recipe", style: "Stout", notes: "Initial notes" },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    const getA = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
    });
    expect(getA.statusCode).toBe(200);
    const gotA = getA.json() as any;
    expect(gotA.ok).toBe(true);
    expect(gotA.recipe.accountId).toBe(TEST_ACCOUNT_A);
    expect(gotA.recipe.notes).toBe("Initial notes");

    const patchA = await app.inject({
      method: "PATCH",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: { name: "Renamed Recipe", style: "Porter", notes: "Updated notes" },
    });
    expect(patchA.statusCode).toBe(200);
    const patched = patchA.json() as any;
    expect(patched.ok).toBe(true);
    expect(patched.recipe.name).toBe("Renamed Recipe");
    expect(patched.recipe.style).toBe("Porter");
    expect(patched.recipe.notes).toBe("Updated notes");

    const getB = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_B },
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
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: { name: "Delete Me", style: null },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    const del = await app.inject({
      method: "DELETE",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json()).toEqual({ ok: true });

    const get = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
    });
    expect(get.statusCode).toBe(404);
  });

  it("does not allow deleting across accounts", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: { name: "Delete Scoped", style: null },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    const delWrong = await app.inject({
      method: "DELETE",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_B },
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
      headers: { "x-user-id": TEST_USER_ID, "x-account-id": TEST_ACCOUNT_A },
      payload: {
        name: "Bad grist",
        gristJson: [{ id: "x", name: "Malt", amountKg: -1, colorLovibond: 2, potential: null }],
      },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as any;
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("invalid_grist_row_amount");
  });
});

