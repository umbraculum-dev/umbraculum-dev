"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { H1, H2, SizableText, Spinner, View, XStack, YStack } from "tamagui";

import { ApiClientError, getWorkspaceAiUsage } from "@umbraculum/api-client";
import type { WorkspaceAiUsageResponse } from "@umbraculum/contracts";

import { webPlatformApiClient } from "../../../_lib/webApiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { DashboardClient } from "../../../DashboardClient";

import { UsageTokenChart } from "../_components/UsageTokenChart";

interface DailyPoint {
  day: string;
  tokensIn: number;
  tokensOut: number;
  calls: number;
}

interface ByUserRow {
  userId: string;
  email: string | null;
  role: string | null;
  tokensInToday: number;
  tokensOutToday: number;
  tokensInMonth: number;
  tokensOutMonth: number;
  costMicroUsdMonth: number;
  callCountMonth: number;
}

interface RoleAlert {
  role: string;
  used: number;
  limit: number;
  percent: number;
}

interface UserAlert {
  userId: string;
  usedToday: number;
  cap: number;
  percent: number;
}

interface UsageResponse extends WorkspaceAiUsageResponse {}

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

function formatPercent(p: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(p);
}

export default function AiUsagePage() {
  const tCommon = useTranslations("common");
  const tUsage = useTranslations("ai.usage");
  const auth = useRequireAuth({ requireActiveWorkspace: true });

  const [data, setData] = useState<UsageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const workspaceId =
    auth.status === "ready" ? auth.me.activeWorkspaceId ?? null : null;

  const fetchData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const body = await getWorkspaceAiUsage(webPlatformApiClient(), workspaceId);
      setData(body);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? ((err.body as { error?: { message?: string } })?.error?.message ?? err.message)
          : err instanceof Error
            ? err.message
            : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.dailySeries.map((d) => ({
      day: d.day,
      total: d.tokensIn + d.tokensOut,
      calls: d.calls,
    }));
  }, [data]);

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
    <YStack gap="$4">
      <H1 id="ai-usage-title">{tUsage("title")}</H1>
        <SizableText theme="alt2">{tUsage("description")}</SizableText>

        {error ? (
          <View role="alert" backgroundColor="$red3" padding="$3" borderRadius="$3">
            <SizableText color="$red11">{error}</SizableText>
          </View>
        ) : null}

        {loading && !data ? (
          <XStack gap="$2" alignItems="center">
            <Spinner />
            <SizableText>{tCommon("loading")}</SizableText>
          </XStack>
        ) : null}

        {data ? (
          <>
            {/* Alerts */}
            {data.alerts.roleAlerts.length > 0 || data.alerts.userAlerts.length > 0 ? (
              <YStack
                gap="$2"
                backgroundColor="$yellow3"
                padding="$3"
                borderRadius="$3"
                role="alert"
                aria-live="polite"
              >
                <H2 size="$5">{tUsage("alerts.heading")}</H2>
                {data.alerts.roleAlerts.map((a) => (
                  <SizableText key={`role-${a.role}`}>
                    {tUsage("alerts.roleApproachingLimit", {
                      role: a.role,
                      percent: formatPercent(a.percent),
                      used: formatNumber(a.used),
                      limit: formatNumber(a.limit),
                    })}
                  </SizableText>
                ))}
                {data.alerts.userAlerts.map((a) => {
                  const member = data.byUser.find((u) => u.userId === a.userId);
                  const label = member?.email ?? a.userId.slice(0, 8);
                  return (
                    <SizableText key={`user-${a.userId}`}>
                      {tUsage("alerts.userApproachingDailyCap", {
                        user: label,
                        percent: formatPercent(a.percent),
                        used: formatNumber(a.usedToday),
                        cap: formatNumber(a.cap),
                      })}
                    </SizableText>
                  );
                })}
              </YStack>
            ) : null}

            {/* Monthly summary cards */}
            <XStack gap="$3" flexWrap="wrap">
              <SummaryCard
                label={tUsage("monthly.callCount")}
                value={formatNumber(data.monthly.callCount)}
              />
              <SummaryCard
                label={tUsage("monthly.tokensIn")}
                value={formatNumber(data.monthly.tokensIn)}
              />
              <SummaryCard
                label={tUsage("monthly.tokensOut")}
                value={formatNumber(data.monthly.tokensOut)}
              />
              <SummaryCard
                label={tUsage("monthly.total")}
                value={formatNumber(data.monthly.tokensIn + data.monthly.tokensOut)}
              />
            </XStack>

            {/* Chart */}
            <YStack gap="$2">
              <H2 size="$6">{tUsage("chart.title")}</H2>
              <UsageTokenChart data={chartData} ariaLabel={tUsage("chart.ariaLabel")} />
            </YStack>

            {/* Per-user table */}
            <YStack gap="$2">
              <H2 size="$6">{tUsage("table.title")}</H2>
              {data.byUser.length === 0 ? (
                <SizableText theme="alt2">{tUsage("table.empty")}</SizableText>
              ) : (
                <UsageTable
                  rows={data.byUser}
                  perUserDailyCap={data.perUserDailyCap}
                  roleLimits={data.roleLimits}
                  labels={{
                    user: tUsage("table.user"),
                    role: tUsage("table.role"),
                    today: tUsage("table.today"),
                    month: tUsage("table.month"),
                    roleLimit: tUsage("table.roleLimit"),
                    rolePercent: tUsage("table.rolePercent"),
                  }}
                />
              )}
            </YStack>
          </>
        ) : null}
      <DashboardClient />
    </YStack>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <YStack
      backgroundColor="$background"
      padding="$3"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
      minWidth={140}
    >
      <SizableText size="$2" theme="alt2">
        {label}
      </SizableText>
      <SizableText size="$7" fontWeight="700">
        {value}
      </SizableText>
    </YStack>
  );
}

