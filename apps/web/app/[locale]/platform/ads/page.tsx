"use client";

import { useLocale, useTranslations } from "next-intl";
import { H1, SizableText, View, YStack } from "tamagui";

import { ErrorBox } from "../../../_shared-layout/_components/ErrorBox";
import { PlatformAdForm } from "./_components/PlatformAdForm";
import { PlatformAdsTable } from "./_components/PlatformAdsTable";
import { usePlatformAdsPage } from "./_hooks/usePlatformAdsPage";

export default function PlatformAdsPage() {
  const locale = useLocale();
  const t = useTranslations("platformAds");
  const { auth, isPlatformAdmin, error, formProps, tableProps } = usePlatformAdsPage();

  if (auth.status === "loading") return <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("loading")}</SizableText>;
  if (auth.status === "error") return <ErrorBox>{auth.error}</ErrorBox>;

  if (!isPlatformAdmin) {
    return (
      <YStack maxWidth={900}>
        <View className="brew-panel">
          <H1 mt={0}>{t("title")}</H1>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
            {t("notAuthorized")}
          </SizableText>
        </View>
      </YStack>
    );
  }

  return (
    <YStack gap="$4" maxWidth={900}>
      <View className="brew-panel">
        <H1 mt={0}>{t("title")}</H1>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("subtitle")}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("hint", { locale })}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
          {t("globalBottomNote")}
        </SizableText>

        {error ? (
          <ErrorBox mt="$3">{error}</ErrorBox>
        ) : null}

        <PlatformAdForm {...formProps} />
      </View>

      <PlatformAdsTable {...tableProps} />
    </YStack>
  );
}
