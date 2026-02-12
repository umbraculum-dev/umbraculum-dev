import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEV_ACCOUNT_A = "00000000-0000-0000-0000-0000000000a1";
const DEV_ACCOUNT_B = "00000000-0000-0000-0000-0000000000b2";

describe("recipes (account scoped)", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();

    await app.prisma.user.upsert({
      where: { id: DEV_USER_ID },
      create: { id: DEV_USER_ID, email: "dev@brewery.local" },
      update: { email: "dev@brewery.local" },
    });

    await app.prisma.account.upsert({
      where: { id: DEV_ACCOUNT_A },
      create: { id: DEV_ACCOUNT_A, name: "Dev Brewery A" },
      update: { name: "Dev Brewery A" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: DEV_ACCOUNT_A, userId: DEV_USER_ID } },
      create: { accountId: DEV_ACCOUNT_A, userId: DEV_USER_ID, role: "owner" },
      update: { role: "owner" },
    });

    await app.prisma.account.upsert({
      where: { id: DEV_ACCOUNT_B },
      create: { id: DEV_ACCOUNT_B, name: "Dev Brewery B" },
      update: { name: "Dev Brewery B" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: DEV_ACCOUNT_B, userId: DEV_USER_ID } },
      create: { accountId: DEV_ACCOUNT_B, userId: DEV_USER_ID, role: "owner" },
      update: { role: "owner" },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 400 when X-Account-Id is missing", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { "x-user-id": DEV_USER_ID },
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
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
      payload: { name: "Test Recipe", style: "IPA" },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);
    expect(created.recipe.accountId).toBe(DEV_ACCOUNT_A);

    const list = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
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
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
      payload: { name: "Scoped Recipe", style: null },
    });
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    // List in B must not contain it
    const listB = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_B },
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
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
      payload: { name: "Editable Recipe", style: "Stout", notes: "Initial notes" },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);

    const getA = await app.inject({
      method: "GET",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
    });
    expect(getA.statusCode).toBe(200);
    const gotA = getA.json() as any;
    expect(gotA.ok).toBe(true);
    expect(gotA.recipe.accountId).toBe(DEV_ACCOUNT_A);
    expect(gotA.recipe.notes).toBe("Initial notes");

    const patchA = await app.inject({
      method: "PATCH",
      url: `/recipes/${created.recipe.id}`,
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_A },
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
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_B },
    });
    expect(getB.statusCode).toBe(404);
    expect(getB.json()).toEqual({
      ok: false,
      error: { code: "recipe_not_found", message: "Recipe not found" },
    });
  });
});

