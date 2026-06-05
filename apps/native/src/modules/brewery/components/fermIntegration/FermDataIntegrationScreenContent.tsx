import React from "react";
import { ScrollView, View } from "react-native";

import { Heading, Text } from "@umbraculum/ui";

import type { NativeFermDataIntegrationScreenModel } from "../../hooks/fermIntegration/useNativeFermDataIntegrationScreen";
import { FermIntegrationSection } from "./sections/FermIntegrationSection";

export function FermDataIntegrationScreenContent(props: { model: NativeFermDataIntegrationScreenModel }) {
  const { model } = props;
  const { t } = model;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ gap: 16 }}>
        <Heading fontSize={28} mb="$2">
          {t("title")}
        </Heading>
        <Text fontSize={14} opacity={0.85}>
          {t("subtitle")}
        </Text>

        <FermIntegrationSection model={model} />
      </View>
    </ScrollView>
  );
}
