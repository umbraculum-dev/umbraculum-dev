import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import {
  createPlatformAd,
  deletePlatformAd,
  listPlatformAds,
  listPlatformRecipes,
  listPlatformWorkspaces,
  patchPlatformAd,
} from "./platformAdmin.js";

describe("platform admin facades", () => {
  it("listPlatformWorkspaces parses workspace rows", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              workspaces: [{ id: "w1", name: "Workspace" }],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listPlatformWorkspaces(client);
    expect(res["workspaces"]).toHaveLength(1);
  });

  it("listPlatformRecipes passes workspaceId query", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, recipes: [] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await listPlatformRecipes(client, "w1");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/platform/recipes/list?workspaceId=w1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("listPlatformAds parses ads list", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, ads: [] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listPlatformAds(client);
    expect(res["ads"]).toEqual([]);
  });

  it("createPlatformAd POSTs payload", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, id: "ad1" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await createPlatformAd(client, {
      placement: "global_top",
      imageUrl: "https://example.com/a.png",
      linkUrl: "https://example.com",
      altText: "Ad",
    });
    expect(res["id"]).toBe("ad1");
  });

  it("patchPlatformAd PATCHes isActive", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await patchPlatformAd(client, "ad1", { isActive: false });
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/platform/ads/ad1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("deletePlatformAd DELETEs ad row", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await deletePlatformAd(client, "ad1");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/platform/ads/ad1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
