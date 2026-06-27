"use client";

import { Button, Input, SizableText, XStack, YStack } from "tamagui";

import { CodeInline } from "../../../../../_shared-layout/_components/CodeInline";
import { MessageBox } from "../../../../../_shared-layout/_components/MessageBox";
import type { UseFermDataIntegrationPageModel } from "../../_hooks/useFermDataIntegrationPage";
import type { IntegrationKind } from "../../_lib/fermIntegrationTypes";
import { FermIntegrationDevicesSection } from "./FermIntegrationDevicesSection";

type Model = UseFermDataIntegrationPageModel;

function IntegrationKindSetup(props: {
  model: Model;
  kind: IntegrationKind;
  integration: Model["integrations"][IntegrationKind];
  variant: "tilt" | "generic";
}) {
  const { model, kind, integration, variant } = props;
  const {
    t,
    canCall,
    loading,
    isAnyWorking,
    newPublicPaths,
    newTokens,
    copied,
    getFullPublicUrl,
    copyToClipboard,
    createOrRotate,
    reveal,
    rotateToken,
    revoke,
  } = model;

  const isTilt = variant === "tilt";

  return (
    <YStack gap="$2" mt={isTilt ? undefined : "$3"}>
      <SizableText size="$3" fontFamily="$body">
        {t(`sections.integration.${kind}Title`)}
      </SizableText>
      {isTilt ? (
        <>
          <MessageBox variant="success">{t("sections.integration.tiltSupportedNotice")}</MessageBox>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {t("sections.integration.tiltSubtitle")}
          </SizableText>
          <YStack gap="$1">
            <SizableText size="$2" fontFamily="$body">
              {t("sections.integration.stepsLabel")}
            </SizableText>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("sections.integration.step1")}
            </SizableText>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("sections.integration.step2")}
            </SizableText>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("sections.integration.step3")}
            </SizableText>
          </YStack>
        </>
      ) : (
        <>
          <MessageBox variant="warning">{t(`sections.integration.${kind}Warning`)}</MessageBox>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {t(`sections.integration.${kind}Subtitle`)}
          </SizableText>
        </>
      )}

      <XStack gap="$2" flexWrap="wrap" alignItems="center">
        <Button
          onPress={() => void createOrRotate(kind)}
          disabled={!canCall || loading || isAnyWorking}
          aria-label={
            isTilt
              ? t("sections.integration.actions.createAria")
              : t("sections.integration.actions.createAriaGeneric")
          }
        >
          {integration ? t("sections.integration.actions.createAgain") : t("sections.integration.actions.create")}
        </Button>
        <Button onPress={() => void reveal(kind)} disabled={!integration || loading || isAnyWorking}>
          {t("sections.integration.actions.reveal")}
        </Button>
        <Button
          onPress={() => void rotateToken(kind)}
          disabled={!integration || loading || isAnyWorking}
          aria-label={
            isTilt
              ? t("sections.integration.actions.rotateAria")
              : t("sections.integration.actions.rotateAriaGeneric")
          }
        >
          {t("sections.integration.actions.rotate")}
        </Button>
        <Button
          onPress={() => void revoke(kind)}
          disabled={!integration || loading || isAnyWorking}
          aria-label={
            isTilt
              ? t("sections.integration.actions.revokeAria")
              : t("sections.integration.actions.revokeAriaGeneric")
          }
        >
          {t("sections.integration.actions.revoke")}
        </Button>

        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {loading || isAnyWorking
            ? t("sections.integration.working")
            : integration
              ? t("sections.integration.configured")
              : t("sections.integration.notConfigured")}
        </SizableText>
      </XStack>

      {newPublicPaths[kind] ? (
        <YStack gap="$2" mt="$2">
          <SizableText size="$2" fontFamily="$body">
            {t("sections.integration.cloudUrlLabel")}
          </SizableText>
          <Input
            value={getFullPublicUrl(kind) ?? newPublicPaths[kind]}
            readOnly
            aria-label={
              isTilt
                ? t("sections.integration.cloudUrlAriaTilt")
                : t("sections.integration.cloudUrlAriaGeneric")
            }
          />
          <XStack gap="$2" flexWrap="wrap" alignItems="center">
            <Button
              onPress={() => {
                void copyToClipboard(kind, "url", getFullPublicUrl(kind) ?? newPublicPaths[kind] ?? "");
              }}
              disabled={!getFullPublicUrl(kind) && !newPublicPaths[kind]}
              aria-label={t("sections.integration.copyUrlAria")}
            >
              {copied?.kind === kind && copied.field === "url"
                ? t("sections.integration.copied")
                : t("sections.integration.copy")}
            </Button>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {isTilt ? t("sections.integration.cloudUrlHelpTilt") : t("sections.integration.cloudUrlHelpGeneric")}
            </SizableText>
          </XStack>
        </YStack>
      ) : null}

      {newTokens[kind] ? (
        <YStack gap="$2" mt="$2">
          <SizableText size="$2" fontFamily="$body">
            {t("sections.integration.tokenLabel")}
          </SizableText>
          <Input value={newTokens[kind]} readOnly aria-label={t("sections.integration.tokenAria")} />
          <XStack gap="$2" flexWrap="wrap" alignItems="center">
            <Button
              onPress={() => {
                void copyToClipboard(kind, "token", newTokens[kind] ?? "");
              }}
              aria-label={t("sections.integration.copyTokenAria")}
            >
              {copied?.kind === kind && copied.field === "token"
                ? t("sections.integration.copied")
                : t("sections.integration.copy")}
            </Button>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("sections.integration.tokenHelp")}
            </SizableText>
          </XStack>
        </YStack>
      ) : null}
    </YStack>
  );
}

export function FermIntegrationSetupSection(props: { model: Model }) {
  const { model } = props;
  const { t, error, tiltIntegration, ispindelIntegration, raptIntegration } = model;

  return (
    <>
      {error ? (
        <SizableText size="$2" color="var(--danger)" fontFamily="$body" mt="$3">
          {t("sections.integration.error")} <CodeInline>{error}</CodeInline>
        </SizableText>
      ) : null}

      <YStack gap="$2" mt="$3">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("sections.integration.intro")}
        </SizableText>

        <IntegrationKindSetup model={model} kind="tilt" integration={tiltIntegration} variant="tilt" />

        <FermIntegrationDevicesSection model={model} />

        <YStack borderBottomWidth={1} borderColor="var(--border)" my="$3" />

        <IntegrationKindSetup model={model} kind="ispindel" integration={ispindelIntegration} variant="generic" />

        <YStack borderBottomWidth={1} borderColor="var(--border)" my="$3" />

        <IntegrationKindSetup model={model} kind="rapt" integration={raptIntegration} variant="generic" />
      </YStack>
    </>
  );
}
