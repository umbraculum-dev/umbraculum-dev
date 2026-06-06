import { z } from "zod";

import { isoDateTime } from "./routeSchemasCommon.js";

export const EquipmentProfilePayloadSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  equipment: z.record(z.string(), z.unknown()),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const EquipmentProfilesListResponseSchema = z.object({
  ok: z.literal(true),
  profiles: z.array(EquipmentProfilePayloadSchema),
});

export const EquipmentProfileResponseSchema = z.object({
  ok: z.literal(true),
  profile: EquipmentProfilePayloadSchema,
});

export const EquipmentProfileCreateRequestSchema = z.record(z.string(), z.unknown());

export const EquipmentProfilePatchRequestSchema = z.record(z.string(), z.unknown());
