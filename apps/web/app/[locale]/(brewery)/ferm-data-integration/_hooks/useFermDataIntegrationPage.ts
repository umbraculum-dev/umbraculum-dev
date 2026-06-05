"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  attachTiltDevice,
  createWorkspaceIntegration,
  detachTiltDevice,
  getWorkspaceIntegration,
  listIntegrationDevices,
  listRecentBrewSessions,
  revealIntegrationToken,
  revokeIntegration,
  rotateIntegrationToken,
} from "@umbraculum/api-client";

import { webPlatformApiClient } from "../../../../_lib/webApiClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import {
  createKindRecord,
  INTEGRATION_KINDS,
  type IntegrationDevice,
  type IntegrationKind,
  type IntegrationSummary,
  type RecentBrewSession,
} from "../_lib/fermIntegrationTypes";

export function useFermDataIntegrationPage() {
  const t = useTranslations("dashboard.fermDataIntegration");
  const [openSections, setOpenSections] = useState<string[]>([]);

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const workspaceId = authState.status === "ready" ? authState.me.activeWorkspaceId ?? "" : "";
  const canCall = authState.status === "ready" && !!workspaceId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<Record<IntegrationKind, IntegrationSummary | null>>(
    createKindRecord<IntegrationSummary | null>(null),
  );
  const [devicesByKind, setDevicesByKind] = useState<Record<IntegrationKind, IntegrationDevice[]>>(
    createKindRecord<IntegrationDevice[]>([]),
  );
  const [recentBrewSessions, setRecentBrewSessions] = useState<RecentBrewSession[]>([]);

  const [newTokens, setNewTokens] = useState<Record<IntegrationKind, string | null>>(createKindRecord(null));
  const [newPublicPaths, setNewPublicPaths] = useState<Record<IntegrationKind, string | null>>(createKindRecord(null));
  const [copied, setCopied] = useState<null | { kind: IntegrationKind; field: "url" | "token" }>(null);

  const [attachSessionByDeviceId, setAttachSessionByDeviceId] = useState<Record<string, string>>({});
  const [deviceWorkingId, setDeviceWorkingId] = useState<string | null>(null);
  const [integrationWorking, setIntegrationWorking] = useState<null | {
    kind: IntegrationKind;
    action: "create" | "rotate" | "revoke" | "reveal";
  }>(null);

  const getFullPublicUrl = (kind: IntegrationKind) => {
    const path = newPublicPaths[kind];
    if (!path || typeof window === "undefined") return null;
    return `${window.location.origin}${path}`;
  };

  const brewSessionOptions = useMemo(() => {
    return (recentBrewSessions ?? []).map((s) => ({
      value: s.id,
      label: `${s.code} — ${s.recipe?.name ?? ""}`.trim(),
    }));
  }, [recentBrewSessions]);

  const tiltIntegration = integrations.tilt;
  const tiltDevices = devicesByKind.tilt;
  const ispindelIntegration = integrations.ispindel;
  const raptIntegration = integrations.rapt;

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const integrationRequests = INTEGRATION_KINDS.map((kind) =>
        getWorkspaceIntegration(client, workspaceId, kind),
      );
      const deviceRequests = INTEGRATION_KINDS.map((kind) =>
        listIntegrationDevices(client, workspaceId, kind, { includeReadings: true, readingsLimit: 50 }),
      );
      const [integrationResponses, deviceResponses, sessionsData] = await Promise.all([
        Promise.all(integrationRequests),
        Promise.all(deviceRequests),
        listRecentBrewSessions(client, workspaceId, { limit: 25 }),
      ]);

      const nextIntegrations = createKindRecord<IntegrationSummary | null>(null);
      const nextDevices = createKindRecord<IntegrationDevice[]>([]);
      INTEGRATION_KINDS.forEach((kind, idx) => {
        nextIntegrations[kind] = (integrationResponses[idx]?.integration ?? null) as IntegrationSummary | null;
        const devices = deviceResponses[idx]?.devices;
        nextDevices[kind] = Array.isArray(devices) ? (devices as IntegrationDevice[]) : [];
      });

      setIntegrations(nextIntegrations);
      setDevicesByKind(nextDevices);
      const sessions = sessionsData?.brewSessions;
      setRecentBrewSessions(Array.isArray(sessions) ? (sessions as RecentBrewSession[]) : []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, workspaceId]);

  const copyToClipboard = async (kind: IntegrationKind, field: "url" | "token", value: string) => {
    setCopied(null);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopied({ kind, field });
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const updateKindTokens = (kind: IntegrationKind, token: string, publicPath: string) => {
    setNewTokens((prev) => ({ ...prev, [kind]: token || null }));
    setNewPublicPaths((prev) => ({ ...prev, [kind]: publicPath || null }));
  };

  const reveal = async (kind: IntegrationKind) => {
    if (!canCall) return;
    setIntegrationWorking({ kind, action: "reveal" });
    setError(null);
    try {
      const body = await revealIntegrationToken(webPlatformApiClient(), workspaceId, kind);
      updateKindTokens(kind, String(body?.token ?? ""), String(body?.publicPath ?? ""));
    } catch (e) {
      setError(String(e));
    } finally {
      setIntegrationWorking(null);
    }
  };

  const createOrRotate = async (kind: IntegrationKind) => {
    if (!canCall) return;
    setIntegrationWorking({ kind, action: "create" });
    setError(null);
    try {
      const body = await createWorkspaceIntegration(webPlatformApiClient(), workspaceId, kind);
      updateKindTokens(kind, String(body?.token ?? ""), String(body?.publicPath ?? ""));
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setIntegrationWorking(null);
    }
  };

  const rotateToken = async (kind: IntegrationKind) => {
    if (!canCall) return;
    setIntegrationWorking({ kind, action: "rotate" });
    setError(null);
    try {
      const body = await rotateIntegrationToken(webPlatformApiClient(), workspaceId, kind);
      updateKindTokens(kind, String(body?.token ?? ""), String(body?.publicPath ?? ""));
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setIntegrationWorking(null);
    }
  };

  const revoke = async (kind: IntegrationKind) => {
    if (!canCall) return;
    setIntegrationWorking({ kind, action: "revoke" });
    setError(null);
    try {
      await revokeIntegration(webPlatformApiClient(), workspaceId, kind);
      updateKindTokens(kind, "", "");
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setIntegrationWorking(null);
    }
  };

  const attachDevice = async (deviceId: string) => {
    if (!canCall) return;
    const brewSessionId = attachSessionByDeviceId[deviceId] ?? "";
    if (!brewSessionId) return;
    setDeviceWorkingId(deviceId);
    setError(null);
    try {
      await attachTiltDevice(webPlatformApiClient(), workspaceId, deviceId, { brewSessionId });
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setDeviceWorkingId(null);
    }
  };

  const detachDevice = async (deviceId: string) => {
    if (!canCall) return;
    setDeviceWorkingId(deviceId);
    setError(null);
    try {
      await detachTiltDevice(webPlatformApiClient(), workspaceId, deviceId);
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setDeviceWorkingId(null);
    }
  };

  const isAnyWorking = integrationWorking !== null;

  return {
    t,
    openSections,
    setOpenSections,
    canCall,
    loading,
    error,
    integrations,
    tiltIntegration,
    tiltDevices,
    ispindelIntegration,
    raptIntegration,
    newTokens,
    newPublicPaths,
    copied,
    attachSessionByDeviceId,
    setAttachSessionByDeviceId,
    deviceWorkingId,
    integrationWorking,
    getFullPublicUrl,
    brewSessionOptions,
    isAnyWorking,
    copyToClipboard,
    reveal,
    createOrRotate,
    rotateToken,
    revoke,
    attachDevice,
    detachDevice,
  };
}

export type UseFermDataIntegrationPageModel = ReturnType<typeof useFermDataIntegrationPage>;
