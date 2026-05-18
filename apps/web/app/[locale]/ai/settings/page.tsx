"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, H1, H2, Input, SizableText, View, XStack, YStack } from "tamagui";

import type { WorkspaceAiSettings } from "@brewery/contracts";

import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { DashboardClient } from "../../../DashboardClient";

const ROLE_KEYS = ["brewery_admin", "member", "viewer"] as const;
type _RoleKey = (typeof ROLE_KEYS)[number];

interface FormState {
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

const CONCIERGE_URL = process.env['NEXT_PUBLIC_CONCIERGE_BOOKING_URL'] ?? "";

export default function AiSettingsPage() {
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
    const res = await apiFetch(`/api/workspaces/${workspaceId}/ai/settings`);
    if (res.ok && (res.data as { ok?: boolean })?.ok) {
      const next = (res.data as { settings: WorkspaceAiSettings }).settings;
      setSettings(next);
      setForm(settingsToForm(next));
    }
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const onSave = async () => {
    if (!workspaceId || !form) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    const body: Record<string, unknown> = {
      enabled: form.enabled,
      roleLimits: form.roleLimits,
      perUserDailyCap: form.perUserDailyCap,
      dataEgressAccepted: form.dataEgressAccepted,
    };
    if (form.clearKey) {
      body['apiKey'] = "";
    } else if (form.apiKey.length > 0) {
      body['apiKey'] = form.apiKey;
    }
    const res = await apiFetch(`/api/workspaces/${workspaceId}/ai/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok && (res.data as { ok?: boolean })?.ok) {
      const next = (res.data as { settings: WorkspaceAiSettings }).settings;
      setSettings(next);
      setForm(settingsToForm(next));
      setSaved(true);
    } else {
      const message =
        (res.data as { error?: { message?: string } })?.error?.message ?? "Save failed";
      setSaveError(message);
    }
  };

  if (auth.status === "loading" || loading) {
    return (
      <View aria-busy="true">
        <SizableText>{tCommon("loading")}</SizableText>
      </View>
    );
  }
  if (auth.status === "error") {
    return (
      <View role="alert">
        <SizableText>{auth.error}</SizableText>
      </View>
    );
  }
  if (!form || !settings) {
    return (
      <View role="alert">
        <SizableText>{tCommon("loading")}</SizableText>
      </View>
    );
  }

  return (
    <>
      <main role="main" aria-labelledby="ai-settings-title">
        <YStack gap="$4">
          <YStack gap="$2">
            <H1 id="ai-settings-title">{tSettings("title")}</H1>
            <SizableText size="$2" color="var(--text-muted)">
              {tSettings("subtitle")}
            </SizableText>
          </YStack>

          {!isAdmin ? (
            <View
              role="status"
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor: "var(--surface-subtle, #fafafa)",
              }}
            >
              <SizableText>{tSettings("memberOnlyNotice")}</SizableText>
            </View>
          ) : null}

          {saved ? (
            <View role="status">
              <SizableText color="var(--text-success, #2c7a2c)">
                {tSettings("savedMessage")}
              </SizableText>
            </View>
          ) : null}
          {saveError ? (
            <View role="alert">
              <SizableText color="var(--text-error, #a00)">
                {tSettings("saveError", { message: saveError })}
              </SizableText>
            </View>
          ) : null}

          {/* Enable toggle */}
          <YStack gap="$1">
            <label htmlFor="ai-enable" aria-label={tSettings("enableLabel")}>
              <XStack ai="center" gap="$2">
                <input
                  id="ai-enable"
                  type="checkbox"
                  checked={form.enabled}
                  disabled={!isAdmin || saving}
                  onChange={(e) => setForm((f) => (f ? { ...f, enabled: e.target.checked } : f))}
                  aria-describedby="enable-hint"
                />
                <SizableText>{tSettings("enableLabel")}</SizableText>
              </XStack>
            </label>
            <SizableText id="enable-hint" size="$1" color="var(--text-muted)">
              {tSettings("enableHint")}
            </SizableText>
          </YStack>

          {/* Provider (display-only in v0) */}
          <YStack gap="$1">
            <SizableText fontWeight="600">{tSettings("providerLabel")}</SizableText>
            <SizableText>Anthropic Claude</SizableText>
            <SizableText size="$1" color="var(--text-muted)">
              {tSettings("providerHint")}
            </SizableText>
          </YStack>

          {/* API key */}
          <YStack gap="$1">
            <label htmlFor="ai-api-key">
              <SizableText fontWeight="600">{tSettings("apiKeyLabel")}</SizableText>
            </label>
            <SizableText size="$1" color="var(--text-muted)">
              {settings.hasKey ? tSettings("apiKeyConfigured") : tSettings("apiKeyMissing")}
            </SizableText>
            <Input
              id="ai-api-key"
              value={form.apiKey}
              onChangeText={(t) => setForm((f) => (f ? { ...f, apiKey: t, clearKey: false } : f))}
              placeholder={tSettings("apiKeyPlaceholder")}
              secureTextEntry
              disabled={!isAdmin || saving}
              aria-describedby="ai-api-key-hint"
              autoCapitalize="off"
              autoCorrect="off"
            />
            <SizableText id="ai-api-key-hint" size="$1" color="var(--text-muted)">
              {tSettings("apiKeyHint")}
            </SizableText>
            {settings.hasKey ? (
              <label htmlFor="ai-clear-key" aria-label={tSettings("apiKeyClearLabel")}>
                <XStack ai="center" gap="$2">
                  <input
                    id="ai-clear-key"
                    type="checkbox"
                    checked={form.clearKey}
                    disabled={!isAdmin || saving}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, clearKey: e.target.checked, apiKey: "" } : f))
                    }
                  />
                  <SizableText size="$1">{tSettings("apiKeyClearLabel")}</SizableText>
                </XStack>
              </label>
            ) : null}
          </YStack>

          {/* Data egress */}
          <YStack gap="$1">
            <label htmlFor="ai-data-egress" aria-label={tSettings("dataEgressLabel")}>
              <XStack ai="center" gap="$2">
                <input
                  id="ai-data-egress"
                  type="checkbox"
                  checked={form.dataEgressAccepted}
                  disabled={!isAdmin || saving}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, dataEgressAccepted: e.target.checked } : f))
                  }
                  aria-describedby="data-egress-hint"
                />
                <SizableText>{tSettings("dataEgressLabel")}</SizableText>
              </XStack>
            </label>
            <SizableText id="data-egress-hint" size="$1" color="var(--text-muted)">
              {tSettings("dataEgressHint")}
            </SizableText>
            {settings.dataEgressAcceptedAt ? (
              <SizableText size="$1" color="var(--text-muted)">
                {tSettings("dataEgressAcceptedAt", {
                  date: new Date(settings.dataEgressAcceptedAt).toLocaleDateString(),
                })}
              </SizableText>
            ) : null}
          </YStack>

          {/* Role limits */}
          <YStack gap="$2">
            <H2>{tSettings("roleLimitsTitle")}</H2>
            <SizableText size="$1" color="var(--text-muted)">
              {tSettings("roleLimitsHint")}
            </SizableText>
            <YStack gap="$2">
              {ROLE_KEYS.map((role) => (
                <XStack key={role} ai="center" gap="$3">
                  <View width={150}>
                    <SizableText>{tRoles(role)}</SizableText>
                  </View>
                  <View flex={1}>
                    <Input
                      value={String(form.roleLimits[role] ?? 0)}
                      onChangeText={(v) => {
                        const parsed = Number(v);
                        if (Number.isNaN(parsed) || parsed < 0) return;
                        setForm((f) =>
                          f ? { ...f, roleLimits: { ...f.roleLimits, [role]: Math.floor(parsed) } } : f,
                        );
                      }}
                      keyboardType="numeric"
                      inputMode="numeric"
                      disabled={!isAdmin || saving}
                      aria-label={tRoles(role)}
                    />
                  </View>
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Per-user daily cap */}
          <YStack gap="$1">
            <label htmlFor="ai-per-user-cap">
              <SizableText fontWeight="600">{tSettings("perUserDailyCapLabel")}</SizableText>
            </label>
            <Input
              id="ai-per-user-cap"
              value={String(form.perUserDailyCap)}
              onChangeText={(v) => {
                const parsed = Number(v);
                if (Number.isNaN(parsed) || parsed < 0) return;
                setForm((f) => (f ? { ...f, perUserDailyCap: Math.floor(parsed) } : f));
              }}
              keyboardType="numeric"
              inputMode="numeric"
              disabled={!isAdmin || saving}
              aria-describedby="ai-per-user-cap-hint"
            />
            <SizableText id="ai-per-user-cap-hint" size="$1" color="var(--text-muted)">
              {tSettings("perUserDailyCapHint")}
            </SizableText>
          </YStack>

          {/* Concierge link */}
          {CONCIERGE_URL.length > 0 ? (
            <View
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor: "var(--surface-subtle, #fafafa)",
              }}
            >
              <YStack gap="$1">
                <H2>{tSettings("concierge.title")}</H2>
                <SizableText>{tSettings("concierge.body")}</SizableText>
                <XStack mt="$1">
                  <a href={CONCIERGE_URL} target="_blank" rel="noopener noreferrer">
                    <SizableText color="var(--accent, #06c)">
                      {tSettings("concierge.cta")}
                    </SizableText>
                  </a>
                </XStack>
              </YStack>
            </View>
          ) : null}

          {/* Save */}
          {isAdmin ? (
            <XStack mt="$2">
              <Button disabled={saving} onPress={() => void onSave()}>
                {saving ? tSettings("savingButton") : tSettings("saveButton")}
              </Button>
            </XStack>
          ) : null}
        </YStack>
      </main>
      <DashboardClient />
    </>
  );
}
