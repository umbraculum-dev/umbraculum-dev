"use client";

import { useEffect, useMemo, useState } from "react";

import { listWaterProfiles } from "@umbraculum/brewery-api-client";
import type { WaterProfilesResponse } from "@umbraculum/brewery-contracts";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../../../../_shared-layout/_lib/fetchAuthMe";

export function useWaterPageAuthProfiles() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchAuthMe();
      if (cancelled) return;
      setAuthed(res.ok);
      setAuthChecked(true);
    })().catch(() => {
      if (!cancelled) {
        setAuthed(false);
        setAuthChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const canCall = useMemo(() => authed, [authed]);

  const refreshProfiles = async () => {
    setProfilesError(null);
    setLoadingProfiles(true);
    try {
      const profilesRes = await listWaterProfiles(webBreweryApiClient());
      setProfiles(profilesRes);
    } catch (err) {
      setProfilesError(String(err));
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    void refreshProfiles();
  }, [authed]);

  const allProfiles = useMemo(() => {
    const sys = profiles?.system ?? [];
    const pub = profiles?.public ?? [];
    const wsp = profiles?.workspace ?? [];
    return [...sys, ...pub, ...wsp];
  }, [profiles]);

  const waterProfiles = useMemo(() => allProfiles.filter((p) => p.type === "water"), [allProfiles]);
  const dilutionProfiles = useMemo(() => allProfiles.filter((p) => p.type === "dilution"), [allProfiles]);

  return {
    authChecked,
    authed,
    canCall,
    profiles,
    loadingProfiles,
    profilesError,
    refreshProfiles,
    allProfiles,
    waterProfiles,
    dilutionProfiles,
  };
}
