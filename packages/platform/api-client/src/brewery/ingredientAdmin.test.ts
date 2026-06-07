import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { listIngredientSyncRuns, runIngredientSync } from "./ingredientAdmin.js";

describe("brewery ingredientAdmin facades", () => {
  it("listIngredientSyncRuns parses runs", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, runs: [{ id: "run-1" }] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listIngredientSyncRuns(client);
    expect(res.runs).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/admin/ingredients/sync-runs",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("runIngredientSync POSTs sync", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, result: { imported: 1 } })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await runIngredientSync(client);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/admin/ingredients/sync",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
