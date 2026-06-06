"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { ApiClientError, getWorkspaceAiUsage } from "@umbraculum/api-client";

import { webPlatformApiClient } from "../../../../_lib/webApiClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";

import type { UsageResponse } from "../_components/aiUsageTypes";

export function useAiUsagePage() {
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

  return {
    tCommon,
    tUsage,
    auth,
    data,
    error,
    loading,
    chartData,
  };
}

export type AiUsagePageModel = ReturnType<typeof useAiUsagePage>;
