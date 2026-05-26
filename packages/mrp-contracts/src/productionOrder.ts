import { z } from "zod";

import {
  IsoDateTimeStringSchema,
  NonEmptyStringSchema,
  QuantitySchema,
  UnitCodeSchema,
} from "./shared.js";
import { OperationSchema } from "./operation.js";
import { MaterialRequirementSchema } from "./materialRequirement.js";

export const ProductionOrderStatusSchema = z.enum([
  "planned",
  "released",
  "in_progress",
  "completed",
  "cancelled",
]);

export const ProductionOrderLineSchema = z.object({
  id: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  lineNumber: z.number().int().positive(),
  outputProductId: z.string().min(1).nullable(),
  outputVariantId: z.string().min(1).nullable(),
  description: z.string().min(1).nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
});

export const ProductionOrderSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  orderNumber: NonEmptyStringSchema,
  status: ProductionOrderStatusSchema,
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
  outputProductId: z.string().min(1).nullable(),
  outputVariantId: z.string().min(1).nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  plannedStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
  lines: z.array(ProductionOrderLineSchema),
});

export const ProductionOrderRefSchema = z.object({
  productionOrderId: NonEmptyStringSchema,
});

export const ProductionOrderListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(ProductionOrderSchema),
});

export const ProductionOrderGetResponseSchema = z.object({
  ok: z.literal(true),
  item: ProductionOrderSchema.extend({
    operations: z.array(OperationSchema),
    materialRequirements: z.array(MaterialRequirementSchema),
  }),
});

export type ProductionOrderStatus = z.infer<typeof ProductionOrderStatusSchema>;
export type ProductionOrderLine = z.infer<typeof ProductionOrderLineSchema>;
export type ProductionOrder = z.infer<typeof ProductionOrderSchema>;
export type ProductionOrderRef = z.infer<typeof ProductionOrderRefSchema>;
export type ProductionOrderListResponse = z.infer<typeof ProductionOrderListResponseSchema>;
export type ProductionOrderGetResponse = z.infer<typeof ProductionOrderGetResponseSchema>;

export function parseProductionOrder(payload: unknown): ProductionOrder {
  return ProductionOrderSchema.parse(payload);
}

export function parseProductionOrderListResponse(
  payload: unknown,
): ProductionOrderListResponse {
  return ProductionOrderListResponseSchema.parse(payload);
}

export function parseProductionOrderGetResponse(payload: unknown): ProductionOrderGetResponse {
  return ProductionOrderGetResponseSchema.parse(payload);
}
