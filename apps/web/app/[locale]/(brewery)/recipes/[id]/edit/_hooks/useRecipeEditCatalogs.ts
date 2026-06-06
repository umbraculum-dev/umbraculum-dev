"use client";

import { useEffect, useState } from "react";

import { listEquipmentProfiles, listStyles } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import type { EquipmentProfile, StyleListItem } from "../_lib/recipeEditTypes";

export function useRecipeEditCatalogs(authReady: boolean) {
  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);

  const [equipmentProfiles, setEquipmentProfiles] = useState<EquipmentProfile[]>([]);
  const [equipmentProfilesLoading, setEquipmentProfilesLoading] = useState(false);
  const [equipmentProfilesError, setEquipmentProfilesError] = useState<string | null>(null);
  const [selectedEquipmentProfileId, setSelectedEquipmentProfileId] = useState<string>("");

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    void (async () => {
      setStylesLoading(true);
      setStylesError(null);
      try {
        const data = await listStyles(webBreweryApiClient());
        if (!cancelled) setStyles(data.styles as StyleListItem[]);
      } catch (err) {
        if (!cancelled) setStylesError(String(err));
      } finally {
        if (!cancelled) setStylesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    void (async () => {
      setEquipmentProfilesLoading(true);
      setEquipmentProfilesError(null);
      try {
        const data = await listEquipmentProfiles(webBreweryApiClient());
        if (!cancelled) setEquipmentProfiles(data.profiles as EquipmentProfile[]);
      } catch (err) {
        if (!cancelled) setEquipmentProfilesError(String(err));
      } finally {
        if (!cancelled) setEquipmentProfilesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady]);

  return {
    styles,
    stylesLoading,
    stylesError,
    equipmentProfiles,
    equipmentProfilesLoading,
    equipmentProfilesError,
    selectedEquipmentProfileId,
    setSelectedEquipmentProfileId,
  };
}
