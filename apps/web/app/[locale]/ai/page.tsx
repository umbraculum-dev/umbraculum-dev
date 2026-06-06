"use client";

import Link from "next/link";
import { H1, SizableText, View, XStack, YStack } from "tamagui";
import { useTranslations } from "next-intl";

import { useRequireAuth } from "../../_shell/_lib/useRequireAuth";
import { DashboardClient } from "../../DashboardClient";

import { AiChatPanel } from "./_components/AiChatPanel";

export default function AiPage() {
  const tCommon = useTranslations("common");
  const tActions = useTranslations("ai.actions");
  const auth = useRequireAuth({ requireActiveWorkspace: true });

  if (auth.status === "loading") {
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

  return (
    <YStack gap="$4">
      <XStack alignItems="center" gap="$3" mb="$2">
        <H1 id="ai-page-title">AI</H1>
        <XStack gap="$3" marginLeft="auto">
          <Link href="settings">{tActions("openSettings")}</Link>
          <Link href="usage">{tActions("openUsage")}</Link>
        </XStack>
      </XStack>
      <AiChatPanel />
      <DashboardClient />
    </YStack>
  );
}
