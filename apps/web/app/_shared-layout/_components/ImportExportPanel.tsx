"use client";

import { useTranslations } from "next-intl";
import { H2, SizableText, View, YStack } from "tamagui";
import { Link } from "../../../src/i18n/navigation";

export function ImportExportPanel(props: {
  headingId: string;
  className?: string;
  variant?: "panel" | "content";
}) {
  const t = useTranslations("dashboard");
  const { headingId, className, variant } = props;

  const content = (
    <>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("importExport.supportedNote")}
      </SizableText>
      <YStack gap="$2" mt="$2" mb={0} color="var(--text-muted)">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("importExport.importFormats")}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("importExport.exportFormats")}
        </SizableText>
      </YStack>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
        {t("importExport.actionsLiveInRecipes")} <Link href="/recipes">{t("importExport.actionsCta")}</Link>
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
        {t("importExport.customImportNote")} <Link href="/contact">{t("importExport.customImportCta")}</Link>
      </SizableText>
    </>
  );

  if (variant === "content") {
    return <>{content}</>;
  }

  return (
    <View
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
      aria-labelledby={headingId}
      className={className}
    >
      <H2 id={headingId} mt={0}>
        {t("importExport.title")}
      </H2>
      {content}
    </View>
  );
}

