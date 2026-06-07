import type { PrismaClient } from "@prisma/client";

import { BadRequestError, ForbiddenError, NotFoundError } from "../../../../../errors.js";
import { WorkspacesService } from "../../../../../services/workspacesService.js";
import {
  isAdminRole,
  toNumber,
  toOptionalPh,
  toScope,
  toType,
  toVerificationStatus,
  type UpdateWaterProfileInput,
} from "../waterProfilesTypes.js";

export async function updateWaterProfile(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  profileId: string,
  input: UpdateWaterProfileInput,
) {
  const role = await workspaces.assertMembership(userId, workspaceId);
  if (!isAdminRole(role)) {
    throw new ForbiddenError("insufficient_role", "Only brewery admins can manage water profiles");
  }

  const existing = await prisma.waterProfile.findUnique({ where: { id: profileId } });
  if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");

  if (existing.scope === "system") {
    throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
  }

  if (existing.workspaceId !== workspaceId) {
    throw new ForbiddenError("wrong_workspace", "Water profile does not belong to this workspace");
  }

  const data: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = (input.name ?? "").trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
    data["name"] = name;
  }
  if (input.scope !== undefined) data["scope"] = toScope(input.scope);
  if (input.type !== undefined) data["type"] = toType(input.type);

  const numericFields = [
    "ph",
    "calcium",
    "magnesium",
    "sodium",
    "sulfate",
    "chloride",
    "bicarbonate",
  ] as const;
  const inputRec = input as Record<string, unknown>;
  for (const f of numericFields) {
    const v = inputRec[f];
    if (v !== undefined) {
      if (f === "ph") data[f] = toOptionalPh(v);
      else data[f] = toNumber(v, f);
    }
  }

  if (input.verificationStatus !== undefined) data["verificationStatus"] = toVerificationStatus(input.verificationStatus);

  if (Object.keys(data).length === 0) {
    throw new BadRequestError("no_updates", "No updatable fields provided");
  }

  return prisma.waterProfile.update({
    where: { id: profileId },
    data: data,
  });
}

export async function setWaterProfileVerificationStatus(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  profileId: string,
  verificationStatus: "unverified" | "verified",
) {
  const role = await workspaces.assertMembership(userId, workspaceId);
  if (!isAdminRole(role)) {
    throw new ForbiddenError("insufficient_role", "Only brewery admins can verify water profiles");
  }

  const existing = await prisma.waterProfile.findUnique({ where: { id: profileId } });
  if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");
  if (existing.scope === "system") {
    throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
  }
  if (existing.workspaceId !== workspaceId) {
    throw new ForbiddenError("wrong_workspace", "Water profile does not belong to this workspace");
  }

  return prisma.waterProfile.update({
    where: { id: profileId },
    data: {
      verificationStatus,
      verifiedByUserId: userId,
      verifiedAt: verificationStatus === "verified" ? new Date() : null,
    },
  });
}

export async function deleteWaterProfile(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  profileId: string,
) {
  const role = await workspaces.assertMembership(userId, workspaceId);
  if (!isAdminRole(role)) {
    throw new ForbiddenError("insufficient_role", "Only brewery admins can manage water profiles");
  }

  const existing = await prisma.waterProfile.findUnique({ where: { id: profileId } });
  if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");

  if (existing.scope === "system") {
    throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
  }

  if (existing.workspaceId !== workspaceId) {
    throw new ForbiddenError("wrong_workspace", "Water profile does not belong to this workspace");
  }

  await prisma.waterProfile.delete({ where: { id: profileId } });
  return { ok: true as const };
}
