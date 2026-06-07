/**
 * mrp-crp-export-alpha.spec.ts — Alpha demo export smoke (Wave 6 + demo closure).
 *
 * Prerequisites (repo root):
 *   docker compose up -d
 *   ./scripts/smoke.sh  # must include api /api/health 200
 *   docker compose exec api npm run seed:e2e
 *
 * Auth: `authenticatedPage` (e2e-admin). Stale `apps/web/e2e/.auth/e2e-admin.json` is
 * refreshed automatically when the session no longer reaches a protected page.
 *
 * Requires gotenberg + redis (same as API render tests).
 */
import { test, expect } from "../support/auth-fixture";
import type { Page } from "@playwright/test";
import { loginPage } from "../support/locators";
import { getFixtureIdentities } from "../support/personas";

const fixture = getFixtureIdentities();
const productionOrderId = `brewery-brew-session-${fixture.brewSessionId}`;

function localized(path: string): string {
  return `/en${path}`;
}

async function expectApiReachable() {
  const base = process.env["E2E_BASE_URL"] ?? "http://localhost:18080";
  const res = await fetch(`${base}/api/health`);
  if (!res.ok) {
    throw new Error(
      `API not reachable at ${base}/api/health (${res.status}). ` +
        "Fix the api container before Playwright export smoke (see docker compose logs api).",
    );
  }
}

/** Protected navigation; fixture should already be logged in. */
async function gotoWithSession(page: Page, path: string) {
  await page.goto(path);
  const logout = page.getByRole("button", { name: "Log out" });
  const onLogin = loginPage.emailInput(page);
  const state = await Promise.race([
    logout.waitFor({ state: "visible", timeout: 12_000 }).then(() => "ready" as const),
    onLogin.waitFor({ state: "visible", timeout: 12_000 }).then(() => "login" as const),
  ]).catch(() => "unknown" as const);
  if (state === "login") {
    throw new Error(
      `Expected authenticated session at ${path} but got Sign in. ` +
        "Run seed:e2e, ensure api is healthy (not 502), and rm apps/web/e2e/.auth/e2e-admin.json if needed.",
    );
  }
  await expect(logout).toBeVisible();
}

test.describe("MRP/CRP export alpha smoke (authenticated)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    await expectApiReachable();
  });

  test("production order detail exports work-order PDF", async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    await gotoWithSession(
      authenticatedPage,
      localized(`/production-orders/${encodeURIComponent(productionOrderId)}`),
    );
    await authenticatedPage.getByTestId("mrp-export-work-order-pdf").click();
    await expect(authenticatedPage.getByTestId("mrp-export-work-order-pdf-download")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("capacity page exports capacity-load XLSX", async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    await gotoWithSession(authenticatedPage, localized("/capacity"));
    await authenticatedPage.getByTestId("crp-export-capacity-load-xlsx").click();
    await expect(authenticatedPage.getByTestId("crp-export-capacity-load-xlsx-download")).toBeVisible({
      timeout: 30_000,
    });
  });
});
