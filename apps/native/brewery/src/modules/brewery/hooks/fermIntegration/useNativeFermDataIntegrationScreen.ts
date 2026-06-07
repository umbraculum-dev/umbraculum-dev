import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  createWorkspaceIntegration,
  getAuthMe,
  getWorkspaceIntegration,
  listIntegrationDevices,
  revealIntegrationToken,
  revokeIntegration,
  rotateIntegrationToken,
} from "@umbraculum/api-client";
import { useT } from "@umbraculum/i18n-react";

import { useAuth, getApiBaseUrl, nativePlatformApiClient } from "@umbraculum/native-shell/auth";

import {
  INTEGRATION_KINDS,
  type FermIntegrationWorkingAction,
  type IntegrationDevice,
  type IntegrationKind,
  type IntegrationSummary,
  type IntegrationTokenState,
} from "./fermIntegrationTypes";

export function useNativeFermDataIntegrationScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const { t } = useT("dashboard.fermDataIntegration");

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    error?: string | undefined;
    workspaceId?: string | null | undefined;
    integrations: Record<IntegrationKind, IntegrationSummary | null>;
    devices: Record<IntegrationKind, IntegrationDevice[]>;
    tokens: Record<IntegrationKind, IntegrationTokenState>;
    working?: { kind: IntegrationKind; action: FermIntegrationWorkingAction } | null | undefined;
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
    return nativePlatformApiClient(token);
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

      const me = await getAuthMe(api);
      const workspaceId = typeof me.activeWorkspaceId === "string" ? me.activeWorkspaceId : null;
      if (!workspaceId) throw new Error("No active workspace selected");

      const integrationsRes = await Promise.all(
        INTEGRATION_KINDS.map((kind) => getWorkspaceIntegration(api, workspaceId, kind)),
      );
      const devicesRes = await Promise.all(
        INTEGRATION_KINDS.map((kind) =>
          listIntegrationDevices(api, workspaceId, kind, { includeReadings: true, readingsLimit: 200 }),
        ),
      );

      const nextIntegrations = { tilt: null, ispindel: null, rapt: null } as Record<
        IntegrationKind,
        IntegrationSummary | null
      >;
      const nextDevices = { tilt: [], ispindel: [], rapt: [] } as Record<IntegrationKind, IntegrationDevice[]>;
      INTEGRATION_KINDS.forEach((kind, idx) => {
        const intRes = integrationsRes[idx];
        const devRes = devicesRes[idx];
        if (!intRes || !devRes) return;
        nextIntegrations[kind] = (intRes.integration ?? null) as IntegrationSummary | null;
        const devices = devRes.devices;
        nextDevices[kind] = Array.isArray(devices) ? (devices as IntegrationDevice[]) : [];
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

  const setWorking = (kind: IntegrationKind, action: FermIntegrationWorkingAction) => {
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
      const body = await revealIntegrationToken(api, state.workspaceId, kind);
      updateTokens(kind, String(body.token ?? ""), String(body.publicPath ?? ""));
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
      const body = await createWorkspaceIntegration(api, state.workspaceId, kind);
      updateTokens(kind, String(body.token ?? ""), String(body.publicPath ?? ""));
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
      const body = await rotateIntegrationToken(api, state.workspaceId, kind);
      updateTokens(kind, String(body.token ?? ""), String(body.publicPath ?? ""));
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
      await revokeIntegration(api, state.workspaceId, kind);
      updateTokens(kind, "", "");
      await refresh();
    } catch (err) {
      Alert.alert(t("sections.integration.title"), String(err));
    } finally {
      clearWorking();
    }
  };

  return {
    t,
    api,
    state,
    buildPublicUrl,
    createOrRotate,
    reveal,
    rotateToken,
    revoke,
  };
}

export type NativeFermDataIntegrationScreenModel = ReturnType<typeof useNativeFermDataIntegrationScreen>;
