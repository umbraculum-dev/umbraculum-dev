/**
 * Centralized session-expired UX state shared by apiFetch and fetchAuthMe.
 */

let hadValidSessionInThisTab = false;
let authExpiredEmittedAtMs: number | null = null;

export function markSessionValidFromAuthEndpoint(
  path: string,
  method: string,
  ok: boolean,
): void {
  if (typeof window === "undefined" || !ok) return;

  const upper = method.toUpperCase();
  const isAuthMe = upper === "GET" && path === "/api/auth/me";
  const isLogin = upper === "POST" && path === "/api/auth/login";
  const isSignup = upper === "POST" && path === "/api/auth/signup";

  if (isAuthMe || isLogin || isSignup) {
    hadValidSessionInThisTab = true;
  }
}

export function markSessionLoggedOut(path: string, method: string): void {
  if (typeof window === "undefined") return;

  const upper = method.toUpperCase();
  const isLogout = upper === "POST" && path === "/api/auth/logout";

  if (isLogout) {
    hadValidSessionInThisTab = false;
    authExpiredEmittedAtMs = null;
  }
}

export function emitAuthExpiredIfNeeded(
  status: number,
  path: string,
  method: string,
): void {
  if (typeof window === "undefined" || status !== 401) return;

  const upper = method.toUpperCase();
  const isLogin = upper === "POST" && path === "/api/auth/login";
  const isSignup = upper === "POST" && path === "/api/auth/signup";

  const shouldEmit = hadValidSessionInThisTab && !isLogin && !isSignup;
  if (!shouldEmit) return;

  try {
    const next = `${window.location.pathname}${window.location.search ?? ""}`;
    const now = Date.now();
    const recentlyEmitted =
      authExpiredEmittedAtMs != null && now - authExpiredEmittedAtMs < 30_000;
    if (!recentlyEmitted) {
      authExpiredEmittedAtMs = now;
      hadValidSessionInThisTab = false;
      window.dispatchEvent(new CustomEvent("brewery:auth-expired", { detail: { next } }));
    }
    window.dispatchEvent(new Event("brewery:auth-changed"));
  } catch {
    // ignore
  }
}
