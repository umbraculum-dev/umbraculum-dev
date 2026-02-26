"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { SizableText } from "tamagui";

import { apiFetch } from "./_lib/apiClient";

export function DashboardClient() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  // Avoid hydration mismatches caused by browser extensions (e.g. password managers)
  // injecting DOM into form fields before React hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      // Trigger centralized 401 handling (banner + timed redirect) via apiFetch.
      await apiFetch("/api/auth/me");
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale, mounted]);

  if (!mounted) return <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{tCommon("loading")}</SizableText>;
  return null;
}

