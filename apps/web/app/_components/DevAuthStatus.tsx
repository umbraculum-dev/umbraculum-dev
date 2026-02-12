"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getDevAuthServerSnapshot, getDevAuthSnapshot, subscribeDevAuth } from "../_lib/devAuth";

export function DevAuthStatus() {
  const auth = useSyncExternalStore(
    subscribeDevAuth,
    () => getDevAuthSnapshot(),
    () => getDevAuthServerSnapshot(),
  );
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const a = auth;
    if (!a?.userId) return;
    (async () => {
      try {
        const res = await fetch("/api/me", {
          headers: {
            "X-User-Id": a.userId,
            ...(a.activeAccountId ? { "X-Account-Id": a.activeAccountId } : {}),
          },
        });
        const data = (await res.json()) as any;
        if (cancelled) return;
        setRole(res.ok && data?.ok ? (data.role ?? null) : null);
      } catch {
        if (!cancelled) setRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth?.userId, auth?.activeAccountId]);

  const has = Boolean(auth.userId && auth.activeAccountId);

  return (
    <span
      className="muted"
      role="status"
      aria-live="polite"
      style={{
        fontSize: 12,
        padding: "4px 8px",
        border: "1px solid var(--border)",
        borderRadius: 999,
        background: "var(--surface)",
      }}
    >
      {has ? (
        <>
          Dev: user <code>{auth.userId.slice(0, 8)}</code> · acct{" "}
          <code>{auth.activeAccountId.slice(0, 8)}</code>
          {role ? (
            <>
              {" "}
              · role <code>{role}</code>
            </>
          ) : null}
        </>
      ) : (
        <>Dev: missing headers</>
      )}
    </span>
  );
}

