import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { ApiClientError } from "../errors.js";
import { createRecipe, deleteRecipe, listRecipeVersions, listRecipes } from "./recipes.js";
import { listStyles } from "./styles.js";
import { searchYeasts } from "./ingredients.js";

describe("brewery recipes facades (E8)", () => {
  it("createRecipe POSTs and parses response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              recipe: { id: "r2", name: "Pils" },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await createRecipe(client, { name: "Pils", styleKey: "custom" });
    const recipe = res.recipe as Record<string, unknown>;
    expect(recipe["id"]).toBe("r2");
  });

  it("deleteRecipe DELETEs and parses ok", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await deleteRecipe(client, "r1");
    expect(res.ok).toBe(true);
  });

  it("listRecipeVersions parses versions", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              versions: [{ id: "v1", version: 1 }],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listRecipeVersions(client, "r1");
    expect(res.versions[0]?.["id"]).toBe("v1");
  });

  it("createRecipe throws ApiClientError on 4xx", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ ok: false, error: "bad_request" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(createRecipe(client, { name: "X", styleKey: "custom" })).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });
});

describe("brewery styles facades", () => {
  it("listStyles parses styles", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              styles: [{
                key: "custom",
                name: "Custom",
                source: "bjcp",
                version: "2021",
                code: null,
                category: null,
                categoryId: null,
                sortOrder: 0,
              }],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listStyles(client);
    expect(res.styles[0]?.key).toBe("custom");
  });
});

describe("brewery ingredients facades", () => {
  it("searchYeasts parses items", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              items: [{ id: "y1", name: "US-05" }],
              total: 1,
              offset: 0,
              limit: 20,
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await searchYeasts(client, { query: "US" });
    expect(res.items[0]?.["id"]).toBe("y1");
  });
});

describe("brewery facades (existing)", () => {
  it("listRecipes parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              recipes: [{ id: "r1", name: "IPA" }],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listRecipes(client);
    expect(res.recipes[0]?.id).toBe("r1");
  });
});
