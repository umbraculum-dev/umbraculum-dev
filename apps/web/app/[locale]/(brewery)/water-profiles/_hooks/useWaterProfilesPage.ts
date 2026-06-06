"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import type { AuthMeResponse } from "@umbraculum/contracts";
import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/brewery-contracts";
import {
  createWaterProfile,
  deleteWaterProfile,
  listWaterProfiles,
  unverifyWaterProfile,
  verifyWaterProfile,
} from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../../_shell/_lib/fetchAuthMe";
import { isAdmin, mergeAllProfiles } from "../_lib/waterProfileHelpers";
import { DEFAULT_CREATE_ION, type CreateIon } from "../_lib/waterProfileTypes";

export function useWaterProfilesPage() {
  const t = useTranslations("waterProfiles");
  const tEquipment = useTranslations("equipment");
  const tUnits = useTranslations("units");

  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createScope, setCreateScope] = useState<"account" | "public">("public");
  const [createType, setCreateType] = useState<"water" | "dilution">("water");
  const [createPh, setCreatePh] = useState<string>("");
  const [createIon, setCreateIon] = useState<CreateIon>(DEFAULT_CREATE_ION);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["table"]);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const meRes = await fetchAuthMe();
      if (meRes.ok) {
        setMe(meRes.data);
      } else {
        setMe(null);
      }

      setProfiles(await listWaterProfiles(webBreweryApiClient()));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const allProfiles = useMemo(() => mergeAllProfiles(profiles), [profiles]);

  const admin = isAdmin(me?.role ?? null);

  const onCreateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      await createWaterProfile(webBreweryApiClient(), {
        scope: createScope,
        type: createType,
        name: createName,
        ph: createPh.trim() === "" ? null : Number(createPh),
        ...createIon,
      });
      setCreateName("");
      setCreatePh("");
      setCreateIon(DEFAULT_CREATE_ION);
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onToggleVerify = async (p: WaterProfile) => {
    const client = webBreweryApiClient();
    if (p.verificationStatus === "verified") {
      await unverifyWaterProfile(client, p.id);
    } else {
      await verifyWaterProfile(client, p.id);
    }
    await refresh();
  };

  const onDeleteProfile = async (p: WaterProfile) => {
    if (p.scope === "system") return;
    const ok = window.confirm(`Delete water profile "${p.name}"? This cannot be undone.`);
    if (!ok) return;
    setError(null);
    try {
      await deleteWaterProfile(webBreweryApiClient(), p.id);
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const setOpenSectionsFromAccordion = (next: string | string[]) => {
    setOpenSections(Array.isArray(next) ? next : next ? [next] : []);
  };

  return {
    t,
    tEquipment,
    tUnits,
    profiles,
    allProfiles,
    error,
    admin,
    openSections,
    setOpenSectionsFromAccordion,
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
