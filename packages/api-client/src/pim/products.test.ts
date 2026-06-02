import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { ApiClientError } from "../errors.js";
import { createProduct, listProducts } from "./products.js";

describe("pim products facades", () => {
  it("listProducts parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, items: [] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listProducts(client);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/pim/products",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("createProduct POSTs and parses response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              item: {
                id: "p1",
                workspaceId: "w1",
                sku: "SKU-1",
                name: "Product",
                description: null,
                primaryAttributeSetId: null,
                status: "draft",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await createProduct(client, { sku: "SKU-1", name: "Product" });
    expect(res.item.id).toBe("p1");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/pim/products",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("createProduct throws ApiClientError on 4xx", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ ok: false, error: "bad_request" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(createProduct(client, { sku: "SKU-1", name: "Product" })).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });
});
