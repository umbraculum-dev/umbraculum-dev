"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { AuthMeResponse } from "@brewery/contracts";
import { parseAuthMeResponse } from "@brewery/contracts";

import { apiFetch } from "./apiClient";

export type { AuthMeResponse };

type State =
  | { status: "loading" }
  | { status: "ready"; me: AuthMeResponse }
  | { status: "error"; error: string };

export function useRequireAuth(options?: { requireActiveWorkspace?: boolean; requireActiveAccount?: boolean }) {
  const requireActiveWorkspace = Boolean(options?.requireActiveWorkspace ?? options?.requireActiveAccount);

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void (async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        if (!res.ok) {
          // Not authenticated -> go to login, preserve where we were going.
          const qs = searchParams?.toString();
          const current = `${pathname ?? `/${locale}`}${qs ? `?${qs}` : ""}`;
          router.replace(`/${locale}/login?next=${encodeURIComponent(current)}`);
          return;
        }
        const me = parseAuthMeResponse(res.data);
        if (requireActiveWorkspace && !me.activeWorkspaceId) {
          router.replace(`/${locale}/select-workspace`);
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
  }, [locale, pathname, requireActiveWorkspace, router, searchParams]);

  return state;
}

