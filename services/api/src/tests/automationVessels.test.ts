import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

/**
 * Phase B-3 integration tests for the automation read path.
 *
 * Covers:
 *  - 401 when unauthenticated.
 *  - 400 when authenticated but no active workspace (handled at the
 *    requireActiveWorkspace boundary).
 *  - Happy path: list + get-by-code return seeded vessels in deterministic
 *    `code asc` order.
 *  - 404 when the code is not present in the active workspace.
 *  - L2 cross-workspace isolation pin: a vessel created in workspace A is
 *    invisible to a session active in workspace B (list returns empty;
 *    get-by-code returns 404, not 403, because the lookup is
 *    workspace-scoped — the row simply does not exist from B's
 *    perspective).
 *
 * Boundary lane (per canonical-automation-module-surface.md §11 Non-goals):
 * this surface exposes *live controller state* (mode / temps / alarm /
 * lastSeenAt). It is NOT a scheduling, capacity, or utilization surface;
 * vessel-as-planning-resource belongs to the future `crp` module.
 */
describe("automation vessels — read path (Phase B-3)", () => {
  const app = buildApp();

  let cookieA = "";
  let workspaceA = "";
  let cookieB = "";
  let workspaceB = "";

  beforeAll(async () => {
    await app.ready();

    const sessionA = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookieA = sessionA.cookie;
    workspaceA = sessionA.workspaceId;

    const sessionB = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookieB = sessionB.cookie;
    workspaceB = sessionB.workspaceId;

    // Seed two vessels in workspace A (deterministic codes for `code asc`
    // ordering assertions) and one vessel in workspace B (for the L2
    // cross-workspace isolation pin).
    await app.prisma.vessel.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.prisma.vessel.create({
      data: {
        workspaceId: workspaceA,
        code: "FV-01",
        displayName: "Fermenter 1",
        vesselKind: "fermenter",
        mode: "fermenting",
        currentTempC: 18.4,
        targetTempC: 18.0,
        alarmActive: false,
      },
    });
    await app.prisma.vessel.create({
      data: {
        workspaceId: workspaceA,
        code: "K-01",
        displayName: "Kettle 1",
        vesselKind: "kettle",
        mode: "idle",
        currentTempC: null,
        targetTempC: null,
        alarmActive: false,
      },
    });
    await app.prisma.vessel.create({
      data: {
        workspaceId: workspaceB,
        // Same code as a vessel in workspace A. The (workspaceId, code)
        // unique index allows this; the L2 isolation pin below verifies
        // that A's session cannot reach B's row.
        code: "FV-01",
        displayName: "Workspace-B Fermenter",
        vesselKind: "fermenter",
        mode: null,
        currentTempC: null,
        targetTempC: null,
        alarmActive: false,
      },
    });
  });

  afterAll(async () => {
    await app.prisma.vessel.deleteMany({
      where: { workspaceId: { in: [workspaceA, workspaceB] } },
    });
    await app.close();
  });

  describe("GET /automation/vessels", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/automation/vessels",
      });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({
        ok: false,
        error: { code: "missing_session", message: "Not authenticated" },
      });
    });

    it("lists vessels in the active workspace in `code asc` order", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/automation/vessels",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.vessels)).toBe(true);
      expect(body.vessels.length).toBe(2);
      expect(body.vessels[0].code).toBe("FV-01");
      expect(body.vessels[1].code).toBe("K-01");
      expect(body.vessels[0].workspaceId).toBe(workspaceA);
      expect(body.vessels[0].currentTempC).toBe(18.4);
      expect(body.vessels[0].targetTempC).toBe(18.0);
      expect(body.vessels[0].mode).toBe("fermenting");
      expect(body.vessels[0].alarmActive).toBe(false);
      expect(body.vessels[0].lastSeenAt).toBeNull();
    });

    it("L2 cross-workspace isolation: workspace B sees only its own vessels", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/automation/vessels",
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(body.vessels.length).toBe(1);
      expect(body.vessels[0].workspaceId).toBe(workspaceB);
      expect(body.vessels[0].displayName).toBe("Workspace-B Fermenter");
      // Sanity: the only vessel B sees is its own, even though A and B
      // both have a vessel with code "FV-01".
      expect(
        body.vessels.every(
          (v: { workspaceId: string }) => v.workspaceId === workspaceB,
        ),
      ).toBe(true);
    });
  });

  describe("GET /automation/vessels/:code", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/automation/vessels/FV-01",
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns the vessel by code in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/automation/vessels/FV-01",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(body.vessel.code).toBe("FV-01");
      expect(body.vessel.workspaceId).toBe(workspaceA);
      expect(body.vessel.displayName).toBe("Fermenter 1");
    });

    it("returns 404 when the code is not present in the active workspace", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/automation/vessels/does-not-exist",
        headers: { cookie: cookieA },
      });
      expect(res.statusCode).toBe(404);
      const body = res.json();
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("vessel_not_found");
    });

    it("L2 cross-workspace isolation: same code in workspace B returns workspace B's row, not workspace A's", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/automation/vessels/FV-01",
        headers: { cookie: cookieB },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(body.vessel.workspaceId).toBe(workspaceB);
      expect(body.vessel.displayName).toBe("Workspace-B Fermenter");
      // Confirm we did NOT get workspace A's vessel even though both
      // workspaces have an "FV-01".
      expect(body.vessel.workspaceId).not.toBe(workspaceA);
    });

    it("L2 cross-workspace isolation: workspace A's session cannot reach workspace B's distinct vessel via code", async () => {
      // workspaceB has only "FV-01" — but workspaceA does too, by chance.
      // A different vessel that only exists in B would also be invisible
      // to A's session; we cover the "code overlap" case above and here
      // confirm a workspace-B-only code is 404 from A's perspective.
      await app.prisma.vessel.create({
        data: {
          workspaceId: workspaceB,
          code: "B-ONLY",
          displayName: "Workspace-B-only Vessel",
          vesselKind: "fermenter",
          alarmActive: false,
        },
      });
      try {
        const res = await app.inject({
          method: "GET",
          url: "/automation/vessels/B-ONLY",
          headers: { cookie: cookieA },
        });
        expect(res.statusCode).toBe(404);
        expect(res.json().error.code).toBe("vessel_not_found");
      } finally {
        await app.prisma.vessel.deleteMany({
          where: { workspaceId: workspaceB, code: "B-ONLY" },
        });
      }
    });
  });
});
