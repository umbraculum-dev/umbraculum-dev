import { describe, expect, it } from "vitest";
import { parseWaterProfileItem, parseWaterProfilesResponse } from "./waterProfile";

function validProfile() {
  return {
    id: "p-1",
    key: "dusseldorf",
    scope: "system",
    type: "water",
    workspaceId: null,
    name: "Düsseldorf",
    ph: 7.2,
    calcium: 90,
    magnesium: 15,
    sodium: 50,
    sulfate: 60,
    chloride: 75,
    bicarbonate: 180,
    verificationStatus: "verified",
    source: "famous-brewing-waters",
  };
}

function validProfilesResponse() {
  return {
    ok: true,
    system: [validProfile()],
    public: [],
    workspace: [],
  };
}

describe("parseWaterProfileItem", () => {
  it("accepts a well-formed profile", () => {
    const p = parseWaterProfileItem(validProfile());
    expect(p.id).toBe("p-1");
    expect(p.key).toBe("dusseldorf");
    expect(p.scope).toBe("system");
    expect(p.type).toBe("water");
    expect(p.workspaceId).toBeNull();
    expect(p.name).toBe("Düsseldorf");
    expect(p.ph).toBe(7.2);
    expect(p.calcium).toBe(90);
    expect(p.bicarbonate).toBe(180);
    expect(p.verificationStatus).toBe("verified");
    expect(p.source).toBe("famous-brewing-waters");
  });

  it("rejects when payload is not an object", () => {
    expect(() => parseWaterProfileItem(null)).toThrow(/expected object/);
    expect(() => parseWaterProfileItem("nope")).toThrow(/expected object/);
    expect(() => parseWaterProfileItem([])).toThrow(/expected object/);
  });

  it("rejects when id, key, or name is missing", () => {
    const noId = validProfile();
    (noId as { id: unknown }).id = "";
    expect(() => parseWaterProfileItem(noId)).toThrow(/id, key, name/);

    const noKey = validProfile();
    (noKey as { key: unknown }).key = "";
    expect(() => parseWaterProfileItem(noKey)).toThrow(/id, key, name/);

    const noName = validProfile();
    (noName as { name: unknown }).name = "";
    expect(() => parseWaterProfileItem(noName)).toThrow(/id, key, name/);
  });

  it("defaults scope to 'system' when invalid", () => {
    const p = validProfile();
    (p as { scope: unknown }).scope = "not-a-scope";
    expect(parseWaterProfileItem(p).scope).toBe("system");
  });

  it("defaults type to 'water' when invalid", () => {
    const p = validProfile();
    (p as { type: unknown }).type = "smoothie";
    expect(parseWaterProfileItem(p).type).toBe("water");
  });

  it("defaults verificationStatus to 'unverified' when invalid", () => {
    const p = validProfile();
    (p as { verificationStatus: unknown }).verificationStatus = "questionable";
    expect(parseWaterProfileItem(p).verificationStatus).toBe("unverified");
  });

  it("defaults missing ion values to 0", () => {
    const p = validProfile();
    (p as { calcium: unknown }).calcium = "not-a-number";
    (p as { bicarbonate: unknown }).bicarbonate = undefined;
    const parsed = parseWaterProfileItem(p);
    expect(parsed.calcium).toBe(0);
    expect(parsed.bicarbonate).toBe(0);
  });

  it("treats null/undefined ph as undefined", () => {
    const noPh = validProfile();
    (noPh as { ph: unknown }).ph = null;
    expect(parseWaterProfileItem(noPh).ph).toBeUndefined();

    const undefPh = validProfile();
    (undefPh as { ph: unknown }).ph = undefined;
    expect(parseWaterProfileItem(undefPh).ph).toBeUndefined();

    const badPh = validProfile();
    (badPh as { ph: unknown }).ph = "high";
    expect(parseWaterProfileItem(badPh).ph).toBeUndefined();
  });

  // Backward-compat tunnel for the staged `account → workspace` rename
  // (commit `87876d0`). Documented in the parser source at line 66-70.
  // This dual-key handling is what allowed the rename PR to "work on
  // the wire" while breaking four UI consumers in apps/web (Phase 4b).
  // Pinning the behavior down here so a future "remove legacy accountId
  // fallback" PR sees an explicit test impact.
  it("accepts the legacy `accountId` key (staged rename backward-compat)", () => {
    const p = validProfile() as { workspaceId?: unknown; accountId?: unknown };
    delete p.workspaceId;
    p.accountId = "ws-legacy-1";
    expect(parseWaterProfileItem(p).workspaceId).toBe("ws-legacy-1");
  });

  it("normalises workspaceId to null when missing or non-string", () => {
    const p = validProfile() as { workspaceId?: unknown };
    delete p.workspaceId;
    expect(parseWaterProfileItem(p).workspaceId).toBeNull();

    const p2 = validProfile();
    (p2 as { workspaceId: unknown }).workspaceId = 42;
    expect(parseWaterProfileItem(p2).workspaceId).toBeNull();
  });
});

