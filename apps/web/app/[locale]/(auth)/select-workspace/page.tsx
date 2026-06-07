"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox } from "../../(brewery)/_components/recipe-edit";
import { fetchAuthMe } from "../../../_shared-layout/_lib/fetchAuthMe";
import { webPlatformApiClient } from "../../../_shared-layout/_lib/webApiClient";
import { ApiClientError, setActiveWorkspace } from "@umbraculum/api-client";
import { AuthExpiredNotice } from "../../../_shared-layout/_components/AuthExpiredNotice";
import { AuthMeResponseWorkspace } from "@umbraculum/contracts";

type WorkspaceListItem = AuthMeResponseWorkspace;

const AUTH_CHANGED_EVENT = "brewery:auth-changed";
const BRAND_COOKIE = "UI_BRAND";

function writeCookie(name: string, value: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function setBrand(brandKey: string) {
  writeCookie(BRAND_COOKIE, brandKey);
  document.documentElement.dataset['brand'] = brandKey;
}

export default function SelectWorkspacePage() {
  const locale = useLocale();
  const t = useTranslations("auth.selectWorkspace");
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await fetchAuthMe();
        if (!res.ok) {
          setAuthExpired(true);
          return;
        }
        const parsed = res.data;
        if (!cancelled) setWorkspaces(parsed.workspaces);
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

  const hasWorkspaces = useMemo(() => workspaces.length > 0, [workspaces.length]);

  const onPick = async (workspaceId: string) => {
    setSubmittingId(workspaceId);
    setError(null);
    try {
      const picked = workspaces.find((w) => w.id === workspaceId) ?? null;
      const brandKey = (picked?.brandKey && typeof picked.brandKey === "string" ? picked.brandKey : "default") ?? "default";
      setBrand(brandKey);

      await setActiveWorkspace(webPlatformApiClient(), { workspaceId });
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      router.replace(`/${locale}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(typeof err.body === "string" ? err.body : JSON.stringify(err.body));
      } else {
        setError(String(err));
      }
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
      {authExpired ? <AuthExpiredNotice forceVisible nextOverride={`/${locale}/select-workspace`} /> : null}
      <H1 mt={0}>{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {error ? <ErrorBox mt="$3">{error}</ErrorBox> : null}

      {!loading && !hasWorkspaces ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noWorkspacesFound")}
        </SizableText>
      ) : null}

      {hasWorkspaces ? (
        <YStack gap="$2" mt="$3">
          {workspaces.map((w) => (
            <Button
              key={w.id}
              onPress={() => void onPick(w.id)}
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
                  {w.name}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  · {w.role}
                </SizableText>
                {submittingId === w.id ? (
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

