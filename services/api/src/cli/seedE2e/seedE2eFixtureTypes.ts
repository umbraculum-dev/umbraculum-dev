/**
 * Idempotent E2E fixture seeder.
 *
 * Creates a known set of users, a workspace, a BeerJSON recipe, a water profile
 * and a brew session draft so that smoke/Playwright/agentic-browser tests can
 * share identities and content. Re-running is safe (all upserts).
 *
 * Run inside the `api` container:
 *   docker compose exec api npm run seed:e2e
 *
 * Clean (remove the fixture rows):
 *   docker compose exec api npm run seed:e2e -- --clean
 *
 * The fixture identities are documented as the single source of truth in
 * docs/TESTING.md "E2E fixture identities".
 */
export const E2E_USER_ADMIN_ID = "e2e00000-0000-0000-0000-000000000aaa";
export const E2E_USER_MEMBER_ID = "e2e00000-0000-0000-0000-000000000bbb";
export const E2E_USER_VIEWER_ID = "e2e00000-0000-0000-0000-000000000ccc";
export const E2E_USER_MULTI_ADMIN_ID = "e2e00000-0000-0000-0000-000000000ddd";
export const E2E_WORKSPACE_ID = "e2e00000-0000-0000-0000-0000000000aa";
export const E2E_WORKSPACE_2_ID = "e2e00000-0000-0000-0000-0000000000bb";
export const E2E_RECIPE_ID = "e2e00000-0000-0000-0000-000000000abc";
export const E2E_RECIPE_VERSION_GROUP_ID = E2E_RECIPE_ID;
export const E2E_WATER_PROFILE_ID = "e2e00000-0000-0000-0000-000000000fff";
export const E2E_BREW_SESSION_ID = "e2e00000-0000-0000-0000-000000000bbe";
export const E2E_EQUIPMENT_PROFILE_ID = "e2e00000-0000-0000-0000-000000000e01";
export const E2E_VESSEL_ID = "e2e00000-0000-0000-0000-000000000e02";
export const E2E_BREW_SESSION_MASH_STEP_ID = "e2e00000-0000-0000-0000-000000000e03";
export const E2E_BREW_SESSION_BOIL_STEP_ID = "e2e00000-0000-0000-0000-000000000e04";

const ADMIN_EMAIL = "e2e-admin@brewery.local";
const MEMBER_EMAIL = "e2e-member@brewery.local";
const VIEWER_EMAIL = "e2e-viewer@brewery.local";
const MULTI_ADMIN_EMAIL = "e2e-multi-admin@brewery.local";
// `||` (not `??`) so that empty-string env values fall back to defaults.
// Compose injects `E2E_*_PASSWORD: ${VAR:-}` which becomes "" (not undefined)
// when .env omits the override; without this, "" gets hashed as the password
// and every E2E persona returns 401 on login.
const ADMIN_PASSWORD = process.env['E2E_ADMIN_PASSWORD'] || "e2e-admin-pw!";
const MEMBER_PASSWORD = process.env['E2E_MEMBER_PASSWORD'] || "e2e-member-pw!";
const VIEWER_PASSWORD = process.env['E2E_VIEWER_PASSWORD'] || "e2e-viewer-pw!";
const MULTI_ADMIN_PASSWORD = process.env['E2E_MULTI_ADMIN_PASSWORD'] || "e2e-multi-admin-pw!";


export interface Persona {
  id: string;
  email: string;
  password: string;
  role: "brewery_admin" | "member" | "viewer";
}

export const PERSONAS: Persona[] = [
  { id: E2E_USER_ADMIN_ID, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "brewery_admin" },
  { id: E2E_USER_MEMBER_ID, email: MEMBER_EMAIL, password: MEMBER_PASSWORD, role: "member" },
  { id: E2E_USER_VIEWER_ID, email: VIEWER_EMAIL, password: VIEWER_PASSWORD, role: "viewer" },
  {
    id: E2E_USER_MULTI_ADMIN_ID,
    email: MULTI_ADMIN_EMAIL,
    password: MULTI_ADMIN_PASSWORD,
    role: "brewery_admin",
  },
];
