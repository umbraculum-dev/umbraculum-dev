import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { getAdSlot } from "./ads.js";

describe("platform ads facades", () => {
  it("getAdSlot fetches slot with platform query", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              placement: "global_top",
              platform: "web",
              disabled: false,
              ad: null,
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await getAdSlot(client, "global_top", { platform: "web" });
    expect(res["disabled"]).toBe(false);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/ads/slot/global_top?platform=web",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
