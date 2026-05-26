import React, { useCallback, useEffect, useMemo } from "react";
import { Linking, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useT } from "@umbraculum/i18n-react";
import { AiChatPanel, Screen, useAiChatStream } from "@umbraculum/ui";

import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";

/**
 * Native AI consultant screen — wraps the shared {@link AiChatPanel}
 * with a bearer-token chatFetch + the `ai` i18n namespace.
 *
 * The upgrade CTA links out to the web upgrade flow (handled in a
 * browser tab via `Linking.openURL`) since payment intent + Stripe
 * redirect aren't yet wired into the native app.
 */
export function AiScreen() {
  const navigation = useNavigation();
  const { t } = useT("ai");
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const chat = useAiChatStream(
    useMemo(
      () => ({
        chatFetch: (message: string, init: { signal: AbortSignal }) =>
          fetch(`${baseUrl}/api/ai/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ message }),
            signal: init.signal,
          }),
      }),
      [baseUrl, token],
    ),
  );

  const onOpenUpgrade = useCallback(() => {
    if (!baseUrl) return;
    void Linking.openURL(`${baseUrl}/en/ai/upgrade`);
  }, [baseUrl]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <AiChatPanel chat={chat} t={t} onOpenUpgrade={onOpenUpgrade} />
        </View>
      </ScrollView>
    </Screen>
  );
}
