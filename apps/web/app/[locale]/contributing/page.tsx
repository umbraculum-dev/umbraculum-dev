"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { H1, H2, H3, SizableText, View, YStack } from "tamagui";

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
    <YStack gap="$4" maxWidth={860}>
      <H1 mt={0}>{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <View
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
      >
        <details ref={i18nRef} open={openI18n} onToggle={(e) => setOpenI18n(e.currentTarget.open)}>
          <summary className="brew-details-summary">
            <H2 mt={0} display="inline">{t("sections.i18n.title")}</H2>
          </summary>
          <YStack mt="$3">
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tI18n("subtitle")}
            </SizableText>

            <H3 mb="$1.5">{tI18n("howItWorksTitle")}</H3>
            <ul>
              <li>{tI18n("howItWorks1")}</li>
              <li>
                {tI18n("howItWorks2Prefix")} <code>apps/web/messages/en.json</code> {tI18n("howItWorks2Middle")}{" "}
                <code>apps/web/messages/it.json</code>.
              </li>
              <li>{tI18n("howItWorks3")}</li>
            </ul>

            <H3 mb="$1.5">{tI18n("recommendedToolTitle")}</H3>
            <SizableText size="$3" color="var(--text)" fontFamily="$body">
              {tI18n("recommendedToolBody")}
            </SizableText>
            <ul>
              <li>{tI18n("recommendedTool1")}</li>
              <li>{tI18n("recommendedTool2")}</li>
            </ul>

            <H3 mb="$1.5">{tI18n("githubFallbackTitle")}</H3>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {tI18n("githubFallbackBody")}
            </SizableText>

            <H3 mb="$1.5">{tI18n("rulesTitle")}</H3>
            <ul>
              <li>{tI18n("rule1", { url: "{url}" })}</li>
              <li>{tI18n("rule2")}</li>
              <li>{tI18n("rule3")}</li>
            </ul>
          </YStack>
        </details>
      </View>

      <View
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
      >
        <details ref={rawMaterialsRef} open={openRawMaterials} onToggle={(e) => setOpenRawMaterials(e.currentTarget.open)}>
          <summary className="brew-details-summary">
            <H2 mt={0} display="inline">{t("sections.rawMaterials.title")}</H2>
          </summary>
          <YStack mt="$3">
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("sections.rawMaterials.subtitle")}
            </SizableText>
            <ol>
              <li>{t("sections.rawMaterials.step1")}</li>
              <li>{t("sections.rawMaterials.step2")}</li>
              <li>{t("sections.rawMaterials.step3")}</li>
            </ol>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              {t("sections.rawMaterials.issueTemplateNote")}
            </SizableText>
          </YStack>
        </details>
      </View>
    </YStack>
  );
}

