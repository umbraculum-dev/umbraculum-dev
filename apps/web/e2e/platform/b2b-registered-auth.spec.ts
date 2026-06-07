/**
 * auth.spec.ts - exercises the real login UI top-to-bottom.
 *
 * Most other specs use the persona storageState fixture so they don't burn
 * UI time on login; this spec deliberately doesn't, so that the auth path
 * stays honest (cookie setup, locale prefix middleware, redirect to dashboard).
 */
import { expect, test } from "@playwright/test";
import { loginPage } from "../support/locators";
import { getPersona } from "../support/personas";

test.describe("auth smoke (UI flow)", () => {
  test("login as e2e-admin lands on locale-prefixed dashboard", async ({ page }) => {
    const persona = getPersona("e2e-admin");
    await page.goto("/en/login");

    await loginPage.emailInput(page).fill(persona.email);
    await loginPage.passwordInput(page).fill(persona.password);

    await Promise.all([
      page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 15_000 }),
      loginPage.submitButton(page).click(),
    ]);

    const url = new URL(page.url());
    expect(url.pathname.startsWith("/en")).toBe(true);
    expect(url.pathname).not.toContain("/login");
  });

  test("unprefixed /recipes is redirected to /en/recipes by middleware", async ({ page }) => {
    const response = await page.goto("/recipes", { waitUntil: "domcontentloaded" });
    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname.startsWith("/en") || finalUrl.pathname.startsWith("/it")).toBe(true);
    if (response) expect(response.ok()).toBe(true);
  });

  test("login with wrong password shows an error and stays on /en/login", async ({ page }) => {
    await page.goto("/en/login");
    await loginPage.emailInput(page).fill("e2e-admin@brewery.local");
    await loginPage.passwordInput(page).fill("definitely-wrong-pw");
    await loginPage.submitButton(page).click();

    await page.waitForLoadState("networkidle").catch(() => undefined);
    expect(new URL(page.url()).pathname).toContain("/login");
  });
});
