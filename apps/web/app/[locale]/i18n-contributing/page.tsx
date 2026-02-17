"use client";

import { useTranslations } from "next-intl";

export default function I18nContributingPage() {
  const t = useTranslations("i18nContributing");

  return (
    <section className="panel" style={{ maxWidth: 860 }}>
      <h1 style={{ marginTop: 0 }}>{t("title")}</h1>

      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <h2>{t("howItWorksTitle")}</h2>
      <ul>
        <li>{t("howItWorks1")}</li>
        <li>
          {t("howItWorks2Prefix")} <code>apps/web/messages/en.json</code> {t("howItWorks2Middle")}{" "}
          <code>apps/web/messages/it.json</code>.
        </li>
        <li>{t("howItWorks3")}</li>
      </ul>

      <h2>{t("recommendedToolTitle")}</h2>
      <p>{t("recommendedToolBody")}</p>
      <ul>
        <li>{t("recommendedTool1")}</li>
        <li>{t("recommendedTool2")}</li>
      </ul>

      <h2>{t("githubFallbackTitle")}</h2>
      <p className="muted">{t("githubFallbackBody")}</p>

      <h2>{t("rulesTitle")}</h2>
      <ul>
        <li>{t("rule1", { url: "{url}" })}</li>
        <li>{t("rule2")}</li>
        <li>{t("rule3")}</li>
      </ul>
    </section>
  );
}

