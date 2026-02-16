import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEV_ACCOUNT_ID = "00000000-0000-0000-0000-0000000000a1";

describe("ingredients: yeasts", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();

    // Ensure seed baseline exists (tests should be repeatable).
    await app.prisma.user.upsert({
      where: { id: DEV_USER_ID },
      create: { id: DEV_USER_ID, email: "dev@brewery.local" },
      update: { email: "dev@brewery.local" },
    });
    await app.prisma.account.upsert({
      where: { id: DEV_ACCOUNT_ID },
      create: { id: DEV_ACCOUNT_ID, name: "Dev Brewery" },
      update: { name: "Dev Brewery" },
    });
    await app.prisma.accountMember.upsert({
      where: { accountId_userId: { accountId: DEV_ACCOUNT_ID, userId: DEV_USER_ID } },
      create: { accountId: DEV_ACCOUNT_ID, userId: DEV_USER_ID, role: "owner" },
      update: { role: "owner" },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns productId in /ingredients/yeasts items", async () => {
    const created = await app.prisma.yeast.create({
      data: {
        name: "Test Yeast ProductId",
        lab: "Test Lab",
        productId: "TST-123",
        attenuationMin: 72,
        attenuationMax: 78,
      },
    });

    const res = await app.inject({
      method: "GET",
      url: "/ingredients/yeasts?query=Test%20Yeast%20ProductId",
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_ID },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    const hit = body.items.find((it: any) => it.id === created.id);
    expect(hit).toBeTruthy();
    expect(hit.productId).toBe("TST-123");

    const resByProduct = await app.inject({
      method: "GET",
      url: "/ingredients/yeasts?query=TST-123",
      headers: { "x-user-id": DEV_USER_ID, "x-account-id": DEV_ACCOUNT_ID },
    });
    expect(resByProduct.statusCode).toBe(200);
    const bodyByProduct = resByProduct.json() as any;
    expect(bodyByProduct.ok).toBe(true);
    const hitByProduct = bodyByProduct.items.find((it: any) => it.id === created.id);
    expect(hitByProduct).toBeTruthy();
    expect(hitByProduct.productId).toBe("TST-123");

    await app.prisma.yeast.delete({ where: { id: created.id } });
  });
});

