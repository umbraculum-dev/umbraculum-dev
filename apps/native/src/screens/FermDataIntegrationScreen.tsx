import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Input, Screen, Spinner, Text } from "@brewery/ui";

import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";

type IntegrationKind = "tilt" | "ispindel" | "rapt";
const INTEGRATION_KINDS: IntegrationKind[] = ["tilt", "ispindel", "rapt"];

type IntegrationSummary = {
  id: string;
  workspaceId: string;
  kind: IntegrationKind;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type IntegrationDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
  lastSeenAt: string | null;
  lastReading?: {
    recordedAt: string | null;
    receivedAt: string;
    temperatureC: number | null;
    gravitySg: number | null;
  } | null;
};

type IntegrationTokenState = {
  token: string | null;
  publicPath: string | null;
};

export function FermDataIntegrationScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const { t } = useT("dashboard.fermDataIntegration");

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    error?: string;
    workspaceId?: string | null;
    integrations: Record<IntegrationKind, IntegrationSummary | null>;
    devices: Record<IntegrationKind, IntegrationDevice[]>;
    tokens: Record<IntegrationKind, IntegrationTokenState>;
    working?: { kind: IntegrationKind; action: "create" | "reveal" | "rotate" | "revoke" } | null;
  }>({
    status: "loading",
    integrations: { tilt: null, ispindel: null, rapt: null },
    devices: { tilt: [], ispindel: [], rapt: [] },
    tokens: {
      tilt: { token: null, publicPath: null },
      ispindel: { token: null, publicPath: null },
      rapt: { token: null, publicPath: null },
    },
    working: null,
  });

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createApiClient(baseUrl, bearerTokenAuth(() => token));
  }, [baseUrl, token]);

  const buildPublicUrl = useCallback(
    (publicPath: string | null) => {
      if (!publicPath || !baseUrl) return null;
      const b = baseUrl.replace(/\/+$/, "");
      const p = publicPath.replace(/^\/+/, "");
      return `${b}/${p}`;
    },
    [baseUrl],
  );

  const refresh = useCallback(async () => {
    try {
      if (!api) throw new Error("Not authenticated");
      setState((prev) => ({ ...prev, status: "loading", error: undefined }));

      const meRes = await api.get("/api/auth/me");
      if (!meRes.ok) throw new Error(typeof meRes.data === "string" ? meRes.data : JSON.stringify(meRes.data));
      const me = meRes.data as any;
      const workspaceId = typeof me?.activeWorkspaceId === "string" ? me.activeWorkspaceId : null;
      if (!workspaceId) throw new Error("No active workspace selected");

      const integrationsRes = await Promise.all(
        INTEGRATION_KINDS.map((kind) => api.get(`/api/workspaces/${workspaceId}/integrations/${kind}`)),
      );
      const devicesRes = await Promise.all(
        INTEGRATION_KINDS.map((kind) => api.get(`/api/workspaces/${workspaceId}/integrations/${kind}/devices`)),
      );

      integrationsRes.forEach((res) => {
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      });
      devicesRes.forEach((res) => {
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      });

      const nextIntegrations = { tilt: null, ispindel: null, rapt: null } as Record<
        IntegrationKind,
        IntegrationSummary | null
      >;
      const nextDevices = { tilt: [], ispindel: [], rapt: [] } as Record<IntegrationKind, IntegrationDevice[]>;
      INTEGRATION_KINDS.forEach((kind, idx) => {
        nextIntegrations[kind] = (integrationsRes[idx].data as any).integration ?? null;
        nextDevices[kind] = (devicesRes[idx].data as any).devices ?? [];
      });

      setState((prev) => ({
        ...prev,
        status: "ready",
        workspaceId,
        integrations: nextIntegrations,
        devices: nextDevices,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, status: "error", error: String(err) }));
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setWorking = (kind: IntegrationKind, action: "create" | "reveal" | "rotate" | "revoke") => {
    setState((prev) => ({ ...prev, working: { kind, action } }));
  };

  const clearWorking = () => {
    setState((prev) => ({ ...prev, working: null }));
  };

  const updateTokens = (kind: IntegrationKind, tokenValue: string, publicPath: string) => {
    setState((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        [kind]: { token: tokenValue || null, publicPath: publicPath || null },
      },
    }));
  };

  const reveal = async (kind: IntegrationKind) => {
    try {
      if (!api) throw new Error("Not authenticated");
      if (!state.workspaceId) throw new Error("No active workspace selected");
      setWorking(kind, "reveal");
      const res = await api.get(`/api/workspaces/${state.workspaceId}/integrations/${kind}/reveal`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      updateTokens(kind, String((res.data as any)?.token ?? ""), String((res.data as any)?.publicPath ?? ""));
    } catch (err) {
      Alert.alert(t("sections.integration.title"), String(err));
    } finally {
      clearWorking();
    }
  };

  const createOrRotate = async (kind: IntegrationKind) => {
    try {
      if (!api) throw new Error("Not authenticated");
      if (!state.workspaceId) throw new Error("No active workspace selected");
      setWorking(kind, "create");
      const res = await api.post(`/api/workspaces/${state.workspaceId}/integrations/${kind}`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      updateTokens(kind, String((res.data as any)?.token ?? ""), String((res.data as any)?.publicPath ?? ""));
      await refresh();
    } catch (err) {
      Alert.alert(t("sections.integration.title"), String(err));
    } finally {
      clearWorking();
    }
  };

  const rotateToken = async (kind: IntegrationKind) => {
    try {
      if (!api) throw new Error("Not authenticated");
      if (!state.workspaceId) throw new Error("No active workspace selected");
      setWorking(kind, "rotate");
      const res = await api.post(`/api/workspaces/${state.workspaceId}/integrations/${kind}/rotate-token`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      updateTokens(kind, String((res.data as any)?.token ?? ""), String((res.data as any)?.publicPath ?? ""));
      await refresh();
    } catch (err) {
      Alert.alert(t("sections.integration.title"), String(err));
    } finally {
      clearWorking();
    }
  };

  const revoke = async (kind: IntegrationKind) => {
    try {
      if (!api) throw new Error("Not authenticated");
      if (!state.workspaceId) throw new Error("No active workspace selected");
      setWorking(kind, "revoke");
      const res = await api.post(`/api/workspaces/${state.workspaceId}/integrations/${kind}/revoke`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      updateTokens(kind, "", "");
      await refresh();
    } catch (err) {
      Alert.alert(t("sections.integration.title"), String(err));
    } finally {
      clearWorking();
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <Heading fontSize={28} mb="$2">
            {t("title")}
          </Heading>
          <Text fontSize={14} opacity={0.85}>
            {t("subtitle")}
          </Text>

          <Card gap="$2" aria-label={t("sections.integration.title")}>
            <Heading fontSize={18}>{t("sections.integration.title")}</Heading>
            <Text fontSize={12} opacity={0.85}>
              {t("sections.integration.intro")}
            </Text>

            {state.status === "loading" ? <Spinner /> : null}
            {state.status === "error" ? (
              <Text fontSize={12} color="$red10">
                {state.error}
              </Text>
            ) : null}

            {state.status === "ready" ? (
              <View style={{ gap: 16 }}>
                {INTEGRATION_KINDS.map((kind) => {
                  const integration = state.integrations[kind];
                  const devices = state.devices[kind];
                  const tokenState = state.tokens[kind];
                  const isWorking = state.working?.kind === kind;
                  const statusLabel = isWorking
                    ? t("sections.integration.working")
                    : integration
                      ? t("sections.integration.configured")
                      : t("sections.integration.notConfigured");

                  const titleKey =
                    kind === "tilt"
                      ? "sections.integration.tiltTitle"
                      : kind === "ispindel"
                        ? "sections.integration.ispindelTitle"
                        : "sections.integration.raptTitle";
                  const warnKey =
                    kind === "tilt"
                      ? "sections.integration.tiltSupportedNotice"
                      : kind === "ispindel"
                        ? "sections.integration.ispindelWarning"
                        : "sections.integration.raptWarning";
                  const subtitleKey =
                    kind === "tilt"
                      ? "sections.integration.tiltSubtitle"
                      : kind === "ispindel"
                        ? "sections.integration.ispindelSubtitle"
                        : "sections.integration.raptSubtitle";

                  return (
                    <Card key={kind} gap="$2">
                      <Heading fontSize={16}>{t(titleKey)}</Heading>
                      <Text fontSize={12} color={kind === "tilt" ? "$green10" : "$yellow10"}>
                        {t(warnKey)}
                      </Text>
                      <Text fontSize={12} opacity={0.85}>
                        {t(subtitleKey)}
                      </Text>

                      {kind === "tilt" ? (
                        <View style={{ gap: 4 }}>
                          <Text fontSize={12}>{t("sections.integration.stepsLabel")}</Text>
                          <Text fontSize={12} opacity={0.85}>
                            {t("sections.integration.step1")}
                          </Text>
                          <Text fontSize={12} opacity={0.85}>
                            {t("sections.integration.step2")}
                          </Text>
                          <Text fontSize={12} opacity={0.85}>
                            {t("sections.integration.step3")}
                          </Text>
                        </View>
                      ) : null}

                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        <Button
                          onPress={() => void createOrRotate(kind)}
                          disabled={!api || state.status !== "ready" || Boolean(state.working)}
                          accessibilityLabel={
                            kind === "tilt"
                              ? t("sections.integration.actions.createAria")
                              : t("sections.integration.actions.createAriaGeneric")
                          }
                        >
                          {integration ? t("sections.integration.actions.createAgain") : t("sections.integration.actions.create")}
                        </Button>
                        <Button onPress={() => void reveal(kind)} disabled={!integration || Boolean(state.working)}>
                          {t("sections.integration.actions.reveal")}
                        </Button>
                        <Button
                          onPress={() => void rotateToken(kind)}
                          disabled={!integration || Boolean(state.working)}
                          accessibilityLabel={
                            kind === "tilt"
                              ? t("sections.integration.actions.rotateAria")
                              : t("sections.integration.actions.rotateAriaGeneric")
                          }
                        >
                          {t("sections.integration.actions.rotate")}
                        </Button>
                        <Button
                          onPress={() => void revoke(kind)}
                          disabled={!integration || Boolean(state.working)}
                          accessibilityLabel={
                            kind === "tilt"
                              ? t("sections.integration.actions.revokeAria")
                              : t("sections.integration.actions.revokeAriaGeneric")
                          }
                        >
                          {t("sections.integration.actions.revoke")}
                        </Button>
                        <Text fontSize={12} opacity={0.8}>
                          {statusLabel}
                        </Text>
                      </View>

                      {tokenState.publicPath ? (
                        <View style={{ gap: 4 }}>
                          <Text fontSize={12}>{t("sections.integration.cloudUrlLabel")}</Text>
                          <Input value={buildPublicUrl(tokenState.publicPath) ?? tokenState.publicPath} readOnly />
                          <Text fontSize={12} opacity={0.75}>
                            {kind === "tilt"
                              ? t("sections.integration.cloudUrlHelpTilt")
                              : t("sections.integration.cloudUrlHelpGeneric")}
                          </Text>
                        </View>
                      ) : null}

                      {tokenState.token ? (
                        <View style={{ gap: 4 }}>
                          <Text fontSize={12}>{t("sections.integration.tokenLabel")}</Text>
                          <Input value={tokenState.token} readOnly />
                          <Text fontSize={12} opacity={0.75}>
                            {t("sections.integration.tokenHelp")}
                          </Text>
                        </View>
                      ) : null}

                      {kind === "tilt" ? (
                        <View style={{ gap: 8 }}>
                          <Heading fontSize={14}>{t("sections.integration.devicesTitle")}</Heading>
                          {!devices.length ? (
                            <Text fontSize={12} opacity={0.75}>
                              {t("sections.integration.noDevices")}
                            </Text>
                          ) : (
                            devices.map((d) => (
                              <Card key={d.id} gap="$1">
                                <Text fontSize={12}>
                                  {t("sections.integration.device")}: {d.displayName ?? d.deviceKey}
                                </Text>
                                <Text fontSize={12} opacity={0.8}>
                                  {t("sections.integration.deviceKey")}: {d.deviceKey}
                                </Text>
                                {d.lastReading ? (
                                  <Text fontSize={12} opacity={0.8}>
                                    {t("sections.integration.lastReading")}:{" "}
                                    {typeof d.lastReading.temperatureC === "number"
                                      ? `${d.lastReading.temperatureC.toFixed(2)} °C`
                                      : "—"}
                                    ,{" "}
                                    {typeof d.lastReading.gravitySg === "number"
                                      ? `SG ${d.lastReading.gravitySg.toFixed(3)}`
                                      : "—"}
                                  </Text>
                                ) : (
                                  <Text fontSize={12} opacity={0.75}>
                                    {t("sections.integration.noReadingsYet")}
                                  </Text>
                                )}
                              </Card>
                            ))
                          )}
                        </View>
                      ) : null}
                    </Card>
                  );
                })}
              </View>
            ) : null}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
