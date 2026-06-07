export type IntegrationKind = "tilt" | "ispindel" | "rapt";

export const INTEGRATION_KINDS: IntegrationKind[] = ["tilt", "ispindel", "rapt"];

export type BrewSessionDetail = {
  id: string;
  code: string;
  status: string;
  recipe?: { id: string; name: string | null } | null;
};

export type HydrometerDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
};

export type HydrometerAttachment = {
  id: string;
  attachedAt: string;
  device: HydrometerDevice & { kind: IntegrationKind };
};

export type HydrometerReading = {
  recordedAt: string | null;
  receivedAt: string;
  temperatureC: number | null;
  gravitySg: number | null;
};

export type HydrometerWorkingAction = null | "refresh" | "attach" | "detach";
