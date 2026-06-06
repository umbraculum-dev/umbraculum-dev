"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  getWorkspaceIntegration,
  listIntegrationDevices,
  listRecentBrewSessions,
} from "@umbraculum/api-client";

import { webPlatformApiClient } from "../../../../_shell/_lib/webApiClient";
import { useRequireAuth } from "../../../../_shell/_lib/useRequireAuth";
import {
  createKindRecord,
  INTEGRATION_KINDS,
  type IntegrationDevice,
  type IntegrationKind,
  type IntegrationSummary,
  type RecentBrewSession,
} from "../_lib/fermIntegrationTypes";

export function useFermDataIntegrationPageLoad() {
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

  return {
    t,
    openSections,
    setOpenSections,
    canCall,
    workspaceId,
    loading,
    error,
    setError,
    integrations,
    setIntegrations,
    devicesByKind,
    recentBrewSessions,
    newTokens,
    setNewTokens,
    newPublicPaths,
    setNewPublicPaths,
    copied,
    setCopied,
    attachSessionByDeviceId,
    setAttachSessionByDeviceId,
    getFullPublicUrl,
    brewSessionOptions,
    tiltIntegration,
    tiltDevices,
    ispindelIntegration,
    raptIntegration,
    refresh,
  };
}

export type FermDataIntegrationPageLoadModel = ReturnType<typeof useFermDataIntegrationPageLoad>;
