// src/version.ts
var CONTRACT_VERSION = "0.1.0-alpha.1";
function parseSemVer(input) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(input);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    return null;
  }
  const prerelease = match[4];
  if (prerelease === void 0) {
    return { major, minor, patch };
  }
  return { major, minor, patch, prerelease };
}
function classifyContractVersionSkew(runtime, expected = CONTRACT_VERSION) {
  const r = parseSemVer(runtime);
  const e = parseSemVer(expected);
  if (!r || !e) return "unparseable";
  if (r.major !== e.major) return "major";
  if (r.minor !== e.minor) return "minor";
  if (r.patch !== e.patch) return "patch";
  return "match";
}

// src/shared.ts
import { z } from "zod";
var IsoDateTimeStringSchema = z.string().min(1, "timestamp required").refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");
var NonEmptyStringSchema = z.string().min(1);
var QuantitySchema = z.number().finite().positive();
var UnitCodeSchema = z.string().min(1, "unit required");
var MrpDeleteResponseSchema = z.object({
  ok: z.literal(true)
});
function parseMrpDeleteResponse(payload) {
  return MrpDeleteResponseSchema.parse(payload);
}

// src/bom.ts
import { z as z2 } from "zod";
var BomLineSchema = z2.object({
  id: NonEmptyStringSchema,
  bomId: NonEmptyStringSchema,
  lineNumber: z2.number().int().positive(),
  materialRefModule: z2.string().min(1).nullable(),
  materialRefId: z2.string().min(1).nullable(),
  description: NonEmptyStringSchema,
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  lossPercent: z2.number().finite().min(0).max(100).nullable()
});
var BomSchema = z2.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  ownerModule: z2.string().min(1).nullable(),
  sourceRefId: z2.string().min(1).nullable(),
  lines: z2.array(BomLineSchema)
});
var BomRefSchema = z2.object({
  bomId: NonEmptyStringSchema
});
var BomListResponseSchema = z2.object({
  ok: z2.literal(true),
  items: z2.array(BomSchema)
});
var BomGetResponseSchema = z2.object({
  ok: z2.literal(true),
  item: BomSchema
});
function parseBom(payload) {
  return BomSchema.parse(payload);
}
function parseBomListResponse(payload) {
  return BomListResponseSchema.parse(payload);
}
function parseBomGetResponse(payload) {
  return BomGetResponseSchema.parse(payload);
}

// src/materialRequirement.ts
import { z as z3 } from "zod";
var MaterialRequirementStatusSchema = z3.enum([
  "planned",
  "available_assumed",
  "shortage_assumed",
  "reserved"
]);
var MaterialRequirementSchema = z3.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  bomLineId: z3.string().min(1).nullable(),
  materialRefModule: z3.string().min(1).nullable(),
  materialRefId: z3.string().min(1).nullable(),
  description: NonEmptyStringSchema,
  requiredQuantity: QuantitySchema,
  unit: UnitCodeSchema,
  availabilityStatus: MaterialRequirementStatusSchema,
  availabilityNote: z3.string().min(1).nullable()
});
var MaterialRequirementListResponseSchema = z3.object({
  ok: z3.literal(true),
  items: z3.array(MaterialRequirementSchema)
});
function parseMaterialRequirement(payload) {
  return MaterialRequirementSchema.parse(payload);
}
function parseMaterialRequirementListResponse(payload) {
  return MaterialRequirementListResponseSchema.parse(payload);
}

// src/operation.ts
import { z as z4 } from "zod";
var OperationTemplateSchema = z4.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  requiredResourceKind: z4.string().min(1).nullable(),
  defaultDurationMinutes: z4.number().int().positive().nullable(),
  sourceModule: z4.string().min(1).nullable(),
  sourceRefId: z4.string().min(1).nullable()
});
var OperationSchema = z4.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  sequence: z4.number().int().positive(),
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  requiredResourceKind: z4.string().min(1).nullable(),
  plannedDurationMinutes: z4.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable()
});
var ScheduleableOperationSchema = z4.object({
  productionOrderId: NonEmptyStringSchema,
  operationId: NonEmptyStringSchema,
  operationCode: NonEmptyStringSchema,
  requiredResourceKind: z4.string().min(1).nullable(),
  plannedDurationMinutes: z4.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  sourceModule: z4.string().min(1).nullable(),
  sourceRefId: z4.string().min(1).nullable()
});
function parseOperation(payload) {
  return OperationSchema.parse(payload);
}
function parseScheduleableOperation(payload) {
  return ScheduleableOperationSchema.parse(payload);
}

// src/productionOrder.ts
import { z as z5 } from "zod";
var ProductionOrderStatusSchema = z5.enum([
  "planned",
  "released",
  "in_progress",
  "completed",
  "cancelled"
]);
var ProductionOrderLineSchema = z5.object({
  id: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  lineNumber: z5.number().int().positive(),
  outputProductId: z5.string().min(1).nullable(),
  outputVariantId: z5.string().min(1).nullable(),
  description: z5.string().min(1).nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema
});
var ProductionOrderSchema = z5.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  orderNumber: NonEmptyStringSchema,
  status: ProductionOrderStatusSchema,
  sourceModule: z5.string().min(1).nullable(),
  sourceRefId: z5.string().min(1).nullable(),
  outputProductId: z5.string().min(1).nullable(),
  outputVariantId: z5.string().min(1).nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  plannedStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
  lines: z5.array(ProductionOrderLineSchema)
});
var ProductionOrderRefSchema = z5.object({
  productionOrderId: NonEmptyStringSchema
});
var ProductionOrderListResponseSchema = z5.object({
  ok: z5.literal(true),
  items: z5.array(ProductionOrderSchema)
});
var ProductionOrderGetResponseSchema = z5.object({
  ok: z5.literal(true),
  item: ProductionOrderSchema.extend({
    operations: z5.array(OperationSchema),
    materialRequirements: z5.array(MaterialRequirementSchema)
  })
});
function parseProductionOrder(payload) {
  return ProductionOrderSchema.parse(payload);
}
function parseProductionOrderListResponse(payload) {
  return ProductionOrderListResponseSchema.parse(payload);
}
function parseProductionOrderGetResponse(payload) {
  return ProductionOrderGetResponseSchema.parse(payload);
}

