/**
 * Playwright fixture: per-persona authenticated BrowserContext.
 *
 * Logs in via the real `POST /api/auth/login` UI route ONCE per persona by
 * loading the persisted storageState file if present, otherwise driving the
 * login form and saving the cookie. This keeps each spec deterministic without
 * burning UI time on every test (only auth.spec.ts intentionally tests the
 * login UI itself, top-to-bottom).
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { test as base, type BrowserContext, type Page } from "@playwright/test";
import { getPersona, storageStatePath, type Persona, type PersonaKey } from "./personas";
import { loginPage } from "./locators";

interface PersonaContextOptions {
  forceFresh?: boolean;
}

async function performLoginUiFlow(page: Page, persona: Persona): Promise<void> {
  await page.goto("/en/login");
  await loginPage.emailInput(page).fill(persona.email);
  await loginPage.passwordInput(page).fill(persona.password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 15_000 }),
    loginPage.submitButton(page).click(),
  ]);
}

async function loginPersonaAndSaveState(
  baseURL: string,
  persona: Persona,
  storagePath: string,
  newContext: (storageStateOverride?: string) => Promise<BrowserContext>,
): Promise<void> {
  mkdirSync(path.dirname(storagePath), { recursive: true });
  const context = await newContext(undefined);
  try {
    const page = await context.newPage();
    await performLoginUiFlow(page, persona);
    await context.storageState({ path: storagePath });
  } finally {
    await context.close();
  }
}

interface Fixtures {
  persona: Persona;
  authenticatedContext: BrowserContext;
  authenticatedPage: Page;
}

export const test = base.extend<Fixtures & { personaKey: PersonaKey }>({
  personaKey: ["e2e-admin", { option: true }],

  persona: async ({ personaKey }, use) => {
    await use(getPersona(personaKey));
  },

  authenticatedContext: async ({ browser, baseURL, persona }, use) => {
    if (!baseURL) throw new Error("baseURL must be configured for authenticatedContext");
    const storagePath = storageStatePath(persona.key);

    if (!existsSync(storagePath)) {
      await loginPersonaAndSaveState(baseURL, persona, storagePath, () => browser.newContext());
    }

    const context = await browser.newContext({ storageState: storagePath });
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    try {
      await use(page);
    } finally {
      await page.close();
    }
  },
});

export const expect = test.expect;
export type { PersonaContextOptions };
