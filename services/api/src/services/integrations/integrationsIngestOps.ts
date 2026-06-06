import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { BadRequestError } from "../../errors.js";
import type {
  CreateIntegrationReadingInput,
  CreateIntegrationReadingResult,
  UpsertIntegrationDeviceResult,
} from "./integrationsTypes.js";

export async function getActiveAttachmentForDevice(prisma: PrismaClient, deviceId: string) {
  return prisma.integrationDeviceAttachment.findFirst({
    where: { deviceId, detachedAt: null },
    orderBy: [{ attachedAt: "desc" }, { id: "desc" }],
    select: { id: true, brewSessionId: true, attachedAt: true },
  });
}

export async function upsertDevice(
  prisma: PrismaClient,
  input: {
    integrationId: string;
    deviceKey: string;
    displayName?: string | null;
    metadataJson?: unknown;
  },
): Promise<UpsertIntegrationDeviceResult> {
  const key = input.deviceKey.trim();
  if (!key) throw new BadRequestError("invalid_device_key", "Device key is required");
  const now = new Date();

  const metadataJson: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined =
    input.metadataJson === undefined
      ? undefined
      : input.metadataJson === null
        ? Prisma.JsonNull
        : (input.metadataJson);
  const device = await prisma.integrationDevice.upsert({
    where: { integrationId_deviceKey: { integrationId: input.integrationId, deviceKey: key } },
    create: {
      integrationId: input.integrationId,
      deviceKey: key,
      displayName: input.displayName ?? null,
      ...(metadataJson !== undefined ? { metadataJson } : {}),
      lastSeenAt: now,
    },
    update: {
      ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
      ...(metadataJson !== undefined ? { metadataJson } : {}),
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

export async function createReading(
  prisma: PrismaClient,
  input: CreateIntegrationReadingInput,
): Promise<CreateIntegrationReadingResult> {
  const attachment = await getActiveAttachmentForDevice(prisma, input.deviceId);
  const reading = await prisma.integrationReading.create({
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

export function parseOptionalRecordedAt(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function fahrenheitToCelsius(f: number): number {
  return (f - 32) * (5 / 9);
}

export function buildRawMeta(raw: unknown): Record<string, unknown> {
  return {
    rawType: Array.isArray(raw) ? "array" : raw === null ? "null" : typeof raw,
    receivedAtIso: new Date().toISOString(),
  };
}
