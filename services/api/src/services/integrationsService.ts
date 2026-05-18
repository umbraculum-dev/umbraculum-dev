import type { IntegrationKind, PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { createHash, createHmac, randomUUID } from "node:crypto";

import { BadRequestError, UnauthorizedError } from "../errors.js";

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function base64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function nowIso() {
  return new Date().toISOString();
}

export type CreateIntegrationResult = {
  integration: { id: string; workspaceId: string; kind: IntegrationKind; revokedAt: Date | null };
  /** Raw token returned once to the caller (store/display immediately). */
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

export class IntegrationsService {
  constructor(private readonly prisma: PrismaClient) {}

  private getTokenSecret(): string {
    const raw = (process.env['INTEGRATIONS_TOKEN_SECRET'] ?? "").trim();
    if (raw) return raw;
    if (process.env['NODE_ENV'] === "production") {
      throw new BadRequestError("missing_integrations_token_secret", "INTEGRATIONS_TOKEN_SECRET is not configured");
    }
    // Dev fallback to keep local environments working. Must be overridden in production.
    return "dev_insecure_integrations_token_secret_change_me";
  }

  hashIntegrationToken(token: string): string {
    const t = token.trim();
    if (!t) throw new BadRequestError("invalid_token", "Token is required");
    return sha256Hex(t);
  }

  deriveToken(input: { integrationId: string; tokenVersion: number }): string {
    const version = Math.max(1, Math.floor(input.tokenVersion));
    const payload = `${input.integrationId}:${version}`;
    const secret = this.getTokenSecret();
    const mac = createHmac("sha256", secret).update(payload).digest();
    return base64Url(mac);
  }

  async requireActiveIntegrationByToken(input: { token: string; kind: IntegrationKind }) {
    const tokenHash = this.hashIntegrationToken(input.token);
    const integration = await this.prisma.integration.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        workspaceId: true,
        kind: true,
        revokedAt: true,
        tokenVersion: true,
      },
    });
    if (!integration || integration.revokedAt) {
      throw new UnauthorizedError("invalid_integration_token", "Invalid integration token");
    }
    if (integration.kind !== input.kind) {
      throw new UnauthorizedError("invalid_integration_token", "Invalid integration token kind");
    }
    return integration;
  }

  async createIntegration(workspaceId: string, kind: IntegrationKind): Promise<CreateIntegrationResult> {
    const id = randomUUID();
    const tokenVersion = 1;
    const token = this.deriveToken({ integrationId: id, tokenVersion });
    const tokenHash = this.hashIntegrationToken(token);
    const integration = await this.prisma.integration.create({
      data: {
        id,
        workspaceId,
        kind,
        tokenVersion,
        tokenHash,
      },
      select: { id: true, workspaceId: true, kind: true, revokedAt: true },
    });
    return { integration, token };
  }

  async rotateIntegrationToken(integrationId: string): Promise<{ token: string }> {
    const current = await this.prisma.integration.findUnique({
      where: { id: integrationId },
      select: { id: true, tokenVersion: true },
    });
    if (!current) throw new BadRequestError("invalid_integration_id", "Integration not found");

    const nextVersion = Math.max(1, Math.floor(current.tokenVersion ?? 1)) + 1;
    const token = this.deriveToken({ integrationId: integrationId, tokenVersion: nextVersion });
    const tokenHash = this.hashIntegrationToken(token);

    await this.prisma.integration.update({
      where: { id: integrationId },
      data: { tokenVersion: nextVersion, tokenHash, revokedAt: null },
      select: { id: true },
    });
    return { token };
  }

  async revokeIntegration(integrationId: string): Promise<void> {
    await this.prisma.integration.update({
      where: { id: integrationId },
      data: { revokedAt: new Date() },
      select: { id: true },
    });
  }

  async upsertDevice(input: {
    integrationId: string;
    deviceKey: string;
    displayName?: string | null;
    metadataJson?: unknown;
  }): Promise<UpsertIntegrationDeviceResult> {
    const key = input.deviceKey.trim();
    if (!key) throw new BadRequestError("invalid_device_key", "Device key is required");
    const now = new Date();

    const metadataJson:
      | Prisma.InputJsonValue
      | typeof Prisma.JsonNull
      | undefined =
      input.metadataJson === undefined
        ? undefined
        : input.metadataJson === null
          ? Prisma.JsonNull
          : (input.metadataJson);
    const device = await this.prisma.integrationDevice.upsert({
      where: { integrationId_deviceKey: { integrationId: input.integrationId, deviceKey: key } },
      create: {
        integrationId: input.integrationId,
        deviceKey: key,
        displayName: input.displayName ?? null,
        metadataJson,
        lastSeenAt: now,
      },
      update: {
        displayName: input.displayName ?? undefined,
        metadataJson,
        lastSeenAt: now,
      },
      select: {
        id: true,
        integrationId: true,
        deviceKey: true,
        displayName: true,
        metadataJson: true,
        lastSeenAt: true,
      },
    });

    return { device };
  }

  async getActiveAttachmentForDevice(deviceId: string) {
    return this.prisma.integrationDeviceAttachment.findFirst({
      where: { deviceId, detachedAt: null },
      orderBy: [{ attachedAt: "desc" }, { id: "desc" }],
      select: { id: true, brewSessionId: true, attachedAt: true },
    });
  }

  async createReading(input: CreateIntegrationReadingInput): Promise<CreateIntegrationReadingResult> {
    const attachment = await this.getActiveAttachmentForDevice(input.deviceId);
    const reading = await this.prisma.integrationReading.create({
      data: {
        deviceId: input.deviceId,
        brewSessionId: attachment?.brewSessionId ?? null,
        recordedAt: input.recordedAt,
        temperatureC: input.temperatureC,
        gravitySg: input.gravitySg,
        rawJson: input.rawJson as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        deviceId: true,
        brewSessionId: true,
        recordedAt: true,
        receivedAt: true,
        temperatureC: true,
        gravitySg: true,
      },
    });
    return { reading };
  }

  /**
   * Best-effort parse for ISO-ish timestamps (e.g. gateway timestamp fields).
   */
  parseOptionalRecordedAt(value: unknown): Date | null {
    if (typeof value !== "string") return null;
    const s = value.trim();
    if (!s) return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  /**
   * Tilt defaults are typically Fahrenheit; store canonical Celsius.
   */
  fahrenheitToCelsius(f: number): number {
    return (f - 32) * (5 / 9);
  }

  /**
   * Debug helper for raw payload auditing.
   */
  buildRawMeta(raw: unknown): Record<string, unknown> {
    return {
      rawType: Array.isArray(raw) ? "array" : raw === null ? "null" : typeof raw,
      receivedAtIso: nowIso(),
    };
  }
}

