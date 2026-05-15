"use client";

import { useState } from "react";
import { Button, H2, Input, SizableText, View, XStack, YStack } from "tamagui";

import type { useAiChatStream } from "./useAiChatStream";

/**
 * Translation lookup. The shared component is i18n-agnostic — the caller
 * passes a typed translator so web (next-intl) and native (@brewery/i18n-react)
 * can both supply their own implementation.
 */
export type AiChatTranslate = (key: string, vars?: Record<string, string | number>) => string;

export interface AiChatPanelProps {
  chat: ReturnType<typeof useAiChatStream>;
  t: AiChatTranslate;
  /**
   * Optional callback for the "subscription required" upgrade CTA.
   * If omitted, the CTA link is hidden.
   */
  onOpenUpgrade?: () => void;
}

/**
 * Cross-platform AI chat panel — Tamagui primitives only. The wire-protocol
 * + state machine live in `useAiChatStream`; this component is the visual
 * shell over them and is identical on web and native.
 *
 * Accessibility:
 *   - Outer container uses aria-labelledby pointing at the H2 title.
 *   - The streaming turn is marked aria-live="polite" (Tamagui forwards
 *     the prop to the underlying RN/DOM node).
 *   - The composer Button has an explicit aria-label.
 *   - Submit-on-Enter is wired via `onSubmitEditing` (cross-platform).
 */
export function AiChatPanel({ chat, t, onOpenUpgrade }: AiChatPanelProps) {
  const { messages, pending, terminalError, send } = chat;
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const text = draft.trim();
    if (!text || pending) return;
    setDraft("");
    void send(text);
  };

  const isSubscriptionError = terminalError?.code === "ai_subscription_required";
  const isNotEnabled = terminalError?.code === "ai_not_enabled";
  const isNoKey = terminalError?.code === "ai_no_key";
  const isDataEgress = terminalError?.code === "ai_data_egress_not_accepted";
  const isRateRole = terminalError?.code === "ai_rate_limit";

  const errorText = terminalError
    ? isSubscriptionError
      ? t("errors.subscriptionRequired")
      : isNotEnabled
        ? t("errors.notEnabled")
        : isNoKey
          ? t("errors.noKey")
          : isDataEgress
            ? t("errors.dataEgressNotAccepted")
            : isRateRole
              ? t("errors.rateLimit")
              : terminalError.message || t("errors.internal")
    : null;

  return (
    <YStack
      gap="$4"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({ "aria-labelledby": "ai-chat-title", role: "main" } as any)}
    >
      <YStack gap="$2">
        <H2 id="ai-chat-title">{t("title")}</H2>
        <SizableText size="$2" theme="alt2">
          {t("subtitle")}
        </SizableText>
      </YStack>

      {errorText ? (
        <View
          backgroundColor="$yellow3"
          borderColor="$yellow8"
          borderWidth={1}
          padding="$3"
          borderRadius="$3"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ role: "alert" } as any)}
        >
          <SizableText>{errorText}</SizableText>
          {isSubscriptionError && onOpenUpgrade ? (
            <XStack marginTop="$2">
              <Button
                size="$2"
                onPress={onOpenUpgrade}
                accessibilityLabel={t("errors.subscriptionRequiredCta")}
              >
                {t("errors.subscriptionRequiredCta")}
              </Button>
            </XStack>
          ) : null}
        </View>
      ) : null}

      <YStack
        gap="$3"
        minHeight={300}
        padding="$3"
        backgroundColor="$background"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$borderColor"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ "aria-live": "polite" } as any)}
      >
        {messages.length === 0 ? (
          <SizableText theme="alt2">{t("messages.empty")}</SizableText>
        ) : (
          messages.map((m) => (
            <YStack key={m.id} gap="$1">
              <SizableText fontWeight="600">
                {m.role === "user" ? t("messages.you") : t("messages.assistant")}
              </SizableText>
              <SizableText>
                {m.text ||
                  (pending && m.role === "assistant" ? t("composer.thinking") : "")}
              </SizableText>
              {m.turn?.toolCalls.map((tc, i) => (
                <SizableText key={`${m.id}-tc-${i}`} size="$1" theme="alt2">
                  {tc.errored
                    ? t("messages.toolError", { message: tc.name })
                    : t("messages.toolCall", { tool: tc.name })}
                </SizableText>
              ))}
            </YStack>
          ))
        )}
      </YStack>

      <XStack gap="$2" alignItems="center">
        <View flex={1}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder={t("composer.placeholder")}
            disabled={pending}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            accessibilityLabel={t("composer.placeholder")}
          />
        </View>
        <Button
          onPress={handleSend}
          disabled={pending || draft.trim().length === 0}
          accessibilityLabel={t("composer.sendAriaLabel")}
        >
          {pending ? t("composer.thinking") : t("composer.send")}
        </Button>
      </XStack>
    </YStack>
  );
}
