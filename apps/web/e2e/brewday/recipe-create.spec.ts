/**
 * recipe-create.spec.ts - end-to-end recipe creation via the API, validated
 * via the workspace-scoped GET /api/recipes/:id round-trip.
 *
 * The UI form is intentionally NOT driven here; that's the job of the agentic
 * browser-MCP layer (see the plugin-shipped agentic-browser-web-app skill + docs/AGENTIC-JOBS.md ->
 * agenticCreateRecipe). Playwright keeps the deterministic shape contract.
 */
import { test, expect } from "../support/auth-fixture";

const SPEC_RECIPE_NAME = "E2E Playwright Recipe (create.spec)";

test.describe("recipe create (API round-trip)", () => {
  test("creates a BeerJSON recipe and fetches it back with name/style preserved", async ({ authenticatedContext }) => {
    const createResponse = await authenticatedContext.request.post("/api/recipes", {
      data: {
        name: SPEC_RECIPE_NAME,
        styleKey: "custom",
        beerJsonRecipeJson: {
          beerjson: {
            version: 1,
            recipes: [
              {
                name: SPEC_RECIPE_NAME,
                type: "all grain",
                author: "brewery-app-playwright",
                efficiency: { brewhouse: { unit: "%", value: 75 } },
                batch_size: { unit: "l", value: 20 },
                ingredients: {
                  fermentable_additions: [
                    {
                      id: "pw-grain-1",
                      name: "Pale Ale Malt",
                      type: "grain",
                      yield: { potential: { unit: "sg", value: 1.037 } },
                      color: { unit: "Lovi", value: 3.0 },
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
        },
      },
    });
    expect(createResponse.status(), `unexpected status: ${await createResponse.text().catch(() => "")}`).toBe(200);
    const createBody = (await createResponse.json()) as { ok: boolean; recipe: { id: string; name: string; styleKey: string } };
    expect(createBody.ok).toBe(true);
    expect(createBody.recipe.name).toBe(SPEC_RECIPE_NAME);
    expect(createBody.recipe.styleKey).toBe("custom");

    const fetchResponse = await authenticatedContext.request.get(`/api/recipes/${createBody.recipe.id}`);
    expect(fetchResponse.status()).toBe(200);
    const fetchBody = (await fetchResponse.json()) as { ok: boolean; recipe: { id: string; name: string; beerJsonRecipeJson: { beerjson: { recipes: Array<{ name: string }> } } } };
    expect(fetchBody.ok).toBe(true);
    expect(fetchBody.recipe.id).toBe(createBody.recipe.id);
    expect(fetchBody.recipe.name).toBe(SPEC_RECIPE_NAME);
    expect(fetchBody.recipe.beerJsonRecipeJson.beerjson.recipes[0]?.name).toBe(SPEC_RECIPE_NAME);

    await authenticatedContext.request.delete(`/api/recipes/${createBody.recipe.id}`).catch(() => undefined);
  });
});
