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

export const MediaAssetRefCreateRequestSchema = z
  .object({
    mediaAssetId: z.string().min(1, "mediaAssetId required"),
    role: MediaAssetRoleSchema,
    sortOrder: z.number().int().optional(),
  })
  .strict();

export const MediaAssetRefUpdateRequestSchema = z
  .object({
    mediaAssetId: z.string().min(1, "mediaAssetId required").optional(),
    role: MediaAssetRoleSchema.optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Object.values(value).every((v) => v === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "at least one field required",
      });
    }
  });

export const MediaAssetRefListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(MediaAssetRefSchema),
});

export const MediaAssetRefGetResponseSchema = z.object({
  ok: z.literal(true),
  item: MediaAssetRefSchema,
});

export type MediaAssetRole = z.infer<typeof MediaAssetRoleSchema>;
export type MediaAssetRef = z.infer<typeof MediaAssetRefSchema>;
export type MediaAssetRefCreateRequest = z.infer<typeof MediaAssetRefCreateRequestSchema>;
export type MediaAssetRefUpdateRequest = z.infer<typeof MediaAssetRefUpdateRequestSchema>;
export type MediaAssetRefListResponse = z.infer<typeof MediaAssetRefListResponseSchema>;
export type MediaAssetRefGetResponse = z.infer<typeof MediaAssetRefGetResponseSchema>;
