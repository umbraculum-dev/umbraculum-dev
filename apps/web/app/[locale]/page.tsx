"use client";

import { HealthPanel } from "../HealthPanel";
import { DashboardClient } from "../DashboardClient";
import { useTranslations } from "next-intl";
import { ImportExportPanel } from "../_components/ImportExportPanel";
import { Link } from "../../src/i18n/navigation";

export default function Home() {
  const t = useTranslations("dashboard");
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="brew-muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>
      <HealthPanel />
      <ImportExportPanel headingId="import-export-heading" className="" />

      <section className="brew-panel" aria-labelledby="dashboard-links-heading" style={{ marginTop: 16 }}>
        <h2 id="dashboard-links-heading" style={{ marginTop: 0 }}>
          {t("links.title")}
        </h2>
        <ul style={{ marginTop: 8, marginBottom: 0 }}>
          <li>
            <Link href="/ferm-data-integration">{t("links.fermDataIntegration")}</Link>
          </li>
          <li>
            <Link href="/brewday-steps">{t("links.brewdaySteps")}</Link>
          </li>
          <li>
            <Link href="/water-profiles">{t("links.waterProfiles")}</Link>
          </li>
        </ul>
      </section>

      <DashboardClient />
    </>
  );
}

