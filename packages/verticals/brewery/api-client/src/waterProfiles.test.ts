import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "@umbraculum/api-client";
import { createApiClient } from "@umbraculum/api-client";
import { ApiClientError } from "@umbraculum/api-client";
import { deleteWaterProfile, listWaterProfiles } from "./waterProfiles.js";
import { updateRecipeWaterSettings } from "./waterSettings.js";

describe("waterProfiles facades", () => {
  it("listWaterProfiles parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              system: [],
              public: [],
              workspace: [],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listWaterProfiles(client);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/water-profiles",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("deleteWaterProfile throws ApiClientError on 404", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ ok: false, error: "not found" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(deleteWaterProfile(client, "missing")).rejects.toBeInstanceOf(ApiClientError);
  });
});

describe("waterSettings facades", () => {
  it("updateRecipeWaterSettings uses PUT and parses response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              settings: { id: "ws1", mashSaltAdditionsJson: [] },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await updateRecipeWaterSettings(client, "r1", { mashSaltAdditionsJson: [] });
    expect(res.settings?.['id']).toBe("ws1");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/recipes/r1/water-settings",
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
