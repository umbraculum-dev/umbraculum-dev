import type { IntegrationKind } from "@prisma/client";

export type CreateIntegrationResult = {
  integration: { id: string; workspaceId: string; kind: IntegrationKind; revokedAt: Date | null };
  token: string;
};

export type UpsertIntegrationDeviceResult = {
  device: {
    id: string;
    integrationId: string;
    deviceKey: string;
    displayName: string | null;
    metadataJson: unknown | null;
    lastSeenAt: Date | null;
  };
};

export type CreateIntegrationReadingInput = {
  deviceId: string;
  temperatureC: number | null;
  gravitySg: number | null;
  recordedAt: Date | null;
  rawJson: unknown;
};

export type CreateIntegrationReadingResult = {
  reading: {
    id: string;
    deviceId: string;
    brewSessionId: string | null;
    recordedAt: Date | null;
    receivedAt: Date;
    temperatureC: number | null;
    gravitySg: number | null;
  };
};
