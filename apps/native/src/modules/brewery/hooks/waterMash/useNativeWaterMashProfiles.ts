import { useMemo } from "react";

import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/brewery-contracts";

export function useNativeWaterMashProfiles(profiles: WaterProfilesResponse | null) {
  const allProfiles = useMemo(() => {
    if (!profiles) return [];
    const sys = profiles.system ?? [];
    const pub = profiles.public ?? [];
    const ws = profiles.workspace ?? [];
    return [...sys, ...pub, ...ws];
  }, [profiles]);

  const waterProfiles = useMemo(() => allProfiles.filter((p: WaterProfile) => p.type === "water"), [allProfiles]);
  const dilutionProfiles = useMemo(() => allProfiles.filter((p: WaterProfile) => p.type === "dilution"), [allProfiles]);

  const profileOptions = (list: WaterProfile[]) => list.map((p) => ({ value: p.id, label: p.name }));

  return {
    allProfiles,
    waterProfiles,
    dilutionProfiles,
    profileOptions,
  };
}
