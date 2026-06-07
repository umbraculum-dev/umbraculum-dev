"use client";

import { H1, H2, SizableText, Spinner, View, XStack, YStack } from "tamagui";

import { DashboardClient } from "../../../../../DashboardClient";
import { UsageTokenChart } from "../../_components/UsageTokenChart";
import type { AiUsagePageModel } from "../_hooks/useAiUsagePage";
import { formatNumber, formatPercent } from "./aiUsageFormatters";
import { AiUsageSummaryCard } from "./AiUsageSummaryCard";
import { AiUsageTable } from "./AiUsageTable";

export function AiUsagePageContent(props: { model: AiUsagePageModel }) {
  const { model } = props;
  const { tCommon, tUsage, auth, data, error, loading, chartData } = model;

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
              <AiUsageSummaryCard
                label={tUsage("monthly.callCount")}
                value={formatNumber(data.monthly.callCount)}
              />
              <AiUsageSummaryCard
                label={tUsage("monthly.tokensIn")}
                value={formatNumber(data.monthly.tokensIn)}
              />
              <AiUsageSummaryCard
                label={tUsage("monthly.tokensOut")}
                value={formatNumber(data.monthly.tokensOut)}
              />
              <AiUsageSummaryCard
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
                <AiUsageTable
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
