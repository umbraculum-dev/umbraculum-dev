/**
 * select-workspace.spec.ts — Phase 3b L5 regression-pin for the
 * SelectWorkspace flow (the apps/web side of the Phase 5g surface).
 *
 * Why this spec exists
 * --------------------
 * The HIGH-full ESLint slice (commit `6445476`, 2026-05-16, Phase 5g) flagged
 * an untyped render-prop inside the apps/native SelectWorkspace screen
 * (`<RootStack.Screen name="SelectWorkspace">{({ navigation }) => …}</…>`
 * was falling back to `any`). That bug never shipped a runtime symptom, but
 * the lack of static typing left the screen unprotected against a future
 * "navigation prop changes shape" regression that would silently break the
 * multi-workspace flow on native.
 *
 * apps/web has a parallel SelectWorkspace surface
 * (`apps/web/app/[locale]/(auth)/select-workspace/page.tsx`) that consumes
 * the same `/api/auth/me` and `/api/auth/active-workspace` endpoints and
 * runs the same multi-workspace handoff logic. It also had no L5 coverage
 * before this spec — the auth-fixture pre-seeded persona always belonged
 * to exactly one workspace, so login auto-selected it and the
 * SelectWorkspace page never rendered in any existing E2E test.
 *
 * This spec deliberately uses the dedicated `e2e-multi-admin` persona
 * (introduced in this same Phase 3b PR) who belongs to BOTH `E2E Brewery`
 * and `E2E Side Brewery`, so logging in lands on /en/select-workspace
 * with two visible options. Without that fixture, the SelectWorkspace
 * route is a dead branch in the routing tree from an E2E perspective.
 *
 * Why fresh browser context
 * -------------------------
 * Other smoke specs use the `authenticatedPage` fixture from
 * `support/auth-fixture.ts`, which persists storageState per persona in
 * `apps/web/e2e/.auth/<key>.json`. For the multi-workspace persona,
 * the persisted state captures a session WITHOUT an active workspace
 * (the persona is parked on /en/select-workspace right after login).
 * Reusing that state across tests would make the "fresh login" assertion
 * non-deterministic — so this spec uses the plain `@playwright/test`
 * import and drives the UI top-to-bottom on a fresh browser context per
 * test, the same pattern `auth.spec.ts` uses.
 *
 * Coverage trio for Phase 5g
 * --------------------------
 *   - L1: deferred until apps/native testing infrastructure exists
 *         (apps/native today has only `tsc --noEmit` and no unit test
 *         runner; tracked separately in docs/TESTING.md non-goals).
 *   - L4: not applicable — Phase 5g is a typing-discipline bug, not a
 *         wire-format bug; the `/auth/me` contract snapshot
 *         (`auth.contract.test.ts`) already pins the wire shape.
 *   - L5 (this spec): pins the production-rendering outcome of the
 *         multi-workspace handoff on apps/web. The native equivalent
 *         (a Detox spec for the apps/native SelectWorkspace screen)
 *         would mirror this once native testing lands.
 */
import { expect, test } from "@playwright/test";
import { loginPage, selectWorkspacePage } from "../support/locators";
import { getFixtureIdentities, getPersona } from "../support/personas";

test.describe("select workspace flow (Phase 3b L5 regression-pin)", () => {
  test("multi-workspace persona is redirected to /en/select-workspace after login", async ({
    page,
  }) => {
    const persona = getPersona("e2e-multi-admin");
    await page.goto("/en/login");
    await loginPage.emailInput(page).fill(persona.email);
    await loginPage.passwordInput(page).fill(persona.password);

    await Promise.all([
      page.waitForURL((url) => url.pathname.includes("/select-workspace"), { timeout: 15_000 }),
      loginPage.submitButton(page).click(),
    ]);

    expect(new URL(page.url()).pathname).toBe("/en/select-workspace");
    await expect(page.getByRole("heading", { name: /select workspace/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("both seeded workspaces appear as picker buttons", async ({ page }) => {
    const persona = getPersona("e2e-multi-admin");
    await page.goto("/en/login");
    await loginPage.emailInput(page).fill(persona.email);
    await loginPage.passwordInput(page).fill(persona.password);
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes("/select-workspace"), { timeout: 15_000 }),
      loginPage.submitButton(page).click(),
    ]);

    const primary = selectWorkspacePage.pickWorkspaceByName(page, "E2E Brewery");
    const secondary = selectWorkspacePage.pickWorkspaceByName(page, "E2E Side Brewery");
    await expect(primary).toBeVisible({ timeout: 10_000 });
    await expect(secondary).toBeVisible({ timeout: 10_000 });
  });

  test("picking a workspace POSTs /api/auth/active-workspace and redirects to /en/", async ({
    page,
  }) => {
    const persona = getPersona("e2e-multi-admin");
    const { secondaryWorkspaceId } = getFixtureIdentities();

    await page.goto("/en/login");
    await loginPage.emailInput(page).fill(persona.email);
    await loginPage.passwordInput(page).fill(persona.password);
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes("/select-workspace"), { timeout: 15_000 }),
      loginPage.submitButton(page).click(),
    ]);

    // Pick the SECONDARY workspace deliberately — picking the primary
    // would be indistinguishable from the auto-select-single-workspace
    // path and wouldn't pin the "user actually chose" behavior.
    const pickPromise = page.waitForResponse(
      (res) => res.url().includes("/api/auth/active-workspace") && res.request().method() === "POST",
      { timeout: 15_000 },
    );
    await selectWorkspacePage.pickWorkspaceByName(page, "E2E Side Brewery").click();
    const pickResponse = await pickPromise;
    expect(pickResponse.status()).toBe(200);
    const pickBody = (await pickResponse.json()) as {
      ok?: unknown;
      activeWorkspaceId?: unknown;
    };
    expect(pickBody.ok).toBe(true);
    expect(pickBody.activeWorkspaceId).toBe(secondaryWorkspaceId);

    // The page client also triggers router.replace(`/${locale}`), so the
    // URL should land on /en/. Use a regex tolerant of the trailing slash.
    await page.waitForURL((url) => /\/en\/?$/.test(url.pathname), { timeout: 10_000 });

    // Verify the session was actually mutated server-side, not just
    // optimistically updated in the UI. /api/auth/me must now report the
    // picked workspace as the active one.
    const meResponse = await page.request.get("/api/auth/me");
    expect(meResponse.status()).toBe(200);
    const meBody = (await meResponse.json()) as { activeWorkspaceId?: unknown };
    expect(meBody.activeWorkspaceId).toBe(secondaryWorkspaceId);
  });
});
