"use client";

import { useTranslations } from "next-intl";

import { DashboardClient } from "../../DashboardClient";
import { Link } from "../../../src/i18n/navigation";

export default function FermDataIntegrationPage() {
  const t = useTranslations("dashboard.fermDataIntegration");

  return (
    <>
      <DashboardClient />

      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <p className="muted">
        <Link href="/">{t("backToDashboard")}</Link>
      </p>

      <section className="panel" aria-labelledby="integration-heading">
        <h2 id="integration-heading" style={{ marginTop: 0 }}>
          {t("sections.integration.title")}
        </h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          {t("sections.integration.empty")}
        </p>
      </section>
    </>
  );
}

