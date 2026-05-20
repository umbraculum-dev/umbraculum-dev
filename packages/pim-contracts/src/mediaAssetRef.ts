import { z } from "zod";

import { IsoDateTimeStringSchema } from "./shared.js";

export const MediaAssetRoleSchema = z.enum(["primary", "gallery", "swatch", "document"]);

export const MediaAssetRefSchema = z.object({
  id: z.string().min(1, "id required"),
  productId: z.string().min(1, "productId required"),
  mediaAssetId: z.string().min(1, "mediaAssetId required"),
  role: MediaAssetRoleSchema,
  sortOrder: z.number().int(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const MediaAssetRefListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(MediaAssetRefSchema),
});

export type MediaAssetRole = z.infer<typeof MediaAssetRoleSchema>;
export type MediaAssetRef = z.infer<typeof MediaAssetRefSchema>;
export type MediaAssetRefListResponse = z.infer<typeof MediaAssetRefListResponseSchema>;
