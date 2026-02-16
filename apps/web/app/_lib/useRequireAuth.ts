"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { apiFetch } from "./apiClient";

export type AuthMeResponse = {
  ok: true;
  user: { id: string; email: string; preferredLocale: string };
  accounts: Array<{ id: string; name: string; role: string }>;
  activeAccountId: string | null;
  role: string | null;
};

type State =
  | { status: "loading" }
  | { status: "ready"; me: AuthMeResponse }
  | { status: "error"; error: string };

export function useRequireAuth(options?: { requireActiveAccount?: boolean }) {
  const requireActiveAccount = Boolean(options?.requireActiveAccount);

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    (async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        if (!res.ok) {
          // Not authenticated -> go to login, preserve where we were going.
          const qs = searchParams?.toString();
          const current = `${pathname ?? `/${locale}`}${qs ? `?${qs}` : ""}`;
          router.replace(`/${locale}/login?next=${encodeURIComponent(current)}`);
          return;
        }
        const me = res.data as AuthMeResponse;
        if (requireActiveAccount && !me.activeAccountId) {
          router.replace(`/${locale}/select-account`);
          return;
        }
        if (!cancelled) setState({ status: "ready", me });
      } catch (err) {
        if (!cancelled) setState({ status: "error", error: String(err) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, pathname, requireActiveAccount, router, searchParams]);

  return state;
}

