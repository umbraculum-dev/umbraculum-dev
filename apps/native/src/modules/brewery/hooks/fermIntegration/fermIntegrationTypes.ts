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

export type IntegrationDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
  lastSeenAt: string | null;
  lastReading?: {
    recordedAt: string | null;
    receivedAt: string;
    temperatureC: number | null;
    gravitySg: number | null;
  } | null;
  recentReadings?: Array<{
    recordedAt: string | null;
    receivedAt: string;
    temperatureC: number | null;
    gravitySg: number | null;
  }> | null;
};

export type IntegrationTokenState = {
  token: string | null;
  publicPath: string | null;
};

export type FermIntegrationWorkingAction = "create" | "reveal" | "rotate" | "revoke";
