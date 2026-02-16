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
      payload: { email, password: "password123", preferredLocale: "it", accountName: "Test Brewery" },
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
    expect(Array.isArray(body.accounts)).toBe(true);
    expect(typeof body.activeAccountId === "string").toBe(true);
  });

  it("login returns activeAccountId null when user has multiple accounts; /auth/active-account sets it", async () => {
    const email = `multi_${Date.now()}@example.com`;
    const password = "password123";

    // signup (1 account + session)
    const signup = await app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: { email, password, preferredLocale: "en", accountName: "First" },
    });
    expect(signup.statusCode).toBe(200);
    const sidCookie1 = extractSidCookie(signup.headers["set-cookie"]);
    expect(sidCookie1).toBeTruthy();

    // create second account while logged in
    const created = await app.inject({
      method: "POST",
      url: "/accounts",
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

    // login again -> 2 accounts => activeAccountId null
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
    expect(Array.isArray(loginBody.accounts)).toBe(true);
    expect(loginBody.accounts.length).toBe(2);
    expect(loginBody.activeAccountId).toBe(null);

    // with no active account, account-scoped endpoints should fail
    const recipesNoAcct = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: sidCookie2 as string },
    });
    expect(recipesNoAcct.statusCode).toBe(401);
    expect(recipesNoAcct.json()).toEqual({
      ok: false,
      error: { code: "missing_active_account", message: "No active account selected" },
    });

    // choose active account
    const secondAccountId = loginBody.accounts[1].id as string;
    const pick = await app.inject({
      method: "POST",
      url: "/auth/active-account",
      headers: { cookie: sidCookie2 as string },
      payload: { accountId: secondAccountId },
    });
    expect(pick.statusCode).toBe(200);

    // now account-scoped endpoints work
    const recipesOk = await app.inject({
      method: "GET",
      url: "/recipes",
      headers: { cookie: sidCookie2 as string },
    });
    expect(recipesOk.statusCode).toBe(200);
    expect((recipesOk.json() as any).ok).toBe(true);
  });
});

