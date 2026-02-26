/**
 * Shared API fetch helper for the web app.
 *
 * - Cookie-based auth: browser sends the session cookie automatically.
 * - Parses JSON when possible, but safely falls back to raw text to avoid
 *   `SyntaxError: Unexpected token '<'` masking the real server response.
 */
let hadValidSessionInThisTab = false;
let authExpiredEmittedAtMs: number | null = null;

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
  // - Only emit if we previously had a valid session in this tab.
  if (typeof window !== "undefined" && res.status === 401) {
    const method = (init?.method ?? "GET").toUpperCase();
    const isLogin = method === "POST" && path === "/api/auth/login";
    const isSignup = method === "POST" && path === "/api/auth/signup";

    const shouldEmit = hadValidSessionInThisTab && !isLogin && !isSignup;
    if (shouldEmit) {
      try {
        const next = `${window.location.pathname}${window.location.search ?? ""}`;
        const now = Date.now();
        const recentlyEmitted = authExpiredEmittedAtMs != null && now - authExpiredEmittedAtMs < 30_000;
        if (!recentlyEmitted) {
          authExpiredEmittedAtMs = now;
          hadValidSessionInThisTab = false;
          window.dispatchEvent(new CustomEvent("brewery:auth-expired", { detail: { next } }));
        }
        // Keep existing listeners in sync (e.g. PrimaryNav’s auth polling).
        window.dispatchEvent(new Event("brewery:auth-changed"));
      } catch {
        // ignore
      }
    }
  }

  // Track whether this tab has ever had a successful session so we only show
  // “session expired” when we actually expire, not when the user is simply logged out.
  if (typeof window !== "undefined") {
    const method = (init?.method ?? "GET").toUpperCase();
    const isAuthMe = method === "GET" && path === "/api/auth/me";
    const isLogin = method === "POST" && path === "/api/auth/login";
    const isSignup = method === "POST" && path === "/api/auth/signup";
    const isLogout = method === "POST" && path === "/api/auth/logout";

    if (res.ok && (isAuthMe || isLogin || isSignup)) {
      hadValidSessionInThisTab = true;
    }
    if (isLogout) {
      hadValidSessionInThisTab = false;
      authExpiredEmittedAtMs = null;
    }
  }

  return { ok: res.ok, status: res.status, data };
}

