import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import { Input, YStack } from "tamagui";

import { useT } from "@brewery/i18n-react";
import { Button, Heading, Screen, Text } from "@brewery/ui";

import { AdSlot } from "../components/AdSlot";
import { useAuth } from "../auth/AuthProvider";
import { useLocaleController } from "../i18n/I18nProvider";

export function LoginScreen() {
  const auth = useAuth();
  const { locale } = useLocaleController();
  const { t } = useT("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !submitting;
  }, [email, password, submitting]);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await auth.login({ email, password, preferredLocale: locale });
      if (!res.ok) {
        const msg = res.error ?? "Login failed";
        setError(msg);
        Alert.alert(t("loginTitle"), msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <AdSlot placement="global_top" />
      <Heading fontSize={28}>{t("loginTitle")}</Heading>

      <YStack gap="$3" style={{ width: "100%", maxWidth: 420 }}>
        <YStack gap="$1.5">
          <Text fontSize={14}>{t("emailLabel")}</Text>
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder={t("emailLabel")}
          />
        </YStack>

        <YStack gap="$1.5">
          <Text fontSize={14}>{t("passwordLabel")}</Text>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder={t("passwordLabel")}
          />
        </YStack>

        <Button
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel={t("submitLogin")}
        >
          <Text>{submitting ? t("submitting") : t("submitLogin")}</Text>
        </Button>

        {error ? <Text color="red">{error}</Text> : null}
      </YStack>
    </Screen>
  );
}

