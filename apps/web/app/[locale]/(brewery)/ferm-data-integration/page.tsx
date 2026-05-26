"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Accordion, Button, H1, Input, SizableText, XStack, YStack } from "tamagui";

import { DashboardClient } from "../../../DashboardClient";
import { Link } from "../../../../src/i18n/navigation";
import { BrewAccordionSection } from "../../../_components/BrewAccordionSection";
import { BrewSelect } from "../../../_components/BrewSelect";
import { CodeInline } from "../../../_components/CodeInline";
import { HydrometerChart } from "@umbraculum/ui/charts/HydrometerChart";
import { MessageBox } from "../../../_components/recipe-edit/MessageBox";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";

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

type HydrometerReadingPoint = {
  recordedAt: string | null;
  receivedAt: string;
  temperatureC: number | null;
  gravitySg: number | null;
};

type IntegrationDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
  lastSeenAt: string | null;
  activeAttachment?: {
    brewSession?: {
      id: string;
      code: string;
      recipe?: { id: string; name: string | null } | null;
    } | null;
  } | null;
  lastReading?: HydrometerReadingPoint | null;
  recentReadings?: HydrometerReadingPoint[] | null;
};

type RecentBrewSession = {
  id: string;
  code: string;
  recipe?: { id: string; name: string | null } | null;
};

