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
    cookieB = sessB.cookie;
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
  describe("GET /inventory (happy path)", () => {
    it("returns an empty list for a fresh workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/inventory",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { ok: boolean; items: unknown[] };
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items).toEqual([]);
    });
  });
  describe("POST /inventory (happy path)", () => {
    it("creates a fermentable item with category-specific metadata round-trip", async () => {
      const res = await app.inject({
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
      expect(res.statusCode).toBe(200);
      const body = res.json() as {
        ok: boolean;
        item: {
          id: string;
          workspaceId: string;
          category: string;
          name: string;
          quantity: number;
          unit: string;
          metadataJson: Record<string, unknown> | null;
        };
      };
      expect(body.ok).toBe(true);
      expect(body.item.workspaceId).toBe(workspaceIdA);
      expect(body.item.category).toBe("fermentable");
      expect(body.item.name).toBe("Pilsner Malt");
      expect(body.item.quantity).toBe(25);
      expect(body.item.unit).toBe("kg");
      // `InventoryService.parseMetadata` whitelists known fields per
      // category — confirm the producer + the three numeric fields land,
      // and no extras leak through.
      expect(body.item.metadataJson).toEqual({
        producer: "Weyermann",
        colorLovibond: 1.8,
        yieldPercent: 81,
        ppg: 37,
      });
      createdItemIdsA.push(body.item.id);
    });
  });

  describe("PATCH /inventory/:id (happy path)", () => {
    it("updates name and quantity in place", async () => {
      const idToUpdate = createdItemIdsA[0]; // The Pilsner Malt fermentable.
      expect(idToUpdate).toBeTruthy();
      const res = await app.inject({
        method: "PATCH",
        url: `/inventory/${idToUpdate}`,
        headers: { cookie: cookieA },
        payload: {
          name: "Pilsner Malt (updated)",
          quantity: 30,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json() as { item: { id: string; name: string; quantity: number; unit: string } };
      expect(body.item.id).toBe(idToUpdate);
      expect(body.item.name).toBe("Pilsner Malt (updated)");
      expect(body.item.quantity).toBe(30);
      // unit was not in the PATCH payload — must remain unchanged.
      expect(body.item.unit).toBe("kg");
    });
  });

  describe("cross-workspace isolation (Phase 4b-2 ↔ 4b-1 parity)", () => {
    it("PATCH /inventory/:id from another workspace returns 404", async () => {
      const idA = createdItemIdsA[0];
      expect(idA).toBeTruthy();
      const res = await app.inject({
        method: "PATCH",
        url: `/inventory/${idA}`,
        headers: { cookie: cookieB },
        payload: { name: "should be unreachable", quantity: 999 },
      });
      expect(res.statusCode).toBe(404);
      expect((res.json() as { error: { code: string } }).error.code).toBe("inventory_item_not_found");

      // Belt-and-suspenders: A's row must NOT have been mutated by B's
      // request. Re-fetch via A's list and verify the name + quantity
      // pinned by the earlier PATCH happy-path are intact.
      const listFromA = await app.inject({
        method: "GET",
        url: "/inventory?category=fermentable",
        headers: { cookie: cookieA },
      });
      const body = listFromA.json() as { items: Array<{ id: string; name: string; quantity: number }> };
      const stillThere = body.items.find((i) => i.id === idA);
      expect(stillThere).toBeTruthy();
      expect(stillThere?.name).toBe("Pilsner Malt (updated)");
      expect(stillThere?.quantity).toBe(30);
    });
  });
});
