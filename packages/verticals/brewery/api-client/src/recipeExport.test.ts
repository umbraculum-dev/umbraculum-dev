import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "@umbraculum/api-client";
import { createApiClient } from "@umbraculum/api-client";
import {
  allRecipesBeerJsonExportPath,
  exportAllRecipesBeerJson,
  exportRecipeBeerJson,
  recipeBeerJsonExportPath,
} from "./recipeExport.js";

describe("brewery recipeExport facades", () => {
  it("recipeBeerJsonExportPath encodes recipe id", () => {
    expect(recipeBeerJsonExportPath("abc/def")).toBe("/api/recipes/abc%2Fdef/export/beerjson");
  });

  it("allRecipesBeerJsonExportPath is stable", () => {
    expect(allRecipesBeerJsonExportPath()).toBe("/api/recipes/export/beerjson");
  });

  it("exportRecipeBeerJson returns bytes from non-JSON body", async () => {
    const payload = Buffer.from([0x7b, 0x22, 0x62, 0x65, 0x65, 0x72, 0x7d]);
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(payload.toString("latin1")),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const buf = await exportRecipeBeerJson(client, "r1");
    expect(buf.equals(payload)).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/recipes/r1/export/beerjson",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("exportAllRecipesBeerJson GETs bulk path", async () => {
    const payload = Buffer.from([0x5b, 0x5d, 0x00]);
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(payload.toString("latin1")),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await exportAllRecipesBeerJson(client);
    expect(fetch).toHaveBeenCalledWith(
      `http://test${allRecipesBeerJsonExportPath()}`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
