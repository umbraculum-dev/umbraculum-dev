import { useCallback, useEffect, useState } from "react";

import { listEquipmentProfiles, listStyles } from "@umbraculum/api-client/brewery";

import type { EquipmentProfile, StyleListItem } from "../../lib/recipeEditTypes";

type ApiClient = Parameters<typeof listStyles>[0];

export function useNativeRecipeEditCatalogs(params: { api: ApiClient | null }) {
  const { api } = params;

  const [equipmentProfiles, setEquipmentProfiles] = useState<EquipmentProfile[]>([]);
  const [equipmentProfilesLoading, setEquipmentProfilesLoading] = useState(false);
  const [equipmentProfilesError, setEquipmentProfilesError] = useState<string | null>(null);
  const [selectedEquipmentProfileId, setSelectedEquipmentProfileId] = useState("");

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);

  const loadStyles = useCallback(async () => {
    if (!api) return;
    setStylesLoading(true);
    try {
      const parsed = await listStyles(api);
      const items = parsed.styles;
      setStyles(Array.isArray(items) ? (items as StyleListItem[]) : []);
    } catch {
      setStyles([]);
    } finally {
      setStylesLoading(false);
    }
  }, [api]);

  const loadEquipmentProfiles = useCallback(async () => {
    if (!api) return;
    setEquipmentProfilesLoading(true);
    setEquipmentProfilesError(null);
    try {
      const parsed = await listEquipmentProfiles(api);
      const items = parsed.profiles;
      setEquipmentProfiles(Array.isArray(items) ? (items as unknown as EquipmentProfile[]) : []);
    } catch (err) {
      setEquipmentProfilesError(String(err));
      setEquipmentProfiles([]);
    } finally {
      setEquipmentProfilesLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (api) {
      void loadStyles();
      void loadEquipmentProfiles();
    }
  }, [api, loadStyles, loadEquipmentProfiles]);

  return {
    equipmentProfiles,
    equipmentProfilesLoading,
    equipmentProfilesError,
    selectedEquipmentProfileId,
    setSelectedEquipmentProfileId,
    styles,
    stylesLoading,
    loadStyles,
    loadEquipmentProfiles,
  };
}
