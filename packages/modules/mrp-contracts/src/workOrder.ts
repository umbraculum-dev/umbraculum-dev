import { z } from "zod";

import { MaterialRequirementSchema } from "./materialRequirement.js";
import { OperationSchema } from "./operation.js";
import { ProductionOrderSchema } from "./productionOrder.js";
import { NonEmptyStringSchema } from "./shared.js";

export const WorkOrderPreviewSchema = z.object({
  productionOrder: ProductionOrderSchema,
  operations: z.array(OperationSchema),
  materialRequirements: z.array(MaterialRequirementSchema),
  operatorNotes: z.array(z.string().min(1)),
});

export const WorkOrderPreviewResponseSchema = z.object({
  ok: z.literal(true),
  item: WorkOrderPreviewSchema,
});

export const WorkOrderDocumentInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  preview: WorkOrderPreviewSchema,
});

export type WorkOrderPreview = z.infer<typeof WorkOrderPreviewSchema>;
export type WorkOrderPreviewResponse = z.infer<typeof WorkOrderPreviewResponseSchema>;
export type WorkOrderDocumentInput = z.infer<typeof WorkOrderDocumentInputSchema>;

export function parseWorkOrderPreview(payload: unknown): WorkOrderPreview {
  return WorkOrderPreviewSchema.parse(payload);
}

export function parseWorkOrderPreviewResponse(payload: unknown): WorkOrderPreviewResponse {
  return WorkOrderPreviewResponseSchema.parse(payload);
}

export function parseWorkOrderDocumentInput(payload: unknown): WorkOrderDocumentInput {
  return WorkOrderDocumentInputSchema.parse(payload);
}
