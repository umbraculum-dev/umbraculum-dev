import React from "react";
import { View } from "react-native";

import { useT } from "@brewery/i18n-react";
import type { SupportedLocale } from "@brewery/i18n";
import { Button, Heading, Screen, Text } from "@brewery/ui";

import { useLocaleController } from "../i18n/I18nProvider";
import { RemoteImage } from "../media/RemoteImage";

export function DashboardScreen() {
  const { locale, setLocale } = useLocaleController();
  const { t } = useT("common");

  return (
    <Screen>
      <Heading fontSize={28}>{t("backToDashboard")}</Heading>
      <Text fontSize={16}>{t("loading")}</Text>
      <RemoteImage
        assetKey="yeast/dilution-1-100.png"
        accessibilityLabel={t("dilutionDiagramLabel")}
        unavailableText={t("imageUnavailable")}
        width={320}
        height={180}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text fontSize={16}>
          {t("localeLabel")}: {locale}
        </Text>
        <Button
          onPress={() => setLocale((locale === "en" ? "it" : "en") satisfies SupportedLocale)}
          accessibilityRole="button"
          accessibilityLabel={t("toggleLanguage")}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: "#111827",
          }}
          pressStyle={{ opacity: 0.9 }}
        >
          <Text color="#fff" fontWeight="600">
            {t("toggle")}
          </Text>
        </Button>
      </View>
    </Screen>
  );
}

