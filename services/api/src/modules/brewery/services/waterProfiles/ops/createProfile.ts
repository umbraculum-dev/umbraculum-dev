import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { BadRequestError, ForbiddenError } from "../../../../../errors.js";
import { WorkspacesService } from "../../../../../services/workspacesService.js";
import {
  type CreateWaterProfileInput,
  isAdminRole,
  toNumber,
  toOptionalPh,
  toScope,
  toType,
  type WaterProfileScope,
} from "../waterProfilesTypes.js";

export async function createWaterProfile(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  input: CreateWaterProfileInput,
) {
  const role = await workspaces.assertMembership(userId, workspaceId);
  if (!isAdminRole(role)) {
    throw new ForbiddenError("insufficient_role", "Only brewery admins can manage water profiles");
  }

  const name = input.name.trim();
  if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

  const scope: WaterProfileScope = toScope(input.scope) ?? "account";
  const type = toType(input.type);
  if (!type) throw new BadRequestError("invalid_type", "Body.type is required");

  const phValue = toOptionalPh(input.ph);
  return prisma.waterProfile.create({
    data: {
      key: `user:${randomUUID()}`,
      scope,
      type,
      workspaceId,
      name,
      ...(phValue !== undefined ? { ph: phValue } : {}),
      calcium: toNumber(input.calcium, "calcium"),
      magnesium: toNumber(input.magnesium, "magnesium"),
      sodium: toNumber(input.sodium, "sodium"),
      sulfate: toNumber(input.sulfate, "sulfate"),
      chloride: toNumber(input.chloride, "chloride"),
      bicarbonate: toNumber(input.bicarbonate, "bicarbonate"),
      verificationStatus: "unverified",
      submittedByUserId: userId,
      source: "user",
    },
  });
}
