"use client";

import { Button, H2, Input, SizableText, View, XStack, YStack } from "tamagui";

import { CONCIERGE_URL, ROLE_KEYS, type AiSettingsPageModel } from "../_hooks/useAiSettingsPage";

export function AiSettingsAdminForm(props: {
  model: Pick<
    AiSettingsPageModel,
    "tSettings" | "tRoles" | "settings" | "form" | "setForm" | "isAdmin" | "saving" | "onSave"
  >;
}) {
  const { tSettings, tRoles, settings, form, setForm, isAdmin, saving, onSave } = props.model;
  if (!form || !settings) return null;

  return (
    <>
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

      <YStack gap="$1">
        <SizableText fontWeight="600">{tSettings("providerLabel")}</SizableText>
        <SizableText>Anthropic Claude</SizableText>
        <SizableText size="$1" color="var(--text-muted)">
          {tSettings("providerHint")}
        </SizableText>
      </YStack>

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
                <SizableText color="var(--accent, #06c)">{tSettings("concierge.cta")}</SizableText>
              </a>
            </XStack>
          </YStack>
        </View>
      ) : null}

      {isAdmin ? (
        <XStack mt="$2">
          <Button disabled={saving} onPress={() => void onSave()}>
            {saving ? tSettings("savingButton") : tSettings("saveButton")}
          </Button>
        </XStack>
      ) : null}
    </>
  );
}
