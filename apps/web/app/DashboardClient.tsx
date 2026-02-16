"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function DashboardClient() {
  const locale = useLocale();
  const router = useRouter();
  // Avoid hydration mismatches caused by browser extensions (e.g. password managers)
  // injecting DOM into form fields before React hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (cancelled) return;
      if (res.status === 401) router.replace(`/${locale}/login?next=/${locale}`);
      else if (res.ok) return;
      // For any other error, also route to login (simple behavior for now)
      else router.replace(`/${locale}/login?next=/${locale}`);
    })().catch(() => {
      if (!cancelled) router.replace(`/${locale}/login?next=/${locale}`);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, mounted, router]);

  if (!mounted) return <p className="muted">Loading…</p>;
  return null;
}