// src/workOrder.ts
import { z as z6 } from "zod";
var WorkOrderPreviewSchema = z6.object({
  productionOrder: ProductionOrderSchema,
  operations: z6.array(OperationSchema),
  materialRequirements: z6.array(MaterialRequirementSchema),
  operatorNotes: z6.array(z6.string().min(1))
});
var WorkOrderPreviewResponseSchema = z6.object({
  ok: z6.literal(true),
  item: WorkOrderPreviewSchema
});
var WorkOrderDocumentInputSchema = z6.object({
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  preview: WorkOrderPreviewSchema
});
function parseWorkOrderPreview(payload) {
  return WorkOrderPreviewSchema.parse(payload);
}
function parseWorkOrderPreviewResponse(payload) {
  return WorkOrderPreviewResponseSchema.parse(payload);
}
function parseWorkOrderDocumentInput(payload) {
  return WorkOrderDocumentInputSchema.parse(payload);
}

// src/aiTools.ts
import { z as z7 } from "zod";
var MrpListProductionOrdersToolInputSchema = z7.object({
  status: z7.enum(["planned", "released", "in_progress", "completed", "cancelled"]).optional()
}).strict();
var MrpGetProductionOrderToolInputSchema = z7.object({
  productionOrderId: NonEmptyStringSchema
}).strict();
var MrpExplainMaterialRequirementsToolInputSchema = z7.object({
  productionOrderId: NonEmptyStringSchema
}).strict();
var MrpSummarizeWorkOrderToolInputSchema = z7.object({
  productionOrderId: NonEmptyStringSchema
}).strict();
var MrpListProductionOrdersToolOutputSchema = ProductionOrderListResponseSchema;
var MrpGetProductionOrderToolOutputSchema = ProductionOrderGetResponseSchema;
var MrpExplainMaterialRequirementsToolOutputSchema = MaterialRequirementListResponseSchema;
var MrpSummarizeWorkOrderToolOutputSchema = WorkOrderPreviewResponseSchema;

// src/documentTemplates.ts
import { z as z8 } from "zod";
var MRP_WORK_ORDER_PDF_TEMPLATE_REF = "mrp:work-order-pdf@v1";
var MRP_ROUTE_CARD_PDF_TEMPLATE_REF = "mrp:route-card-pdf@v1";
var MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF = "mrp:material-requirements-xlsx@v1";
var MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF = "mrp:production-order-csv@v1";
var MrpWorkOrderPdfInputSchema = WorkOrderDocumentInputSchema;
var MrpRouteCardPdfInputSchema = z8.object({
  workspaceId: NonEmptyStringSchema,
  productionOrder: ProductionOrderSchema,
  operations: z8.array(OperationSchema)
});
var MrpMaterialRequirementsXlsxInputSchema = z8.object({
  workspaceId: NonEmptyStringSchema,
  productionOrder: ProductionOrderSchema,
  materialRequirements: z8.array(MaterialRequirementSchema)
});
var MrpProductionOrderCsvInputSchema = z8.object({
  workspaceId: NonEmptyStringSchema,
  productionOrders: z8.array(ProductionOrderSchema)
});
export {
  BomGetResponseSchema,
  BomLineSchema,
  BomListResponseSchema,
  BomRefSchema,
  BomSchema,
  CONTRACT_VERSION,
  IsoDateTimeStringSchema,
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  MaterialRequirementListResponseSchema,
  MaterialRequirementSchema,
  MaterialRequirementStatusSchema,
  MrpDeleteResponseSchema,
  MrpExplainMaterialRequirementsToolInputSchema,
  MrpExplainMaterialRequirementsToolOutputSchema,
  MrpGetProductionOrderToolInputSchema,
  MrpGetProductionOrderToolOutputSchema,
  MrpListProductionOrdersToolInputSchema,
  MrpListProductionOrdersToolOutputSchema,
  MrpMaterialRequirementsXlsxInputSchema,
  MrpProductionOrderCsvInputSchema,
  MrpRouteCardPdfInputSchema,
  MrpSummarizeWorkOrderToolInputSchema,
  MrpSummarizeWorkOrderToolOutputSchema,
  MrpWorkOrderPdfInputSchema,
  NonEmptyStringSchema,
  OperationSchema,
  OperationTemplateSchema,
  ProductionOrderGetResponseSchema,
  ProductionOrderLineSchema,
  ProductionOrderListResponseSchema,
  ProductionOrderRefSchema,
  ProductionOrderSchema,
  ProductionOrderStatusSchema,
  QuantitySchema,
  ScheduleableOperationSchema,
  UnitCodeSchema,
  WorkOrderDocumentInputSchema,
  WorkOrderPreviewResponseSchema,
  WorkOrderPreviewSchema,
  classifyContractVersionSkew,
  parseBom,
  parseBomGetResponse,
  parseBomListResponse,
  parseMaterialRequirement,
  parseMaterialRequirementListResponse,
  parseMrpDeleteResponse,
  parseOperation,
  parseProductionOrder,
  parseProductionOrderGetResponse,
  parseProductionOrderListResponse,
  parseScheduleableOperation,
  parseSemVer,
  parseWorkOrderDocumentInput,
  parseWorkOrderPreview,
  parseWorkOrderPreviewResponse
};
