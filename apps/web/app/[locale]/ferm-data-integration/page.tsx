"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Accordion, Button, H1, Input, SizableText, XStack, YStack } from "tamagui";

import { DashboardClient } from "../../DashboardClient";
import { Link } from "../../../src/i18n/navigation";
import { BrewAccordionSection } from "../../_components/BrewAccordionSection";
import { BrewSelect } from "../../_components/BrewSelect";
import { CodeInline } from "../../_components/CodeInline";
import { MessageBox } from "../../_components/recipe-edit/MessageBox";
import { apiFetch } from "../../_lib/apiClient";
import { useRequireAuth } from "../../_lib/useRequireAuth";

export default function FermDataIntegrationPage() {
  const t = useTranslations("dashboard.fermDataIntegration");
  const [openSections, setOpenSections] = useState<string[]>([]);

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const workspaceId = authState.status === "ready" ? authState.me.activeWorkspaceId ?? "" : "";
  const canCall = authState.status === "ready" && !!workspaceId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [integration, setIntegration] = useState<any | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [recentBrewSessions, setRecentBrewSessions] = useState<any[]>([]);

  const [newToken, setNewToken] = useState<string | null>(null);
  const [newPublicPath, setNewPublicPath] = useState<string | null>(null);
  const [copied, setCopied] = useState<null | "url" | "token">(null);

  const [attachSessionByDeviceId, setAttachSessionByDeviceId] = useState<Record<string, string>>({});
  const [deviceWorkingId, setDeviceWorkingId] = useState<string | null>(null);
  const [integrationWorking, setIntegrationWorking] = useState<null | "create" | "rotate" | "revoke">(null);

  const fullPublicUrl = useMemo(() => {
    if (!newPublicPath || typeof window === "undefined") return null;
    return `${window.location.origin}${newPublicPath}`;
  }, [newPublicPath]);

  const brewSessionOptions = useMemo(() => {
    return (recentBrewSessions ?? []).map((s: any) => ({
      value: s.id,
      label: `${s.code} — ${s.recipe?.name ?? ""}`.trim(),
    }));
  }, [recentBrewSessions]);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const [iRes, dRes, sRes] = await Promise.all([
        apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt`),
        apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt/devices`),
        apiFetch(`/api/workspaces/${workspaceId}/brew-sessions/recent?limit=25`),
      ]);

      if (!iRes.ok) throw new Error(String((iRes.data as any)?.message ?? iRes.status));
      if (!dRes.ok) throw new Error(String((dRes.data as any)?.message ?? dRes.status));
      if (!sRes.ok) throw new Error(String((sRes.data as any)?.message ?? sRes.status));

      setIntegration((iRes.data as any).integration ?? null);
      setDevices((dRes.data as any).devices ?? []);
      setRecentBrewSessions((sRes.data as any).brewSessions ?? []);
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

  const copyToClipboard = async (kind: "url" | "token", value: string) => {
    setCopied(null);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback: select/copy from an input (we keep value visible anyway).
      }
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const reveal = async () => {
    if (!canCall) return;
    setIntegrationWorking("create");
    setError(null);
    try {
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt/reveal`);
      if (!res.ok) throw new Error(String((res.data as any)?.message ?? res.status));
      const token = String((res.data as any)?.token ?? "");
      const publicPath = String((res.data as any)?.publicPath ?? "");
      setNewToken(token || null);
      setNewPublicPath(publicPath || null);
    } catch (e) {
      setError(String(e));
    } finally {
      setIntegrationWorking(null);
    }
  };

  const createOrRotate = async () => {
    if (!canCall) return;
    setIntegrationWorking("create");
    setError(null);
    try {
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt`, { method: "POST" });
      if (!res.ok) throw new Error(String((res.data as any)?.message ?? res.status));
      const token = String((res.data as any)?.token ?? "");
      const publicPath = String((res.data as any)?.publicPath ?? "");
      setNewToken(token || null);
      setNewPublicPath(publicPath || null);
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setIntegrationWorking(null);
    }
  };

  const rotateToken = async () => {
    if (!canCall) return;
    setIntegrationWorking("rotate");
    setError(null);
    try {
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt/rotate-token`, { method: "POST" });
      if (!res.ok) throw new Error(String((res.data as any)?.message ?? res.status));
      const token = String((res.data as any)?.token ?? "");
      const publicPath = String((res.data as any)?.publicPath ?? "");
      setNewToken(token || null);
      setNewPublicPath(publicPath || null);
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setIntegrationWorking(null);
    }
  };

  const revoke = async () => {
    if (!canCall) return;
    setIntegrationWorking("revoke");
    setError(null);
    try {
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt/revoke`, { method: "POST" });
      if (!res.ok) throw new Error(String((res.data as any)?.message ?? res.status));
      setNewToken(null);
      setNewPublicPath(null);
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
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt/devices/${deviceId}/attach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewSessionId }),
      });
      if (!res.ok) throw new Error(String((res.data as any)?.message ?? res.status));
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
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt/devices/${deviceId}/detach`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(String((res.data as any)?.message ?? res.status));
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setDeviceWorkingId(null);
    }
  };

  return (
    <YStack gap="$3">
      <DashboardClient />

      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        <Link href="/">{t("backToDashboard")}</Link>
      </SizableText>

      <YStack gap="$0">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <BrewAccordionSection
            value="integrations"
            headingId="integrations-heading"
            title={t("sections.integration.title")}
            open={openSections.includes("integrations")}
          >
            {error ? (
              <SizableText size="$2" color="var(--danger)" fontFamily="$body" mt="$3">
                {t("sections.integration.error")} <CodeInline>{error}</CodeInline>
              </SizableText>
            ) : null}

            <YStack gap="$2" mt="$3">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {t("sections.integration.intro")}
              </SizableText>

              <SizableText size="$3" fontFamily="$body">
                {t("sections.integration.tiltTitle")}
              </SizableText>
              <MessageBox variant="success">{t("sections.integration.tiltSupportedNotice")}</MessageBox>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {t("sections.integration.tiltSubtitle")}
              </SizableText>
              <YStack gap="$1">
                <SizableText size="$2" fontFamily="$body">
                  {t("sections.integration.stepsLabel")}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {t("sections.integration.step1")}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {t("sections.integration.step2")}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {t("sections.integration.step3")}
                </SizableText>
              </YStack>

              <XStack gap="$2" flexWrap="wrap" alignItems="center">
                <Button
                  onPress={createOrRotate}
                  disabled={!canCall || loading || integrationWorking !== null}
                  aria-label={t("sections.integration.actions.createAria")}
                >
                  {integration ? t("sections.integration.actions.createAgain") : t("sections.integration.actions.create")}
                </Button>
                <Button onPress={reveal} disabled={!integration || loading || integrationWorking !== null}>
                  {t("sections.integration.actions.reveal")}
                </Button>
                <Button
                  onPress={rotateToken}
                  disabled={!integration || loading || integrationWorking !== null}
                  aria-label={t("sections.integration.actions.rotateAria")}
                >
                  {t("sections.integration.actions.rotate")}
                </Button>
                <Button
                  onPress={revoke}
                  disabled={!integration || loading || integrationWorking !== null}
                  aria-label={t("sections.integration.actions.revokeAria")}
                >
                  {t("sections.integration.actions.revoke")}
                </Button>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {loading || integrationWorking ? t("sections.integration.working") : integration ? t("sections.integration.configured") : t("sections.integration.notConfigured")}
                </SizableText>
              </XStack>

              {newPublicPath ? (
                <YStack gap="$2" mt="$2">
                  <SizableText size="$2" fontFamily="$body">
                    {t("sections.integration.cloudUrlLabel")}
                  </SizableText>
                  <Input value={fullPublicUrl ?? newPublicPath} readOnly aria-label={t("sections.integration.cloudUrlAria")} />
                  <XStack gap="$2" flexWrap="wrap" alignItems="center">
                    <Button
                      onPress={() => copyToClipboard("url", fullPublicUrl ?? newPublicPath)}
                      disabled={!fullPublicUrl && !newPublicPath}
                      aria-label={t("sections.integration.copyUrlAria")}
                    >
                      {copied === "url" ? t("sections.integration.copied") : t("sections.integration.copy")}
                    </Button>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {t("sections.integration.cloudUrlHelp")}
                    </SizableText>
                  </XStack>
                </YStack>
              ) : null}

              {newToken ? (
                <YStack gap="$2" mt="$2">
                  <SizableText size="$2" fontFamily="$body">
                    {t("sections.integration.tokenLabel")}
                  </SizableText>
                  <Input value={newToken} readOnly aria-label={t("sections.integration.tokenAria")} />
                  <XStack gap="$2" flexWrap="wrap" alignItems="center">
                    <Button onPress={() => copyToClipboard("token", newToken)} aria-label={t("sections.integration.copyTokenAria")}>
                      {copied === "token" ? t("sections.integration.copied") : t("sections.integration.copy")}
                    </Button>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {t("sections.integration.tokenHelp")}
                    </SizableText>
                  </XStack>
                </YStack>
              ) : null}

              <YStack gap="$2" mt="$3">
                <SizableText size="$3" fontFamily="$body">
                  {t("sections.integration.devicesTitle")}
                </SizableText>

                {!devices.length ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("sections.integration.noDevices")}
                  </SizableText>
                ) : (
                  <YStack gap="$2">
                    {devices.map((d: any) => {
                      const attachId = `attach-${d.id}`;
                      const selectedSessionId = attachSessionByDeviceId[d.id] ?? "";
                      const working = deviceWorkingId === d.id;
                      const active = d.activeAttachment?.brewSession ?? null;
                      const last = d.lastReading ?? null;

                      return (
                        <YStack
                          key={d.id}
                          gap="$2"
                          p="$3"
                          borderWidth={1}
                          borderColor="var(--border)"
                          borderRadius="$3"
                          backgroundColor="var(--surface)"
                        >
                          <YStack gap="$1">
                            <SizableText size="$3" fontFamily="$body">
                              {d.displayName ? `${t("sections.integration.device")} ${d.displayName}` : t("sections.integration.device")}
                            </SizableText>
                            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                              {t("sections.integration.deviceKey")}: <CodeInline>{d.deviceKey}</CodeInline>
                            </SizableText>
                          </YStack>

                          {last ? (
                            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                              {t("sections.integration.lastReading")}:{" "}
                              <CodeInline>
                                {typeof last.temperatureC === "number" ? `${last.temperatureC.toFixed(2)} °C` : "—"},{" "}
                                {typeof last.gravitySg === "number" ? `SG ${last.gravitySg.toFixed(3)}` : "—"}
                              </CodeInline>
                            </SizableText>
                          ) : (
                            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                              {t("sections.integration.noReadingsYet")}
                            </SizableText>
                          )}

                          <YStack gap="$1">
                            <SizableText size="$2" fontFamily="$body">
                              {t("sections.integration.attachedTo")}{" "}
                              {active ? (
                                <CodeInline>{`${active.code} — ${active.recipe?.name ?? ""}`.trim()}</CodeInline>
                              ) : (
                                <CodeInline>{t("sections.integration.notAttached")}</CodeInline>
                              )}
                            </SizableText>

                            <XStack gap="$2" flexWrap="wrap" alignItems="center">
                              <SizableText id={attachId} size="$2" fontFamily="$body">
                                {t("sections.integration.attachLabel")}
                              </SizableText>
                              <BrewSelect
                                value={selectedSessionId}
                                onValueChange={(v) => setAttachSessionByDeviceId((prev) => ({ ...prev, [d.id]: v }))}
                                options={brewSessionOptions}
                                placeholder={t("sections.integration.attachPlaceholder")}
                                aria-labelledby={attachId}
                                disabled={working}
                                width="full"
                              />
                              <Button onPress={() => attachDevice(d.id)} disabled={working || !selectedSessionId}>
                                {t("sections.integration.attach")}
                              </Button>
                              <Button onPress={() => detachDevice(d.id)} disabled={working || !active}>
                                {t("sections.integration.detach")}
                              </Button>
                            </XStack>
                          </YStack>
                        </YStack>
                      );
                    })}
                  </YStack>
                )}
              </YStack>

              <YStack borderBottomWidth={1} borderColor="var(--border)" my="$3" />

              <YStack gap="$2" mt="$3">
                <SizableText size="$3" fontFamily="$body">
                  {t("sections.integration.ispindelTitle")}
                </SizableText>
                <MessageBox variant="warning">{t("sections.integration.ispindelWarning")}</MessageBox>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {t("sections.integration.ispindelSubtitle")}
                </SizableText>
                <XStack gap="$2" flexWrap="wrap" alignItems="center">
                  <Button disabled aria-label={t("sections.integration.actions.createAria")}>
                    {t("sections.integration.actions.create")}
                  </Button>
                  <Button disabled>{t("sections.integration.actions.reveal")}</Button>
                  <Button disabled aria-label={t("sections.integration.actions.rotateAria")}>
                    {t("sections.integration.actions.rotate")}
                  </Button>
                  <Button disabled aria-label={t("sections.integration.actions.revokeAria")}>
                    {t("sections.integration.actions.revoke")}
                  </Button>
                </XStack>
              </YStack>

              <YStack borderBottomWidth={1} borderColor="var(--border)" my="$3" />

              <YStack gap="$2" mt="$3">
                <SizableText size="$3" fontFamily="$body">
                  {t("sections.integration.raptTitle")}
                </SizableText>
                <MessageBox variant="warning">{t("sections.integration.raptWarning")}</MessageBox>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {t("sections.integration.raptSubtitle")}
                </SizableText>
                <XStack gap="$2" flexWrap="wrap" alignItems="center">
                  <Button disabled aria-label={t("sections.integration.actions.createAria")}>
                    {t("sections.integration.actions.create")}
                  </Button>
                  <Button disabled>{t("sections.integration.actions.reveal")}</Button>
                  <Button disabled aria-label={t("sections.integration.actions.rotateAria")}>
                    {t("sections.integration.actions.rotate")}
                  </Button>
                  <Button disabled aria-label={t("sections.integration.actions.revokeAria")}>
                    {t("sections.integration.actions.revoke")}
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </BrewAccordionSection>
        </Accordion>
      </YStack>
    </YStack>
  );
}

