"use client";

import { useTranslations } from "next-intl";

import { DashboardClient } from "../../DashboardClient";
import { Link } from "../../../src/i18n/navigation";

export default function BrewdayStepsPage() {
  const t = useTranslations("dashboard.brewdaySteps");

  return (
    <>
      <DashboardClient />

      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="brew-muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <p className="brew-muted">
        <Link href="/">{t("backToDashboard")}</Link>
      </p>

      <section className="brew-panel" aria-labelledby="brew-steps-heading">
        <h2 id="brew-steps-heading" style={{ marginTop: 0 }}>
          {t("sections.brewSteps.title")}
        </h2>
        <p className="brew-muted" style={{ marginBottom: 0 }}>
          {t("sections.brewSteps.empty")}
        </p>
      </section>
    </>
  );
}

