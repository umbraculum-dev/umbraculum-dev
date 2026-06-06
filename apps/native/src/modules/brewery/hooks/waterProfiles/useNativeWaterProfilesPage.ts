import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { getAuthMe } from "@umbraculum/api-client";
import {
  createWaterProfile,
  deleteWaterProfile,
  listWaterProfiles,
  unverifyWaterProfile,
  verifyWaterProfile,
} from "@umbraculum/api-client/brewery";
import type { AuthMeResponse } from "@umbraculum/contracts";
import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/brewery-contracts";
import { useT } from "@umbraculum/i18n-react";

import { useAuth } from "../../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import { EMPTY_ION_STATE, isAdmin } from "../../lib/waterProfileTypes";
import type { WaterProfileIonState } from "../../lib/waterProfileTypes";

export function useNativeWaterProfilesPage() {
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("waterProfiles");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tEquipment } = useT("equipment");

  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createScope, setCreateScope] = useState<"account" | "public">("public");
  const [createType, setCreateType] = useState<"water" | "dilution">("water");
  const [createPh, setCreatePh] = useState("");
  const [createIon, setCreateIon] = useState<WaterProfileIonState>(EMPTY_ION_STATE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return nativePlatformApiClient(token);
  }, [baseUrl, token]);

  const refresh = useCallback(async () => {
    if (!api) return;
    setError(null);
    setLoading(true);
    try {
      const meRes = await getAuthMe(api);
      setMe(meRes);

      const profRes = await listWaterProfiles(api);
      setProfiles(profRes);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const acc = profiles?.workspace ?? [];
    return [...sys, ...pub, ...acc];
  }, [profiles]);

  const admin = isAdmin(me?.role ?? null);

  const onCreateProfile = async () => {
    if (!api) return;
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      await createWaterProfile(api, {
        scope: createScope,
        type: createType,
        name: createName,
        ph: createPh.trim() === "" ? null : Number(createPh),
        ...createIon,
      });
      setCreateName("");
      setCreatePh("");
      setCreateIon(EMPTY_ION_STATE);
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onToggleVerify = async (p: WaterProfile) => {
    if (!api) return;
    if (p.verificationStatus === "verified") {
      await unverifyWaterProfile(api, p.id);
    } else {
      await verifyWaterProfile(api, p.id);
    }
    await refresh();
  };

  const onDeleteProfile = (p: WaterProfile) => {
    if (p.scope === "system" || !api) return;
    Alert.alert(
      tEquipment("delete"),
      `Delete water profile "${p.name}"? This cannot be undone.`,
      [
        { text: tCommon("close"), style: "cancel" },
        {
          text: tEquipment("delete"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              setError(null);
              try {
                await deleteWaterProfile(api, p.id);
                await refresh();
              } catch (err) {
                setError(String(err));
              }
            })();
          },
        },
      ]
    );
  };

  return {
    t,
    tCommon,
    tUnits,
    tEquipment,
    api,
    me,
    profiles,
    allProfiles,
    loading,
    error,
    admin,
    openSections,
    setOpenSections,
    onToggleVerify,
    onDeleteProfile,
    createName,
    setCreateName,
    createScope,
    setCreateScope,
    createType,
    setCreateType,
    createPh,
    setCreatePh,
    createIon,
    setCreateIon,
    createError,
    createSubmitting,
    onCreateProfile,
  };
}

export type NativeWaterProfilesPageModel = ReturnType<typeof useNativeWaterProfilesPage>;
