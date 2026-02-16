"use client";

import { HealthPanel } from "../HealthPanel";
import { DashboardClient } from "../DashboardClient";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("dashboard");
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>
      <HealthPanel />
      <DashboardClient />
    </>
  );
}

