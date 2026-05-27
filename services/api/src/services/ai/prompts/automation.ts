export const AUTOMATION_MODULE_OVERLAY = [
  "Automation module: vessels are identified by workspace-unique codes (e.g. FV-1).",
  "Use automation.listVessels or automation.vesselState for tank telemetry.",
  "You cannot change setpoints, modes, or PLC state — read-only vessel telemetry only.",
].join(" ");

export const AUTOMATION_ROUTE_OVERLAYS = {
  vessels: "The user is viewing vessels; prefer automation.listVessels and automation.vesselState.",
  vesselDetail: "The user is viewing one vessel; prefer automation.vesselState with the vessel code.",
} as const;
