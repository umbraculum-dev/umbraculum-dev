/**
 * Legacy cookie-session fetch helper for the web app.
 *
 * Phase E9 migrated all API call sites to `@umbraculum/api-client` typed facades via
 * `webPlatformApiClient()`. This module remains for:
 * - cookie transport (`credentials: "same-origin"`)
 * - session UX side effects (auth expiry redirect, logout/login markers)
 *
 * Do not add new `apiFetch` consumers — use facades from `webApiClient.ts` instead.
 * See [`docs/AUTH-STRATEGY.md`](../../../docs/AUTH-STRATEGY.md) and
 * [`packages/api-client/README.md`](../../../packages/api-client/README.md).
 */
import {
  emitAuthExpiredIfNeeded,
  markSessionLoggedOut,
  markSessionValidFromAuthEndpoint,
} from "./sessionAuthUx.js";

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, credentials: "same-origin" });
  const text = await res.text();

  let data: unknown = text;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    // keep text
  }

  const method = (init?.method ?? "GET").toUpperCase();

  emitAuthExpiredIfNeeded(res.status, path, method);
  markSessionValidFromAuthEndpoint(path, method, res.ok);
  markSessionLoggedOut(path, method);

  return { ok: res.ok, status: res.status, data };
}
