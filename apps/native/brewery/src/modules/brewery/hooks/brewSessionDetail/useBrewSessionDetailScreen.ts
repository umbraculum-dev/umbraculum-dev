import { useMemo } from "react";
import { useRoute } from "@react-navigation/native";

import { useT } from "@umbraculum/i18n-react";

import { useAuth } from "../../../../auth/AuthProvider";
import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import { useBrewSessionDetailExport } from "./useBrewSessionDetailExport";
import { useBrewSessionDetailHydrometer } from "./useBrewSessionDetailHydrometer";
import { useBrewSessionDetailScreenLoad } from "./useBrewSessionDetailScreenLoad";

export function useBrewSessionDetailScreen() {
  const route = useRoute();
  const { t } = useT("recipes.brewSessions");
  const { state } = useAuth();

  const _recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const brewSessionId = (route.params as { brewSessionId?: string } | undefined)?.brewSessionId ?? "";
  const canCall = state.status === "logged_in";

  const api = useMemo(() => {
    if (!canCall || state.status !== "logged_in") return null;
    return nativePlatformApiClient(state.token);
  }, [canCall, state]);

  const load = useBrewSessionDetailScreenLoad({ api, brewSessionId });
  const hydrometer = useBrewSessionDetailHydrometer({
    api,
    brewSessionId,
    workspaceId: load.workspaceId,
  });
  const exportPdf = useBrewSessionDetailExport({ api, brewSessionId, t });

  return {
    t,
    api,
    session: load.session,
    loading: load.loading,
    error: load.error,
    exportingPdf: exportPdf.exportingPdf,
    exportWorkOrderPdf: exportPdf.exportWorkOrderPdf,
    hydrometerKind: hydrometer.hydrometerKind,
    setHydrometerKind: hydrometer.setHydrometerKind,
    kindOptions: hydrometer.kindOptions,
    devices: hydrometer.devices,
    deviceOptions: hydrometer.deviceOptions,
    selectedDeviceId: hydrometer.selectedDeviceId,
    setSelectedDeviceId: hydrometer.setSelectedDeviceId,
    attachHydrometer: hydrometer.attachHydrometer,
    detachHydrometer: hydrometer.detachHydrometer,
    attached: hydrometer.attached,
    working: hydrometer.working,
    lastReading: hydrometer.lastReading,
    chartPoints: hydrometer.chartPoints,
    hydrometerError: hydrometer.hydrometerError,
  };
}

export type BrewSessionDetailScreenModel = ReturnType<typeof useBrewSessionDetailScreen>;
