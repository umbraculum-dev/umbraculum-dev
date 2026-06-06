import type { PrismaClient } from "@prisma/client";

import { NotFoundError } from "../../errors.js";

export async function listIntegrationDevices(
  prisma: PrismaClient,
  integrationId: string,
  readingsTake = 1,
) {
  return prisma.integrationDevice.findMany({
    where: { integrationId },
    orderBy: [{ lastSeenAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      deviceKey: true,
      displayName: true,
      metadataJson: true,
      lastSeenAt: true,
      createdAt: true,
      attachments: {
        where: { detachedAt: null },
        orderBy: [{ attachedAt: "desc" }, { id: "desc" }],
        take: 1,
        select: {
          id: true,
          attachedAt: true,
          brewSession: {
            select: {
              id: true,
              code: true,
              status: true,
              createdAt: true,
              startedAt: true,
              recipe: { select: { id: true, name: true, version: true } },
            },
          },
        },
      },
      readings: {
        orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
        take: readingsTake,
        select: {
          id: true,
          brewSessionId: true,
          recordedAt: true,
          receivedAt: true,
          temperatureC: true,
          gravitySg: true,
        },
      },
    },
  });
}

export async function attachDeviceToBrewSession(
  prisma: PrismaClient,
  deviceId: string,
  brewSessionId: string,
) {
  const now = new Date();
  await prisma.integrationDeviceAttachment.updateMany({
    where: { deviceId, detachedAt: null },
    data: { detachedAt: now },
  });
  return prisma.integrationDeviceAttachment.create({
    data: { deviceId, brewSessionId, attachedAt: now },
    select: { id: true, attachedAt: true, brewSessionId: true },
  });
}

export async function detachDevice(prisma: PrismaClient, deviceId: string) {
  const now = new Date();
  return prisma.integrationDeviceAttachment.updateMany({
    where: { deviceId, detachedAt: null },
    data: { detachedAt: now },
  });
}

export async function detachDeviceFromBrewSession(
  prisma: PrismaClient,
  deviceId: string,
  brewSessionId: string,
) {
  return prisma.integrationDeviceAttachment.updateMany({
    where: { deviceId, brewSessionId, detachedAt: null },
    data: { detachedAt: new Date() },
  });
}

export async function assertIntegrationDevice(
  prisma: PrismaClient,
  integrationId: string,
  deviceId: string,
) {
  const device = await prisma.integrationDevice.findFirst({
    where: { id: deviceId, integrationId },
    select: { id: true },
  });
  if (!device) throw new NotFoundError("missing_device", "Device not found");
  return device;
}

export async function assertBrewSessionInWorkspace(
  prisma: PrismaClient,
  workspaceId: string,
  brewSessionId: string,
) {
  const session = await prisma.brewSession.findFirst({
    where: { id: brewSessionId, workspaceId },
    select: { id: true },
  });
  if (!session) throw new NotFoundError("missing_brew_session", "Brew session not found");
  return session;
}

export async function listRecentBrewSessions(
  prisma: PrismaClient,
  workspaceId: string,
  limit: number,
) {
  return prisma.brewSession.findMany({
    where: { workspaceId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: {
      id: true,
      recipeId: true,
      code: true,
      status: true,
      startedAt: true,
      pausedAt: true,
      stoppedAt: true,
      scheduledDate: true,
      createdAt: true,
      recipe: { select: { id: true, name: true, version: true } },
    },
  });
}
