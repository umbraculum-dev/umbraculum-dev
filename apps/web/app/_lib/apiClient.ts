import type { DevAuth } from "./devAuth";

/**
 * Shared API fetch helper for the web app.
 *
 * - Adds dev-auth headers (`X-User-Id`, `X-Account-Id`).
 * - Parses JSON when possible, but safely falls back to raw text to avoid
 *   `SyntaxError: Unexpected token '<'` masking the real server response.
 */
export async function apiFetch(path: string, auth: DevAuth, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  headers.set("X-User-Id", auth.userId);
  if (auth.activeAccountId) headers.set("X-Account-Id", auth.activeAccountId);

  const res = await fetch(path, { ...init, headers });
  const text = await res.text();

  let data: unknown = text;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    // keep text
  }

  return { ok: res.ok, status: res.status, data };
}

