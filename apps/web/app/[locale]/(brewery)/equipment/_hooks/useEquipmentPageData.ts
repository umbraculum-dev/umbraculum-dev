"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { AuthMeResponse } from "@umbraculum/contracts";

import { listEquipmentProfiles } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import { fetchAuthMe } from "../../../../_shared-layout/_lib/fetchAuthMe";
import type { EquipmentProfile } from "../_lib/equipmentTypes";

export function useEquipmentPageData() {
  const t = useTranslations("equipment");

  const [auth, setAuth] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<EquipmentProfile[]>([]);
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState<string[]>([]);

  const canWrite = auth != null;

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const meRes = await fetchAuthMe();
      if (!meRes.ok) {
        setAuth(null);
        throw new Error(t("errors.notAuthenticated"));
      }
      setAuth(meRes.data);

      const listData = await listEquipmentProfiles(webBreweryApiClient());
      setProfiles(Array.isArray(listData.profiles) ? (listData.profiles as EquipmentProfile[]) : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setListSectionOpen = (open: boolean) => {
    setOpenSections((prev) =>
      open ? (prev.includes("list") ? prev : [...prev, "list"]) : prev.filter((x) => x !== "list")
    );
  };

  const setCreateSectionOpen = (open: boolean) => {
    setOpenSections((prev) =>
      open ? (prev.includes("create") ? prev : [...prev, "create"]) : prev.filter((x) => x !== "create")
    );
  };

  return {
    profiles,
    error,
    canWrite,
    openSections,
    setListSectionOpen,
    setCreateSectionOpen,
    refresh,
  };
}
