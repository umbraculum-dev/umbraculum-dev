import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@umbraculum/api-client";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";

import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";

type WorkspaceListItem = { id: string; name: string; role: string; brandKey?: string | null };

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; workspaces: WorkspaceListItem[]; activeWorkspaceId: string | null };

export function SelectWorkspaceScreen({ onDone }: { onDone?: () => void }) {
  const auth = useAuth();
  const { t } = useT("auth");

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [state, setState] = useState<State>({ status: "loading" });
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createApiClient(baseUrl, bearerTokenAuth(() => token));
  }, [baseUrl, token]);

  const load = useCallback(async () => {
    try {
      if (!api) throw new Error("Not authenticated");
      setState({ status: "loading" });

      const res = await api.get("/api/auth/me");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));

      const raw = res.data as {
        workspaces?: unknown;
        accounts?: unknown;
        activeWorkspaceId?: unknown;
      } | null | undefined;
      const list = raw?.workspaces ?? raw?.accounts;
      const workspaces: WorkspaceListItem[] = Array.isArray(list) ? (list as WorkspaceListItem[]) : [];
      const activeWorkspaceId = typeof raw?.activeWorkspaceId === "string" ? raw.activeWorkspaceId : null;
      setState({ status: "ready", workspaces, activeWorkspaceId });
    } catch (err) {
      setState({ status: "error", error: String(err) });
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const pick = useCallback(
    async (workspaceId: string) => {
      try {
        if (!api) throw new Error("Not authenticated");
        setSubmittingId(workspaceId);

        const res = await api.post("/api/auth/active-workspace", { workspaceId });
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));

        onDone?.();
      } catch (err) {
        Alert.alert(t("selectWorkspace.title"), String(err));
      } finally {
        setSubmittingId(null);
      }
    },
    [api, onDone, t],
  );

  return (
    <Screen>
      <Heading fontSize={28}>{t("selectWorkspace.title")}</Heading>
      <Text fontSize={14} opacity={0.8}>
        {t("selectWorkspace.subtitle")}
      </Text>

      {state.status === "loading" ? (
        <View style={{ paddingVertical: 12 }}>
          <Spinner />
        </View>
      ) : state.status === "error" ? (
        <Text color="$red10" fontSize={12}>
          {state.error}
        </Text>
      ) : state.workspaces.length === 0 ? (
        <Text fontSize={14} opacity={0.8}>
          {t("selectWorkspace.noWorkspacesFound")}
        </Text>
      ) : (
        <Card gap="$2">
          {state.workspaces.map((w) => {
            const isActive = state.activeWorkspaceId === w.id;
            const isSubmitting = submittingId === w.id;
            return (
              <Button
                key={w.id}
                onPress={() => void pick(w.id)}
                disabled={Boolean(submittingId)}
                accessibilityRole="button"
                accessibilityLabel={w.name}
                width="100%"
                p="$3"
                background={isActive ? "$color4" : "$background"}
                borderWidth={1}
                borderColor="$borderColor"
              >
                <View style={{ width: "100%" }}>
                  <Text fontWeight="700" fontSize={16} lineHeight={20}>
                    {w.name}
                  </Text>
                  <Text mt="$1" opacity={0.8} fontSize={12} lineHeight={16}>
                    {w.role}
                    {isSubmitting ? ` · ${t("submitting")}` : ""}
                  </Text>
                </View>
              </Button>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

