/**
 * mrp-crp-export-alpha.spec.ts — Alpha demo export smoke (Wave 6 + demo closure).
 *
 * Requires gotenberg + redis in the E2E stack (same as API render tests).
 */
import { test, expect } from "../support/auth-fixture";
import type { Page } from "@playwright/test";
import { loginPage } from "../support/locators";
import { getFixtureIdentities, type Persona } from "../support/personas";

const fixture = getFixtureIdentities();
const productionOrderId = `brewery-brew-session-${fixture.brewSessionId}`;

function localized(path: string): string {
  return `/en${path}`;
}

async function gotoAuthenticatedPage(page: Page, persona: Persona, path: string) {
  await page.goto(path);
  const loginEmail = loginPage.emailInput(page);
  const logoutButton = page.getByRole("button", { name: "Log out" });
  const authState = await Promise.race([
    loginEmail.waitFor({ state: "visible", timeout: 10_000 }).then(() => "login" as const).catch(() => null),
    logoutButton.waitFor({ state: "visible", timeout: 10_000 }).then(() => "ready" as const).catch(() => null),
  ]);
  if (authState === "login") {
    await loginPage.emailInput(page).fill(persona.email);
    await loginPage.passwordInput(page).fill(persona.password);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 15_000 }),
      loginPage.submitButton(page).click(),
    ]);
    await page.goto(path);
  }
  await expect(logoutButton).toBeVisible();
}

test.describe("MRP/CRP export alpha smoke (authenticated)", () => {
  test("production order detail exports work-order PDF", async ({ authenticatedPage, persona }) => {
    test.setTimeout(60_000);
    await gotoAuthenticatedPage(
      authenticatedPage,
      persona,
      localized(`/production-orders/${encodeURIComponent(productionOrderId)}`),
    );
    await authenticatedPage.getByTestId("mrp-export-work-order-pdf").click();
    await expect(authenticatedPage.getByTestId("mrp-export-work-order-pdf-download")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("capacity page exports capacity-load XLSX", async ({ authenticatedPage, persona }) => {
    test.setTimeout(60_000);
    await gotoAuthenticatedPage(authenticatedPage, persona, localized("/capacity"));
    await authenticatedPage.getByTestId("crp-export-capacity-load-xlsx").click();
    await expect(authenticatedPage.getByTestId("crp-export-capacity-load-xlsx-download")).toBeVisible({
      timeout: 30_000,
    });
  });
});
