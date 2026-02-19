"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type Topic = "i18n" | "raw-materials" | null;

function parseTopic(v: string | null): Topic {
  if (v === "i18n") return "i18n";
  if (v === "raw-materials") return "raw-materials";
  return null;
}

export default function ContributingPage() {
  const t = useTranslations("contributing");
  const tI18n = useTranslations("i18nContributing");

  const searchParams = useSearchParams();
  const topic = useMemo(() => parseTopic(searchParams?.get("topic") ?? null), [searchParams]);

  const [openI18n, setOpenI18n] = useState(false);
  const [openRawMaterials, setOpenRawMaterials] = useState(false);

  const i18nRef = useRef<HTMLDetailsElement | null>(null);
  const rawMaterialsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    if (topic === "i18n") {
      setOpenI18n(true);
      setOpenRawMaterials(false);
      // After state applies, scroll.
      setTimeout(() => i18nRef.current?.scrollIntoView({ block: "start" }), 0);
      return;
    }
    if (topic === "raw-materials") {
      setOpenI18n(false);
      setOpenRawMaterials(true);
      setTimeout(() => rawMaterialsRef.current?.scrollIntoView({ block: "start" }), 0);
      return;
    }
    setOpenI18n(false);
    setOpenRawMaterials(false);
  }, [topic]);

  return (
    <div style={{ maxWidth: 860, display: "grid", gap: 16 }}>
      <h1 style={{ marginTop: 0 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <section className="panel">
        <details ref={i18nRef} open={openI18n} onToggle={(e) => setOpenI18n(e.currentTarget.open)}>
          <summary style={{ cursor: "pointer" }}>
            <h2 style={{ margin: 0, display: "inline" }}>{t("sections.i18n.title")}</h2>
          </summary>
          <div style={{ marginTop: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>
              {tI18n("subtitle")}
            </p>

            <h3 style={{ marginBottom: 6 }}>{tI18n("howItWorksTitle")}</h3>
            <ul>
              <li>{tI18n("howItWorks1")}</li>
              <li>
                {tI18n("howItWorks2Prefix")} <code>apps/web/messages/en.json</code> {tI18n("howItWorks2Middle")}{" "}
                <code>apps/web/messages/it.json</code>.
              </li>
              <li>{tI18n("howItWorks3")}</li>
            </ul>

            <h3 style={{ marginBottom: 6 }}>{tI18n("recommendedToolTitle")}</h3>
            <p>{tI18n("recommendedToolBody")}</p>
            <ul>
              <li>{tI18n("recommendedTool1")}</li>
              <li>{tI18n("recommendedTool2")}</li>
            </ul>

            <h3 style={{ marginBottom: 6 }}>{tI18n("githubFallbackTitle")}</h3>
            <p className="muted">{tI18n("githubFallbackBody")}</p>

            <h3 style={{ marginBottom: 6 }}>{tI18n("rulesTitle")}</h3>
            <ul>
              <li>{tI18n("rule1", { url: "{url}" })}</li>
              <li>{tI18n("rule2")}</li>
              <li>{tI18n("rule3")}</li>
            </ul>
          </div>
        </details>
      </section>

      <section className="panel">
        <details ref={rawMaterialsRef} open={openRawMaterials} onToggle={(e) => setOpenRawMaterials(e.currentTarget.open)}>
          <summary style={{ cursor: "pointer" }}>
            <h2 style={{ margin: 0, display: "inline" }}>{t("sections.rawMaterials.title")}</h2>
          </summary>
          <div style={{ marginTop: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>
              {t("sections.rawMaterials.subtitle")}
            </p>
            <ol>
              <li>{t("sections.rawMaterials.step1")}</li>
              <li>{t("sections.rawMaterials.step2")}</li>
              <li>{t("sections.rawMaterials.step3")}</li>
            </ol>
            <p className="muted" style={{ marginBottom: 0 }}>
              {t("sections.rawMaterials.issueTemplateNote")}
            </p>
          </div>
        </details>
      </section>
    </div>
  );
}

