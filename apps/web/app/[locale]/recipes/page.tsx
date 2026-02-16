"use client";

import { useTranslations } from "next-intl";

import { Link } from "../../../src/i18n/navigation";

export default function RecipesPage() {
  const t = useTranslations("recipes");
  const c = useTranslations("common");
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <p>{t("instructions")}</p>

      <ul>
        <li>
          <Link href="/">{c("backToDashboard")}</Link>
        </li>
      </ul>
    </>
  );
}

