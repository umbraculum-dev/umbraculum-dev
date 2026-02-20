"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";

export function ImportExportPanel(props: { headingId: string; className?: string }) {
  const t = useTranslations("dashboard");
  const { headingId, className } = props;

  return (
    <section className={`panel${className ? ` ${className}` : ""}`} aria-labelledby={headingId}>
      <h2 id={headingId} style={{ marginTop: 0 }}>
        {t("importExport.title")}
      </h2>
      <p className="brew-muted" style={{ marginTop: 0 }}>
        {t("importExport.supportedNote")}
      </p>
      <ul className="brew-muted" style={{ marginTop: 8, marginBottom: 0 }}>
        <li>{t("importExport.importFormats")}</li>
        <li>{t("importExport.exportFormats")}</li>
      </ul>
      <p className="brew-muted" style={{ marginTop: 10, marginBottom: 0 }}>
        {t("importExport.actionsLiveInRecipes")} <Link href="/recipes">{t("importExport.actionsCta")}</Link>
      </p>
      <p className="brew-muted" style={{ marginTop: 10, marginBottom: 0 }}>
        {t("importExport.customImportNote")} <Link href="/contact">{t("importExport.customImportCta")}</Link>
      </p>
    </section>
  );
}

