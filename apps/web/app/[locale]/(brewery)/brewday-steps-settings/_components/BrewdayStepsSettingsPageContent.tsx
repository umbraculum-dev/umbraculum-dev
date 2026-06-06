"use client";

import { H1, SizableText, View, YStack } from "tamagui";

import {
  ErrorBox,
  MessageBox,
} from "../../_components/recipe-edit";
import { DashboardClient } from "../../../../DashboardClient";
import { Link } from "../../../../../src/i18n/navigation";
import type { useBrewdayStepsSettingsPage } from "../_hooks/useBrewdayStepsSettingsPage";
import { BrewdayBrewingTypeSection } from "./sections/BrewdayBrewingTypeSection";
import { BrewdayNotesSection } from "./sections/BrewdayNotesSection";
import { BrewdayStepsCustomSection } from "./sections/BrewdayStepsCustomSection";
import { BrewdayStepsDefaultSection } from "./sections/BrewdayStepsDefaultSection";
import { BrewdayStepsRecapSection } from "./sections/BrewdayStepsRecapSection";
import { BrewdayStepsSectionsSection } from "./sections/BrewdayStepsSectionsSection";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayStepsSettingsPageContent(props: { model: Model }) {
  const {
    t,
    authState,
    canCallAccountScoped,
    loadError,
    saveStatus,
    setSaveStatus,
    saveError,
  } = props.model;

  return (
    <YStack gap="$3">
      <DashboardClient />

      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        <Link href="/">{t("backToDashboard")}</Link>
      </SizableText>

      {authState.error ? <ErrorBox>{authState.error}</ErrorBox> : null}
      {authState.status === "ready" && !canCallAccountScoped ? (
        <ErrorBox>{t("accountRequired")}</ErrorBox>
      ) : null}

      {loadError ? <ErrorBox aria-live="polite">{loadError}</ErrorBox> : null}

      {(saveStatus || saveError) ? (
        <View
          position="fixed"
          top={16}
          left="50%"
          style={{ transform: "translateX(-50%)" }}
          zIndex={1000}
          width="100%"
          maxWidth={600}
          px="$4"
        >
          <YStack gap="$2" width="100%">
            {saveStatus ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => setSaveStatus(null)}
              >
                {saveStatus}
              </MessageBox>
            ) : null}
            {saveError ? (
              <ErrorBox aria-live="polite">{saveError}</ErrorBox>
            ) : null}
          </YStack>
        </View>
      ) : null}

      <YStack gap="$4">
        <BrewdayStepsRecapSection model={props.model} />
        <BrewdayBrewingTypeSection model={props.model} />
        <BrewdayStepsSectionsSection model={props.model} />
        <BrewdayStepsDefaultSection model={props.model} />
        <BrewdayStepsCustomSection model={props.model} />
        <BrewdayNotesSection model={props.model} />
      </YStack>
    </YStack>
  );
}
