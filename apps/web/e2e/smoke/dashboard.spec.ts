/**
 * dashboard.spec.ts - logged-in landing page renders and has no critical a11y violations.
 */
import { test, expect } from "../support/auth-fixture";
import { expectNoCriticalA11yViolations } from "../support/axe";

test.describe("dashboard smoke (authenticated)", () => {
  test("dashboard renders for e2e-admin and is a11y-critical-clean", async ({ authenticatedPage }, testInfo) => {
    await authenticatedPage.goto("/en/");
    await expect(authenticatedPage).toHaveURL(/\/en\b/);

    const heading = authenticatedPage.getByRole("heading").first();
    await expect(heading).toBeVisible();

    await expectNoCriticalA11yViolations(authenticatedPage, testInfo);
  });
});
