/**
 * water-profiles.spec.ts — Phase 4b L5 regression-pin.
 *
 * This spec completes the regression-pin trio for the Phase 4b
 * `account → workspace` stale-consumer-drift bug (commit `87876d0` on
 * 2026-04-23; surfaced by HIGH-full Phase 4b commit `4d9ec1e` on
 * 2026-05-16). The trio:
 *
 *   - L1 unit:    packages/contracts/src/water/waterProfile.test.ts
 *                 → pins the dual-key parser behavior on the client side.
 *   - L4 snapshot: services/api/src/tests/contracts/waterProfiles.contract.test.ts
 *                 → pins the `body.workspace` (not `.account`) wire grouping
 *                   on the server side.
 *   - L5 (this):   below — pins the production-rendering outcome on
 *                   apps/web. If a future PR renames the grouping back
 *                   to `.account` without also updating the four UI
 *                   consumers in apps/web (or vice versa), this spec
 *                   will fail loudly because the seeded "E2E Tap Water"
 *                   workspace profile will silently disappear from the
 *                   table.
 *
 * The seed for "E2E Tap Water" lives at
 * services/api/src/cli/seedE2eFixture.ts (look for E2E_WATER_PROFILE_ID
 * + scope: "account" + workspaceId: E2E_WORKSPACE_ID). Run
 * `docker compose exec api npm run seed:e2e` before this spec if the
 * row goes missing.
 */
import { test, expect } from "../support/auth-fixture";

test.describe("water profiles list (Phase 4b L5 regression-pin)", () => {
  test("workspace-scoped 'E2E Tap Water' profile appears in /en/water-profiles", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/en/water-profiles");
    await expect(authenticatedPage).toHaveURL(/\/en\/water-profiles/);

    // The page renders profiles in a plain HTML <table>; the workspace-
    // scoped profile name is rendered as <td>{p.name}</td>. Locate the
    // exact seeded name to avoid false positives from system profiles
    // that happen to mention "water" in their name.
    const profileCell = authenticatedPage.getByRole("cell", {
      name: /^E2E Tap Water$/,
    });
    await expect(profileCell).toBeVisible({ timeout: 15_000 });
  });

  test("/api/water-profiles response carries the workspace-scoped seed under body.workspace", async ({
    authenticatedContext,
  }) => {
    // Belt-and-suspenders network-shape assertion. The L4 snapshot pins
    // the shape; this asserts the actual seeded data is reachable via
    // the authenticated browser session (catches deployment-time
    // misconfigurations like a stale CDN or a misrouted /api proxy).
    const response = await authenticatedContext.request.get("/api/water-profiles");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.workspace)).toBe(true);
    expect(body.workspace.length).toBeGreaterThan(0);

    const e2eTapWater = (body.workspace as Array<{ name: string; scope: string }>).find(
      (p) => p.name === "E2E Tap Water",
    );
    expect(e2eTapWater, "Seeded E2E Tap Water profile missing from body.workspace").toBeTruthy();
    expect(e2eTapWater?.scope).toBe("account");

    // Phase 4b sanity check: the legacy `.account` key MUST NOT exist
    // on the wire. If a future PR re-introduces it (intentionally or
    // not), this fires so we explicitly notice.
    expect(
      (body as Record<string, unknown>)['account'],
      "Legacy `body.account` key should not exist on the wire (Phase 4b regression)",
    ).toBeUndefined();
  });
});
