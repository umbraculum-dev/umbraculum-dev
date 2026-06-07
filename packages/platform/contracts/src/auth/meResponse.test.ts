/**
 * v2.0 (RFC-0003): test assertions migrated from hand-rolled error-message
 * regex (`/expected object/`, `/workspaces\[1\]/`) to ZodError-shaped
 * path/message assertions via `expectIssuePath`. Behavior assertions
 * (well-formed response shape, soft-default fallbacks, backward-compat
 * tunnels) are preserved 1:1 — this migration changes the validation
 * engine, not the contract.
 */
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { AuthMeResponseSchema, parseAuthMeResponse } from "./meResponse";

/**
 * Assert that calling `parseAuthMeResponse(value)` throws a ZodError whose
 * FIRST issue's path starts with `expectedPathPrefix`. Use this in place of
 * the v1.x `expect(() => fn()).toThrow(/regex/)` pattern for any test that
 * was asserting on a specific path-tagged error message.
 */
function expectFirstIssuePathStartsWith(
  value: unknown,
  expectedPathPrefix: ReadonlyArray<string | number>,
): void {
  let error: unknown;
  try {
    parseAuthMeResponse(value);
  } catch (e) {
    error = e;
  }
  if (!(error instanceof ZodError)) {
    throw new Error("expected ZodError, got: " + (error === undefined ? "no throw" : String(error)));
  }
  const path = error.issues[0]?.path ?? [];
  for (let i = 0; i < expectedPathPrefix.length; i++) {
    if (path[i] !== expectedPathPrefix[i]) {
      throw new Error(
        `expected error.issues[0].path[${i}] === ${JSON.stringify(expectedPathPrefix[i])}, got path=${JSON.stringify(path)}`,
      );
    }
  }
}

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
    expect(parsed.workspaces[0]!.id).toBe("ws-1");
    expect(parsed.workspaces[0]!.name).toBe("Acme Brewery");
    expect(parsed.workspaces[0]!.role).toBe("brewery_admin");
    expect(parsed.workspaces[0]!.brandKey).toBe("acme");
    expect(parsed.activeWorkspaceId).toBe("ws-1");
    expect(parsed.role).toBe("brewery_admin");
  });

  it("rejects when payload is not an object", () => {
    expect(() => parseAuthMeResponse(null)).toThrow(ZodError);
    expect(() => parseAuthMeResponse("nope")).toThrow(ZodError);
    expect(() => parseAuthMeResponse([])).toThrow(ZodError);
  });

  it("rejects when ok is not true", () => {
    const r = validResponse();
    (r as { ok: unknown }).ok = false;
    expectFirstIssuePathStartsWith(r, ["ok"]);
  });

  it("rejects when user.id is missing", () => {
    const r = validResponse();
    (r.user as { id: unknown }).id = "";
    expectFirstIssuePathStartsWith(r, ["user", "id"]);
  });

  it("rejects when user.email is missing", () => {
    const r = validResponse();
    (r.user as { email: unknown }).email = "";
    expectFirstIssuePathStartsWith(r, ["user", "email"]);
  });

  it("rejects when workspaces is not an array", () => {
    const r = validResponse();
    (r as { workspaces: unknown }).workspaces = "not-an-array";
    expectFirstIssuePathStartsWith(r, ["workspaces"]);
  });

  it("includes the offending workspace index in the error path", () => {
    const r = validResponse();
    const bad = validWorkspace();
    (bad as { name: unknown }).name = "";
    (r as { workspaces: unknown[] }).workspaces = [validWorkspace(), bad];
    expectFirstIssuePathStartsWith(r, ["workspaces", 1, "name"]);
  });

  // Backward-compat tunnel for the staged `account → workspace` rename
  // (commit `87876d0`). The schema's top-level preprocess maps `accounts`
  // to `workspaces` and `activeAccountId` to `activeWorkspaceId` before
  // validation. This is the same dual-key handling that made the Phase
  // 4b stale-rename bug invisible at the parser level — pinning it
  // down here so a future "remove legacy account fallback" PR sees an
  // explicit test impact.
  it("accepts the legacy `accounts` key (staged rename backward-compat)", () => {
    const r = validResponse() as { workspaces?: unknown; accounts?: unknown };
    r.accounts = r.workspaces;
    delete r.workspaces;
    const parsed = parseAuthMeResponse(r);
    expect(parsed.workspaces).toHaveLength(1);
    expect(parsed.workspaces[0]!.id).toBe("ws-1");
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
    expect(parseAuthMeResponse(r).workspaces[0]!.brandKey).toBeNull();

    const r2 = validResponse();
    (r2.workspaces[0] as { brandKey: unknown }).brandKey = 42;
    expect(parseAuthMeResponse(r2).workspaces[0]!.brandKey).toBeUndefined();
  });
});

// Schema export is intentional — call sites in `apps/web` and
// `apps/native` may import `AuthMeResponseSchema` for inline validation
// (e.g. in tanstack-query callbacks). Smoke check that the export is
// the schema, not the parser function.
describe("AuthMeResponseSchema (exported schema)", () => {
  it("is a Zod schema with a parse method", () => {
    expect(typeof AuthMeResponseSchema.parse).toBe("function");
    expect(typeof AuthMeResponseSchema.safeParse).toBe("function");
  });

  it("safeParse returns success: true for valid input", () => {
    const result = AuthMeResponseSchema.safeParse(validResponse());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.user.id).toBe("user-1");
    }
  });

  it("safeParse returns success: false with issues for invalid input", () => {
    // Note: prior revision annotated `result` with `z.SafeParseReturnType<unknown, unknown>`
    // (a Zod v3 type). Zod v4 renamed that type to `z.ZodSafeParseResult<T>`
    // with a single type parameter. The annotation was redundant (TS infers
    // it from `safeParse`'s return type) — removed during CI hygiene sweep
    // (sub-plan #9 mid-execution, 2026-05-19) so we don't have to track the
    // Zod-v4-vs-v3 type-name drift just to spell out what TS already knows.
    const result = AuthMeResponseSchema.safeParse({
      ok: true,
      user: { id: "", email: "" },
      workspaces: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0]!.path).toEqual(["user", "id"]);
    }
  });
});
