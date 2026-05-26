/**
 * mrp-crp-read-only-alpha.spec.ts - Wave 3 read-only planning surfaces.
 *
 * The E2E seed gives the default admin workspace a recipe + brew session,
 * which Wave 2 projects into the canonical MRP read APIs. CRP fixtures may
 * be sparse; this smoke pins the CRP page shells and no-write behavior without
 * expanding global seed scope.
 */
import { test, expect } from "../support/auth-fixture";
import type { Page } from "@playwright/test";
import { loginPage } from "../support/locators";
import type { Persona } from "../support/personas";

const WRITE_CONTROL = /create|update|delete|save/i;

async function expectNoWriteButtons(page: Page) {
  await expect(page.getByRole("button", { name: WRITE_CONTROL })).toHaveCount(0);
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

test.describe("MRP/CRP read-only alpha smoke (authenticated)", () => {
  test("MRP production orders render projected brewery rows and detail", async ({ authenticatedPage, persona }) => {
    await gotoAuthenticatedPage(authenticatedPage, persona, "/en/production-orders");
    await expect(authenticatedPage).toHaveURL(/\/en\/production-orders(?:\?|$)/);
    await expect(
      authenticatedPage.getByRole("heading", { name: "Production planning" }),
    ).toBeVisible();
    await expect(authenticatedPage.getByText("Projected from brewery").first()).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);

    await authenticatedPage.getByRole("link", { name: "View order" }).first().click();
    await expect(authenticatedPage).toHaveURL(/\/en\/production-orders\/[^/]+(?:\?|$)/);
    await expect(authenticatedPage.getByText("Material requirements").first()).toBeVisible();
    await expect(authenticatedPage.getByText("Pale Ale Malt").first()).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);
  });

  test("MRP material requirements entry page is read-only", async ({ authenticatedPage, persona }) => {
    await gotoAuthenticatedPage(authenticatedPage, persona, "/en/material-requirements");
    await expect(authenticatedPage).toHaveURL(/\/en\/material-requirements(?:\?|$)/);
    await expect(
      authenticatedPage.getByRole("heading", { name: "Material requirements" }),
    ).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Open order requirements" }).first()).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);
  });

  test("CRP read-only page shells render without write controls", async ({ authenticatedPage, persona }) => {
    for (const path of ["/en/capacity", "/en/schedule", "/en/resources"]) {
      await gotoAuthenticatedPage(authenticatedPage, persona, path);
      await expect(authenticatedPage).toHaveURL(new RegExp(`${path.replaceAll("/", "\\/")}(?:\\?|$)`));
      await expect(authenticatedPage.getByRole("heading").first()).toBeVisible();
      await expectNoWriteButtons(authenticatedPage);
    }
  });
});
