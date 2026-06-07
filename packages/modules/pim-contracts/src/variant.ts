import { z } from "zod";

import { AttributeValueSchema } from "./attribute.js";
import { IsoDateTimeStringSchema } from "./shared.js";

export const VariantSchema = z.object({
  id: z.string().min(1, "id required"),
  productId: z.string().min(1, "productId required"),
  sku: z.string().min(1, "sku required"),
  name: z.string().min(1, "name required"),
  attributeValues: z.record(z.string(), AttributeValueSchema),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const VariantRefSchema = z.object({
  variantId: z.string().min(1, "variantId required"),
});

export const VariantCreateRequestSchema = z
  .object({
    sku: z.string().min(1, "sku required"),
    name: z.string().min(1, "name required"),
    attributeValues: z.record(z.string(), AttributeValueSchema).optional(),
  })
  .strict();

export const VariantUpdateRequestSchema = z
  .object({
    sku: z.string().min(1, "sku required").optional(),
    name: z.string().min(1, "name required").optional(),
    attributeValues: z.record(z.string(), AttributeValueSchema).optional(),
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

export const VariantListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(VariantSchema),
});

export const VariantGetResponseSchema = z.object({
  ok: z.literal(true),
  item: VariantSchema,
});

export type Variant = z.infer<typeof VariantSchema>;
export type VariantRef = z.infer<typeof VariantRefSchema>;
export type VariantCreateRequest = z.infer<typeof VariantCreateRequestSchema>;
export type VariantUpdateRequest = z.infer<typeof VariantUpdateRequestSchema>;
export type VariantListResponse = z.infer<typeof VariantListResponseSchema>;
export type VariantGetResponse = z.infer<typeof VariantGetResponseSchema>;
