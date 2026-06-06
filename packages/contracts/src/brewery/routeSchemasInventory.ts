import { z } from "zod";

import { isoDateTime } from "./routeSchemasCommon.js";

export const InventoryItemPayloadSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  category: z.string(),
  ingredientId: z.string().nullable(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  metadataJson: z.unknown().nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const InventoryListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(InventoryItemPayloadSchema),
});

export const InventoryItemResponseSchema = z.object({
  ok: z.literal(true),
  item: InventoryItemPayloadSchema,
});

export const InventoryCreateRequestSchema = z.record(z.string(), z.unknown());

export const InventoryPatchRequestSchema = z.record(z.string(), z.unknown());

export const BrewdaySettingsPayloadSchema = z.record(z.string(), z.unknown());

export const BrewdaySettingsResponseSchema = z.object({
  ok: z.literal(true),
  settings: BrewdaySettingsPayloadSchema.nullable(),
});

export const BrewdaySettingsPatchRequestSchema = z.record(z.string(), z.unknown());