export default function FermDataIntegrationPage() {
  const t = useTranslations("dashboard.fermDataIntegration");
  const [openSections, setOpenSections] = useState<string[]>([]);

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const workspaceId = authState.status === "ready" ? authState.me.activeWorkspaceId ?? "" : "";
  const canCall = authState.status === "ready" && !!workspaceId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createKindRecord = <T,>(value: T): Record<IntegrationKind, T> => ({
    tilt: value,
    ispindel: value,
    rapt: value,
  });

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
  const [integrationWorking, setIntegrationWorking] = useState<null | { kind: IntegrationKind; action: "create" | "rotate" | "revoke" | "reveal" }>(
    null
  );

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
      const integrationRequests = INTEGRATION_KINDS.map((kind) =>
        apiFetch(`/api/workspaces/${workspaceId}/integrations/${kind}`)
      );
      const deviceRequests = INTEGRATION_KINDS.map((kind) =>
        apiFetch(
          `/api/workspaces/${workspaceId}/integrations/${kind}/devices?includeReadings=1&readingsLimit=50`
        )
      );
      const [integrationResponses, deviceResponses, sRes] = await Promise.all([
        Promise.all(integrationRequests),
        Promise.all(deviceRequests),
        apiFetch(`/api/workspaces/${workspaceId}/brew-sessions/recent?limit=25`),
      ]);

      integrationResponses.forEach((res) => {
        if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
      });
      deviceResponses.forEach((res) => {
        if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
      });
      if (!sRes.ok) throw new Error(String((sRes.data as { message?: unknown })?.message ?? sRes.status));

      const nextIntegrations = createKindRecord<IntegrationSummary | null>(null);
      const nextDevices = createKindRecord<IntegrationDevice[]>([]);
      INTEGRATION_KINDS.forEach((kind, idx) => {
        const integration = (integrationResponses[idx].data as { integration?: unknown })?.integration;
        nextIntegrations[kind] = (integration ?? null) as IntegrationSummary | null;
        const devices = (deviceResponses[idx].data as { devices?: unknown })?.devices;
        nextDevices[kind] = Array.isArray(devices) ? (devices as IntegrationDevice[]) : [];
      });

      setIntegrations(nextIntegrations);
      setDevicesByKind(nextDevices);
      const sessions = (sRes.data as { brewSessions?: unknown })?.brewSessions;
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
      } else {
        // Fallback: select/copy from an input (we keep value visible anyway).
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
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/${kind}/reveal`);
      if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
      const body = res.data as { token?: unknown; publicPath?: unknown };
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
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/${kind}`, { method: "POST" });
      if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
      const body = res.data as { token?: unknown; publicPath?: unknown };
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
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/${kind}/rotate-token`, { method: "POST" });
      if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
      const body = res.data as { token?: unknown; publicPath?: unknown };
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
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/${kind}/revoke`, { method: "POST" });
      if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
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
      const res = await apiFetch(`/api/workspaces/${workspaceId}/integrations/tilt/devices/${deviceId}/attach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewSessionId }),
      });
      if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
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
      if (!res.ok) throw new Error(String((res.data as { message?: unknown })?.message ?? res.status));
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setDeviceWorkingId(null);
    }
  };

  const _isKindWorking = (kind: IntegrationKind) => integrationWorking?.kind === kind;
  const isAnyWorking = integrationWorking !== null;

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
                  onPress={() => void createOrRotate("tilt")}
                  disabled={!canCall || loading || isAnyWorking}
                  aria-label={t("sections.integration.actions.createAria")}
                >
                  {tiltIntegration ? t("sections.integration.actions.createAgain") : t("sections.integration.actions.create")}
                </Button>
                <Button onPress={() => void reveal("tilt")} disabled={!tiltIntegration || loading || isAnyWorking}>
                  {t("sections.integration.actions.reveal")}
                </Button>
                <Button
                  onPress={() => void rotateToken("tilt")}
                  disabled={!tiltIntegration || loading || isAnyWorking}
                  aria-label={t("sections.integration.actions.rotateAria")}
                >
                  {t("sections.integration.actions.rotate")}
                </Button>
                <Button
                  onPress={() => void revoke("tilt")}
                  disabled={!tiltIntegration || loading || isAnyWorking}
                  aria-label={t("sections.integration.actions.revokeAria")}
                >
                  {t("sections.integration.actions.revoke")}
                </Button>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {loading || isAnyWorking
                    ? t("sections.integration.working")
                    : tiltIntegration
                      ? t("sections.integration.configured")
                      : t("sections.integration.notConfigured")}
                </SizableText>
              </XStack>

              {newPublicPaths.tilt ? (
                <YStack gap="$2" mt="$2">
                  <SizableText size="$2" fontFamily="$body">
                    {t("sections.integration.cloudUrlLabel")}
                  </SizableText>
                  <Input
                    value={getFullPublicUrl("tilt") ?? newPublicPaths.tilt}
                    readOnly
                      aria-label={t("sections.integration.cloudUrlAriaTilt")}
                  />
                  <XStack gap="$2" flexWrap="wrap" alignItems="center">
                    <Button
                      onPress={() => { void copyToClipboard("tilt", "url", getFullPublicUrl("tilt") ?? newPublicPaths.tilt ?? ""); }}
                      disabled={!getFullPublicUrl("tilt") && !newPublicPaths.tilt}
                      aria-label={t("sections.integration.copyUrlAria")}
                    >
                      {copied?.kind === "tilt" && copied.field === "url"
                        ? t("sections.integration.copied")
                        : t("sections.integration.copy")}
                    </Button>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {t("sections.integration.cloudUrlHelpTilt")}
                    </SizableText>
                  </XStack>
                </YStack>
              ) : null}

              {newTokens.tilt ? (
                <YStack gap="$2" mt="$2">
                  <SizableText size="$2" fontFamily="$body">
                    {t("sections.integration.tokenLabel")}
                  </SizableText>
                  <Input value={newTokens.tilt} readOnly aria-label={t("sections.integration.tokenAria")} />
                  <XStack gap="$2" flexWrap="wrap" alignItems="center">
                    <Button
                      onPress={() => { void copyToClipboard("tilt", "token", newTokens.tilt ?? ""); }}
                      aria-label={t("sections.integration.copyTokenAria")}
                    >
                      {copied?.kind === "tilt" && copied.field === "token"
                        ? t("sections.integration.copied")
                        : t("sections.integration.copy")}
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

                {!tiltDevices.length ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("sections.integration.noDevices")}
                  </SizableText>
                ) : (
                  <YStack gap="$2">
                    {tiltDevices.map((d) => {
                      const attachId = `attach-${d.id}`;
                      const selectedSessionId = attachSessionByDeviceId[d.id] ?? "";
                      const working = deviceWorkingId === d.id;
                      const active = d.activeAttachment?.brewSession ?? null;
                      const last = d.lastReading ?? null;
                      const recentReadings = Array.isArray(d.recentReadings) ? d.recentReadings : [];

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

                          {recentReadings.length ? (
                            <HydrometerChart
                              points={recentReadings.map((r: HydrometerReadingPoint) => ({
                                at: String(r.recordedAt ?? r.receivedAt ?? ""),
                                gravitySg: typeof r.gravitySg === "number" ? r.gravitySg : null,
                                temperatureC: typeof r.temperatureC === "number" ? r.temperatureC : null,
                              }))}
                              compact
                              title={t("sections.integration.deviceChartTitle")}
                              gravityLabel={t("sections.integration.chartGravity")}
                              temperatureLabel={t("sections.integration.chartTemperature")}
                              xAxisLabel={t("sections.integration.chartXAxis")}
                              gravityAxisLabel={t("sections.integration.chartGravityAxis")}
                              temperatureAxisLabel={t("sections.integration.chartTemperatureAxis")}
                            />
                          ) : null}

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
                              <Button onPress={() => { void attachDevice(d.id); }} disabled={working || !selectedSessionId}>
                                {t("sections.integration.attach")}
                              </Button>
                              <Button onPress={() => { void detachDevice(d.id); }} disabled={working || !active}>
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
                  <Button
                    onPress={() => void createOrRotate("ispindel")}
                    disabled={!canCall || loading || isAnyWorking}
                    aria-label={t("sections.integration.actions.createAriaGeneric")}
                  >
                    {ispindelIntegration
                      ? t("sections.integration.actions.createAgain")
                      : t("sections.integration.actions.create")}
                  </Button>
                  <Button onPress={() => void reveal("ispindel")} disabled={!ispindelIntegration || loading || isAnyWorking}>
                    {t("sections.integration.actions.reveal")}
                  </Button>
                  <Button
                    onPress={() => void rotateToken("ispindel")}
                    disabled={!ispindelIntegration || loading || isAnyWorking}
                    aria-label={t("sections.integration.actions.rotateAriaGeneric")}
                  >
                    {t("sections.integration.actions.rotate")}
                  </Button>
                  <Button
                    onPress={() => void revoke("ispindel")}
                    disabled={!ispindelIntegration || loading || isAnyWorking}
                    aria-label={t("sections.integration.actions.revokeAriaGeneric")}
                  >
                    {t("sections.integration.actions.revoke")}
                  </Button>

                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {loading || isAnyWorking
                      ? t("sections.integration.working")
                      : ispindelIntegration
                        ? t("sections.integration.configured")
                        : t("sections.integration.notConfigured")}
                  </SizableText>
                </XStack>

                {newPublicPaths.ispindel ? (
                  <YStack gap="$2" mt="$2">
                    <SizableText size="$2" fontFamily="$body">
                      {t("sections.integration.cloudUrlLabel")}
                    </SizableText>
                    <Input
                      value={getFullPublicUrl("ispindel") ?? newPublicPaths.ispindel}
                      readOnly
                      aria-label={t("sections.integration.cloudUrlAriaGeneric")}
                    />
                    <XStack gap="$2" flexWrap="wrap" alignItems="center">
                      <Button
                        onPress={() => {
                          void copyToClipboard("ispindel", "url", getFullPublicUrl("ispindel") ?? newPublicPaths.ispindel ?? "");
                        }}
                        disabled={!getFullPublicUrl("ispindel") && !newPublicPaths.ispindel}
                        aria-label={t("sections.integration.copyUrlAria")}
                      >
                        {copied?.kind === "ispindel" && copied.field === "url"
                          ? t("sections.integration.copied")
                          : t("sections.integration.copy")}
                      </Button>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {t("sections.integration.cloudUrlHelpGeneric")}
                      </SizableText>
                    </XStack>
                  </YStack>
                ) : null}

                {newTokens.ispindel ? (
                  <YStack gap="$2" mt="$2">
                    <SizableText size="$2" fontFamily="$body">
                      {t("sections.integration.tokenLabel")}
                    </SizableText>
                    <Input value={newTokens.ispindel} readOnly aria-label={t("sections.integration.tokenAria")} />
                    <XStack gap="$2" flexWrap="wrap" alignItems="center">
                      <Button
                        onPress={() => { void copyToClipboard("ispindel", "token", newTokens.ispindel ?? ""); }}
                        aria-label={t("sections.integration.copyTokenAria")}
                      >
                        {copied?.kind === "ispindel" && copied.field === "token"
                          ? t("sections.integration.copied")
                          : t("sections.integration.copy")}
                      </Button>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {t("sections.integration.tokenHelp")}
                      </SizableText>
                    </XStack>
                  </YStack>
                ) : null}
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
                  <Button
                    onPress={() => void createOrRotate("rapt")}
                    disabled={!canCall || loading || isAnyWorking}
                    aria-label={t("sections.integration.actions.createAriaGeneric")}
                  >
                    {raptIntegration ? t("sections.integration.actions.createAgain") : t("sections.integration.actions.create")}
                  </Button>
                  <Button onPress={() => void reveal("rapt")} disabled={!raptIntegration || loading || isAnyWorking}>
                    {t("sections.integration.actions.reveal")}
                  </Button>
                  <Button
                    onPress={() => void rotateToken("rapt")}
                    disabled={!raptIntegration || loading || isAnyWorking}
                    aria-label={t("sections.integration.actions.rotateAriaGeneric")}
                  >
                    {t("sections.integration.actions.rotate")}
                  </Button>
                  <Button
                    onPress={() => void revoke("rapt")}
                    disabled={!raptIntegration || loading || isAnyWorking}
                    aria-label={t("sections.integration.actions.revokeAriaGeneric")}
                  >
                    {t("sections.integration.actions.revoke")}
                  </Button>

                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {loading || isAnyWorking
                      ? t("sections.integration.working")
                      : raptIntegration
                        ? t("sections.integration.configured")
                        : t("sections.integration.notConfigured")}
                  </SizableText>
                </XStack>

                {newPublicPaths.rapt ? (
                  <YStack gap="$2" mt="$2">
                    <SizableText size="$2" fontFamily="$body">
                      {t("sections.integration.cloudUrlLabel")}
                    </SizableText>
                    <Input
                      value={getFullPublicUrl("rapt") ?? newPublicPaths.rapt}
                      readOnly
                      aria-label={t("sections.integration.cloudUrlAriaGeneric")}
                    />
                    <XStack gap="$2" flexWrap="wrap" alignItems="center">
                      <Button
                        onPress={() => { void copyToClipboard("rapt", "url", getFullPublicUrl("rapt") ?? newPublicPaths.rapt ?? ""); }}
                        disabled={!getFullPublicUrl("rapt") && !newPublicPaths.rapt}
                        aria-label={t("sections.integration.copyUrlAria")}
                      >
                        {copied?.kind === "rapt" && copied.field === "url"
                          ? t("sections.integration.copied")
                          : t("sections.integration.copy")}
                      </Button>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {t("sections.integration.cloudUrlHelpGeneric")}
                      </SizableText>
                    </XStack>
                  </YStack>
                ) : null}

                {newTokens.rapt ? (
                  <YStack gap="$2" mt="$2">
                    <SizableText size="$2" fontFamily="$body">
                      {t("sections.integration.tokenLabel")}
                    </SizableText>
                    <Input value={newTokens.rapt} readOnly aria-label={t("sections.integration.tokenAria")} />
                    <XStack gap="$2" flexWrap="wrap" alignItems="center">
                      <Button
                        onPress={() => { void copyToClipboard("rapt", "token", newTokens.rapt ?? ""); }}
                        aria-label={t("sections.integration.copyTokenAria")}
                      >
                        {copied?.kind === "rapt" && copied.field === "token"
                          ? t("sections.integration.copied")
                          : t("sections.integration.copy")}
                      </Button>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {t("sections.integration.tokenHelp")}
            </SizableText>
                    </XStack>
                  </YStack>
                ) : null}
              </YStack>
            </YStack>
          </BrewAccordionSection>
        </Accordion>
      </YStack>
    </YStack>
  );
}

