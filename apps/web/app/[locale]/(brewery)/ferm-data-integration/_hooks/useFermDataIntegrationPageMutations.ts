"use client";

import { useState } from "react";

import {
  attachTiltDevice,
  createWorkspaceIntegration,
  detachTiltDevice,
  revealIntegrationToken,
  revokeIntegration,
  rotateIntegrationToken,
} from "@umbraculum/api-client";

import { webPlatformApiClient } from "../../../../_lib/webApiClient";
import type { IntegrationKind } from "../_lib/fermIntegrationTypes";
import type { FermDataIntegrationPageLoadModel } from "./useFermDataIntegrationPageLoad";

export function useFermDataIntegrationPageMutations(load: FermDataIntegrationPageLoadModel) {
  const {
    canCall,
    workspaceId,
    setError,
    setNewTokens,
    setNewPublicPaths,
    setCopied,
    attachSessionByDeviceId,
    refresh,
  } = load;

  const [deviceWorkingId, setDeviceWorkingId] = useState<string | null>(null);
  const [integrationWorking, setIntegrationWorking] = useState<null | {
    kind: IntegrationKind;
    action: "create" | "rotate" | "revoke" | "reveal";
  }>(null);

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
    deviceWorkingId,
    integrationWorking,
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
