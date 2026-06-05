import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Input, Text } from "@umbraculum/ui";

import type { IntegrationKind } from "../../../hooks/fermIntegration/fermIntegrationTypes";
import type { NativeFermDataIntegrationScreenModel } from "../../../hooks/fermIntegration/useNativeFermDataIntegrationScreen";
import { FermIntegrationDevicesSection } from "./FermIntegrationDevicesSection";

function kindTitleKey(kind: IntegrationKind) {
  if (kind === "tilt") return "sections.integration.tiltTitle";
  if (kind === "ispindel") return "sections.integration.ispindelTitle";
  return "sections.integration.raptTitle";
}

function kindWarnKey(kind: IntegrationKind) {
  if (kind === "tilt") return "sections.integration.tiltSupportedNotice";
  if (kind === "ispindel") return "sections.integration.ispindelWarning";
  return "sections.integration.raptWarning";
}

function kindSubtitleKey(kind: IntegrationKind) {
  if (kind === "tilt") return "sections.integration.tiltSubtitle";
  if (kind === "ispindel") return "sections.integration.ispindelSubtitle";
  return "sections.integration.raptSubtitle";
}

export function FermIntegrationSetupSection(props: {
  model: NativeFermDataIntegrationScreenModel;
  kind: IntegrationKind;
}) {
  const { model, kind } = props;
  const { t, api, state, buildPublicUrl, createOrRotate, reveal, rotateToken, revoke } = model;

  const integration = state.integrations[kind];
  const devices = state.devices[kind];
  const tokenState = state.tokens[kind];
  const isWorking = state.working?.kind === kind;
  const statusLabel = isWorking
    ? t("sections.integration.working")
    : integration
      ? t("sections.integration.configured")
      : t("sections.integration.notConfigured");

  return (
    <Card key={kind} gap="$2">
      <Heading fontSize={16}>{t(kindTitleKey(kind))}</Heading>
      <Text fontSize={12} color={kind === "tilt" ? "$green10" : "$yellow10"}>
        {t(kindWarnKey(kind))}
      </Text>
      <Text fontSize={12} opacity={0.85}>
        {t(kindSubtitleKey(kind))}
      </Text>

      {kind === "tilt" ? (
        <View style={{ gap: 4 }}>
          <Text fontSize={12}>{t("sections.integration.stepsLabel")}</Text>
          <Text fontSize={12} opacity={0.85}>
            {t("sections.integration.step1")}
          </Text>
          <Text fontSize={12} opacity={0.85}>
            {t("sections.integration.step2")}
          </Text>
          <Text fontSize={12} opacity={0.85}>
            {t("sections.integration.step3")}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Button
          onPress={() => void createOrRotate(kind)}
          disabled={!api || state.status !== "ready" || Boolean(state.working)}
          accessibilityLabel={
            kind === "tilt"
              ? t("sections.integration.actions.createAria")
              : t("sections.integration.actions.createAriaGeneric")
          }
        >
          {integration ? t("sections.integration.actions.createAgain") : t("sections.integration.actions.create")}
        </Button>
        <Button onPress={() => void reveal(kind)} disabled={!integration || Boolean(state.working)}>
          {t("sections.integration.actions.reveal")}
        </Button>
        <Button
          onPress={() => void rotateToken(kind)}
          disabled={!integration || Boolean(state.working)}
          accessibilityLabel={
            kind === "tilt"
              ? t("sections.integration.actions.rotateAria")
              : t("sections.integration.actions.rotateAriaGeneric")
          }
        >
          {t("sections.integration.actions.rotate")}
        </Button>
        <Button
          onPress={() => void revoke(kind)}
          disabled={!integration || Boolean(state.working)}
          accessibilityLabel={
            kind === "tilt"
              ? t("sections.integration.actions.revokeAria")
              : t("sections.integration.actions.revokeAriaGeneric")
          }
        >
          {t("sections.integration.actions.revoke")}
        </Button>
        <Text fontSize={12} opacity={0.8}>
          {statusLabel}
        </Text>
      </View>

      {tokenState.publicPath ? (
        <View style={{ gap: 4 }}>
          <Text fontSize={12}>{t("sections.integration.cloudUrlLabel")}</Text>
          <Input value={buildPublicUrl(tokenState.publicPath) ?? tokenState.publicPath} readOnly />
          <Text fontSize={12} opacity={0.75}>
            {kind === "tilt"
              ? t("sections.integration.cloudUrlHelpTilt")
              : t("sections.integration.cloudUrlHelpGeneric")}
          </Text>
        </View>
      ) : null}

      {tokenState.token ? (
        <View style={{ gap: 4 }}>
          <Text fontSize={12}>{t("sections.integration.tokenLabel")}</Text>
          <Input value={tokenState.token} readOnly />
          <Text fontSize={12} opacity={0.75}>
            {t("sections.integration.tokenHelp")}
          </Text>
        </View>
      ) : null}

      <FermIntegrationDevicesSection model={model} kind={kind} devices={devices} />
    </Card>
  );
}
