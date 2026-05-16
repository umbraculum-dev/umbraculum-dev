/**
 * Contract snapshot: POST /recipes + GET /recipes/:id
 *
 * Native (apps/native) reads recipe payloads to render recipe edit/brew flows.
 * If we add/rename a BeerJSON-derived field server-side and forget to update
 * the native parser in @brewery/contracts, this snapshot turns it into a PR red.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";
import { assertSnapshotShape } from "./shapeHelpers.js";

const RECIPE_NAME = "Contract Snapshot Pale Ale";

function buildBeerJsonRecipe(name: string) {
  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name,
          type: "all grain",
          author: "brewery-app-contract",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          ingredients: {
            fermentable_additions: [
              {
                id: "contract-grain-1",
                name: "Pale Ale Malt",
                type: "grain",
                yield: { potential: { unit: "sg", value: 1.037 } },
                color: { unit: "Lovi", value: 3.0 },
                amount: { unit: "kg", value: 4.5 },
              },
            ],
            hop_additions: [
              {
                name: "Cascade",
                alpha_acid: { unit: "%", value: 5.5 },
                amount: { unit: "g", value: 30 },
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
}

describe("contract: recipe create + fetch", () => {
  const app = buildApp();
  let cookie = "";
  let recipeId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeWorkspace: true });
    cookie = sess.cookie;

    const create = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: {
        name: RECIPE_NAME,
        styleKey: "custom",
        beerJsonRecipeJson: buildBeerJsonRecipe(RECIPE_NAME),
      },
    });
    if (create.statusCode !== 200) {
      throw new Error(`recipe create failed (${create.statusCode}): ${create.body}`);
    }
    const body = create.json();
    recipeId = body.recipe.id;
  });

  afterAll(async () => {
    if (recipeId) {
      await app.prisma.recipe.deleteMany({ where: { id: recipeId } }).catch(() => undefined);
    }
    await app.close();
  });

  it("POST /recipes response shape is stable", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/recipes",
      headers: { cookie },
      payload: {
        name: RECIPE_NAME + " (snap)",
        styleKey: "custom",
        beerJsonRecipeJson: buildBeerJsonRecipe(RECIPE_NAME + " (snap)"),
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    try {
      assertSnapshotShape("recipe.create", body);
    } finally {
      await app.prisma.recipe.deleteMany({ where: { id: body.recipe.id } }).catch(() => undefined);
    }
  });

  it("GET /recipes/:id response shape is stable", async () => {
    const res = await app.inject({ method: "GET", url: `/recipes/${recipeId}`, headers: { cookie } });
    expect(res.statusCode).toBe(200);
    assertSnapshotShape("recipe.fetchById", res.json());
  });
});
