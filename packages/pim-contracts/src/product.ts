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
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type ProductGetResponse = z.infer<typeof ProductGetResponseSchema>;
