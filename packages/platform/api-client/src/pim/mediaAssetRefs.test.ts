import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { createProductMediaAssetRef, listProductMediaAssetRefs } from "./mediaAssetRefs.js";

const sampleRef = {
  id: "r1",
  productId: "p1",
  mediaAssetId: "m1",
  role: "primary" as const,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("pim mediaAssetRefs facades", () => {
  it("listProductMediaAssetRefs parses list", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, items: [sampleRef] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listProductMediaAssetRefs(client, "p1");
    expect(res.items).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/pim/products/p1/media-asset-refs",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("createProductMediaAssetRef POSTs with 201", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify({ ok: true, item: sampleRef })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await createProductMediaAssetRef(client, "p1", {
      mediaAssetId: "m1",
      role: "primary",
    });
    expect(res.item.id).toBe("r1");
  });
});
