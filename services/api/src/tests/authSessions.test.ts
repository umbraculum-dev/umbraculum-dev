import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

function extractSidCookie(setCookieHeader: string | string[] | undefined) {
  const raw = Array.isArray(setCookieHeader) ? setCookieHeader : setCookieHeader ? [setCookieHeader] : [];
  const sid = raw.find((h) => h.startsWith("sid="));
  if (!sid) return null;
  return sid.split(";")[0] ?? null;
}

describe("auth (signup/login) + cookie sessions", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("signup creates session cookie and /auth/me works", async () => {
    const email = `user_${Date.now()}@example.com`;
    const signup = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: { email, password: "password123", preferredLocale: "it", workspaceName: "Test Workspace" },
    });
    expect(signup.statusCode).toBe(200);

    const sidCookie = extractSidCookie(signup.headers["set-cookie"]);
    expect(sidCookie).toBeTruthy();

    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: sidCookie as string },
    });
    expect(me.statusCode).toBe(200);
    const body = me.json() as any;
    expect(body.ok).toBe(true);
    expect(body.user.email).toBe(email.toLowerCase());
    expect(body.user.preferredLocale).toBe("it");
    expect(Array.isArray(body.workspaces)).toBe(true);
    expect(typeof body.activeWorkspaceId === "string").toBe(true);
  });

  it("login returns activeWorkspaceId null when user has multiple workspaces; /auth/active-workspace sets it", async () => {
    const email = `multi_${Date.now()}@example.com`;
    const password = "password123";

    // signup (1 workspace + session)
    const signup = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: { email, password, preferredLocale: "en", workspaceName: "First" },
    });
    expect(signup.statusCode).toBe(200);
    const sidCookie1 = extractSidCookie(signup.headers["set-cookie"]);
    expect(sidCookie1).toBeTruthy();

    // create second workspace while logged in
    const created = await app.inject({
      method: "POST",
      url: "/workspaces",
      headers: { cookie: sidCookie1 as string },
      payload: { name: "Second" },
    });
    expect(created.statusCode).toBe(200);

    // logout (delete session)
    const logout = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { cookie: sidCookie1 as string },
    });
    expect(logout.statusCode).toBe(200);

    // login again -> 2 workspaces => activeWorkspaceId null
    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email, password, preferredLocale: "it" },
    });
    expect(login.statusCode).toBe(200);
    const sidCookie2 = extractSidCookie(login.headers["set-cookie"]);
    expect(sidCookie2).toBeTruthy();

    const loginBody = login.json() as any;
    expect(loginBody.ok).toBe(true);
    expect(Array.isArray(loginBody.workspaces)).toBe(true);
    expect(loginBody.workspaces.length).toBe(2);
    expect(loginBody.activeWorkspaceId).toBe(null);

    // with no active workspace, workspace-scoped endpoints should fail
    const recipesNoAcct = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: sidCookie2 as string },
    });
    expect(recipesNoAcct.statusCode).toBe(401);
    expect(recipesNoAcct.json()).toEqual({
      ok: false,
      error: { code: "missing_active_workspace", message: "No active workspace selected" },
    });

    // choose active workspace
    const secondWorkspaceId = loginBody.workspaces[1].id as string;
    const pick = await app.inject({
      method: "POST",
      url: "/auth/active-workspace",
      headers: { cookie: sidCookie2 as string },
      payload: { workspaceId: secondWorkspaceId },
    });
    expect(pick.statusCode).toBe(200);

    // now workspace-scoped endpoints work
    const recipesOk = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: sidCookie2 as string },
    });
    expect(recipesOk.statusCode).toBe(200);
    expect((recipesOk.json() as any).ok).toBe(true);
  });

  it("login/native returns token (no cookie); Bearer token works for /auth/me and logout", async () => {
    const email = `native_${Date.now()}@example.com`;
    const password = "password123";

    const signup = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: { email, password, preferredLocale: "en", workspaceName: "Native Test" },
    });
    expect(signup.statusCode).toBe(200);

    const loginNative = await app.inject({
      method: "POST",
      url: "/auth/login/native",
      payload: { email, password, preferredLocale: "en" },
    });
    expect(loginNative.statusCode).toBe(200);
    expect(loginNative.headers["set-cookie"]).toBeUndefined();

    const body = loginNative.json() as any;
    expect(body.ok).toBe(true);
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
    expect(body.user.email).toBe(email.toLowerCase());

    const token = body.token as string;

    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(me.statusCode).toBe(200);
    expect((me.json() as any).user.email).toBe(email.toLowerCase());

    const logout = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(logout.statusCode).toBe(200);

    const meAfter = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(meAfter.statusCode).toBe(401);
  });
});

