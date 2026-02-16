import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("ingredients: yeasts", () => {
  const app = buildApp();
  let cookie = "";

  beforeAll(async () => {
    await app.ready();
    cookie = (await createSessionForTestUser(app, { activeAccount: false })).cookie;
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
      headers: { cookie },
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
      headers: { cookie },
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

