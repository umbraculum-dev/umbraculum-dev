"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../../src/i18n/navigation";

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="brew-muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>
      <p className="brew-muted" style={{ marginTop: 12 }}>
        {t("translationsRowPrefix")}{" "}
        <Link href="/contributing?topic=i18n">{t("translationsRowLinkText")}</Link> {t("translationsRowSuffix")}
      </p>
      <p className="brew-muted" style={{ marginTop: 8 }}>
        {t("translationsSideNote")}
      </p>
    </>
  );
}

