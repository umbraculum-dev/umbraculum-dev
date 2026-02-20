"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";

import { apiFetch } from "../../../_lib/apiClient";

type AccountListItem = { id: string; name: string; role: string; brandKey?: string | null };

const AUTH_CHANGED_EVENT = "brewery:auth-changed";
const BRAND_COOKIE = "UI_BRAND";

function writeCookie(name: string, value: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function setBrand(brandKey: string) {
  writeCookie(BRAND_COOKIE, brandKey);
  document.documentElement.dataset.brand = brandKey;
}

export default function SelectAccountPage() {
  const locale = useLocale();
  const t = useTranslations("auth.selectAccount");
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
        const list = (res.data as any)?.accounts;
        const items: AccountListItem[] = Array.isArray(list) ? list : [];
        if (!cancelled) setAccounts(items);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasAccounts = useMemo(() => accounts.length > 0, [accounts.length]);

  const onPick = async (accountId: string) => {
    setSubmittingId(accountId);
    setError(null);
    try {
      const picked = accounts.find((a) => a.id === accountId) ?? null;
      const brandKey = (picked?.brandKey && typeof picked.brandKey === "string" ? picked.brandKey : "default") ?? "default";
      setBrand(brandKey);

      const res = await apiFetch("/api/auth/active-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      router.replace(`/${locale}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <View
      maxWidth={720}
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
    >
      <H1 mt={0}>{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {error ? (
        <View mt="$3">
          <pre className="brew-error-box" role="alert">
            {error}
          </pre>
        </View>
      ) : null}

      {!loading && !hasAccounts ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noAccountsFound")}
        </SizableText>
      ) : null}

      {hasAccounts ? (
        <YStack gap="$2" mt="$3">
          {accounts.map((a) => (
            <Button
              key={a.id}
              onPress={() => void onPick(a.id)}
              disabled={Boolean(submittingId)}
              justifyContent="flex-start"
              width="100%"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              size="$3"
            >
              <XStack gap="$1" flex={1} justifyContent="flex-start" alignItems="center">
                <SizableText size="$3" fontWeight="bold" fontFamily="$body" color="var(--text)">
                  {a.name}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  · {a.role}
                </SizableText>
                {submittingId === a.id ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    · Saving…
                  </SizableText>
                ) : null}
              </XStack>
            </Button>
          ))}
        </YStack>
      ) : null}
    </View>
  );
}