function UsageTable({
  rows,
  perUserDailyCap,
  roleLimits,
  labels,
}: {
  rows: ByUserRow[];
  perUserDailyCap: number;
  roleLimits: Record<string, number>;
  labels: {
    user: string;
    role: string;
    today: string;
    month: string;
    roleLimit: string;
    rolePercent: string;
  };
}) {
  return (
    <View>
      {/*
       * Plain table here because Tamagui doesn't ship a Table primitive and
       * the dashboard is web-only for v0 (native dashboard is deferred).
       */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead>
          <tr>
            <th style={cellHeaderStyle}>{labels.user}</th>
            <th style={cellHeaderStyle}>{labels.role}</th>
            <th style={cellHeaderStyle}>{labels.today}</th>
            <th style={cellHeaderStyle}>{labels.month}</th>
            <th style={cellHeaderStyle}>{labels.roleLimit}</th>
            <th style={cellHeaderStyle}>{labels.rolePercent}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const today = r.tokensInToday + r.tokensOutToday;
            const month = r.tokensInMonth + r.tokensOutMonth;
            const limit = r.role ? roleLimits[r.role] ?? 0 : 0;
            const percent = limit > 0 ? Math.min(month / limit, 1) : 0;
            const todayPercent =
              perUserDailyCap > 0 ? Math.min(today / perUserDailyCap, 1) : 0;
            return (
              <tr key={r.userId}>
                <td style={cellStyle}>{r.email ?? r.userId.slice(0, 8)}</td>
                <td style={cellStyle}>{r.role ?? "—"}</td>
                <td style={cellStyle}>
                  {formatNumber(today)}
                  {perUserDailyCap > 0 ? (
                    <SizableText size="$1" theme="alt2">
                      {" "}
                      ({formatPercent(todayPercent)})
                    </SizableText>
                  ) : null}
                </td>
                <td style={cellStyle}>{formatNumber(month)}</td>
                <td style={cellStyle}>{limit > 0 ? formatNumber(limit) : "—"}</td>
                <td style={cellStyle}>{limit > 0 ? formatPercent(percent) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </View>
  );
}

const cellHeaderStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid var(--borderColor, #444)",
  fontWeight: 600,
};

const cellStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid var(--borderColor, #333)",
};
