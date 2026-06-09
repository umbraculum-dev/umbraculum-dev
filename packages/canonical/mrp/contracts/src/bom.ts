import { z } from "zod";

import { NonEmptyStringSchema, QuantitySchema, UnitCodeSchema } from "./shared.js";

export const BomLineSchema = z.object({
  id: NonEmptyStringSchema,
  bomId: NonEmptyStringSchema,
  lineNumber: z.number().int().positive(),
  materialRefModule: z.string().min(1).nullable(),
  materialRefId: z.string().min(1).nullable(),
  description: NonEmptyStringSchema,
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  lossPercent: z.number().finite().min(0).max(100).nullable(),
});

export const BomSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  ownerModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
  lines: z.array(BomLineSchema),
});

export const BomRefSchema = z.object({
  bomId: NonEmptyStringSchema,
});

export const BomListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(BomSchema),
});

export const BomGetResponseSchema = z.object({
  ok: z.literal(true),
  item: BomSchema,
});

export type BomLine = z.infer<typeof BomLineSchema>;
export type Bom = z.infer<typeof BomSchema>;
export type BomRef = z.infer<typeof BomRefSchema>;
export type BomListResponse = z.infer<typeof BomListResponseSchema>;
export type BomGetResponse = z.infer<typeof BomGetResponseSchema>;

export function parseBom(payload: unknown): Bom {
  return BomSchema.parse(payload);
}

export function parseBomListResponse(payload: unknown): BomListResponse {
  return BomListResponseSchema.parse(payload);
}

export function parseBomGetResponse(payload: unknown): BomGetResponse {
  return BomGetResponseSchema.parse(payload);
}
