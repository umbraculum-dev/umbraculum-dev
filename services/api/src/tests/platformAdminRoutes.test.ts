/**
 * platformAdminRoutes.test.ts — Phase 4b-5 L2 coverage for the
 * platform-admin route surface.
 *
 * Why this file exists
 * --------------------
 * Per the Phase 4a route surface audit (docs/TESTING.md → "Phase 4a route
 * surface audit"), `platformAds.ts` (4 routes) and `platformRecipes.ts`
 * (8 routes) — 12 routes total — were the last remaining gap in the
 * Phase 4b backlog: both files have zero L2 coverage today, and both
 * sit behind the `requirePlatformAdmin` middleware in
 * `services/api/src/plugins/requirePlatformAdmin.ts`. The gate itself
 * was therefore untested, meaning a future regression that
 *
 *   - dropped the `await requirePlatformAdmin(app, s.userId)` call from a
 *     route handler, or
 *   - flipped the `if (!user?.isPlatformAdmin)` check to its negation,
 *
 * would silently allow any authenticated user to read platform data,
 * import recipes into arbitrary workspaces, or mutate ads. Low-frequency-
 * of-changes admin surface notwithstanding, the blast radius of such a
 * regression is high (it's the only path through which one workspace can
 * write into another workspace's recipes, via the admin import routes).
 *
 * What this file pins
 * -------------------
 * For every one of the 12 platform-admin routes:
 *
 *   - 401 `missing_session` when no cookie is present (`requireSession`
 *     fires first, before `requirePlatformAdmin`).
 *   - 403 `not_platform_admin` when a valid but non-platform-admin
 *     session is used (`requirePlatformAdmin` fires after `requireSession`
 *     and throws `ForbiddenError("not_platform_admin")` → HTTP 403, per
 *     `services/api/src/errors.ts:26-30`).
 *
 * Plus 3 admin-happy-path tests to confirm the gate doesn't false-positive
 * on legitimate admin sessions:
 *
 *   - GET /platform/ads returns `{ ok: true, ads: [...] }` for an admin.
 *   - GET /platform/workspaces returns `{ ok: true, workspaces: [...] }`
 *     including the admin's own workspace (positive coverage that the
 *     route actually reads from Prisma after passing the gate).
 *   - POST /platform/ads with a valid payload creates a row and returns
 *     `{ ok: true, id: ... }` (admin write-side pin + DB round-trip).
 *
 * Why a fresh admin user per file
 * -------------------------------
 * The dev `prisma/seed.ts` flags the seeded owner email as
 * `isPlatformAdmin: true`, but tests should not depend on (or interact
 * with) seeded data — a future seed reshuffle would break this test. So
 * this file:
 *   1. Calls `createSessionForTestUser` to spin up an isolated user +
 *      workspace + session (the standard helper).
 *   2. Promotes the new user to platform admin via a direct
 *      `app.prisma.user.update({ data: { isPlatformAdmin: true } })`.
 *      The `createSessionForTestUser` helper does not currently support
 *      this flag because (a) it's only ever needed by this single test
 *      file, and (b) keeping the helper minimal avoids accidentally
 *      promoting test users in unrelated tests.
 *   3. Cleans up both user + workspace + any rows created by the happy-
 *      path tests in `afterAll`.
 *
 * Phase 4d (deferred) applies as elsewhere in Phase 4b: workspace-scoped
 * role-based ACL (`AclService.requireRole`) is unwired in v0. The
 * platform-admin gate is a SEPARATE gate (the `User.isPlatformAdmin` flag,
 * not `WorkspaceMember.role`) — it IS wired, and this test pins it.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

const AUTH_GATE_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";

/** Minimal body that passes zodApp validation so auth gates (401/403) run before 400. */
const MIN_PLATFORM_AD_CREATE = {
  placement: "global_top" as const,
  imageUrl: "https://example.com/ad.png",
  linkUrl: "https://example.com",
  altText: "Auth gate probe",
};

const MIN_PLATFORM_IMPORT = {
  format: "beerjson" as const,
  content: '{"beerjson":{"version":1,"recipes":[]}}',
  workspaceId: AUTH_GATE_WORKSPACE_ID,
};

