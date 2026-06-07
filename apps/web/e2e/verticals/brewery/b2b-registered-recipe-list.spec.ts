/**
 * recipe-list.spec.ts - the seeded "E2E Pale Ale" recipe shows up in the list
 * and the workspace-scoped /api/recipes endpoint returns it for the admin persona.
 */
import { test, expect } from "../../support/auth-fixture";
import { getFixtureIdentities } from "../../support/personas";

test.describe("recipe list smoke (authenticated)", () => {
  test("seeded E2E Pale Ale appears in the recipe list UI", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/en/recipes");
    await expect(authenticatedPage).toHaveURL(/\/en\/recipes/);

    // /en/recipes renders four collapsible disclosures (Create / Import /
    // Your recipes / Export). The seeded recipe lives inside the
    // "Your recipes" disclosure, which is collapsed by default. Mirror
    // what a real user does: open the disclosure first, then assert.
    const yourRecipesDisclosure = authenticatedPage.getByRole("button", {
      name: /your recipes/i,
    });
    await expect(yourRecipesDisclosure).toBeVisible({ timeout: 15_000 });
    await yourRecipesDisclosure.click();

    const recipeLink = authenticatedPage.getByText(/E2E Pale Ale/i).first();
    await expect(recipeLink).toBeVisible({ timeout: 15_000 });
  });

  test("GET /api/recipes (workspace-scoped) contains the seeded recipe id", async ({ authenticatedContext }) => {
    const fixture = getFixtureIdentities();
    const response = await authenticatedContext.request.get("/api/recipes");
    expect(response.status(), `unexpected status: ${await response.text().catch(() => "")}`).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    const found = (body.recipes ?? []).some((r: { id: string }) => r.id === fixture.recipeId);
    expect(found, `expected recipeId ${fixture.recipeId} to appear in /api/recipes`).toBe(true);
  });
});
