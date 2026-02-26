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

  // Centralized session-expired signal (401) to keep UX consistent.
  // - Do not emit for login/signup endpoints (wrong credentials must not show “session expired”).
  // - Do emit for /auth/me, /active-workspace, and all other protected endpoints.
  if (typeof window !== "undefined" && res.status === 401) {
    const method = (init?.method ?? "GET").toUpperCase();
    const isLogin = method === "POST" && path === "/api/auth/login";
    const isSignup = method === "POST" && path === "/api/auth/signup";

    if (!isLogin && !isSignup) {
      try {
        const next = `${window.location.pathname}${window.location.search ?? ""}`;
        window.dispatchEvent(new CustomEvent("brewery:auth-expired", { detail: { next } }));
        // Keep existing listeners in sync (e.g. PrimaryNav’s auth polling).
        window.dispatchEvent(new Event("brewery:auth-changed"));
      } catch {
        // ignore
      }
    }
  }

  return { ok: res.ok, status: res.status, data };
}

