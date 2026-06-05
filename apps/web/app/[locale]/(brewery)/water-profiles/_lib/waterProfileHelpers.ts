import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";

export function isAdmin(role: string | null) {
  return role === "brewery_admin";
}

export function mergeAllProfiles(profiles: WaterProfilesResponse | null): WaterProfile[] {
  const sys = profiles?.system ?? [];
  const pub = profiles?.public ?? [];
  const wsp = profiles?.workspace ?? [];
  return [...sys, ...pub, ...wsp];
}
