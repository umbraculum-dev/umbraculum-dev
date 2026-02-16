"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DevDashboard } from "./DevDashboard";

export function DashboardClient() {
  const t = useTranslations("devDashboard");
  // Avoid hydration mismatches caused by browser extensions (e.g. password managers)
  // injecting DOM into form fields before React hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <p className="muted">{t("loading")}</p>;
  return <DevDashboard />;
}

