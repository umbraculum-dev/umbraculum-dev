import { describe, expect, it } from "vitest";
import { parseAuthMeResponse } from "./meResponse";

function validUser() {
  return {
    id: "user-1",
    email: "alice@brewery.local",
    preferredLocale: "en",
    preferredTheme: null,
    preferredFontScale: "1.0",
    preferredDensity: "compact",
    isPlatformAdmin: false,
  };
}

function validWorkspace() {
  return {
    id: "ws-1",
    name: "Acme Brewery",
    role: "brewery_admin",
    brandKey: "acme",
  };
}

function validResponse() {
  return {
    ok: true,
    user: validUser(),
    workspaces: [validWorkspace()],
    activeWorkspaceId: "ws-1",
    role: "brewery_admin",
  };
}

describe("parseAuthMeResponse", () => {
  it("accepts a well-formed response", () => {
    const parsed = parseAuthMeResponse(validResponse());
    expect(parsed.ok).toBe(true);
    expect(parsed.user.id).toBe("user-1");
    expect(parsed.user.email).toBe("alice@brewery.local");
    expect(parsed.user.preferredLocale).toBe("en");
    expect(parsed.user.preferredTheme).toBeNull();
    expect(parsed.user.preferredFontScale).toBe("1.0");
    expect(parsed.user.preferredDensity).toBe("compact");
    expect(parsed.user.isPlatformAdmin).toBe(false);
    expect(parsed.workspaces).toHaveLength(1);
    expect(parsed.workspaces[0].id).toBe("ws-1");
    expect(parsed.workspaces[0].name).toBe("Acme Brewery");
    expect(parsed.workspaces[0].role).toBe("brewery_admin");
    expect(parsed.workspaces[0].brandKey).toBe("acme");
    expect(parsed.activeWorkspaceId).toBe("ws-1");
    expect(parsed.role).toBe("brewery_admin");
  });

  it("rejects when payload is not an object", () => {
    expect(() => parseAuthMeResponse(null)).toThrow(/expected object/);
    expect(() => parseAuthMeResponse("nope")).toThrow(/expected object/);
    expect(() => parseAuthMeResponse([])).toThrow(/expected object/);
  });

  it("rejects when ok is not true", () => {
    const r = validResponse();
    (r as { ok: unknown }).ok = false;
    expect(() => parseAuthMeResponse(r)).toThrow(/ok/);
  });

  it("rejects when user.id is missing", () => {
    const r = validResponse();
    (r.user as { id: unknown }).id = "";
    expect(() => parseAuthMeResponse(r)).toThrow(/user/);
  });

  it("rejects when user.email is missing", () => {
    const r = validResponse();
    (r.user as { email: unknown }).email = "";
    expect(() => parseAuthMeResponse(r)).toThrow(/user/);
  });

  it("rejects when workspaces is not an array", () => {
    const r = validResponse();
    (r as { workspaces: unknown }).workspaces = "not-an-array";
    expect(() => parseAuthMeResponse(r)).toThrow(/workspaces/);
  });

  it("includes the offending workspace index in the error message", () => {
    const r = validResponse();
    const bad = validWorkspace();
    (bad as { name: unknown }).name = "";
    (r as { workspaces: unknown[] }).workspaces = [validWorkspace(), bad];
    expect(() => parseAuthMeResponse(r)).toThrow(/workspaces\[1\]/);
  });

  // Backward-compat tunnel for the staged `account → workspace` rename
  // (commit `87876d0`). The parser accepts both keys on the wire and
  // always normalises to `workspaces` / `activeWorkspaceId` in output.
  // This is the same dual-key handling that made the Phase 4b stale-rename
  // bug invisible at the parser level — pinning it down here so a future
  // "remove legacy account fallback" PR sees an explicit test impact.
  it("accepts the legacy `accounts` key (staged rename backward-compat)", () => {
    const r = validResponse() as { workspaces?: unknown; accounts?: unknown };
    r.accounts = r.workspaces;
    delete r.workspaces;
    const parsed = parseAuthMeResponse(r);
    expect(parsed.workspaces).toHaveLength(1);
    expect(parsed.workspaces[0].id).toBe("ws-1");
  });

  it("accepts the legacy `activeAccountId` key (staged rename backward-compat)", () => {
    const r = validResponse() as {
      activeWorkspaceId?: unknown;
      activeAccountId?: unknown;
    };
    r.activeAccountId = "ws-2";
    delete r.activeWorkspaceId;
    const parsed = parseAuthMeResponse(r);
    expect(parsed.activeWorkspaceId).toBe("ws-2");
  });

  it("normalises activeWorkspaceId to null when missing or non-string", () => {
    const r = validResponse() as { activeWorkspaceId?: unknown };
    delete r.activeWorkspaceId;
    expect(parseAuthMeResponse(r).activeWorkspaceId).toBeNull();

    const r2 = validResponse();
    (r2 as { activeWorkspaceId: unknown }).activeWorkspaceId = 42;
    expect(parseAuthMeResponse(r2).activeWorkspaceId).toBeNull();
  });

  it("normalises role to null when missing or non-string", () => {
    const r = validResponse();
    (r as { role: unknown }).role = null;
    expect(parseAuthMeResponse(r).role).toBeNull();

    const r2 = validResponse() as { role?: unknown };
    delete r2.role;
    expect(parseAuthMeResponse(r2).role).toBeNull();
  });

  it("preserves null vs undefined distinction for nullable preference fields", () => {
    const r = validResponse();
    (r.user as { preferredTheme: unknown }).preferredTheme = null;
    (r.user as { preferredFontScale: unknown }).preferredFontScale = undefined;
    const parsed = parseAuthMeResponse(r);
    expect(parsed.user.preferredTheme).toBeNull();
    expect(parsed.user.preferredFontScale).toBeUndefined();
  });

  it("defaults preferredLocale to 'en' when missing", () => {
    const r = validResponse();
    (r.user as { preferredLocale: unknown }).preferredLocale = undefined;
    expect(parseAuthMeResponse(r).user.preferredLocale).toBe("en");
  });

  it("preserves brandKey null vs undefined on workspace items", () => {
    const r = validResponse();
    (r.workspaces[0] as { brandKey: unknown }).brandKey = null;
    expect(parseAuthMeResponse(r).workspaces[0].brandKey).toBeNull();

    const r2 = validResponse();
    (r2.workspaces[0] as { brandKey: unknown }).brandKey = 42;
    expect(parseAuthMeResponse(r2).workspaces[0].brandKey).toBeUndefined();
  });
});
