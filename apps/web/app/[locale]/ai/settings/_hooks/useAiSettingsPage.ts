"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { WorkspaceAiSettings } from "@umbraculum/contracts";
import {
  ApiClientError,
  getWorkspaceAiSettings,
  patchWorkspaceAiSettings,
} from "@umbraculum/api-client";

import { webPlatformApiClient } from "../../../../_shell/_lib/webApiClient";
import { useRequireAuth } from "../../../../_shell/_lib/useRequireAuth";

export const ROLE_KEYS = ["brewery_admin", "member", "viewer"] as const;
type _RoleKey = (typeof ROLE_KEYS)[number];

export interface FormState {
  enabled: boolean;
  apiKey: string;
  clearKey: boolean;
  roleLimits: Record<string, number>;
  perUserDailyCap: number;
  dataEgressAccepted: boolean;
}

function settingsToForm(s: WorkspaceAiSettings): FormState {
  const limits: Record<string, number> = {};
  for (const k of ROLE_KEYS) {
    const v = (s.roleLimits)[k];
    limits[k] = typeof v === "number" ? v : 0;
  }
  return {
    enabled: s.enabled,
    apiKey: "",
    clearKey: false,
    roleLimits: limits,
    perUserDailyCap: s.perUserDailyCap,
    dataEgressAccepted: s.dataEgressAccepted,
  };
}

export const CONCIERGE_URL = process.env['NEXT_PUBLIC_CONCIERGE_BOOKING_URL'] ?? "";

function apiErrorMessage(body: unknown): string {
  const errData = body as { error?: { message?: string } } | undefined;
  return errData?.error?.message ?? (typeof body === "string" ? body : JSON.stringify(body));
}

export function useAiSettingsPage() {
  const tCommon = useTranslations("common");
  const tSettings = useTranslations("ai.settings");
  const tRoles = useTranslations("ai.settings.roles");
  const auth = useRequireAuth({ requireActiveWorkspace: true });

  const [settings, setSettings] = useState<WorkspaceAiSettings | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isAdmin = auth.status === "ready" && auth.me.role === "brewery_admin";
  const workspaceId = auth.status === "ready" ? auth.me.activeWorkspaceId : null;

  const loadSettings = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await getWorkspaceAiSettings(webPlatformApiClient(), workspaceId);
      setSettings(res.settings);
      setForm(settingsToForm(res.settings));
    } catch {
      // keep prior state on load failure
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const onSave = async () => {
    if (!workspaceId || !form) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = {
        enabled: form.enabled,
        roleLimits: form.roleLimits,
        perUserDailyCap: form.perUserDailyCap,
        dataEgressAccepted: form.dataEgressAccepted,
      };
      if (form.clearKey) {
        payload['apiKey'] = "";
      } else if (form.apiKey.length > 0) {
        payload['apiKey'] = form.apiKey;
      }
      const res = await patchWorkspaceAiSettings(webPlatformApiClient(), workspaceId, payload);
      setSettings(res.settings);
      setForm(settingsToForm(res.settings));
      setSaved(true);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? apiErrorMessage(err.body) : String(err);
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    tCommon,
    tSettings,
    tRoles,
    auth,
    settings,
    form,
    setForm,
    loading,
    saving,
    saved,
    saveError,
    isAdmin,
    onSave,
  };
}

export type AiSettingsPageModel = ReturnType<typeof useAiSettingsPage>;
