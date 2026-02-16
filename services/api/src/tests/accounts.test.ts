import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import {
  createAccountForUser,
  createSession,
  createUserWithPassword,
  sidCookieHeader,
} from "./authTestUtils.js";

describe("sessions + accounts", () => {
  const app = buildApp();
  let sid: string;
  let accountId: string;

  beforeAll(async () => {
    await app.ready();
    const user = await createUserWithPassword(app, "acct-tests@brewery.local", "password123");
    const acct = await createAccountForUser(app, user.id, "Dev Brewery");
    accountId = acct.id;
    sid = await createSession(app, user.id, acct.id);
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects /auth/me when session is missing", async () => {
    const res = await app.inject({ method: "GET", url: "/me" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      ok: false,
      error: { code: "missing_session", message: "Not authenticated" },
    });
  });

  it("lists accounts for authenticated user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/accounts",
      headers: sidCookieHeader(sid),
    });
    expect(res.statusCode).toBe(200);

    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.accounts)).toBe(true);
    expect(body.accounts.some((a: any) => a.id === accountId)).toBe(true);
  });
});

