import React from "react";
import { Pressable, Text, View } from "react-native";

import { useT } from "@brewery/i18n-react";
import type { SupportedLocale } from "@brewery/i18n";

import { useLocaleController } from "../i18n/I18nProvider";
import { RemoteImage } from "../media/RemoteImage";

export function DashboardScreen() {
  const { locale, setLocale } = useLocaleController();
  const { t } = useT("common");

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>{t("backToDashboard")}</Text>
      <Text style={{ fontSize: 16 }}>{t("loading")}</Text>
      <RemoteImage
        assetKey="yeast/dilution-1-100.png"
        accessibilityLabel="Dilution 1:100 diagram"
        width={320}
        height={180}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 16 }}>Locale: {locale}</Text>
        <Pressable
          onPress={() => setLocale((locale === "en" ? "it" : "en") satisfies SupportedLocale)}
          accessibilityRole="button"
          accessibilityLabel="Toggle language"
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: "#111827",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Toggle</Text>
        </Pressable>
      </View>
    </View>
  );
}

