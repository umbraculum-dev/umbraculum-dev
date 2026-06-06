import type { IntegrationKind, PrismaClient } from "@prisma/client";
import { createHash, createHmac, randomUUID } from "node:crypto";

import { BadRequestError, UnauthorizedError } from "../../errors.js";
import type { CreateIntegrationResult } from "./integrationsTypes.js";

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

function getTokenSecret(): string {
  const raw = (process.env["INTEGRATIONS_TOKEN_SECRET"] ?? "").trim();
  if (raw) return raw;
  if (process.env["NODE_ENV"] === "production") {
    throw new BadRequestError("missing_integrations_token_secret", "INTEGRATIONS_TOKEN_SECRET is not configured");
  }
  return "dev_insecure_integrations_token_secret_change_me";
}

export function hashIntegrationToken(token: string): string {
  const t = token.trim();
  if (!t) throw new BadRequestError("invalid_token", "Token is required");
  return sha256Hex(t);
}

export function deriveIntegrationToken(input: { integrationId: string; tokenVersion: number }): string {
  const version = Math.max(1, Math.floor(input.tokenVersion));
  const payload = `${input.integrationId}:${version}`;
  const mac = createHmac("sha256", getTokenSecret()).update(payload).digest();
  return base64Url(mac);
}

export async function requireActiveIntegrationByToken(
  prisma: PrismaClient,
  input: { token: string; kind: IntegrationKind },
) {
  const tokenHash = hashIntegrationToken(input.token);
  const integration = await prisma.integration.findUnique({
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

export async function createIntegration(
  prisma: PrismaClient,
  workspaceId: string,
  kind: IntegrationKind,
): Promise<CreateIntegrationResult> {
  const id = randomUUID();
  const tokenVersion = 1;
  const token = deriveIntegrationToken({ integrationId: id, tokenVersion });
  const tokenHash = hashIntegrationToken(token);
  const integration = await prisma.integration.create({
    data: { id, workspaceId, kind, tokenVersion, tokenHash },
    select: { id: true, workspaceId: true, kind: true, revokedAt: true },
  });
  return { integration, token };
}

export async function rotateIntegrationToken(prisma: PrismaClient, integrationId: string) {
  const current = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { id: true, tokenVersion: true },
  });
  if (!current) throw new BadRequestError("invalid_integration_id", "Integration not found");

  const nextVersion = Math.max(1, Math.floor(current.tokenVersion ?? 1)) + 1;
  const token = deriveIntegrationToken({ integrationId, tokenVersion: nextVersion });
  const tokenHash = hashIntegrationToken(token);

  await prisma.integration.update({
    where: { id: integrationId },
    data: { tokenVersion: nextVersion, tokenHash, revokedAt: null },
    select: { id: true },
  });
  return { token };
}

export async function revokeIntegration(prisma: PrismaClient, integrationId: string) {
  await prisma.integration.update({
    where: { id: integrationId },
    data: { revokedAt: new Date() },
    select: { id: true },
  });
}

export async function findWorkspaceIntegration(
  prisma: PrismaClient,
  workspaceId: string,
  kind: IntegrationKind,
) {
  return prisma.integration.findFirst({
    where: { workspaceId, kind },
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      workspaceId: true,
      kind: true,
      revokedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findActiveIntegrationForReveal(
  prisma: PrismaClient,
  workspaceId: string,
  kind: IntegrationKind,
) {
  return prisma.integration.findFirst({
    where: { workspaceId, kind, revokedAt: null },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { id: true, tokenVersion: true },
  });
}