// All 12 platform-admin routes the audit identified. Each entry is the
// HTTP method + URL + a minimal request body sufficient to reach the
// `requirePlatformAdmin(app, s.userId)` call. The auth chain in every
// route is:
//   1. requireSession(req)          → 401 missing_session if no cookie
//   2. requirePlatformAdmin(...)    → 403 not_platform_admin if not admin
// Body parsing happens AFTER both gates, so a minimal/empty payload
// suffices for the 401 + 403 assertions (the 200 happy-path tests do
// provide real payloads further down).
const PLATFORM_ROUTES: Array<{
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  payload?: Record<string, unknown>;
  file: "platformAds.ts" | "platformRecipes.ts";
}> = [
  // platformAds.ts (4 routes).
  { method: "GET", url: "/platform/ads", file: "platformAds.ts" },
  { method: "POST", url: "/platform/ads", payload: MIN_PLATFORM_AD_CREATE, file: "platformAds.ts" },
  {
    method: "PATCH",
    url: "/platform/ads/00000000-0000-0000-0000-000000000000",
    payload: {},
    file: "platformAds.ts",
  },
  {
    method: "DELETE",
    url: "/platform/ads/00000000-0000-0000-0000-000000000000",
    file: "platformAds.ts",
  },
  // platformRecipes.ts (8 routes).
  { method: "GET", url: "/platform/workspaces", file: "platformRecipes.ts" },
  {
    method: "GET",
    url: "/platform/recipes/list?workspaceId=00000000-0000-0000-0000-000000000000",
    file: "platformRecipes.ts",
  },
  {
    method: "GET",
    url: "/platform/recipes/00000000-0000-0000-0000-000000000000/export/beerjson?workspaceId=00000000-0000-0000-0000-000000000000",
    file: "platformRecipes.ts",
  },
  {
    method: "GET",
    url: "/platform/recipes/export/beerjson?workspaceId=00000000-0000-0000-0000-000000000000",
    file: "platformRecipes.ts",
  },
  {
    method: "POST",
    url: "/platform/recipes/import/preview",
    payload: MIN_PLATFORM_IMPORT,
    file: "platformRecipes.ts",
  },
  { method: "POST", url: "/platform/recipes/import", payload: MIN_PLATFORM_IMPORT, file: "platformRecipes.ts" },
  {
    method: "POST",
    url: "/platform/recipes/import/bulk/preview",
    payload: MIN_PLATFORM_IMPORT,
    file: "platformRecipes.ts",
  },
  {
    method: "POST",
    url: "/platform/recipes/import/bulk",
    payload: MIN_PLATFORM_IMPORT,
    file: "platformRecipes.ts",
  },
];

