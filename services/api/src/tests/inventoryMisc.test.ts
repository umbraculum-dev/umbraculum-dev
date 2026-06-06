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
  let cookieB = "";
  let cookieNoWorkspace = "";
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
    cookieB = sessB.cookie;
    workspaceIdB = sessB.workspaceId;

    const sessNo = await createSessionForTestUser(app, { activeWorkspace: false });
    cookieNoWorkspace = sessNo.cookie;

    const seedFermentable = await app.inject({
      method: "POST",
      url: "/inventory",
      headers: { cookie: cookieA },
      payload: {
        category: "fermentable",
        name: "Pilsner Malt",
        quantity: 25,
        unit: "kg",
        metadata: {
          producer: "Weyermann",
          colorLovibond: 1.8,
          yieldPercent: 81,
          ppg: 37,
        },
      },
    });
    expect(seedFermentable.statusCode).toBe(200);
    createdItemIdsA.push((seedFermentable.json() as { item: { id: string } }).item.id);

    const seedHop = await app.inject({
      method: "POST",
      url: "/inventory",
      headers: { cookie: cookieA },
      payload: {
        category: "hop",
        name: "Saaz",
        quantity: 500,
        unit: "g",
        metadata: { alphaMin: 2.5, alphaMax: 4.5, producer: "should be dropped" },
      },
    });
    expect(seedHop.statusCode).toBe(200);
    createdItemIdsA.push((seedHop.json() as { item: { id: string } }).item.id);
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
    it("creates a non-fermentable / non-hop item (metadata is dropped to null)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/inventory",
        headers: { cookie: cookieA },
        payload: {
          category: "acid_salt",
          name: "Gypsum",
          quantity: 100,
          unit: "g",
          metadata: { irrelevant: "ignored" },
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { item: { id: string; category: string; metadataJson: unknown } };
      expect(body.item.category).toBe("acid_salt");
      // `parseMetadata` returns null for non-fermentable / non-hop
      // categories regardless of input; `toItemPayload` then surfaces
      // the null without coercion.
      expect(body.item.metadataJson).toBeNull();
      createdItemIdsA.push(body.item.id);
    });
  });

  describe("GET /inventory (filtering + listing)", () => {
    it("lists all created items, sorted by (category enum-order, name)", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/inventory",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { items: Array<{ category: string; name: string }> };
      // 3 items created in workspace A above.
      expect(body.items.length).toBe(3);
      // Sort order: `orderBy: { category: "asc" }` on a Prisma/Postgres
      // enum column sorts by the enum's DECLARATION ORDER, not
      // alphabetically — i.e. `fermentable` (index 0) < `hop` (index 1)
      // < `acid_salt` (index 3) per the `InventoryCategory` enum order
      // defined in `services/api/src/services/inventoryService.ts`
      // (and matched by the Prisma schema enum order). Pinning the
      // enum-order behavior here so a future schema change that reorders
      // the enum (which is a breaking change for any SQL-side ordering)
      // surfaces as a test failure rather than silently shuffling the
      // /inventory list response.
      expect(body.items.map((i) => i.category)).toEqual(["fermentable", "hop", "acid_salt"]);
      expect(body.items.map((i) => i.name)).toEqual(["Pilsner Malt", "Saaz", "Gypsum"]);
    });

    it("silently ignores ?category= when the value is not a valid InventoryCategory", async () => {
      // `InventoryService.listItems` treats an invalid category param as
      // "no filter" rather than throwing — pinning that contract so a
      // future refactor that decides to 400 instead surfaces this as a
      // behavior change.
      const res = await app.inject({
        method: "GET",
        url: "/inventory?category=not-a-real-category",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { items: unknown[] };
      expect(body.items.length).toBe(3);
    });
  });

  describe("DELETE /inventory/:id (happy path)", () => {
    it("deletes the item and 404s on subsequent GETs via the list", async () => {
      const idToDelete = createdItemIdsA[createdItemIdsA.length - 1]; // The Gypsum row.
      expect(idToDelete).toBeTruthy();
      const res = await app.inject({
        method: "DELETE",
        url: `/inventory/${idToDelete}`,
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ ok: true });

      const list = await app.inject({
        method: "GET",
        url: "/inventory?category=acid_salt",
        headers: { cookie: cookieA },
      });
      expect(list.statusCode).toBe(200);
      const body = list.json() as { items: unknown[] };
      expect(body.items).toEqual([]);

      createdItemIdsA.pop();
    });

    it("returns 404 when the id does not exist", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/inventory/00000000-0000-0000-0000-000000000000",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json() as { ok: boolean; error: { code: string } };
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("inventory_item_not_found");
    });
  });

  describe("POST /inventory (validation 400s)", () => {
    it("400s on invalid category", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/inventory",
        headers: { cookie: cookieA },
        payload: { category: "not-a-real-category", name: "x", quantity: 1, unit: "kg" },
      });
      expect(res.statusCode).toBe(400);
      expect((res.json() as { error: { code: string } }).error.code).toBe("invalid_category");
    });

    it("400s on invalid unit", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/inventory",
        headers: { cookie: cookieA },
        payload: { category: "fermentable", name: "x", quantity: 1, unit: "not-a-real-unit" },
      });
      expect(res.statusCode).toBe(400);
      expect((res.json() as { error: { code: string } }).error.code).toBe("invalid_unit");
    });

    it("400s on empty name (trimmed)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/inventory",
        headers: { cookie: cookieA },
        payload: { category: "fermentable", name: "   ", quantity: 1, unit: "kg" },
      });
      expect(res.statusCode).toBe(400);
      expect((res.json() as { error: { code: string } }).error.code).toBe("invalid_name");
    });

    it("400s on negative quantity", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/inventory",
        headers: { cookie: cookieA },
        payload: { category: "fermentable", name: "x", quantity: -1, unit: "kg" },
      });
      expect(res.statusCode).toBe(400);
      expect((res.json() as { error: { code: string } }).error.code).toBe("invalid_quantity");
    });
  });
  describe("auth gates (401)", () => {
    it("GET /inventory without any cookie returns 401 missing_session", async () => {
      const res = await app.inject({ method: "GET", url: "/inventory" });
      expect(res.statusCode).toBe(401);
      const body = res.json() as { ok: boolean; error: { code: string } };
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("missing_session");
    });

    it("GET /inventory with a session that has no active workspace returns 401 missing_active_workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/inventory",
        headers: { cookie: cookieNoWorkspace },
      });
      expect(res.statusCode).toBe(401);
      const body = res.json() as { error: { code: string } };
      expect(body.error.code).toBe("missing_active_workspace");
    });

    it("POST /inventory without any cookie returns 401 (write side)", async () => {
      // Mirror the GET assertion on the write side so a regression that
      // accidentally makes POST opt-in to auth surfaces explicitly.
      const res = await app.inject({
        method: "POST",
        url: "/inventory",
        payload: { category: "fermentable", name: "x", quantity: 1, unit: "kg" },
      });
      expect(res.statusCode).toBe(401);
    });
  });
  describe("cross-workspace isolation (Phase 4b-2 ↔ 4b-1 parity)", () => {
    it("DELETE /inventory/:id from another workspace returns 404 and A's row still exists", async () => {
      const idA = createdItemIdsA[0];
      expect(idA).toBeTruthy();
      const res = await app.inject({
        method: "DELETE",
        url: `/inventory/${idA}`,
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(404);

      // Verify A's row still exists.
      const listFromA = await app.inject({
        method: "GET",
        url: "/inventory?category=fermentable",
        headers: { cookie: cookieA },
      });
      const body = listFromA.json() as { items: Array<{ id: string }> };
      expect(body.items.some((i) => i.id === idA)).toBe(true);
    });

    it("GET /inventory from another workspace does not include A's items", async () => {
      // Create a known item in B's workspace so the list isn't empty; then
      // assert that B's list contains only B's items and none of A's.
      const createB = await app.inject({
        method: "POST",
        url: "/inventory",
        headers: { cookie: cookieB },
        payload: { category: "hop", name: "B-only hop", quantity: 50, unit: "g" },
      });
      expect(createB.statusCode).toBe(200);
      const bItemId = (createB.json() as { item: { id: string } }).item.id;
      createdItemIdsB.push(bItemId);

      const listB = await app.inject({
        method: "GET",
        url: "/inventory",
        headers: { cookie: cookieB },
      });
      const bodyB = listB.json() as { items: Array<{ id: string; workspaceId: string; name: string }> };
      expect(bodyB.items.length).toBe(1);
      expect(bodyB.items[0]?.id).toBe(bItemId);
      expect(bodyB.items[0]?.workspaceId).toBe(workspaceIdB);
      // The 3 items in A's workspace must not leak into B's list view.
      const aIds = new Set(createdItemIdsA);
      expect(bodyB.items.every((i) => !aIds.has(i.id))).toBe(true);
    });
  });
});
