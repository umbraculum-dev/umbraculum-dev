import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import {
  createAccountForUser,
  createSession,
  createUserWithPassword,
  sidCookieHeader,
} from "./authTestUtils.js";

describe("sessions + workspaces", () => {
  const app = buildApp();
  let sid: string;
  let workspaceId: string;

  beforeAll(async () => {
    await app.ready();
    const user = await createUserWithPassword(app, "acct-tests@brewery.local", "password123");
    const acct = await createAccountForUser(app, user.id, "Dev Brewery");
    workspaceId = acct.id;
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

  it("lists workspaces for authenticated user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/workspaces",
      headers: sidCookieHeader(sid),
    });
    expect(res.statusCode).toBe(200);

    const body = res.json() as any;
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.workspaces)).toBe(true);
    expect(body.workspaces.some((w: any) => w.id === workspaceId)).toBe(true);
  });
});

