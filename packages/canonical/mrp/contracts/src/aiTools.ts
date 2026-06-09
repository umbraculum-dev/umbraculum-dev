import { z } from "zod";

import { MaterialRequirementListResponseSchema } from "./materialRequirement.js";
import {
  ProductionOrderGetResponseSchema,
  ProductionOrderListResponseSchema,
} from "./productionOrder.js";
import { WorkOrderPreviewResponseSchema } from "./workOrder.js";
import { NonEmptyStringSchema } from "./shared.js";

export const MrpListProductionOrdersToolInputSchema = z
  .object({
    status: z.enum(["planned", "released", "in_progress", "completed", "cancelled"]).optional(),
  })
  .strict();

export const MrpGetProductionOrderToolInputSchema = z
  .object({
    productionOrderId: NonEmptyStringSchema,
  })
  .strict();

export const MrpExplainMaterialRequirementsToolInputSchema = z
  .object({
    productionOrderId: NonEmptyStringSchema,
  })
  .strict();

export const MrpSummarizeWorkOrderToolInputSchema = z
  .object({
    productionOrderId: NonEmptyStringSchema,
  })
  .strict();

export const MrpListProductionOrdersToolOutputSchema = ProductionOrderListResponseSchema;
export const MrpGetProductionOrderToolOutputSchema = ProductionOrderGetResponseSchema;
export const MrpExplainMaterialRequirementsToolOutputSchema =
  MaterialRequirementListResponseSchema;
export const MrpSummarizeWorkOrderToolOutputSchema = WorkOrderPreviewResponseSchema;

export type MrpListProductionOrdersToolInput = z.infer<
  typeof MrpListProductionOrdersToolInputSchema
>;
export type MrpGetProductionOrderToolInput = z.infer<
  typeof MrpGetProductionOrderToolInputSchema
>;
export type MrpExplainMaterialRequirementsToolInput = z.infer<
  typeof MrpExplainMaterialRequirementsToolInputSchema
>;
export type MrpSummarizeWorkOrderToolInput = z.infer<
  typeof MrpSummarizeWorkOrderToolInputSchema
>;
export type MrpListProductionOrdersToolOutput = z.infer<
  typeof MrpListProductionOrdersToolOutputSchema
>;
export type MrpGetProductionOrderToolOutput = z.infer<
  typeof MrpGetProductionOrderToolOutputSchema
>;
export type MrpExplainMaterialRequirementsToolOutput = z.infer<
  typeof MrpExplainMaterialRequirementsToolOutputSchema
>;
export type MrpSummarizeWorkOrderToolOutput = z.infer<
  typeof MrpSummarizeWorkOrderToolOutputSchema
>;
