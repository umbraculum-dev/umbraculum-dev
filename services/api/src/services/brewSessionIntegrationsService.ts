import type { IntegrationKind, PrismaClient } from "@prisma/client";

import { BadRequestError, NotFoundError } from "../errors.js";
import { IntegrationsService } from "./integrationsService.js";

export class BrewSessionIntegrationsService {
  private readonly integrations: IntegrationsService;

  constructor(private readonly prisma: PrismaClient) {
    this.integrations = new IntegrationsService(prisma);
  }

  async assertSessionInWorkspace(workspaceId: string, brewSessionId: string): Promise<void> {
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
      select: { id: true },
    });
    if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");
  }

  async listAttachments(workspaceId: string, brewSessionId: string) {
    await this.assertSessionInWorkspace(workspaceId, brewSessionId);

    const attachments = await this.prisma.integrationDeviceAttachment.findMany({
      where: { brewSessionId, detachedAt: null },
      orderBy: [{ attachedAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        attachedAt: true,
        device: {
          select: {
            id: true,
            deviceKey: true,
            displayName: true,
            lastSeenAt: true,
            metadataJson: true,
            integration: { select: { id: true, kind: true } },
          },
        },
      },
    });

    return attachments.map((a) => ({
      id: a.id,
      attachedAt: a.attachedAt,
      device: {
        id: a.device.id,
        deviceKey: a.device.deviceKey,
        displayName: a.device.displayName,
        lastSeenAt: a.device.lastSeenAt,
        metadataJson: a.device.metadataJson ?? null,
        integrationId: a.device.integration.id,
        kind: a.device.integration.kind,
      },
    }));
  }

  async attachDevice(
    workspaceId: string,
    brewSessionId: string,
    kind: IntegrationKind,
    deviceId: string,
  ) {
    await this.assertSessionInWorkspace(workspaceId, brewSessionId);

    const integration = await this.integrations.findWorkspaceIntegration(workspaceId, kind);
    if (!integration) {
      throw new NotFoundError("missing_integration", "Integration not configured");
    }

    const device = await this.prisma.integrationDevice.findFirst({
      where: { id: deviceId, integrationId: integration.id },
      select: { id: true },
    });
    if (!device) throw new NotFoundError("missing_device", "Device not found");

    return this.integrations.attachDeviceToBrewSession(deviceId, brewSessionId);
  }

  async detachDevice(workspaceId: string, brewSessionId: string, deviceId: string) {
    await this.assertSessionInWorkspace(workspaceId, brewSessionId);
    return this.integrations.detachDeviceFromBrewSession(deviceId, brewSessionId);
  }

  async listReadings(
    workspaceId: string,
    brewSessionId: string,
    kind: IntegrationKind,
    limit: number,
  ) {
    await this.assertSessionInWorkspace(workspaceId, brewSessionId);

    return this.prisma.integrationReading.findMany({
      where: {
        brewSessionId,
        device: { integration: { workspaceId, kind } },
      },
      orderBy: [{ recordedAt: "desc" }, { receivedAt: "desc" }, { id: "desc" }],
      take: limit,
      select: {
        id: true,
        deviceId: true,
        recordedAt: true,
        receivedAt: true,
        temperatureC: true,
        gravitySg: true,
      },
    });
  }
}

export function assertIntegrationKind(v: unknown): IntegrationKind {
  const raw = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!raw) throw new BadRequestError("invalid_integration_kind", "Integration kind is required");
  const supported: IntegrationKind[] = ["tilt", "ispindel", "rapt"];
  if (!supported.includes(raw as IntegrationKind)) {
    throw new BadRequestError("invalid_integration_kind", "Integration kind is not supported");
  }
  return raw as IntegrationKind;
}

export function assertReadingsLimit(v: unknown, fallback = 200, max = 500): number {
  const raw = typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
  const n = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.max(1, Math.min(max, n));
}
