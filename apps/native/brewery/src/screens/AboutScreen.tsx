import React, { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";

import { useT } from "@umbraculum/i18n-react";
import { Screen, Text } from "@umbraculum/ui";

import { getApiBaseUrl } from "@umbraculum/native-shell/auth";
import { useLocaleController } from "@umbraculum/native-shell/i18n";
import type { RootStackParamList } from "../navigation/types";

export function AboutScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useT("about");

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();

  const _contributingUrl =
    baseUrl && locale
      ? `${baseUrl.replace(/\/+$/, "")}/${locale}/contributing?topic=i18n`
      : null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 12 }}>
          <Text fontSize={14} opacity={0.85}>
            {t("subtitle")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            <Text fontSize={14} opacity={0.85}>
              {t("translationsRowPrefix")}{" "}
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Contributing", { topic: "i18n" })}
              accessibilityRole="button"
              accessibilityLabel={t("translationsRowLinkText")}
            >
              <Text fontSize={14} opacity={0.85} color="$blue10" textDecorationLine="underline">
                {t("translationsRowLinkText")}
              </Text>
            </Pressable>
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
