import React, { useEffect } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useT } from "@brewery/i18n-react";
import { Heading, Screen, Text } from "@brewery/ui";

import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useLocaleController } from "../i18n/I18nProvider";

export function AboutScreen() {
  const navigation = useNavigation();
  const { t } = useT("about");

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();

  const contributingUrl =
    baseUrl && locale
      ? `${baseUrl.replace(/\/+$/, "")}/${locale}/contributing?topic=i18n`
      : null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 12 }}>
          <Heading fontSize={28} mb="$2">
            {t("title")}
          </Heading>
          <Text fontSize={14} opacity={0.85}>
            {t("subtitle")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            <Text fontSize={14} opacity={0.85}>
              {t("translationsRowPrefix")}{" "}
            </Text>
            {contributingUrl ? (
              <Pressable
                onPress={() => Linking.openURL(contributingUrl)}
                accessibilityRole="link"
                accessibilityLabel={t("translationsRowLinkText")}
              >
                <Text fontSize={14} opacity={0.85} color="$blue10" textDecorationLine="underline">
                  {t("translationsRowLinkText")}
                </Text>
              </Pressable>
            ) : (
              <Text fontSize={14} opacity={0.85}>
                {t("translationsRowLinkText")}
              </Text>
            )}
            <Text fontSize={14} opacity={0.85}>
              {" "}
              {t("translationsRowSuffix")}
            </Text>
          </View>
          <Text fontSize={14} opacity={0.85}>
            {t("translationsSideNote")}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
