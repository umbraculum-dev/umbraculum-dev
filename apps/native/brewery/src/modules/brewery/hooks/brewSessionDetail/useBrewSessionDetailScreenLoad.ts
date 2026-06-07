import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getAuthMe } from "@umbraculum/api-client";
import { getBrewSession } from "@umbraculum/api-client/brewery";

import type { BrewSessionDetail } from "./brewSessionDetailTypes";

type ApiClient = Parameters<typeof getBrewSession>[0];

export function useBrewSessionDetailScreenLoad(params: {
  api: ApiClient | null;
  brewSessionId: string;
}) {
  const { api, brewSessionId } = params;

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [session, setSession] = useState<BrewSessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!api || !brewSessionId) return;
    setError(null);
    setLoading(true);
    try {
      const [me, sessionRes] = await Promise.all([getAuthMe(api), getBrewSession(api, brewSessionId)]);
      const workspace = me.activeWorkspaceId ?? null;
      const s = (sessionRes.brewSession ?? null) as BrewSessionDetail | null;
      setWorkspaceId(typeof workspace === "string" ? workspace : null);
      setSession(s);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [api, brewSessionId]);

  useFocusEffect(
    useCallback(() => {
      void refreshSession();
    }, [refreshSession]),
  );

  return {
    workspaceId,
    session,
    loading,
    error,
    refreshSession,
  };
}
