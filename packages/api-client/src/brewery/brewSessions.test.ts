import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { getBrewSession } from "./brewSessions.js";
import { listInventory } from "./inventory.js";

describe("brewery brewSessions facades", () => {
  it("getBrewSession parses detail", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              brewSession: {
                id: "bs1",
                workspaceId: "w1",
                recipeId: "r1",
                code: "BS-1",
                status: "planned",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
                startedAt: null,
                pausedAt: null,
                stoppedAt: null,
                scheduledDate: null,
              },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await getBrewSession(client, "bs1");
    expect(res.brewSession["id"]).toBe("bs1");
  });
});

describe("brewery inventory facades", () => {
  it("listInventory parses items", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              items: [{
                id: "i1",
                workspaceId: "w1",
                category: "fermentable",
                ingredientId: null,
                name: "Malt",
                quantity: 1,
                unit: "kg",
                metadataJson: null,
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              }],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listInventory(client);
    expect(res.items[0]?.name).toBe("Malt");
  });
});