describe("parseWaterProfilesResponse", () => {
  it("accepts a well-formed response", () => {
    const parsed = parseWaterProfilesResponse(validProfilesResponse());
    expect(parsed.ok).toBe(true);
    expect(parsed.system).toHaveLength(1);
    expect(parsed.system[0]!.key).toBe("dusseldorf");
    expect(parsed.public).toHaveLength(0);
    expect(parsed.workspace).toHaveLength(0);
  });

  it("rejects when payload is not an object", () => {
    expect(() => parseWaterProfilesResponse(null)).toThrow(/expected object/);
    expect(() => parseWaterProfilesResponse([])).toThrow(/expected object/);
  });

  it("rejects when ok is not true", () => {
    const r = validProfilesResponse();
    (r as { ok: unknown }).ok = false;
    expect(() => parseWaterProfilesResponse(r)).toThrow(/ok/);
  });

  it("rejects when system is not an array", () => {
    const r = validProfilesResponse();
    (r as { system: unknown }).system = "not-an-array";
    expect(() => parseWaterProfilesResponse(r)).toThrow(/Expected array/);
  });

  it("rejects when public is not an array", () => {
    const r = validProfilesResponse();
    (r as { public: unknown }).public = "not-an-array";
    expect(() => parseWaterProfilesResponse(r)).toThrow(/Expected array/);
  });

  it("rejects when both workspace AND account arrays are missing", () => {
    const r = validProfilesResponse() as {
      workspace?: unknown;
      account?: unknown;
    };
    delete r.workspace;
    expect(() => parseWaterProfilesResponse(r)).toThrow(/workspace must be array/);
  });

  // Phase 4b regression-pin (the keystone test of this file).
  //
  // Commit `87876d0` ("replacing 'account' with 'workspace'") renamed the
  // `WaterProfilesResponse.account` field to `.workspace`, with
  // `parseWaterProfilesResponse()` accepting both keys on the wire for
  // staged migration but always normalising to `.workspace` in output.
  //
  // Four UI consumers in apps/web (`apps/web/app/recipes/[id]/water/
  // {mash,sparge,boil}/page.tsx` + `apps/web/app/[locale]/water-profiles/
  // page.tsx`) kept reading `profiles?.account`, which evaluated to
  // `undefined` after the rename, silently breaking workspace water
  // profiles in dropdowns until HIGH-full Phase 4b (commit `4d9ec1e`,
  // 2026-05-16) flagged it via `no-unsafe-*` rule promotion and the
  // post-mortem traced the root cause.
  //
  // This test pins the dual-key parser behavior so that:
  //   (a) a future "remove legacy account fallback" PR cannot
  //       silently drop it without an explicit test failure here, and
  //   (b) the contract surface stays stable for any old wire payloads
  //       still in flight (e.g. cached responses, mock servers, third-
  //       party consumers that haven't migrated).
  //
  // The complementary regression test for the UI-consumer side lives in
  // `apps/web/e2e/smoke/water-calc.spec.ts` (workspace profiles appear
  // in the mash water-profile dropdown), which would catch a future
  // similar rename-consumer-drift in production-rendering terms.
  it("accepts the legacy `account` key (staged rename backward-compat)", () => {
    const r = validProfilesResponse() as {
      workspace?: unknown;
      account?: unknown;
      system?: unknown;
      public?: unknown;
      ok?: unknown;
    };
    const ws = validProfile();
    (ws as { id: unknown }).id = "p-ws-1";
    (ws as { key: unknown }).key = "ws-profile-1";
    (ws as { scope: unknown }).scope = "account";
    delete r.workspace;
    r.account = [ws];
    const parsed = parseWaterProfilesResponse(r);
    expect(parsed.workspace).toHaveLength(1);
    expect(parsed.workspace[0]!.id).toBe("p-ws-1");
    expect(parsed.workspace[0]!.key).toBe("ws-profile-1");
  });

  it("includes the offending array index in the error message", () => {
    const r = validProfilesResponse();
    const bad = validProfile();
    (bad as { id: unknown }).id = "";
    (r as { system: unknown[] }).system = [validProfile(), bad];
    expect(() => parseWaterProfilesResponse(r)).toThrow(/array item\[1\]/);
  });
});
