import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { listBrewSessionsForRecipe, listRecipes } from "./recipes.js";

describe("brewery facades", () => {
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
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/recipes",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("listBrewSessionsForRecipe parses sessions", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              brewSessions: [
                {
                  id: "s1",
                  code: "BS-1",
                  status: "planned",
                  createdAt: "2026-01-01T00:00:00.000Z",
                },
              ],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listBrewSessionsForRecipe(client, "r1");
    expect(res.brewSessions[0]?.id).toBe("s1");
  });
});
