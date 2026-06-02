import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Linking, ScrollView, View } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";

import {
  getAuthMe,
  listIntegrationDevices,
  runAsyncRenderJobExport,
} from "@umbraculum/api-client";
import {
  attachBrewSessionIntegration,
  detachBrewSessionIntegration,
  getBrewSession,
  listBrewSessionIntegrationAttachments,
  listBrewSessionIntegrationReadings,
} from "@umbraculum/api-client/brewery";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, SelectField, Text } from "@umbraculum/ui";
import { HydrometerChart } from "@umbraculum/ui/charts/HydrometerChart";

import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";

type IntegrationKind = "tilt" | "ispindel" | "rapt";
const _INTEGRATION_KINDS: IntegrationKind[] = ["tilt", "ispindel", "rapt"];

type BrewSessionDetail = {
  id: string;
  code: string;
  status: string;
  recipe?: { id: string; name: string | null } | null;
};

type HydrometerDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
};

type HydrometerAttachment = {
  id: string;
  attachedAt: string;
  device: HydrometerDevice & { kind: IntegrationKind };
};

type HydrometerReading = {
  recordedAt: string | null;
  receivedAt: string;
  temperatureC: number | null;
  gravitySg: number | null;
};

export function BrewSessionDetailScreen() {
  const route = useRoute();
  const { t } = useT("recipes.brewSessions");
  const { state } = useAuth();

  const _recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const brewSessionId = (route.params as { brewSessionId?: string } | undefined)?.brewSessionId ?? "";
  const canCall = state.status === "logged_in";

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [session, setSession] = useState<BrewSessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hydrometerKind, setHydrometerKind] = useState<IntegrationKind>("tilt");
  const [devices, setDevices] = useState<HydrometerDevice[]>([]);
  const [attachments, setAttachments] = useState<HydrometerAttachment[]>([]);
  const [readings, setReadings] = useState<HydrometerReading[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [working, setWorking] = useState<null | "refresh" | "attach" | "detach">(null);
  const [hydrometerError, setHydrometerError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const api = useMemo(() => {
    if (!canCall || state.status !== "logged_in") return null;
    return nativePlatformApiClient(state.token);
  }, [canCall, state]);

  const refreshSession = useCallback(async () => {
    if (!api || !brewSessionId) return;
    setError(null);
    setLoading(true);
    try {
      const [me, sessionRes] = await Promise.all([getAuthMe(api), getBrewSession(api, brewSessionId)]);
      const workspace = me.activeWorkspaceId ?? null;
      const s = (sessionRes.brewSession ?? null) as BrewSessionDetail | null;
      setWorkspaceId(typeof workspace === "string" ? workspace : null);
      setSession(s);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [api, brewSessionId]);

  const refreshHydrometers = useCallback(
    async (kind: IntegrationKind = hydrometerKind, resetSelection = false) => {
      if (!api || !brewSessionId || !workspaceId) return;
      setHydrometerError(null);
      setWorking("refresh");
      try {
        const [devicesRes, attachmentsRes, readingsRes] = await Promise.all([
          listIntegrationDevices(api, workspaceId, kind),
          listBrewSessionIntegrationAttachments(api, brewSessionId),
          listBrewSessionIntegrationReadings(api, brewSessionId, { kind, limit: 200 }),
        ]);

        const rawDevices = devicesRes.devices;
        const rawAttachments = attachmentsRes.attachments;
        const rawReadings = readingsRes.readings;
        const nextDevices: HydrometerDevice[] = Array.isArray(rawDevices) ? (rawDevices as HydrometerDevice[]) : [];
        const nextAttachments: HydrometerAttachment[] = Array.isArray(rawAttachments)
          ? (rawAttachments as HydrometerAttachment[])
          : [];
        const nextReadings: HydrometerReading[] = Array.isArray(rawReadings) ? (rawReadings as HydrometerReading[]) : [];
        setDevices(nextDevices);
        setAttachments(nextAttachments);
        setReadings(nextReadings);

        if (resetSelection || !selectedDeviceId) {
          const attachedForKind = nextAttachments.find((a) => a.device.kind === kind);
          if (attachedForKind?.device?.id) {
            setSelectedDeviceId(attachedForKind.device.id);
          } else if (nextDevices[0]?.id) {
            setSelectedDeviceId(nextDevices[0].id);
          } else {
            setSelectedDeviceId("");
          }
        }
      } catch (err) {
        setHydrometerError(String(err));
      } finally {
        setWorking(null);
      }
    },
    [api, brewSessionId, workspaceId, hydrometerKind, selectedDeviceId]
  );

  const attachHydrometer = useCallback(async () => {
    if (!api || !brewSessionId || !selectedDeviceId) return;
    setHydrometerError(null);
    setWorking("attach");
    try {
      await attachBrewSessionIntegration(api, brewSessionId, {
        kind: hydrometerKind,
        deviceId: selectedDeviceId,
      });
      await refreshHydrometers(hydrometerKind);
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setWorking(null);
    }
  }, [api, brewSessionId, selectedDeviceId, hydrometerKind, refreshHydrometers]);

  const detachHydrometer = useCallback(async () => {
    if (!api || !brewSessionId) return;
    const attached = attachments.find((a) => a.device.kind === hydrometerKind);
    if (!attached) return;
    setHydrometerError(null);
    setWorking("detach");
    try {
      await detachBrewSessionIntegration(api, brewSessionId, {
        deviceId: attached.device.id,
      });
      await refreshHydrometers(hydrometerKind);
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setWorking(null);
    }
  }, [api, brewSessionId, attachments, hydrometerKind, refreshHydrometers]);

  useFocusEffect(
    useCallback(() => {
      void refreshSession();
    }, [refreshSession])
  );

  useEffect(() => {
    if (!workspaceId) return;
    void refreshHydrometers(hydrometerKind, true);
  }, [workspaceId, hydrometerKind, refreshHydrometers]);

  const kindOptions = useMemo(
    () => [
      { value: "tilt", label: t("hydrometerKindTilt") },
      { value: "ispindel", label: t("hydrometerKindIspindel") },
      { value: "rapt", label: t("hydrometerKindRapt") },
    ],
    [t]
  );

  const deviceOptions = useMemo(
    () =>
      devices.map((device) => ({
        value: device.id,
        label: device.displayName ? `${device.displayName} (${device.deviceKey})` : device.deviceKey,
      })),
    [devices]
  );

  const attached = attachments.find((a) => a.device.kind === hydrometerKind);

  const lastReading = readings[0] ?? null;

  const exportWorkOrderPdf = useCallback(async () => {
    if (!api || !brewSessionId) return;
    setExportingPdf(true);
    try {
      const orderId = `brewery-brew-session-${brewSessionId}`;
      const url = await runAsyncRenderJobExport(
        api,
        `/api/mrp/work-orders/${encodeURIComponent(orderId)}/render-jobs`,
        {
          platform: "native",
          apiBaseUrl: getApiBaseUrl(),
        },
      );
      await Linking.openURL(url);
    } catch {
      Alert.alert(t("exportWorkOrderPdf"), t("exportWorkOrderPdfError"));
    } finally {
      setExportingPdf(false);
    }
  }, [api, brewSessionId, t]);

  const chartPoints = useMemo(
    () =>
      readings
        .slice()
        .reverse()
        .map((r) => ({
          at: String(r.recordedAt ?? r.receivedAt ?? ""),
          gravitySg: typeof r.gravitySg === "number" ? r.gravitySg : null,
          temperatureC: typeof r.temperatureC === "number" ? r.temperatureC : null,
        })),
    [readings]
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Heading fontSize={20} mb="$2">
          {t("detailTitle")}
        </Heading>
        {session ? (
          <Text fontSize={12} opacity={0.8} mb="$3">
            {t("sessionCode")}: {session.code}
          </Text>
        ) : null}

        {session && api ? (
          <Button
            onPress={() => { void exportWorkOrderPdf(); }}
            disabled={exportingPdf}
            mb="$3"
          >
            <Text>{exportingPdf ? t("exportWorkOrderPdfWorking") : t("exportWorkOrderPdf")}</Text>
          </Button>
        ) : null}

        {error ? (
          <Text fontSize={12} color="$red10" mb="$2">
            {error}
          </Text>
        ) : null}

        {loading ? (
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("loading")}
          </Text>
        ) : null}

        <Card gap="$2" mb="$3">
          <Heading fontSize={16}>{t("hydrometerSectionTitle")}</Heading>
          <Text fontSize={12} opacity={0.8}>
            {t("hydrometerSectionSubtitle")}
          </Text>

          <View style={{ gap: 8 }}>
            <Text fontSize={12}>{t("hydrometerKindLabel")}</Text>
            <SelectField
              value={hydrometerKind}
              onValueChange={(value) => setHydrometerKind(value as IntegrationKind)}
              options={kindOptions}
              width="full"
              aria-label={t("hydrometerKindLabel")}
            />
          </View>

          {hydrometerKind !== "tilt" ? (
            <Card borderWidth={1} borderColor="$yellow10" bg="rgba(234,179,8,0.18)">
              <Text fontSize={12} color="$yellow10">
                {t("hydrometerNotSupportedYet")}
              </Text>
            </Card>
          ) : null}

          <View style={{ gap: 8 }}>
            <Text fontSize={12}>{t("hydrometerDeviceLabel")}</Text>
            <SelectField
              value={selectedDeviceId}
              onValueChange={(value) => setSelectedDeviceId(value)}
              options={deviceOptions}
              placeholder={t("hydrometerDevicePlaceholder")}
              width="full"
              aria-label={t("hydrometerDeviceLabel")}
            />
            {!devices.length ? (
              <Text fontSize={12} opacity={0.8}>
                {t("hydrometerNoDevices")}
              </Text>
            ) : null}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Button onPress={() => { void attachHydrometer(); }} disabled={!selectedDeviceId || working !== null}>
              <Text>{t("hydrometerAttach")}</Text>
            </Button>
            <Button onPress={() => { void detachHydrometer(); }} disabled={!attached || working !== null} background="$background" borderWidth={1}>
              <Text>{t("hydrometerDetach")}</Text>
            </Button>
          </View>

          <Text fontSize={12} opacity={0.8}>
            {attached ? t("hydrometerAttachedTo", { device: attached.device.displayName ?? attached.device.deviceKey }) : t("hydrometerNotAttached")}
          </Text>

          <View style={{ gap: 6 }}>
            <Text fontSize={12}>{t("hydrometerLastReading")}</Text>
            {lastReading ? (
              <Text fontSize={12} opacity={0.8}>
                {typeof lastReading.temperatureC === "number" ? `${lastReading.temperatureC.toFixed(2)} °C` : "—"},{" "}
                {typeof lastReading.gravitySg === "number" ? `SG ${lastReading.gravitySg.toFixed(3)}` : "—"}
              </Text>
            ) : (
              <Text fontSize={12} opacity={0.8}>
                {t("hydrometerNoReadings")}
              </Text>
            )}
          </View>

          {chartPoints.length ? (
            <HydrometerChart
              points={chartPoints}
              title={t("hydrometerChartTitle")}
              gravityLabel={t("hydrometerChartGravity")}
              temperatureLabel={t("hydrometerChartTemperature")}
              xAxisLabel={t("hydrometerChartXAxis")}
              gravityAxisLabel={t("hydrometerChartGravityAxis")}
              temperatureAxisLabel={t("hydrometerChartTemperatureAxis")}
            />
          ) : null}

          {hydrometerError ? (
            <Text fontSize={12} color="$red10">
              {hydrometerError}
            </Text>
          ) : null}
        </Card>
      </ScrollView>
    </Screen>
  );
}
