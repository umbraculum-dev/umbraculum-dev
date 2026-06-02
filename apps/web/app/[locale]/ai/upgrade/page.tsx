"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, H1, H2, SizableText, View, XStack, YStack } from "tamagui";

import { ApiClientError, createAiUpgradeBillingIntent } from "@umbraculum/api-client";

import { webPlatformApiClient } from "../../../_lib/webApiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { DashboardClient } from "../../../DashboardClient";

const CONCIERGE_URL = process.env['NEXT_PUBLIC_CONCIERGE_BOOKING_URL'] ?? "";

export default function AiUpgradePage() {
  const tCommon = useTranslations("common");
  const t = useTranslations("ai.upgrade");
  const auth = useRequireAuth({ requireActiveWorkspace: true });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentInfo, setIntentInfo] = useState<{
    billingIntentId: string;
    stripePricingTableId: string | null;
    stripePublishableKey: string | null;
  } | null>(null);

  const onUpgrade = async () => {
    if (auth.status !== "ready" || !auth.me.activeWorkspaceId) return;
    setLoading(true);
    setError(null);
    setIntentInfo(null);
    try {
      const data = await createAiUpgradeBillingIntent(
        webPlatformApiClient(),
        auth.me.activeWorkspaceId,
        { planCode: "premium", provider: "stripe", mode: "purchase" },
      );
      setIntentInfo({
        billingIntentId: data.billingIntentId,
        stripePricingTableId: data.stripePricingTableId,
        stripePublishableKey: data.stripePublishableKey,
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? ((err.body as { error?: { message?: string } })?.error?.message ?? "Unknown error")
          : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
    <>
      <main role="main" aria-labelledby="ai-upgrade-title">
        <YStack gap="$4">
          <H1 id="ai-upgrade-title">{t("title")}</H1>
          <SizableText>{t("body")}</SizableText>
          <YStack gap="$1" mt="$2">
            <SizableText>• {t("bullet1")}</SizableText>
            <SizableText>• {t("bullet2")}</SizableText>
            <SizableText>• {t("bullet3")}</SizableText>
          </YStack>

          {error ? (
            <View role="alert">
              <SizableText color="var(--text-error, #a00)">
                {t("ctaError", { message: error })}
              </SizableText>
            </View>
          ) : null}

          {intentInfo ? (
            <View
              role="status"
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor: "var(--bg-success-subtle, #efffef)",
                borderWidth: 1,
                borderColor: "var(--border-success, #aca)",
                borderStyle: "solid",
              }}
            >
              <YStack gap="$1">
                <SizableText fontWeight="600">Intent #{intentInfo.billingIntentId.slice(0, 8)}</SizableText>
                {intentInfo.stripePublishableKey && intentInfo.stripePricingTableId ? (
                  <SizableText size="$1">
                    Stripe pricing table: {intentInfo.stripePricingTableId}
                  </SizableText>
                ) : (
                  <SizableText size="$1" color="var(--text-muted)">
                    Stripe credentials are not configured on this environment. An admin will follow up.
                  </SizableText>
                )}
              </YStack>
            </View>
          ) : (
            <XStack mt="$2">
              <Button disabled={loading} onPress={() => void onUpgrade()}>
                {loading ? t("ctaLoading") : t("ctaButton")}
              </Button>
            </XStack>
          )}

          {CONCIERGE_URL.length > 0 ? (
            <View
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor: "var(--surface-subtle, #fafafa)",
                marginTop: 12,
              }}
            >
              <YStack gap="$1">
                <H2>{t("concierge.title")}</H2>
                <SizableText>{t("concierge.body")}</SizableText>
                <XStack mt="$1">
                  <a href={CONCIERGE_URL} target="_blank" rel="noopener noreferrer">
                    <SizableText color="var(--accent, #06c)">{t("concierge.cta")}</SizableText>
                  </a>
                </XStack>
              </YStack>
            </View>
          ) : null}
        </YStack>
      </main>
      <DashboardClient />
    </>
  );
}
