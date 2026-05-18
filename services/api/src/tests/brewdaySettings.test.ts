/**
 * brewdaySettings.test.ts — Phase 4b-3 L2 coverage for
 * `services/api/src/routes/brewdaySettings.ts`.
 *
 * Why this file exists
 * --------------------
 * Per the Phase 4a route surface audit (docs/TESTING.md → "Phase 4a route
 * surface audit"), `brewdaySettings.ts` was one of three workspace-scoped
 * route files with ZERO L2 test coverage. It's a small surface (2 routes
 * — GET + PATCH on `BrewdaySettings`) but it's a workspace-scoped writable
 * surface, and the audit's Phase 4b-3 sub-phase scopes it as the cheapest
 * remaining fill-in test work.
 *
 * Coverage axes pinned here (per the audit's per-route matrix):
 *
 *   - Happy path (200) — both routes: GET returns `settings: null` for a
 *     fresh workspace (the route returns 200 with `settings: null` rather
 *     than 404 — pinned so a future regression that decides to 404 instead
 *     surfaces as a behavior change), GET-after-PATCH round-trips the
 *     payload through the upsert (sections / defaultSteps / customSteps /
 *     notes preserved).
 *   - Auth (401) — both flavors: `missing_session` (no cookie) and
 *     `missing_active_workspace` (cookie with no active workspace).
 *   - Cross-workspace isolation — implicit: GET from workspace B after
 *     PATCH from workspace A returns `settings: null` (not A's payload),
 *     because `BrewdaySettingsService.findUnique({ workspaceId })` scopes
 *     to the caller's active workspace. Pinned explicitly so a future
 *     regression that drops the workspace filter surfaces here.
 *
 * Phase 4d (deferred) applies: role-based ACL is unwired in v0, so a
 * viewer/member 403 assertion would not currently fail — deliberately
 * omitted until `AclService.requireRole` gets wired into routes.
 *
 * Validation 400s are intentionally not pinned for this surface — the
 * route handler's `parseSections` + array-fallback logic intentionally
 * coerces malformed input to sensible defaults rather than throwing, so
 * the equivalent "400 on bad input" test would not exist. The shape
 * coercion behavior IS covered indirectly by the round-trip happy-path
 * test below (passing well-formed input and observing what comes back).
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("brewday settings routes (Phase 4b-3)", () => {
  const app = buildApp();
  let cookieA = "";
  let cookieB = "";
  let cookieNoWorkspace = "";
  let workspaceIdA = "";
  let workspaceIdB = "";

  beforeAll(async () => {
    await app.ready();

    const sessA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessA.cookie;
    workspaceIdA = sessA.workspaceId;

    const sessB = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieB = sessB.cookie;
    workspaceIdB = sessB.workspaceId;

    const sessNo = await createSessionForTestUser(app, { activeWorkspace: false });
    cookieNoWorkspace = sessNo.cookie;
  });

  afterAll(async () => {
    if (workspaceIdA) {
      await app.prisma.brewdaySettings.deleteMany({ where: { workspaceId: workspaceIdA } });
    }
    if (workspaceIdB) {
      await app.prisma.brewdaySettings.deleteMany({ where: { workspaceId: workspaceIdB } });
    }
    await app.close();
  });

  describe("GET /brewday-settings (happy path)", () => {
    it("returns { ok: true, settings: null } for a fresh workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/brewday-settings",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { ok: boolean; settings: unknown };
      expect(body.ok).toBe(true);
      // Pinned: NOT 404. `BrewdaySettingsService.getSettings` returns
      // `null` when no row exists for the workspace, and the route
      // surface forwards that as { settings: null }. The UI relies on
      // this to render its "use defaults" empty state without an extra
      // round-trip.
      expect(body.settings).toBeNull();
    });
  });

  describe("PATCH /brewday-settings (happy path + GET round-trip)", () => {
    const payload = {
      brewingType: "all_grain",
      sections: {
        presetExcludes: { mash: false, sparge: true },
        customSections: [],
        customBrewingMethods: ["overnight_mash"],
      },
      defaultSteps: [
        { id: "step-1", name: "Mash in", sectionId: "mash", exclude: false, minutes: 60 },
        { id: "step-2", name: "Sparge", sectionId: "sparge", exclude: true, minutes: null },
      ],
      customSteps: [
        { id: "custom-1", name: "My custom step", sectionId: "mash", exclude: false, minutes: null },
      ],
      notes: "Phase 4b-3 round-trip note.",
    };

    it("upserts settings and returns the saved payload", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/brewday-settings",
        headers: { cookie: cookieA },
        payload,
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as {
        ok: boolean;
        settings: {
          brewingType: string;
          sections: { presetExcludes: Record<string, boolean>; customBrewingMethods: string[] };
          defaultSteps: Array<{
            id: string;
            name: string;
            sectionId: string;
            exclude: boolean;
            minutes: number | null;
          }>;
          customSteps: Array<{
            id: string;
            name: string;
            sectionId: string;
            exclude: boolean;
            minutes: number | null;
          }>;
          notes: string | null;
        };
      };
      expect(body.ok).toBe(true);
      expect(body.settings.brewingType).toBe("all_grain");
      // `parseSectionsJson` (in `services/api/src/services/brewdaySettingsService.ts`)
      // back-fills `presetExcludes` with `false` for every known section
      // key, so the response is a superset of what we sent. Use
      // `toMatchObject` to assert our pinned keys without locking down
      // the full default-key set (which is a service-internal detail
      // that may add new sections over time without breaking semantics).
      expect(body.settings.sections.presetExcludes).toMatchObject({ mash: false, sparge: true });
      expect(body.settings.sections.customBrewingMethods).toEqual(["overnight_mash"]);
      expect(body.settings.defaultSteps).toEqual(payload.defaultSteps);
      expect(body.settings.customSteps).toEqual(payload.customSteps);
      expect(body.settings.notes).toBe(payload.notes);
    });

    it("GET /brewday-settings returns the same payload after PATCH", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/brewday-settings",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as {
        settings: {
          brewingType: string;
          notes: string | null;
          customSteps: unknown[];
          defaultSteps: unknown[];
        };
      };
      // settings is no longer null after the upsert.
      expect(body.settings).not.toBeNull();
      expect(body.settings.brewingType).toBe("all_grain");
      expect(body.settings.notes).toBe(payload.notes);
      expect(body.settings.defaultSteps).toEqual(payload.defaultSteps);
      expect(body.settings.customSteps).toEqual(payload.customSteps);
    });

    it("PATCH a second time replaces the previous settings (upsert semantics)", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/brewday-settings",
        headers: { cookie: cookieA },
        payload: {
          brewingType: "biab",
          sections: { presetExcludes: {}, customSections: [], customBrewingMethods: [] },
          defaultSteps: [],
          customSteps: [],
          notes: null,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { settings: { brewingType: string; notes: string | null } };
      expect(body.settings.brewingType).toBe("biab");
      // Pinned: explicitly passing `notes: null` clears the previous
      // string. The route handler's `notes === null ? null : ...` branch
      // is the one that enables this.
      expect(body.settings.notes).toBeNull();
    });
  });

  describe("auth gates (401)", () => {
    it("GET /brewday-settings without any cookie returns 401 missing_session", async () => {
      const res = await app.inject({ method: "GET", url: "/brewday-settings" });
      expect(res.statusCode).toBe(401);
      expect((res.json() as { error: { code: string } }).error.code).toBe("missing_session");
    });

    it("GET /brewday-settings with no active workspace returns 401 missing_active_workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/brewday-settings",
        headers: { cookie: cookieNoWorkspace },
      });
      expect(res.statusCode).toBe(401);
      expect((res.json() as { error: { code: string } }).error.code).toBe("missing_active_workspace");
    });

    it("PATCH /brewday-settings without any cookie returns 401 (write side)", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/brewday-settings",
        payload: {
          brewingType: "all_grain",
          sections: { presetExcludes: {}, customSections: [], customBrewingMethods: [] },
          defaultSteps: [],
          customSteps: [],
        },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("cross-workspace isolation", () => {
    it("GET from workspace B does not return workspace A's settings", async () => {
      // Workspace A's settings have been populated by the PATCH happy-
      // path above. Workspace B has never PATCHed, so its row does not
      // exist. The route handler's `findUnique({ where: { workspaceId } })`
      // scopes the lookup to the caller's active workspace, so B sees
      // its own (missing) row → `settings: null`, not A's "biab" payload.
      // If a future regression drops the workspace filter, B would see
      // A's settings and this assertion would fail.
      const res = await app.inject({
        method: "GET",
        url: "/brewday-settings",
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { settings: unknown };
      expect(body.settings).toBeNull();
    });

    it("PATCH from workspace B does not overwrite workspace A's settings", async () => {
      const patchB = await app.inject({
        method: "PATCH",
        url: "/brewday-settings",
        headers: { cookie: cookieB },
        payload: {
          brewingType: "extract",
          sections: { presetExcludes: {}, customSections: [], customBrewingMethods: [] },
          defaultSteps: [],
          customSteps: [],
          notes: "B's note — must not leak into A",
        },
      });
      expect(patchB.statusCode).toBe(200);
      expect((patchB.json() as { settings: { brewingType: string } }).settings.brewingType).toBe("extract");

      // Verify A's row is still the "biab" payload from the upsert test
      // above, not B's "extract" payload.
      const getA = await app.inject({
        method: "GET",
        url: "/brewday-settings",
        headers: { cookie: cookieA },
      });
      expect(getA.statusCode).toBe(200);
      const bodyA = getA.json() as { settings: { brewingType: string; notes: string | null } };
      expect(bodyA.settings.brewingType).toBe("biab");
      expect(bodyA.settings.notes).toBeNull();
    });
  });
});
