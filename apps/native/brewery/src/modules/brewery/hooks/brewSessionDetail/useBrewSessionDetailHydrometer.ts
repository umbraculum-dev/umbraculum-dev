import { useCallback, useEffect, useMemo, useState } from "react";

import { listIntegrationDevices } from "@umbraculum/api-client";
import {
  attachBrewSessionIntegration,
  detachBrewSessionIntegration,
  listBrewSessionIntegrationAttachments,
  listBrewSessionIntegrationReadings,
} from "@umbraculum/brewery-api-client";
import { useT } from "@umbraculum/i18n-react";

import type {
  HydrometerAttachment,
  HydrometerDevice,
  HydrometerReading,
  HydrometerWorkingAction,
  IntegrationKind,
} from "./brewSessionDetailTypes";

type ApiClient = Parameters<typeof listIntegrationDevices>[0];

export function useBrewSessionDetailHydrometer(params: {
  api: ApiClient | null;
  brewSessionId: string;
  workspaceId: string | null;
}) {
  const { api, brewSessionId, workspaceId } = params;
  const { t } = useT("recipes.brewSessions");

  const [hydrometerKind, setHydrometerKind] = useState<IntegrationKind>("tilt");
  const [devices, setDevices] = useState<HydrometerDevice[]>([]);
  const [attachments, setAttachments] = useState<HydrometerAttachment[]>([]);
  const [readings, setReadings] = useState<HydrometerReading[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [working, setWorking] = useState<HydrometerWorkingAction>(null);
  const [hydrometerError, setHydrometerError] = useState<string | null>(null);

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
    [api, brewSessionId, workspaceId, hydrometerKind, selectedDeviceId],
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
    [t],
  );

  const deviceOptions = useMemo(
    () =>
      devices.map((device) => ({
        value: device.id,
        label: device.displayName ? `${device.displayName} (${device.deviceKey})` : device.deviceKey,
      })),
    [devices],
  );

  const attached = attachments.find((a) => a.device.kind === hydrometerKind);
  const lastReading = readings[0] ?? null;

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
    [readings],
  );

  return {
    hydrometerKind,
    setHydrometerKind,
    kindOptions,
    devices,
    deviceOptions,
    selectedDeviceId,
    setSelectedDeviceId,
    attachHydrometer,
    detachHydrometer,
    attached,
    working,
    lastReading,
    chartPoints,
    hydrometerError,
  };
}
