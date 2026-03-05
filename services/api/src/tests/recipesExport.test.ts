import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("recipes export (BeerJSON strict)", () => {
  const app = buildApp();
  let cookie = "";
  let createdRecipeId = "";
  let workspaceId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeAccount: true });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;
  });

  afterAll(async () => {
    if (createdRecipeId) {
      await app.prisma.recipe.deleteMany({ where: { id: createdRecipeId, workspaceId } });
    }
    await app.close();
  });

  it("exports BeerJSON with addition row ids stripped", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: {
        name: "Export Strict Test",
        styleKey: "custom",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: "Export Strict Test",
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
                      brewery_app_late_addition: true,
                    },
                  ],
                  hop_additions: [
                    {
                      id: "row-2",
                      name: "Cascade",
                      alpha_acid: { unit: "%", value: 5.5 },
                      amount: { unit: "g", value: 50 },
                      timing: { use: "add_to_boil", duration: { unit: "min", value: 60 } },
                    },
                  ],
                  culture_additions: [
                    {
                      id: "row-3",
                      name: "US-05",
                      type: "ale",
                      form: "dry",
                      amount: { unit: "pkg", value: 1 },
                    },
                  ],
                  miscellaneous_additions: [
                    {
                      id: "row-4",
                      name: "Irish Moss",
                      type: "fining",
                      amount: { unit: "kg", value: 0.01 },
                      timing: { use: "add_to_boil", duration: { unit: "min", value: 10 } },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    });
    expect(create.statusCode).toBe(200);
    const created = create.json() as any;
    expect(created.ok).toBe(true);
    createdRecipeId = created.recipe.id;
    expect(createdRecipeId).toBeTruthy();

    const exp = await app.inject({
      method: "GET",
      url: `/recipes/${createdRecipeId}/export/beerjson`,
      headers: { cookie },
    });
    expect(exp.statusCode).toBe(200);
    expect(String(exp.headers["content-type"] ?? "")).toContain("application/json");
    expect(String(exp.headers["content-disposition"] ?? "")).toContain("attachment");

    const doc = exp.json() as any;
    const ing = doc?.beerjson?.recipes?.[0]?.ingredients ?? null;
    expect(ing?.fermentable_additions?.[0]?.id).toBeUndefined();
    expect(ing?.fermentable_additions?.[0]?.brewery_app_late_addition).toBeUndefined();
    expect(ing?.hop_additions?.[0]?.id).toBeUndefined();
    expect(ing?.culture_additions?.[0]?.id).toBeUndefined();
    expect(ing?.miscellaneous_additions?.[0]?.id).toBeUndefined();

    // Non-id fields remain.
    expect(ing?.fermentable_additions?.[0]?.name).toBe("Pale malt");
  });
});

