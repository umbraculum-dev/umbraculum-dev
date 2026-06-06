"use client";

import { useEffect, useMemo, useState } from "react";

import { listWaterProfiles } from "@umbraculum/api-client/brewery";
import type { AuthMeResponse } from "@umbraculum/contracts";
import type { WaterProfilesResponse } from "@umbraculum/brewery-contracts";

import { webBreweryApiClient } from "../../../../../../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../../../../../_lib/fetchAuthMe";

function isAdmin(role: string | null) {
  return role === "brewery_admin";
}

export function useWaterMashProfiles(authReady: boolean) {
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  const refreshProfiles = async () => {
    if (!authReady) return;
    setProfilesError(null);
    setLoadingProfiles(true);
    try {
      const meRes = await fetchAuthMe();
      setMe(meRes.ok ? meRes.data : null);
      const profilesRes = await listWaterProfiles(webBreweryApiClient());
      setProfiles(profilesRes);
    } catch (err) {
      setProfilesError(String(err));
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    void refreshProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const wsp = profiles?.workspace ?? [];
    return [...sys, ...pub, ...wsp];
  }, [profiles]);

  const waterProfiles = useMemo(() => allProfiles.filter((p) => p.type === "water"), [allProfiles]);
  const dilutionProfiles = useMemo(() => allProfiles.filter((p) => p.type === "dilution"), [allProfiles]);
  const admin = isAdmin(me?.role ?? null);

  return {
    me,
    profiles,
    loadingProfiles,
    profilesError,
    refreshProfiles,
    allProfiles,
    waterProfiles,
    dilutionProfiles,
    admin,
  };
}
