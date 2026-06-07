import { useCallback, useEffect, useMemo, useState } from "react";

import { getAuthMe } from "@umbraculum/api-client";
import { listEquipmentProfiles } from "@umbraculum/api-client/brewery";
import type { AuthMeResponse } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";

import { useAuth, getApiBaseUrl, nativePlatformApiClient } from "@umbraculum/native-shell/auth";
import type { EquipmentProfile } from "../../lib/equipmentTypes";

export function useNativeEquipmentPageData() {
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("equipment");
  const { t: tUnits } = useT("units");
  const { t: tNav } = useT("nav");
  const { t: tCommon } = useT("common");

  const [authMe, setAuthMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<EquipmentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["list"]);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return nativePlatformApiClient(token);
  }, [baseUrl, token]);

  const canWrite = authMe != null;

  const refresh = useCallback(async () => {
    if (!api) return;
    setError(null);
    setLoading(true);
    try {
      const me = await getAuthMe(api);
      setAuthMe(me);
      const listRes = await listEquipmentProfiles(api);
      const items = listRes.profiles;
      setProfiles(Array.isArray(items) ? (items as unknown as EquipmentProfile[]) : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    t,
    tUnits,
    tNav,
    tCommon,
    api,
    canWrite,
    profiles,
    loading,
    error,
    setError,
    openSections,
    setOpenSections,
    refresh,
  };
}
