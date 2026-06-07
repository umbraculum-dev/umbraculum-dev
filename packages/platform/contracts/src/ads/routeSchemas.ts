/**
 * Platform ads route contracts (OpenAPI ads + platform-admin tags).
 */
import { z } from "zod";

const isoDateTime = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString();
  return v;
}, z.string());

const optionalIsoDateTime = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  return v;
}, isoDateTime.nullable());

export const AdPlacementSchema = z.enum([
  "global_top",
  "global_bottom",
  "recipe_edit_after_fermentables",
  "recipe_edit_after_hops",
  "recipe_edit_after_yeast",
]);

export const AdPlatformSchema = z
  .unknown()
  .transform((v): "web" => (v === "web" ? "web" : "web"));

export const AdSlotParamsSchema = z.object({
  placement: AdPlacementSchema,
});

export const AdSlotQuerySchema = z.object({
  platform: AdPlatformSchema.optional(),
});

export const ResolvedAdSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  linkUrl: z.string().min(1),
  altText: z.string().min(1),
});

export const AdSlotResponseSchema = z.object({
  ok: z.literal(true),
  placement: AdPlacementSchema,
  platform: z.literal("web"),
  disabled: z.boolean(),
  ad: ResolvedAdSchema.nullable(),
});

/** platform-admin: GET /platform/ads */
export const PlatformAdRowSchema = z.object({
  id: z.string().min(1),
  placement: AdPlacementSchema,
  platform: z.literal("web"),
  imageUrl: z.string(),
  linkUrl: z.string(),
  altText: z.string(),
  isActive: z.boolean(),
  startsAt: optionalIsoDateTime,
  endsAt: optionalIsoDateTime,
  priority: z.number().int(),
  weight: z.number().int(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const PlatformAdsListResponseSchema = z.object({
  ok: z.literal(true),
  ads: z.array(PlatformAdRowSchema),
});

export const PlatformAdCreateRequestSchema = z.object({
  placement: AdPlacementSchema,
  platform: AdPlatformSchema.optional(),
  imageUrl: z.string().trim().min(1, "Body.imageUrl is required"),
  linkUrl: z.string().trim().min(1, "Body.linkUrl is required"),
  altText: z.string().trim().min(1, "Body.altText is required"),
  startsAt: optionalIsoDateTime.optional(),
  endsAt: optionalIsoDateTime.optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
  weight: z.number().int().optional(),
});

export const PlatformAdCreateResponseSchema = z.object({
  ok: z.literal(true),
  id: z.string().min(1),
});

export const PlatformAdIdParamsSchema = z.object({
  id: z.string().min(1, "Params.id is required"),
});

export const PlatformAdPatchRequestSchema = z
  .object({
    placement: AdPlacementSchema.optional(),
    platform: AdPlatformSchema.optional(),
    imageUrl: z.string().trim().optional(),
    linkUrl: z.string().trim().optional(),
    altText: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    startsAt: optionalIsoDateTime.optional(),
    endsAt: optionalIsoDateTime.optional(),
    priority: z.number().int().optional(),
    weight: z.number().int().optional(),
  })
  .strict();

export const PlatformAdOkResponseSchema = z.object({
  ok: z.literal(true),
});

export type AdSlotResponse = z.infer<typeof AdSlotResponseSchema>;
export type PlatformAdRow = z.infer<typeof PlatformAdRowSchema>;
