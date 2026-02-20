"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { H1, Input, SizableText, View, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox, RecipeEditFieldLabel } from "../../../_components/recipe-edit";
import { apiFetch } from "../../../_lib/apiClient";
import { LocaleSelect } from "../_components/LocaleSelect";

const AUTH_CHANGED_EVENT = "brewery:auth-changed";

export default function SignupPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
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
        <H1 mt={0}>{t("signupTitle")}</H1>
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
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          preferredLocale: locale,
          accountName: accountName.trim() ? accountName.trim() : undefined,
        }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));

      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));

      const activeAccountId =
        res.data && typeof res.data === "object" && "activeAccountId" in (res.data as any)
          ? ((res.data as any).activeAccountId as string | null)
          : null;

      if (!activeAccountId) {
        router.replace(`/${locale}/select-account`);
        return;
      }
      router.replace(`/${locale}`);
    } catch (err) {
      setError(String(err));
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
      <H1 mt={0}>{t("signupTitle")}</H1>

      <form onSubmit={onSubmit} aria-describedby={error ? "signup-error" : undefined}>
        <YStack gap="$3">
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="signup-email">{t("emailLabel")}</RecipeEditFieldLabel>
            <Input
              id="signup-email"
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
            <RecipeEditFieldLabel htmlFor="signup-password">{t("passwordLabel")}</RecipeEditFieldLabel>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChangeText={setPassword}
              autoComplete="new-password"
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
            <RecipeEditFieldLabel htmlFor="signup-accountName">{t("accountNameLabel")}</RecipeEditFieldLabel>
            <Input
              id="signup-accountName"
              value={accountName}
              onChangeText={setAccountName}
              autoComplete="organization"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>

          <LocaleSelect id="signup-locale" />

          <button type="submit" disabled={submitting}>
            {submitting ? t("submitting") : t("submitSignup")}
          </button>
        </YStack>
      </form>

      {error ? (
        <ErrorBox id="signup-error" mt="$3">{error}</ErrorBox>
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
