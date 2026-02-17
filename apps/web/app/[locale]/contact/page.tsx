"use client";

import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");

  const email = t("emailAddress");
  const subject = t("mailtoSubject");
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <section className="panel" aria-labelledby="contact-email-heading" style={{ marginTop: 16 }}>
        <h2 id="contact-email-heading" style={{ marginTop: 0 }}>
          {t("emailHeading")}
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {t("emailLabel")} <code>{email}</code>
        </p>
        <p style={{ marginBottom: 0 }}>
          <a href={href}>{t("emailCta")}</a>
        </p>
      </section>
    </>
  );
}

