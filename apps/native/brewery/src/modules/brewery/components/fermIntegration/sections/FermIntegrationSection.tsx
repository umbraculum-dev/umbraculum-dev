import React from "react";
import { View } from "react-native";

import { Card, Heading, Spinner, Text } from "@umbraculum/ui";

import { INTEGRATION_KINDS } from "../../../hooks/fermIntegration/fermIntegrationTypes";
import type { NativeFermDataIntegrationScreenModel } from "../../../hooks/fermIntegration/useNativeFermDataIntegrationScreen";
import { FermIntegrationSetupSection } from "./FermIntegrationSetupSection";

export function FermIntegrationSection(props: { model: NativeFermDataIntegrationScreenModel }) {
  const { model } = props;
  const { t, state } = model;

  return (
    <Card gap="$2" aria-label={t("sections.integration.title")}>
      <Heading fontSize={18}>{t("sections.integration.title")}</Heading>
      <Text fontSize={12} opacity={0.85}>
        {t("sections.integration.intro")}
      </Text>

      {state.status === "loading" ? <Spinner /> : null}
      {state.status === "error" ? (
        <Text fontSize={12} color="$red10">
          {state.error}
        </Text>
      ) : null}

      {state.status === "ready" ? (
        <View style={{ gap: 16 }}>
          {INTEGRATION_KINDS.map((kind) => (
            <FermIntegrationSetupSection key={kind} model={model} kind={kind} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}
