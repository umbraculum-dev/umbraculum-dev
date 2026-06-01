import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { getAuthMe, loginNative } from "../platform/auth.js";
import { getHealth, listWorkspaces } from "../platform/workspaces.js";

describe("platform auth facades", () => {
  it("getAuthMe parses AuthMeResponse", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              user: { id: "u1", email: "a@b.c", preferredLocale: "en" },
              workspaces: [{ id: "w1", name: "W", role: "owner" }],
              activeWorkspaceId: "w1",
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const me = await getAuthMe(client);
    expect(me.user.id).toBe("u1");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/auth/me",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("loginNative parses token response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              token: "native-tok",
              user: { id: "u1", email: "a@b.c", preferredLocale: "en" },
              workspaces: [],
              activeWorkspaceId: null,
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => null), { fetch });
    const res = await loginNative(client, { email: "a@b.c", password: "secret12" });
    expect(res.token).toBe("native-tok");
  });
});

describe("platform workspaces + health facades", () => {
  it("listWorkspaces uses contracts parser", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              workspaces: [{ id: "w1", name: "W", role: "owner" }],
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listWorkspaces(client);
    expect(res.workspaces).toHaveLength(1);
  });

  it("getHealth returns ok", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(getHealth(client)).resolves.toEqual({ ok: true });
  });
});