describe("platform-admin route gates (Phase 4b-5)", () => {
  const app = buildApp();
  let cookieAdmin = "";
  let cookieNonAdmin = "";
  let adminUserId = "";
  let adminWorkspaceId = "";
  let _nonAdminUserId = "";
  let nonAdminWorkspaceId = "";

  // Track ad rows created by the happy-path tests for cleanup.
  const createdAdIds: string[] = [];

  beforeAll(async () => {
    await app.ready();

    // Non-admin: standard authenticated user. Used as the 403 probe.
    const sessNonAdmin = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieNonAdmin = sessNonAdmin.cookie;
    _nonAdminUserId = sessNonAdmin.userId;
    nonAdminWorkspaceId = sessNonAdmin.workspaceId;

    // Admin: standard authenticated user, then promoted via direct
    // Prisma update. The helper deliberately doesn't accept an
    // isPlatformAdmin flag — see the file-header rationale. We update
    // BEFORE any platform request so the requirePlatformAdmin lookup
    // sees the flag.
    const sessAdmin = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieAdmin = sessAdmin.cookie;
    adminUserId = sessAdmin.userId;
    adminWorkspaceId = sessAdmin.workspaceId;
    await app.prisma.user.update({
      where: { id: adminUserId },
      data: { isPlatformAdmin: true },
    });
  });

  afterAll(async () => {
    if (createdAdIds.length > 0) {
      await app.prisma.ad.deleteMany({ where: { id: { in: createdAdIds } } });
    }
    // Demote the admin user before close to leave the DB tidy (the
    // helper doesn't roll users back; we created the row, we own the
    // cleanup).
    if (adminUserId) {
      await app.prisma.user.update({
        where: { id: adminUserId },
        data: { isPlatformAdmin: false },
      });
    }
    await app.close();
  });

  describe("non-admin session → 403 not_platform_admin on every route", () => {
    for (const route of PLATFORM_ROUTES) {
      it(`${route.method} ${route.url} (${route.file})`, async () => {
        const res = await app.inject({
          method: route.method,
          url: route.url,
          headers: { cookie: cookieNonAdmin },
          ...(route.payload !== undefined ? { payload: route.payload } : {}),
        });
        expect(res.statusCode).toBe(403);
        const body = res.json() as { ok: boolean; error: { code: string; message: string } };
        expect(body.ok).toBe(false);
        expect(body.error.code).toBe("not_platform_admin");
      });
    }
  });

  describe("no session → 401 missing_session on every route (requireSession fires first)", () => {
    // Pinning all 12 routes here too even though missing_session is
    // already pinned exhaustively in other test files (recipes,
    // inventory, brewday-settings). Reason: the auth-chain ORDER
    // (requireSession → requirePlatformAdmin) is a load-bearing
    // contract — if a future regression accidentally swapped the order
    // (e.g. called requirePlatformAdmin first with an undefined userId),
    // the non-admin tests above would still pass (no admin → 403) but
    // the no-cookie probe would behave differently. So we pin the order
    // explicitly here: no cookie must yield 401, not 403.
    for (const route of PLATFORM_ROUTES) {
      it(`${route.method} ${route.url} (${route.file})`, async () => {
        const res = await app.inject({
          method: route.method,
          url: route.url,
          ...(route.payload !== undefined ? { payload: route.payload } : {}),
        });
        expect(res.statusCode).toBe(401);
        const body = res.json() as { error: { code: string } };
        expect(body.error.code).toBe("missing_session");
      });
    }
  });

  describe("admin session → happy paths confirm the gate is not a false-positive", () => {
    it("GET /platform/ads returns { ok: true, ads: [...] } for an admin", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/platform/ads",
        headers: { cookie: cookieAdmin },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { ok: boolean; ads: unknown[] };
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.ads)).toBe(true);
      // We don't assert length here — the dev DB may have pre-existing
      // ads from prior runs / seed data, and the platform/ads endpoint
      // is intentionally global (not workspace-scoped). The contract
      // pinned here is "200 + ads array shape", not "empty list".
    });

    it("GET /platform/workspaces includes the admin's own workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/platform/workspaces",
        headers: { cookie: cookieAdmin },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as {
        ok: boolean;
        workspaces: Array<{ id: string; name: string }>;
      };
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.workspaces)).toBe(true);
      // The admin's own workspace must be reachable through the
      // platform-admin lens. Positive proof that the gate doesn't
      // false-positive AND that the route reads from Prisma correctly
      // post-gate.
      expect(body.workspaces.some((w) => w.id === adminWorkspaceId)).toBe(true);
      // The non-admin user's workspace must ALSO be visible to an
      // admin — that's the whole point of the platform surface (cross-
      // workspace read access for admins only).
      expect(body.workspaces.some((w) => w.id === nonAdminWorkspaceId)).toBe(true);
    });

    it("POST /platform/ads with valid payload creates an ad row (admin write-side pin)", async () => {
      const payload = {
        placement: "global_top",
        platform: "web",
        imageUrl: "https://example.com/ad.png",
        linkUrl: "https://example.com/sponsor",
        altText: "Phase 4b-5 happy-path ad",
        isActive: true,
        priority: 0,
        weight: 1,
      };
      const res = await app.inject({
        method: "POST",
        url: "/platform/ads",
        headers: { cookie: cookieAdmin },
        payload,
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { ok: boolean; id: string };
      expect(body.ok).toBe(true);
      expect(typeof body.id).toBe("string");
      expect(body.id.length).toBeGreaterThan(0);
      createdAdIds.push(body.id);

      // Belt-and-suspenders: verify the row actually landed in the DB
      // (not just that the route returned ok:true).
      const persisted = await app.prisma.ad.findUnique({
        where: { id: body.id },
        select: { altText: true, isActive: true, placement: true, platform: true },
      });
      expect(persisted).not.toBeNull();
      expect(persisted?.altText).toBe(payload.altText);
      expect(persisted?.isActive).toBe(true);
      expect(persisted?.placement).toBe("global_top");
      expect(persisted?.platform).toBe("web");
    });
  });
});
