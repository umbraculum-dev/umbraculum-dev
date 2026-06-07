/**
 * Contract snapshot: GET /water-profiles
 *
 * Phase 4b L4 regression-pin.
 *
 * apps/native consumes this payload via `parseWaterProfilesResponse` in
 * @umbraculum/contracts to populate the water-profile dropdowns on the mash,
 * sparge, and boil water pages. The response is grouped by visibility into
 * three arrays: `system`, `public`, and `workspace`.
 *
 * Historically the third group was named `.account` on the wire. Commit
 * `87876d0` renamed it to `.workspace` (with a backward-compat tunnel in
 * the parser that accepts both keys — pinned by the L1 unit test in
 * `packages/platform/contracts/src/water/waterProfile.test.ts`). Four UI consumers
 * in apps/web kept reading `profiles?.account` and silently broke for
 * months until HIGH-full Phase 4b (commit `4d9ec1e`, 2026-05-16) flagged it.
 *
 * If this snapshot had existed at the time of the rename PR, the
 * `.account` → `.workspace` change would have appeared as snapshot drift
 * in the rename PR's diff, surfacing the contract change explicitly
 * rather than only via type-aware lint promotion months later.
 *
 * To intentionally update:
 *   UPDATE_CONTRACTS=1 npm test -w @umbraculum/api -- contracts/waterProfiles.contract.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";
import { assertSnapshotShape } from "./shapeHelpers.js";

describe("contract: GET /water-profiles", () => {
  const app = buildApp();
  let cookie = "";
  let workspaceId = "";
  let createdWorkspaceProfileId = "";
  let createdPublicProfileId = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, {
      activeWorkspace: true,
      role: "brewery_admin",
    });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;

    // Ensure the workspace and public arrays are both non-empty so the
    // snapshot captures their element shape (not just `__length: "empty"`).
    const wsCreate = await app.inject({
      method: "POST",
      url: "/water-profiles",
      headers: { cookie },
      payload: {
        scope: "account",
        type: "water",
        name: "Contract Snapshot Workspace Water",
        calcium: 50,
        magnesium: 5,
        sodium: 10,
        sulfate: 30,
        chloride: 20,
        bicarbonate: 40,
        ph: 7.0,
      },
    });
    if (wsCreate.statusCode !== 200) {
      throw new Error(
        `workspace profile create failed (${wsCreate.statusCode}): ${wsCreate.body}`,
      );
    }
    createdWorkspaceProfileId = wsCreate.json().profile.id;

    const pubCreate = await app.inject({
      method: "POST",
      url: "/water-profiles",
      headers: { cookie },
      payload: {
        scope: "public",
        type: "water",
        name: "Contract Snapshot Public Water",
        calcium: 80,
        magnesium: 10,
        sodium: 15,
        sulfate: 60,
        chloride: 30,
        bicarbonate: 50,
        ph: 7.2,
      },
    });
    if (pubCreate.statusCode !== 200) {
      throw new Error(
        `public profile create failed (${pubCreate.statusCode}): ${pubCreate.body}`,
      );
    }
    createdPublicProfileId = pubCreate.json().profile.id;
  });

  afterAll(async () => {
    if (createdWorkspaceProfileId) {
      await app.prisma.waterProfile
        .deleteMany({ where: { id: createdWorkspaceProfileId } })
        .catch(() => undefined);
    }
    if (createdPublicProfileId) {
      await app.prisma.waterProfile
        .deleteMany({ where: { id: createdPublicProfileId } })
        .catch(() => undefined);
    }
    await app.close();
  });

  it("response shape is stable (system + public + workspace groups)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/water-profiles",
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();

    // Sanity-pin the grouping field name as `.workspace` (not `.account`)
    // explicitly here so a future regression can't silently rename it
    // without also editing this line.
    expect(Array.isArray(body.workspace)).toBe(true);
    expect(body.workspace.length).toBeGreaterThan(0);
    expect(Array.isArray(body.public)).toBe(true);
    expect(body.public.length).toBeGreaterThan(0);
    expect(Array.isArray(body.system)).toBe(true);
    expect(body.system.length).toBeGreaterThan(0);

    // Make sure the workspace profile we just created shows up scoped
    // to this caller's active workspace (not leaking across workspaces).
    const ours = body.workspace.find(
      (p: { id: string }) => p.id === createdWorkspaceProfileId,
    );
    expect(ours).toBeTruthy();
    expect(ours.workspaceId).toBe(workspaceId);

    assertSnapshotShape("waterProfiles.list", body);
  });
});
