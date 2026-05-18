/**
 * Central locator helpers for the umbraculum-dev web E2E suite.
 *
 * Per docs/DEVELOPMENT-LOCAL.md "Accessibility-first":
 *   Prefer getByRole / getByLabel; reserve data-testid for workflow-critical
 *   custom widgets only.
 *
 * Add new locators here rather than inline-ing them in specs so that they can
 * be reused by the browser-MCP agentic layer (.cursor/skills/agentic-browser-web-app.md + docs/agentic-jobs.md).
 */
import type { Locator, Page } from "@playwright/test";

export const loginPage = {
  emailInput: (page: Page): Locator => page.getByLabel(/email/i).first(),
  passwordInput: (page: Page): Locator => page.getByLabel(/password/i).first(),
  submitButton: (page: Page): Locator =>
    page.getByRole("button", { name: /^log in$|^sign in$|^login$/i }).first(),
};

export const signupPage = {
  emailInput: (page: Page): Locator => page.getByLabel(/email/i).first(),
  passwordInput: (page: Page): Locator => page.getByLabel(/password/i).first(),
  workspaceNameInput: (page: Page): Locator =>
    page
      .getByLabel(/workspace|brewery name|account/i)
      .first(),
  submitButton: (page: Page): Locator =>
    page.getByRole("button", { name: /sign up|create account|register/i }).first(),
};

export const dashboard = {
  greetingHeading: (page: Page): Locator => page.getByRole("heading").first(),
};

export const selectWorkspacePage = {
  pickWorkspaceByName: (page: Page, name: string): Locator =>
    page.getByRole("button", { name: new RegExp(name, "i") }).first(),
};

export const recipeList = {
  recipeLink: (page: Page, name: string): Locator =>
    page.getByRole("link", { name: new RegExp(name, "i") }).first(),
};
