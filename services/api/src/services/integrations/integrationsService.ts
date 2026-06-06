import type { IntegrationKind, PrismaClient } from "@prisma/client";

import * as crudOps from "./integrationsCrudOps.js";
import * as deviceOps from "./integrationsDeviceOps.js";
import * as ingestOps from "./integrationsIngestOps.js";
import type {
  CreateIntegrationReadingInput,
  CreateIntegrationReadingResult,
  CreateIntegrationResult,
  UpsertIntegrationDeviceResult,
} from "./integrationsTypes.js";

export type {
  CreateIntegrationReadingInput,
  CreateIntegrationReadingResult,
  CreateIntegrationResult,
  UpsertIntegrationDeviceResult,
} from "./integrationsTypes.js";

export class IntegrationsService {
  constructor(private readonly prisma: PrismaClient) {}

  hashIntegrationToken(token: string) {
    return crudOps.hashIntegrationToken(token);
  }

  deriveToken(input: { integrationId: string; tokenVersion: number }) {
    return crudOps.deriveIntegrationToken(input);
  }

  requireActiveIntegrationByToken(input: { token: string; kind: IntegrationKind }) {
    return crudOps.requireActiveIntegrationByToken(this.prisma, input);
  }

  createIntegration(workspaceId: string, kind: IntegrationKind): Promise<CreateIntegrationResult> {
    return crudOps.createIntegration(this.prisma, workspaceId, kind);
  }

  rotateIntegrationToken(integrationId: string) {
    return crudOps.rotateIntegrationToken(this.prisma, integrationId);
  }

  revokeIntegration(integrationId: string) {
    return crudOps.revokeIntegration(this.prisma, integrationId);
  }

  findWorkspaceIntegration(workspaceId: string, kind: IntegrationKind) {
    return crudOps.findWorkspaceIntegration(this.prisma, workspaceId, kind);
  }

  findActiveIntegrationForReveal(workspaceId: string, kind: IntegrationKind) {
    return crudOps.findActiveIntegrationForReveal(this.prisma, workspaceId, kind);
  }

  listIntegrationDevices(integrationId: string, readingsTake = 1) {
    return deviceOps.listIntegrationDevices(this.prisma, integrationId, readingsTake);
  }

  attachDeviceToBrewSession(deviceId: string, brewSessionId: string) {
    return deviceOps.attachDeviceToBrewSession(this.prisma, deviceId, brewSessionId);
  }

  detachDevice(deviceId: string) {
    return deviceOps.detachDevice(this.prisma, deviceId);
  }

  detachDeviceFromBrewSession(deviceId: string, brewSessionId: string) {
    return deviceOps.detachDeviceFromBrewSession(this.prisma, deviceId, brewSessionId);
  }

  assertIntegrationDevice(integrationId: string, deviceId: string) {
    return deviceOps.assertIntegrationDevice(this.prisma, integrationId, deviceId);
  }

  assertBrewSessionInWorkspace(workspaceId: string, brewSessionId: string) {
    return deviceOps.assertBrewSessionInWorkspace(this.prisma, workspaceId, brewSessionId);
  }

  listRecentBrewSessions(workspaceId: string, limit: number) {
    return deviceOps.listRecentBrewSessions(this.prisma, workspaceId, limit);
  }

  upsertDevice(input: {
    integrationId: string;
    deviceKey: string;
    displayName?: string | null;
    metadataJson?: unknown;
  }): Promise<UpsertIntegrationDeviceResult> {
    return ingestOps.upsertDevice(this.prisma, input);
  }

  getActiveAttachmentForDevice(deviceId: string) {
    return ingestOps.getActiveAttachmentForDevice(this.prisma, deviceId);
  }

  createReading(input: CreateIntegrationReadingInput): Promise<CreateIntegrationReadingResult> {
    return ingestOps.createReading(this.prisma, input);
  }

  parseOptionalRecordedAt(value: unknown) {
    return ingestOps.parseOptionalRecordedAt(value);
  }

  fahrenheitToCelsius(f: number) {
    return ingestOps.fahrenheitToCelsius(f);
  }

  buildRawMeta(raw: unknown) {
    return ingestOps.buildRawMeta(raw);
  }
}
