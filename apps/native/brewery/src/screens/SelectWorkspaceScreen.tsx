import React, { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";

import { getAuthMe, setActiveWorkspace } from "@umbraculum/api-client";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";

import { useAuth, nativePlatformApiClient } from "@umbraculum/native-shell/auth";

type WorkspaceListItem = { id: string; name: string; role: string; brandKey?: string | null };

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; workspaces: WorkspaceListItem[]; activeWorkspaceId: string | null };

export function SelectWorkspaceScreen({ onDone }: { onDone?: () => void }) {
  const auth = useAuth();
  const { t } = useT("auth");

  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [state, setState] = useState<State>({ status: "loading" });
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      if (!token) throw new Error("Not authenticated");
      setState({ status: "loading" });

      const me = await getAuthMe(nativePlatformApiClient(token));
      const workspaces: WorkspaceListItem[] = me.workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        role: w.role,
        brandKey: w.brandKey ?? null,
      }));
      setState({ status: "ready", workspaces, activeWorkspaceId: me.activeWorkspaceId });
    } catch (err) {
      setState({ status: "error", error: String(err) });
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const pick = useCallback(
    async (workspaceId: string) => {
      try {
        if (!token) throw new Error("Not authenticated");
        setSubmittingId(workspaceId);

        await setActiveWorkspace(nativePlatformApiClient(token), { workspaceId });

        onDone?.();
      } catch (err) {
        Alert.alert(t("selectWorkspace.title"), String(err));
      } finally {
        setSubmittingId(null);
      }
    },
    [token, onDone, t],
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

