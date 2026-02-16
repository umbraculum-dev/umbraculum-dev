"use client";

import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>
    </>
  );
}

