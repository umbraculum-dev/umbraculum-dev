import { z } from "zod";

import { MaterialRequirementSchema } from "./materialRequirement.js";
import { OperationSchema } from "./operation.js";
import { ProductionOrderSchema } from "./productionOrder.js";
import { WorkOrderDocumentInputSchema } from "./workOrder.js";
import { NonEmptyStringSchema } from "./shared.js";

export const MRP_WORK_ORDER_PDF_TEMPLATE_REF = "mrp:work-order-pdf@v1";
export const MRP_ROUTE_CARD_PDF_TEMPLATE_REF = "mrp:route-card-pdf@v1";
export const MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF = "mrp:material-requirements-xlsx@v1";
export const MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF = "mrp:production-order-csv@v1";

export const MrpWorkOrderPdfInputSchema = WorkOrderDocumentInputSchema;

export const MrpRouteCardPdfInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  productionOrder: ProductionOrderSchema,
  operations: z.array(OperationSchema),
});

export const MrpMaterialRequirementsXlsxInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  productionOrder: ProductionOrderSchema,
  materialRequirements: z.array(MaterialRequirementSchema),
});

export const MrpProductionOrderCsvInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  productionOrders: z.array(ProductionOrderSchema),
});

export type MrpWorkOrderPdfInput = z.infer<typeof MrpWorkOrderPdfInputSchema>;
export type MrpRouteCardPdfInput = z.infer<typeof MrpRouteCardPdfInputSchema>;
export type MrpMaterialRequirementsXlsxInput = z.infer<
  typeof MrpMaterialRequirementsXlsxInputSchema
>;
export type MrpProductionOrderCsvInput = z.infer<typeof MrpProductionOrderCsvInputSchema>;
