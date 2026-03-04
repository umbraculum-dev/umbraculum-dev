"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SizableText, View, YStack } from "tamagui";

import { Link } from "../src/i18n/navigation";
import { CodeInline } from "./_components/CodeInline";

const MONO_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

type HealthState =
  | { status: "idle" | "loading" }
  | { status: "ok"; data: unknown }
  | { status: "error"; error: string };

export function HealthStatusContent() {
  const t = useTranslations("health");
  const [state, setState] = useState<HealthState>({ status: "idle" });
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`${apiBase}/health`)
      .then(async (res) => {
        const data = (await res.json()) as unknown;
        if (!cancelled) setState({ status: "ok", data: { httpOk: res.ok, data } });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  return (
    <>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle", { url: `${apiBase}/health` })}
      </SizableText>
      <YStack gap="$3" mt="$3">
        <View bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3" overflow="auto">
          <SizableText size="$2" fontFamily={MONO_FONT} whiteSpace="pre-wrap">
            {JSON.stringify(state, null, 2)}
          </SizableText>
        </View>
      </YStack>
    </>
  );
}

export function AppPermissionsContent() {
  const t = useTranslations("health");
  const [meState, setMeState] = useState<HealthState>({ status: "idle" });
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

  useEffect(() => {
    let cancelled = false;
    setMeState({ status: "loading" });

    fetch(`${apiBase}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        const data = (await res.json()) as unknown;
        if (!cancelled) setMeState({ status: "ok", data: { httpOk: res.ok, data } });
      })
      .catch((err) => {
        if (!cancelled) setMeState({ status: "error", error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const meSummary = (() => {
    if (meState.status !== "ok") return null;
    const raw = (meState.data as any)?.data;
    if (!raw || typeof raw !== "object" || (raw as any).ok !== true) return null;
    const userEmail = typeof (raw as any).user?.email === "string" ? (raw as any).user.email : null;
    const activeWorkspaceId =
      (raw as any).activeWorkspaceId === null
        ? null
        : typeof (raw as any).activeWorkspaceId === "string"
          ? ((raw as any).activeWorkspaceId as string)
          : (raw as any).activeAccountId === null
            ? null
            : typeof (raw as any).activeAccountId === "string"
              ? ((raw as any).activeAccountId as string)
              : null;
    const role =
      (raw as any).role === null ? null : typeof (raw as any).role === "string" ? ((raw as any).role as string) : null;
    return { userEmail, activeWorkspaceId, role };
  })();

  return (
    <>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("appPermissions.subtitle")}
      </SizableText>

      <YStack gap="$1.5" mt="$2.5">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("appPermissions.userLabel")}: <CodeInline>{meSummary?.userEmail ?? "—"}</CodeInline>
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("appPermissions.activeWorkspaceLabel")}: <CodeInline>{meSummary?.activeWorkspaceId ?? "—"}</CodeInline>
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("appPermissions.roleLabel")}: <CodeInline>{meSummary?.role ?? t("appPermissions.roleUnknown")}</CodeInline>
        </SizableText>
      </YStack>

      <View mt="$2.5">
        <Link href="/select-workspace">{t("appPermissions.selectWorkspaceCta")}</Link>
      </View>
    </>
  );
}

