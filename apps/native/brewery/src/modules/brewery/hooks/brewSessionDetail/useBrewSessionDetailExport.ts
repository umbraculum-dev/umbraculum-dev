import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";

import { runAsyncRenderJobExport } from "@umbraculum/api-client";

import { getApiBaseUrl } from "../../../../auth/apiBaseUrl";

type ApiClient = Parameters<typeof runAsyncRenderJobExport>[0];

export function useBrewSessionDetailExport(params: {
  api: ApiClient | null;
  brewSessionId: string;
  t: (key: string) => string;
}) {
  const { api, brewSessionId, t } = params;
  const [exportingPdf, setExportingPdf] = useState(false);

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

  return { exportingPdf, exportWorkOrderPdf };
}
