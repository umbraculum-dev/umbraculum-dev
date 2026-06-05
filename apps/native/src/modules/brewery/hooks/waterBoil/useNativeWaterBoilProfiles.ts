import { useMemo } from "react";

import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";

export function useNativeWaterBoilProfiles(profiles: WaterProfilesResponse | null) {
  const allProfiles = useMemo(() => {
    if (!profiles) return [];
    const sys = profiles.system ?? [];
    const pub = profiles.public ?? [];
    const ws = profiles.workspace ?? [];
    return [...sys, ...pub, ...ws];
  }, [profiles]);

  const waterProfiles = useMemo(() => allProfiles.filter((p: WaterProfile) => p.type === "water"), [allProfiles]);
  const dilutionProfiles = useMemo(() => allProfiles.filter((p: WaterProfile) => p.type === "dilution"), [allProfiles]);

  return { allProfiles, waterProfiles, dilutionProfiles };
}
