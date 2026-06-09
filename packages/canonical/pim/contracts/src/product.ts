import { z } from "zod";

import { IsoDateTimeStringSchema } from "./shared.js";

export const ProductStatusSchema = z.enum(["draft", "active", "archived"]);

export const ProductSchema = z.object({
  id: z.string().min(1, "id required"),
  workspaceId: z.string().min(1, "workspaceId required"),
  sku: z.string().min(1, "sku required"),
  name: z.string().min(1, "name required"),
  description: z.string().nullable(),
  primaryAttributeSetId: z.string().nullable(),
  status: ProductStatusSchema,
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const ProductRefSchema = z.object({
  productId: z.string().min(1, "productId required"),
});

export const ProductCreateRequestSchema = z
  .object({
    sku: z.string().min(1, "sku required"),
    name: z.string().min(1, "name required"),
    description: z.string().nullable().optional(),
    primaryAttributeSetId: z.string().min(1).nullable().optional(),
    status: ProductStatusSchema.optional(),
  })
  .strict();

export const ProductUpdateRequestSchema = z
  .object({
    sku: z.string().min(1, "sku required").optional(),
    name: z.string().min(1, "name required").optional(),
    description: z.string().nullable().optional(),
    primaryAttributeSetId: z.string().min(1).nullable().optional(),
    status: ProductStatusSchema.optional(),
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

export const ProductListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(ProductSchema),
});

export const ProductGetResponseSchema = z.object({
  ok: z.literal(true),
  item: ProductSchema,
});

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductRef = z.infer<typeof ProductRefSchema>;
export type ProductCreateRequest = z.infer<typeof ProductCreateRequestSchema>;
export type ProductUpdateRequest = z.infer<typeof ProductUpdateRequestSchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type ProductGetResponse = z.infer<typeof ProductGetResponseSchema>;
