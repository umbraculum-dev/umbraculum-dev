/**
 * mrp-crp-read-only-alpha.spec.ts - Wave 3 read-only planning surfaces.
 *
 * The E2E seed gives the default admin workspace a recipe, brew session,
 * equipment profile, automation vessel, and deterministic brew-session steps,
 * which Wave 2 projects into the canonical MRP/CRP read APIs.
 */
import { test, expect } from "../support/auth-fixture";
import type { Page } from "@playwright/test";
import { loginPage } from "../support/locators";
import { getFixtureIdentities, type Persona } from "../support/personas";

const WRITE_CONTROL = /create|update|delete|save/i;
const fixture = getFixtureIdentities();
const productionOrderId = `brewery-brew-session-${fixture.brewSessionId}`;
const resourceId = `automation-vessel-${fixture.vesselId}`;

function localized(path: string): string {
  return `/en${path}`;
}

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
    await gotoAuthenticatedPage(authenticatedPage, persona, localized("/production-orders"));
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
    await expect(authenticatedPage.getByText("E2E Alpha Mash").first()).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Open CRP schedule" })).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Open capacity view" })).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);
  });

  test("MRP material requirements entry page is read-only", async ({ authenticatedPage, persona }) => {
    await gotoAuthenticatedPage(authenticatedPage, persona, localized("/material-requirements"));
    await expect(authenticatedPage).toHaveURL(/\/en\/material-requirements(?:\?|$)/);
    await expect(
      authenticatedPage.getByRole("heading", { name: "Material requirements" }),
    ).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Open order requirements" }).first()).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);
  });

  test("CRP resources render deterministic automation and brewery projections", async ({ authenticatedPage, persona }) => {
    await gotoAuthenticatedPage(authenticatedPage, persona, localized("/resources"));
    await expect(authenticatedPage).toHaveURL(/\/en\/resources(?:\?|$)/);
    await expect(authenticatedPage.getByRole("heading", { name: "Capacity planning" })).toBeVisible();
    await expect(authenticatedPage.getByText("E2E-KETTLE-01").first()).toBeVisible();
    await expect(authenticatedPage.getByText("E2E Alpha Kettle").first()).toBeVisible();
    await expect(authenticatedPage.getByText("Projected from automation vessel").first()).toBeVisible();
    await expect(authenticatedPage.getByText("E2E Alpha Brewhouse").first()).toBeVisible();
    await expect(authenticatedPage.getByText("Projected from brewery").first()).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Open related resource" })).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);

    await gotoAuthenticatedPage(
      authenticatedPage,
      persona,
      localized(`/resources/${encodeURIComponent(resourceId)}`),
    );
    await expect(authenticatedPage).toHaveURL(/\/en\/resources\/[^/]+(?:\?|$)/);
    await expect(authenticatedPage.getByText(fixture.vesselId).first()).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Open automation vessel" })).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);
  });

  test("CRP capacity and schedule render deterministic load and warnings", async ({ authenticatedPage, persona }) => {
    await gotoAuthenticatedPage(authenticatedPage, persona, localized("/capacity"));
    await expect(authenticatedPage).toHaveURL(/\/en\/capacity(?:\?|$)/);
    await expect(authenticatedPage.getByText("E2E-KETTLE-01").first()).toBeVisible();
    await expect(authenticatedPage.getByText("0 available minutes (alpha read model)").first()).toBeVisible();
    await expect(authenticatedPage.getByText(/Planned minutes:\s*60/).first()).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Open resource detail" })).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);

    await gotoAuthenticatedPage(authenticatedPage, persona, localized("/schedule"));
    await expect(authenticatedPage).toHaveURL(/\/en\/schedule(?:\?|$)/);
    await expect(authenticatedPage.getByText("E2E Alpha Mash").first()).toBeVisible();
    await expect(authenticatedPage.getByText(productionOrderId).first()).toBeVisible();
    await expect(authenticatedPage.getByText(resourceId).first()).toBeVisible();
    await expect(authenticatedPage.getByText("no positive planned duration").first()).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Production order" }).first()).toBeVisible();
    await expect(authenticatedPage.getByRole("link", { name: "Resource" }).first()).toBeVisible();
    await expectNoWriteButtons(authenticatedPage);
  });
});
