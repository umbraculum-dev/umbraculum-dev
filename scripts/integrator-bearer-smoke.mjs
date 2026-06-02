#!/usr/bin/env node
/**
 * Platform-only integrator smoke: bearer login + typed facades (@umbraculum/api-client).
 * No brewery vertical required. Canonical copy synced to umbraculum-integrator-sample/quickstart.mjs
 *
 * Env:
 *   UMBRACULUM_BASE_URL  (default http://localhost:18080)
 *   UMBRACULUM_EMAIL     (default e2e-admin@brewery.local)
 *   UMBRACULUM_PASSWORD  (default e2e-admin-pw!)
 */
import {
  bearerTokenAuth,
  createApiClient,
  getAuthMe,
  getHealth,
  listWorkspaces,
  loginNative,
} from "@umbraculum/api-client";

const BASE_URL = process.env.UMBRACULUM_BASE_URL ?? "http://localhost:18080";
const EMAIL = process.env.UMBRACULUM_EMAIL ?? "e2e-admin@brewery.local";
const PASSWORD = process.env.UMBRACULUM_PASSWORD ?? "e2e-admin-pw!";
const COLD_START_RETRIES = Number(process.env.UMBRACULUM_COLD_START_RETRIES ?? "15");
const COLD_START_DELAY_MS = Number(process.env.UMBRACULUM_COLD_START_DELAY_MS ?? "2000");

async function waitForHealthUrl() {
  const url = `${BASE_URL.replace(/\/$/, "")}/api/health`;
  for (let i = 0; i < COLD_START_RETRIES; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const body = await res.json();
        if (body?.ok === true) {
          console.log("[integrator-bearer] GET /api/health ok=true");
          return;
        }
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, COLD_START_DELAY_MS));
  }
  console.error(
    `[integrator-bearer] stack not reachable at ${BASE_URL} after ${COLD_START_RETRIES} attempts`,
  );
  process.exit(2);
}

let token = "";
const client = createApiClient(BASE_URL, bearerTokenAuth(() => token));

await waitForHealthUrl();

const login = await loginNative(client, {
  email: EMAIL,
  password: PASSWORD,
  preferredLocale: "en",
});
token = login.token;
console.log(`[integrator-bearer] loginNative token acquired (${token.length} chars)`);

const me = await getAuthMe(client);
console.log(`[integrator-bearer] auth/me workspaces=${me.workspaces.length}`);

const { workspaces } = await listWorkspaces(client);
console.log(
  `[integrator-bearer] workspaces: ${workspaces.map((w) => w.name).join(", ") || "(none)"}`,
);

const health = await getHealth(client);
if (!health.ok) {
  console.error("[integrator-bearer] getHealth ok!=true");
  process.exit(1);
}
console.log("[integrator-bearer] getHealth ok=true");

console.log("OK: integrator bearer smoke passed (platform-only)");
