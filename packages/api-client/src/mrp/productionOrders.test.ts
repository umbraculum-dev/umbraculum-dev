import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { ApiClientError } from "../errors.js";
import { listProductionOrders } from "./productionOrders.js";

describe("mrp productionOrders facades", () => {
  it("listProductionOrders parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, items: [] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listProductionOrders(client);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/mrp/production-orders",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("listProductionOrders throws ApiClientError on 401", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify({ ok: false, error: "unauthorized" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(listProductionOrders(client)).rejects.toBeInstanceOf(ApiClientError);
  });
});
