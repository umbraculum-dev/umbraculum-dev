import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { ApiClientError } from "../errors.js";
import { calcSaltAdditions, estimateMashPh } from "./waterCalc.js";

describe("waterCalc facades", () => {
  it("calcSaltAdditions parses WithDerivation response and POSTs to /api/water-calc/salt-additions", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              result: { resultingProfile: { calcium: 50 } },
              derivation: { kind: "salt_additions", inputs: [], intermediates: [] },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await calcSaltAdditions(client, { volumeLiters: 20, additions: [] });
    expect(res.ok).toBe(true);
    expect(res.derivation["kind"]).toBe("salt_additions");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/water-calc/salt-additions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("estimateMashPh parses ResultOnly response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              result: { ph: { kind: "estimated", value: 5.4 } },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await estimateMashPh(client, { mashWaterVolumeLiters: 20 });
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/water-calc/mash-ph-estimate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("calcSaltAdditions throws ApiClientError on 4xx", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ ok: false, error: "bad_request" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(calcSaltAdditions(client, {})).rejects.toBeInstanceOf(ApiClientError);
  });
});
