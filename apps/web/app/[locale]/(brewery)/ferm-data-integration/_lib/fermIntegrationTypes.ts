export type IntegrationKind = "tilt" | "ispindel" | "rapt";

export const INTEGRATION_KINDS: IntegrationKind[] = ["tilt", "ispindel", "rapt"];

export type IntegrationSummary = {
  id: string;
  workspaceId: string;
  kind: IntegrationKind;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HydrometerReadingPoint = {
  recordedAt: string | null;
  receivedAt: string;
  temperatureC: number | null;
  gravitySg: number | null;
};

export type IntegrationDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
  lastSeenAt: string | null;
  activeAttachment?: {
    brewSession?: {
      id: string;
      code: string;
      recipe?: { id: string; name: string | null } | null;
    } | null;
  } | null;
  lastReading?: HydrometerReadingPoint | null;
  recentReadings?: HydrometerReadingPoint[] | null;
};

export type RecentBrewSession = {
  id: string;
  code: string;
  recipe?: { id: string; name: string | null } | null;
};

export function createKindRecord<T>(value: T): Record<IntegrationKind, T> {
  return {
    tilt: value,
    ispindel: value,
    rapt: value,
  };
}
