import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useT } from "@brewery/i18n-react";
import { Card, Heading, Screen, Text } from "@brewery/ui";

export function FermDataIntegrationScreen() {
  const navigation = useNavigation();
  const { t } = useT("dashboard.fermDataIntegration");

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <Heading fontSize={28} mb="$2">
            {t("title")}
          </Heading>
          <Text fontSize={14} opacity={0.85}>
            {t("subtitle")}
          </Text>

          <Card gap="$2" aria-label={t("sections.integration.title")}>
            <Heading fontSize={18}>{t("sections.integration.title")}</Heading>
            <Text fontSize={12} opacity={0.85}>
              {t("sections.integration.empty")}
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
