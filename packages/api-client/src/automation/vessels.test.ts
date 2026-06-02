import { describe, expect, it, vi } from "vitest";

import { VesselListResponseSchema } from "@umbraculum/automation-contracts";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { ApiClientError } from "../errors.js";
import { getVessel, listVessels } from "./vessels.js";

describe("automation vessels facades", () => {
  it("listVessels parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify(
              VesselListResponseSchema.parse({
                ok: true,
                vessels: [],
              }),
            ),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listVessels(client);
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/automation/vessels",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("getVessel throws ApiClientError on 404", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ ok: false, error: "not_found" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(getVessel(client, "missing")).rejects.toBeInstanceOf(ApiClientError);
  });
});
