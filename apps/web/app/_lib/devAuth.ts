export const DEV_AUTH_STORAGE_KEY = "brewery_dev_headers_v1";

export type DevAuth = {
  userId: string;
  activeAccountId: string;
};

const EMPTY_AUTH: DevAuth = { userId: "", activeAccountId: "" };

let cachedRaw: string | null | undefined;
let cachedAuth: DevAuth | undefined;

function parseDevAuthRaw(raw: string | null | undefined): DevAuth {
  if (!raw) {
    // Helpful defaults for local dev (seeded IDs).
    return {
      userId: "00000000-0000-0000-0000-000000000001",
      activeAccountId: "00000000-0000-0000-0000-0000000000a1",
    };
  }

  // Backwards-compatible: older versions stored `accountId`.
  const parsed = JSON.parse(raw) as Partial<DevAuth> & { accountId?: string };
  return {
    userId: parsed.userId ?? "",
    activeAccountId: parsed.activeAccountId ?? parsed.accountId ?? "",
  };
}

/**
 * Stable snapshot for `useSyncExternalStore`.
 *
 * Important: this function MUST return the exact same object reference
 * if the underlying storage value hasn't changed.
 */
export function getDevAuthSnapshot(): DevAuth {
  try {
    if (typeof window === "undefined") return EMPTY_AUTH;
    const raw = window.localStorage.getItem(DEV_AUTH_STORAGE_KEY);
    if (raw === cachedRaw && cachedAuth) return cachedAuth;
    cachedRaw = raw;
    cachedAuth = parseDevAuthRaw(raw);
    return cachedAuth;
  } catch {
    cachedRaw = undefined;
    cachedAuth = EMPTY_AUTH;
    return EMPTY_AUTH;
  }
}

export function getDevAuthServerSnapshot(): DevAuth {
  return EMPTY_AUTH;
}

export function loadDevAuthFromStorage(): DevAuth {
  try {
    return getDevAuthSnapshot();
  } catch {
    return EMPTY_AUTH;
  }
}

export function saveDevAuthToStorage(a: DevAuth) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DEV_AUTH_STORAGE_KEY, JSON.stringify(a));
    cachedRaw = JSON.stringify(a);
    cachedAuth = a;
    // Defer the notification to avoid cross-component setState warnings.
    queueMicrotask(() => window.dispatchEvent(new CustomEvent("brewery:devAuthChanged")));
  } catch {
    // ignore
  }
}

export function subscribeDevAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("brewery:devAuthChanged", callback as any);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("brewery:devAuthChanged", callback as any);
  };
}

