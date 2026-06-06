import type { IntegrationKind } from "@prisma/client";

export function integrationPublicPath(kind: IntegrationKind | string, token: string): string {
  return `/api/integrations/${kind}/${encodeURIComponent(token)}`;
}

export function toIntegrationGetDto(
  integration: {
    id: string;
    workspaceId: string;
    kind: IntegrationKind;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null,
) {
  return integration
    ? {
        id: integration.id,
        workspaceId: integration.workspaceId,
        kind: integration.kind,
        revokedAt: integration.revokedAt,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      }
    : null;
}

type DeviceRow = {
  id: string;
  deviceKey: string;
  displayName: string | null;
  metadataJson: unknown;
  lastSeenAt: Date | null;
  createdAt: Date;
  attachments?: Array<{
    id: string;
    attachedAt: Date;
    brewSession: unknown;
  }>;
  readings?: unknown[];
};

export function mapIntegrationDeviceDto(
  d: DeviceRow,
  options: { includeReadings: boolean },
) {
  const lastReading = d.readings?.[0] ?? null;
  const recentReadings = options.includeReadings ? (d.readings ?? []) : null;
  return {
    id: d.id,
    deviceKey: d.deviceKey,
    displayName: d.displayName,
    metadataJson: d.metadataJson ?? null,
    lastSeenAt: d.lastSeenAt,
    createdAt: d.createdAt,
    activeAttachment: d.attachments?.[0]
      ? {
          id: d.attachments[0].id,
          attachedAt: d.attachments[0].attachedAt,
          brewSession: d.attachments[0].brewSession,
        }
      : null,
    lastReading,
    ...(recentReadings !== null ? { recentReadings } : {}),
  };
}
