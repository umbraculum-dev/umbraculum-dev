"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SizableText, View, YStack } from "tamagui";

import { Link } from "../src/i18n/navigation";
import { CodeInline } from "./_shell/_components/CodeInline";

const MONO_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

type HealthState =
  | { status: "idle" | "loading" }
  | { status: "ok"; data: unknown }
  | { status: "error"; error: string };

export function HealthStatusContent() {
  const t = useTranslations("health");
  const [state, setState] = useState<HealthState>({ status: "idle" });
  const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? "/api";

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
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("subtitle", { url: `${apiBase}/health` })}
      </SizableText>
      <YStack gap="$3" mt="$3">
        <View bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3" overflow="auto">
          <SizableText size="$2" style={{ fontFamily: MONO_FONT }} whiteSpace="pre-wrap">
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
  const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? "/api";

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
    const raw = (meState.data as { data?: unknown })?.data;
    if (!raw || typeof raw !== "object") return null;
    const rawRec = raw as {
      ok?: unknown;
      user?: { email?: unknown } | null;
      activeWorkspaceId?: unknown;
      activeAccountId?: unknown;
      role?: unknown;
    };
    if (rawRec.ok !== true) return null;
    const userEmail = typeof rawRec.user?.email === "string" ? rawRec.user.email : null;
    const activeWorkspaceId =
      rawRec.activeWorkspaceId === null
        ? null
        : typeof rawRec.activeWorkspaceId === "string"
          ? rawRec.activeWorkspaceId
          : rawRec.activeAccountId === null
            ? null
            : typeof rawRec.activeAccountId === "string"
              ? rawRec.activeAccountId
              : null;
    const role = rawRec.role === null ? null : typeof rawRec.role === "string" ? rawRec.role : null;
    return { userEmail, activeWorkspaceId, role };
  })();

  return (
    <>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
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

