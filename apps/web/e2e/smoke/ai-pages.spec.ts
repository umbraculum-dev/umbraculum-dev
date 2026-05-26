/**
 * ai-pages.spec.ts - the 4 web AI routes each render their H1 (no silent
 * redirect, no silent empty body).
 *
 * Why this exists: in commit `d47f35a` (Sprint #1+#2 backbone landing)
 * all 4 AI pages wrapped their content in `<DashboardClient>...children...</DashboardClient>`, which silently discarded the children
 * because `DashboardClient` is a side-effect component, not a layout
 * wrapper. The fix in `715bbea` unwrapped the content and added
 * `children?: never` typing to make the misuse a TypeScript error.
 *
 * This spec catches the regression *class* — if any AI page ever
 * silently fails to render its top-level H1 (because of a wrapper bug,
 * a redirect, a tier-gate, an i18n key crash, or anything else), one
 * of these assertions will fail. The deterministic H1 IDs
 * (`ai-page-title`, `ai-settings-title`, etc.) are stable selectors
 * that are robust to i18n string changes.
 *
 * Persona: `e2e-admin` (the default in `auth-fixture.ts`). The
 * `/en/ai/settings` page and `/en/ai/usage` page require admin role
 * to render their full UI; the H1 itself is rendered for any
 * authenticated user with an active workspace.
 */
import { test, expect } from "../support/auth-fixture";

test.describe("AI pages smoke (authenticated)", () => {
  test("/en/ai renders the chat page heading", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/en/ai");
    await expect(authenticatedPage).toHaveURL(/\/en\/ai(?:\?|$)/);
    await expect(authenticatedPage.locator("#ai-page-title")).toBeVisible();
  });

  test("/en/ai/settings renders the settings heading", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/en/ai/settings");
    await expect(authenticatedPage).toHaveURL(/\/en\/ai\/settings(?:\?|$)/);
    await expect(authenticatedPage.locator("#ai-settings-title")).toBeVisible();
  });

  test("/en/ai/usage renders the usage dashboard heading", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/en/ai/usage");
    await expect(authenticatedPage).toHaveURL(/\/en\/ai\/usage(?:\?|$)/);
    await expect(authenticatedPage.locator("#ai-usage-title")).toBeVisible();
  });

  test("/en/ai/upgrade renders the upgrade heading", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/en/ai/upgrade");
    await expect(authenticatedPage).toHaveURL(/\/en\/ai\/upgrade(?:\?|$)/);
    await expect(authenticatedPage.locator("#ai-upgrade-title")).toBeVisible();
  });
});
