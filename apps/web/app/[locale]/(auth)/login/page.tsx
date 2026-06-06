"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, H1, Input, SizableText, View, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox, RecipeEditFieldLabel } from "../../(brewery)/_components/recipe-edit";
import { webPlatformApiClient } from "../../../_shell/_lib/webApiClient";
import { ApiClientError, login } from "@umbraculum/api-client";
import { LocaleSelect } from "../_components/LocaleSelect";

const AUTH_CHANGED_EVENT = "brewery:auth-changed";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mounted) {
    return (
      <View
        maxWidth={520}
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
      >
        <H1 mt={0}>{t("loginTitle")}</H1>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("submitting")}
        </SizableText>
      </View>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = await login(webPlatformApiClient(), {
        email,
        password,
        preferredLocale: locale,
      });

      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));

      const activeWorkspaceId = body.activeWorkspaceId ?? null;

      if (!activeWorkspaceId) {
        router.replace(`/${locale}/select-workspace`);
        return;
      }
      router.replace(next && next.startsWith("/") ? next : `/${locale}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(typeof err.body === "string" ? err.body : JSON.stringify(err.body));
      } else {
        setError(String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      maxWidth={520}
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
    >
      <H1 mt={0}>{t("loginTitle")}</H1>

      <form onSubmit={(...a) => { void onSubmit(...(a as Parameters<typeof onSubmit>)); }} aria-describedby={error ? "login-error" : undefined}>
        <YStack gap="$3">
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="login-email">{t("emailLabel")}</RecipeEditFieldLabel>
            <Input
              id="login-email"
              value={email}
              onChangeText={setEmail}
              type="email"
              autoComplete="email"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              required
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>

          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="login-password">{t("passwordLabel")}</RecipeEditFieldLabel>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChangeText={setPassword}
              autoComplete="current-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              required
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>

          <LocaleSelect id="login-locale" />

          <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={submitting}>
            {submitting ? t("submitting") : t("submitLogin")}
          </Button>
        </YStack>
      </form>

      {error ? (
        <ErrorBox id="login-error" mt="$3">{error}</ErrorBox>
      ) : null}

      <View mt="$3">
        <YStack gap="$1.5">
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" fontWeight="bold">
            {t("noteTitle")}
          </SizableText>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {t("noteBody")}
          </SizableText>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            <Link href="/contributing?topic=i18n">{t("helpTranslate")}</Link>
          </SizableText>
        </YStack>
      </View>
    </View>
  );
}

