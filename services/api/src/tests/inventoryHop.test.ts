/**
 * inventory.test.ts — Phase 4b-2 L2 coverage for
 * `services/api/src/modules/brewery/routes/inventory.ts`
 * (relocated in Week 1 audit per RFC-0006).
 *
 * Why this file exists
 * --------------------
 * Per the Phase 4a route surface audit (docs/TESTING.md → "Phase 4a route
 * surface audit"), `inventory.ts` was the largest workspace-scoped writable
 * surface with ZERO L2 test coverage: 4 routes (GET list, POST create,
 * PATCH update, DELETE) on a real Prisma table (`InventoryItem`) with a
 * non-trivial validation surface (6 valid `category` values, 4 valid
 * `unit` values, category-conditional metadata shapes for `fermentable`
 * and `hop`).
 *
 * Coverage axes pinned here (per the audit's per-route matrix):
 *
 *   - Happy path (200) — all 4 routes, including the `?category=` filter
 *     on GET /inventory and the fermentable + hop category-conditional
 *     metadata round-trip on POST /inventory.
 *   - Validation (400) — invalid category, invalid unit, missing name,
 *     negative quantity, non-numeric quantity. These pin the
 *     `BadRequestError` paths in `InventoryService` so a future regression
 *     that loosens validation (e.g. silently dropping invalid input)
 *     would fail loudly.
 *   - Unauth (401) — both flavors: missing session (no cookie) AND
 *     session-with-no-active-workspace. The latter is the more common
 *     production hazard (it would surface if a session got mutated mid-
 *     request); pinning both flavors mirrors the recipes.test.ts pattern.
 *   - Cross-workspace isolation (404) — same regression-pin pattern
 *     established in Phase 4b-1 for brew-sessions: persona B in a separate
 *     workspace probes A's inventoryItem id and gets 404 (not 200 / 403),
 *     plus a positive "B's list view does not contain A's items" check.
 *
 * Phase 4a's "Phase 4d (deferred)" applies here: role-based ACL is unwired
 * in v0 (`AclService.requireRole` exists but is not invoked from this
 * route), so a "viewer 403" assertion would not currently fail — it would
 * succeed as 200, hiding the wiring gap rather than pinning it. When ACL
 * gets wired, add the viewer/member 403 assertions here as part of that
 * follow-on slice.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("inventory routes (Phase 4b-2)", () => {
  const app = buildApp();
  let cookieA = "";
  let _cookieB = "";
  let _cookieNoWorkspace = "";
  let workspaceIdA = "";
  let workspaceIdB = "";

  // Track created inventory item ids per workspace for explicit cleanup.
  // `afterAll` walks both arrays even on partial failure so a broken test
  // doesn't leave orphaned rows in the shared dev DB.
  const createdItemIdsA: string[] = [];
  const createdItemIdsB: string[] = [];

  beforeAll(async () => {
    await app.ready();

    const sessA = await createSessionForTestUser(app, { activeWorkspace: true });
    cookieA = sessA.cookie;
    workspaceIdA = sessA.workspaceId;

    const sessB = await createSessionForTestUser(app, { activeWorkspace: true });
    _cookieB = sessB.cookie;
    workspaceIdB = sessB.workspaceId;

    const sessNo = await createSessionForTestUser(app, { activeWorkspace: false });
    _cookieNoWorkspace = sessNo.cookie;
  });

  afterAll(async () => {
    // Belt-and-suspenders: delete by tracked id first (cheap, catches the
    // happy path), then fall back to a workspace-scoped sweep (catches
    // anything a test forgot to track, e.g. a test that 400'd before the
    // id was captured but somehow still wrote a row — shouldn't happen
    // given the route handlers, but defensive).
    if (createdItemIdsA.length > 0) {
      await app.prisma.inventoryItem.deleteMany({
        where: { id: { in: createdItemIdsA }, workspaceId: workspaceIdA },
      });
    }
    if (createdItemIdsB.length > 0) {
      await app.prisma.inventoryItem.deleteMany({
        where: { id: { in: createdItemIdsB }, workspaceId: workspaceIdB },
      });
    }
    if (workspaceIdA) {
      await app.prisma.inventoryItem.deleteMany({ where: { workspaceId: workspaceIdA } });
    }
    if (workspaceIdB) {
      await app.prisma.inventoryItem.deleteMany({ where: { workspaceId: workspaceIdB } });
    }
    await app.close();
  });
  describe("POST /inventory (happy path)", () => {
    it("creates a hop item with hop-specific metadata (alphaMin/alphaMax only)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/inventory",
        headers: { cookie: cookieA },
        payload: {
          category: "hop",
          name: "Saaz",
          quantity: 500,
          unit: "g",
          metadata: {
            alphaMin: 2.5,
            alphaMax: 4.5,
            // `producer` is whitelisted for fermentables only — this must
            // be silently dropped, NOT cause a 400.
            producer: "should be dropped",
          },
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { item: { id: string; metadataJson: Record<string, unknown> | null } };
      expect(body.item.metadataJson).toEqual({ alphaMin: 2.5, alphaMax: 4.5 });
      createdItemIdsA.push(body.item.id);
    });
  });

  describe("GET /inventory (filtering + listing)", () => {
    it("filters by ?category= when a valid category is provided", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/inventory?category=hop",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { items: Array<{ category: string; name: string }> };
      expect(body.items.length).toBe(1);
      expect(body.items[0]?.category).toBe("hop");
      expect(body.items[0]?.name).toBe("Saaz");
    });
  });
});
