"use client";

import { useEffect, useMemo, useState } from "react";

import {
  attachBrewSessionIntegration,
  detachBrewSessionIntegration,
  listBrewSessionIntegrationAttachments,
  listBrewSessionIntegrationReadings,
} from "@umbraculum/api-client/brewery";
import { listIntegrationDevices } from "@umbraculum/api-client";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { webPlatformApiClient } from "../../../../../../../_shell/_lib/webApiClient";
import {
  type HydrometerAttachment,
  type HydrometerDevice,
  type HydrometerReading,
  type IntegrationKind,
} from "../_lib/brewSessionDetailUi";

export function useBrewSessionHydrometers(params: {
  canCall: boolean;
  brewSessionId: string;
  workspaceId: string;
  t: (key: string) => string;
}) {
  const { canCall, brewSessionId, workspaceId, t } = params;

  const [hydrometerKind, setHydrometerKind] = useState<IntegrationKind>("tilt");
  const [hydrometerDevices, setHydrometerDevices] = useState<HydrometerDevice[]>([]);
  const [hydrometerAttachments, setHydrometerAttachments] = useState<HydrometerAttachment[]>([]);
  const [hydrometerReadings, setHydrometerReadings] = useState<HydrometerReading[]>([]);
  const [hydrometerSelectedDeviceId, setHydrometerSelectedDeviceId] = useState<string>("");
  const [hydrometerWorking, setHydrometerWorking] = useState<null | "refresh" | "attach" | "detach">(null);
  const [hydrometerError, setHydrometerError] = useState<string | null>(null);

  const refreshHydrometers = async (kind: IntegrationKind = hydrometerKind, resetSelection = false) => {
    if (!canCall || !brewSessionId || !workspaceId) return;
    setHydrometerError(null);
    setHydrometerWorking("refresh");
    try {
      const client = webBreweryApiClient();
      const [devicesData, attachmentsData, readingsData] = await Promise.all([
        listIntegrationDevices(webPlatformApiClient(), workspaceId, kind),
        listBrewSessionIntegrationAttachments(client, brewSessionId),
        listBrewSessionIntegrationReadings(client, brewSessionId, { kind, limit: 200 }),
      ]);

      const devices = (Array.isArray(devicesData.devices) ? devicesData.devices : []) as HydrometerDevice[];
      const attachments = (Array.isArray(attachmentsData.attachments)
        ? attachmentsData.attachments
        : []) as HydrometerAttachment[];
      const readings = (Array.isArray(readingsData.readings) ? readingsData.readings : []) as HydrometerReading[];
      setHydrometerDevices(devices);
      setHydrometerAttachments(attachments);
      setHydrometerReadings(readings);

      if (resetSelection || !hydrometerSelectedDeviceId) {
        const attachedForKind = attachments.find((a) => a.device?.kind === kind);
        if (attachedForKind?.device?.id) {
          setHydrometerSelectedDeviceId(attachedForKind.device.id);
        } else if (devices[0]?.id) {
          setHydrometerSelectedDeviceId(devices[0].id);
        }
      }
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setHydrometerWorking(null);
    }
  };

  useEffect(() => {
    void refreshHydrometers(hydrometerKind, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, brewSessionId, hydrometerKind, workspaceId]);

  const attachHydrometer = async () => {
    if (!canCall || !brewSessionId) return;
    if (!hydrometerSelectedDeviceId) return;
    setHydrometerError(null);
    setHydrometerWorking("attach");
    try {
      await attachBrewSessionIntegration(webBreweryApiClient(), brewSessionId, {
        kind: hydrometerKind,
        deviceId: hydrometerSelectedDeviceId,
      });
      await refreshHydrometers(hydrometerKind);
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setHydrometerWorking(null);
    }
  };

  const detachHydrometer = async () => {
    if (!canCall || !brewSessionId) return;
    const attached = hydrometerAttachments.find((a) => a.device.kind === hydrometerKind);
    if (!attached) return;
    setHydrometerError(null);
    setHydrometerWorking("detach");
    try {
      await detachBrewSessionIntegration(webBreweryApiClient(), brewSessionId, {
        deviceId: attached.device.id,
      });
      await refreshHydrometers(hydrometerKind);
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setHydrometerWorking(null);
    }
  };

  const hydrometerKindOptions = useMemo(
    () => [
      { value: "tilt", label: t("hydrometerKindTilt") },
      { value: "ispindel", label: t("hydrometerKindIspindel") },
      { value: "rapt", label: t("hydrometerKindRapt") },
    ],
    [t],
  );

  const hydrometerDeviceOptions = useMemo(() => {
    return hydrometerDevices.map((d) => ({
      value: d.id,
      label: d.displayName ? `${d.displayName} (${d.deviceKey})` : d.deviceKey,
    }));
  }, [hydrometerDevices]);

  const attachedHydrometer = useMemo(() => {
    return hydrometerAttachments.find((a) => a.device.kind === hydrometerKind) ?? null;
  }, [hydrometerAttachments, hydrometerKind]);

  const hydrometerChartPoints = useMemo(() => {
    return [...hydrometerReadings]
      .sort((a, b) => {
        const aTime = new Date(a.recordedAt ?? a.receivedAt).getTime();
        const bTime = new Date(b.recordedAt ?? b.receivedAt).getTime();
        return aTime - bTime;
      })
      .map((r) => ({
        at: r.recordedAt ?? r.receivedAt,
        gravitySg: typeof r.gravitySg === "number" ? r.gravitySg : null,
        temperatureC: typeof r.temperatureC === "number" ? r.temperatureC : null,
      }));
  }, [hydrometerReadings]);

  const hydrometerLastReading = useMemo(() => {
    if (!hydrometerReadings.length) return null;
    return hydrometerReadings[0] ?? null;
  }, [hydrometerReadings]);

  return {
    hydrometerKind,
    setHydrometerKind,
    hydrometerDevices,
    setHydrometerDevices,
    hydrometerAttachments,
    setHydrometerAttachments,
    hydrometerReadings,
    setHydrometerReadings,
    hydrometerSelectedDeviceId,
    setHydrometerSelectedDeviceId,
    hydrometerWorking,
    setHydrometerWorking,
    hydrometerError,
    setHydrometerError,
    refreshHydrometers,
    attachHydrometer,
    detachHydrometer,
    hydrometerKindOptions,
    hydrometerDeviceOptions,
    attachedHydrometer,
    hydrometerChartPoints,
    hydrometerLastReading,
  };
}
