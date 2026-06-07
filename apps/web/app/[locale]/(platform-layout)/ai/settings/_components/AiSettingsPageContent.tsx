"use client";

import { H1, SizableText, View, YStack } from "tamagui";

import { DashboardClient } from "../../../../../DashboardClient";
import type { AiSettingsPageModel } from "../_hooks/useAiSettingsPage";
import { AiSettingsAdminForm } from "./AiSettingsAdminForm";

export function AiSettingsPageContent(props: { model: AiSettingsPageModel }) {
  const { model } = props;
  const {
    tCommon,
    tSettings,
    auth,
    form,
    settings,
    saved,
    saveError,
    loading,
  } = model;

  if (auth.status === "loading" || loading) {
    return (
      <View aria-busy="true">
        <SizableText>{tCommon("loading")}</SizableText>
      </View>
    );
  }
  if (auth.status === "error") {
    return (
      <View role="alert">
        <SizableText>{auth.error}</SizableText>
      </View>
    );
  }
  if (!form || !settings) {
    return (
      <View role="alert">
        <SizableText>{tCommon("loading")}</SizableText>
      </View>
    );
  }

  return (
    <>
      <main role="main" aria-labelledby="ai-settings-title">
        <YStack gap="$4">
          <YStack gap="$2">
            <H1 id="ai-settings-title">{tSettings("title")}</H1>
            <SizableText size="$2" color="var(--text-muted)">
              {tSettings("subtitle")}
            </SizableText>
          </YStack>

          {saved ? (
            <View role="status">
              <SizableText color="var(--text-success, #2c7a2c)">{tSettings("savedMessage")}</SizableText>
            </View>
          ) : null}
          {saveError ? (
            <View role="alert">
              <SizableText color="var(--text-error, #a00)">
                {tSettings("saveError", { message: saveError })}
              </SizableText>
            </View>
          ) : null}

          <AiSettingsAdminForm model={model} />
        </YStack>
      </main>
      <DashboardClient />
    </>
  );
}
