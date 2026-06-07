import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import {
  exchangeWebviewToken,
  getAuthMe,
  loginNative,
  logout,
  patchAuthPreferences,
  setActiveWorkspace,
  signup,
} from "../platform/auth.js";
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

  it("logout posts and parses ok", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await expect(logout(client)).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("setActiveWorkspace posts workspaceId", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, activeWorkspaceId: "w2" })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await setActiveWorkspace(client, { workspaceId: "w2" });
    expect(res["activeWorkspaceId"]).toBe("w2");
  });

  it("signup posts credentials and parses response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              user: { id: "u1", email: "a@b.c", preferredLocale: "en" },
              activeWorkspaceId: "w1",
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => null), { fetch });
    const res = await signup(client, { email: "a@b.c", password: "secret123" });
    expect(res["activeWorkspaceId"]).toBe("w1");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/auth/signup",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("exchangeWebviewToken posts next path and parses bridgeUrl", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              code: "wv-code",
              expiresAt: "2026-06-02T12:00:00.000Z",
              bridgeUrl: "/en/auth/webview-bridge?token=abc",
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await exchangeWebviewToken(client, { next: "/en/recipes" });
    expect(res["bridgeUrl"]).toBe("/en/auth/webview-bridge?token=abc");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/auth/webview-exchange",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("patchAuthPreferences patches UI preferences", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              preferences: {
                preferredTheme: "hc_dark",
                preferredFontScale: "md",
                preferredDensity: "comfortable",
              },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await patchAuthPreferences(client, { preferredTheme: "hc_dark" });
    expect(res["preferences"]["preferredTheme"]).toBe("hc_dark");
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/auth/preferences",
      expect.objectContaining({ method: "PATCH" }),
    );
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
