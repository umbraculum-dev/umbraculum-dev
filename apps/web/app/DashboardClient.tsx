"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { SizableText } from "tamagui";

import { fetchAuthMe } from "./_lib/fetchAuthMe.js";

/**
 * Props for `DashboardClient`.
 *
 * This component is a **side-effect** component, not a layout wrapper. Its
 * only job is to trigger a centralized `/api/auth/me` call so the global
 * 401 banner + timed redirect behavior is consistent across pages.
 *
 * It does **not** render `children`. If you wrap content with it
 * (`<DashboardClient>{kids}</DashboardClient>`), the children are silently
 * dropped from the DOM with no error. The `children?: never` declaration
 * below makes that misuse a TypeScript error instead of a silent bug.
 *
 * Correct usage: place `<DashboardClient />` as a self-closing sibling
 * somewhere in your page tree (typically near the bottom). See for example
 * `apps/web/app/[locale]/inventory/page.tsx`.
 */
interface DashboardClientProps {
  /** Forbidden. This component does not render children. */
  children?: never;
}

export function DashboardClient(_props: DashboardClientProps = {}) {
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
      // Trigger centralized 401 handling (banner + timed redirect) via fetchAuthMe.
      await fetchAuthMe();
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale, mounted]);

  if (!mounted) return <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{tCommon("loading")}</SizableText>;
  return null;
}

