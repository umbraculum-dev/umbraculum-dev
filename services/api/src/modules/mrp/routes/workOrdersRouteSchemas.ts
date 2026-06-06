import { z } from "zod";
import {
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  ProductionOrderStatusSchema,
} from "@umbraculum/mrp-contracts";
import { RenderVisibilitySchema } from "@umbraculum/contracts";

export const ProductionOrderIdParamsSchema = z.object({
  orderId: z.string().min(1, "orderId required"),
});

export const WorkOrderRenderJobBodySchema = z
  .object({
    templateRef: z.enum([MRP_WORK_ORDER_PDF_TEMPLATE_REF, MRP_ROUTE_CARD_PDF_TEMPLATE_REF]),
    visibility: RenderVisibilitySchema.optional(),
  })
  .strict();

export const MaterialRequirementsRenderJobBodySchema = z
  .object({
    visibility: RenderVisibilitySchema.optional(),
  })
  .strict();

export const ProductionOrderListRenderJobBodySchema = z
  .object({
    status: ProductionOrderStatusSchema.optional(),
    visibility: RenderVisibilitySchema.optional(),
  })
  .strict();
