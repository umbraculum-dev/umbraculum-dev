/**
 * Shared API fetch helper for the web app.
 *
 * - Cookie-based auth: browser sends the session cookie automatically.
 * - Parses JSON when possible, but safely falls back to raw text to avoid
 *   `SyntaxError: Unexpected token '<'` masking the real server response.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, credentials: "same-origin" });
  const text = await res.text();

  let data: unknown = text;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    // keep text
  }

  return { ok: res.ok, status: res.status, data };
}

