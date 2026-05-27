"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BomGetResponseSchema: () => BomGetResponseSchema,
  BomLineSchema: () => BomLineSchema,
  BomListResponseSchema: () => BomListResponseSchema,
  BomRefSchema: () => BomRefSchema,
  BomSchema: () => BomSchema,
  CONTRACT_VERSION: () => CONTRACT_VERSION,
  IsoDateTimeStringSchema: () => IsoDateTimeStringSchema,
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF: () => MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF: () => MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF: () => MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF: () => MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  MaterialRequirementListResponseSchema: () => MaterialRequirementListResponseSchema,
  MaterialRequirementSchema: () => MaterialRequirementSchema,
  MaterialRequirementStatusSchema: () => MaterialRequirementStatusSchema,
  MrpDeleteResponseSchema: () => MrpDeleteResponseSchema,
  MrpExplainMaterialRequirementsToolInputSchema: () => MrpExplainMaterialRequirementsToolInputSchema,
  MrpExplainMaterialRequirementsToolOutputSchema: () => MrpExplainMaterialRequirementsToolOutputSchema,
  MrpGetProductionOrderToolInputSchema: () => MrpGetProductionOrderToolInputSchema,
  MrpGetProductionOrderToolOutputSchema: () => MrpGetProductionOrderToolOutputSchema,
  MrpListProductionOrdersToolInputSchema: () => MrpListProductionOrdersToolInputSchema,
  MrpListProductionOrdersToolOutputSchema: () => MrpListProductionOrdersToolOutputSchema,
  MrpMaterialRequirementsXlsxInputSchema: () => MrpMaterialRequirementsXlsxInputSchema,
  MrpProductionOrderCsvInputSchema: () => MrpProductionOrderCsvInputSchema,
  MrpRouteCardPdfInputSchema: () => MrpRouteCardPdfInputSchema,
  MrpSummarizeWorkOrderToolInputSchema: () => MrpSummarizeWorkOrderToolInputSchema,
  MrpSummarizeWorkOrderToolOutputSchema: () => MrpSummarizeWorkOrderToolOutputSchema,
  MrpWorkOrderPdfInputSchema: () => MrpWorkOrderPdfInputSchema,
  NonEmptyStringSchema: () => NonEmptyStringSchema,
  OperationSchema: () => OperationSchema,
  OperationTemplateSchema: () => OperationTemplateSchema,
  ProductionOrderGetResponseSchema: () => ProductionOrderGetResponseSchema,
  ProductionOrderLineSchema: () => ProductionOrderLineSchema,
  ProductionOrderListResponseSchema: () => ProductionOrderListResponseSchema,
  ProductionOrderRefSchema: () => ProductionOrderRefSchema,
  ProductionOrderSchema: () => ProductionOrderSchema,
  ProductionOrderStatusSchema: () => ProductionOrderStatusSchema,
  QuantitySchema: () => QuantitySchema,
  ScheduleableOperationSchema: () => ScheduleableOperationSchema,
  UnitCodeSchema: () => UnitCodeSchema,
  WorkOrderDocumentInputSchema: () => WorkOrderDocumentInputSchema,
  WorkOrderPreviewResponseSchema: () => WorkOrderPreviewResponseSchema,
  WorkOrderPreviewSchema: () => WorkOrderPreviewSchema,
  classifyContractVersionSkew: () => classifyContractVersionSkew,
  parseBom: () => parseBom,
  parseBomGetResponse: () => parseBomGetResponse,
  parseBomListResponse: () => parseBomListResponse,
  parseMaterialRequirement: () => parseMaterialRequirement,
  parseMaterialRequirementListResponse: () => parseMaterialRequirementListResponse,
  parseMrpDeleteResponse: () => parseMrpDeleteResponse,
  parseOperation: () => parseOperation,
  parseProductionOrder: () => parseProductionOrder,
  parseProductionOrderGetResponse: () => parseProductionOrderGetResponse,
  parseProductionOrderListResponse: () => parseProductionOrderListResponse,
  parseScheduleableOperation: () => parseScheduleableOperation,
  parseSemVer: () => parseSemVer,
  parseWorkOrderDocumentInput: () => parseWorkOrderDocumentInput,
  parseWorkOrderPreview: () => parseWorkOrderPreview,
  parseWorkOrderPreviewResponse: () => parseWorkOrderPreviewResponse
});
module.exports = __toCommonJS(index_exports);

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
var import_zod = require("zod");
var IsoDateTimeStringSchema = import_zod.z.string().min(1, "timestamp required").refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");
var NonEmptyStringSchema = import_zod.z.string().min(1);
var QuantitySchema = import_zod.z.number().finite().positive();
var UnitCodeSchema = import_zod.z.string().min(1, "unit required");
var MrpDeleteResponseSchema = import_zod.z.object({
  ok: import_zod.z.literal(true)
});
function parseMrpDeleteResponse(payload) {
  return MrpDeleteResponseSchema.parse(payload);
}

// src/bom.ts
var import_zod2 = require("zod");
var BomLineSchema = import_zod2.z.object({
  id: NonEmptyStringSchema,
  bomId: NonEmptyStringSchema,
  lineNumber: import_zod2.z.number().int().positive(),
  materialRefModule: import_zod2.z.string().min(1).nullable(),
  materialRefId: import_zod2.z.string().min(1).nullable(),
  description: NonEmptyStringSchema,
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  lossPercent: import_zod2.z.number().finite().min(0).max(100).nullable()
});
var BomSchema = import_zod2.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  ownerModule: import_zod2.z.string().min(1).nullable(),
  sourceRefId: import_zod2.z.string().min(1).nullable(),
  lines: import_zod2.z.array(BomLineSchema)
});
var BomRefSchema = import_zod2.z.object({
  bomId: NonEmptyStringSchema
});
var BomListResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  items: import_zod2.z.array(BomSchema)
});
var BomGetResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
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
var import_zod3 = require("zod");
var MaterialRequirementStatusSchema = import_zod3.z.enum([
  "planned",
  "available_assumed",
  "shortage_assumed",
  "reserved"
]);
var MaterialRequirementSchema = import_zod3.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  bomLineId: import_zod3.z.string().min(1).nullable(),
  materialRefModule: import_zod3.z.string().min(1).nullable(),
  materialRefId: import_zod3.z.string().min(1).nullable(),
  description: NonEmptyStringSchema,
  requiredQuantity: QuantitySchema,
  unit: UnitCodeSchema,
  availabilityStatus: MaterialRequirementStatusSchema,
  availabilityNote: import_zod3.z.string().min(1).nullable()
});
var MaterialRequirementListResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  items: import_zod3.z.array(MaterialRequirementSchema)
});
function parseMaterialRequirement(payload) {
  return MaterialRequirementSchema.parse(payload);
}
function parseMaterialRequirementListResponse(payload) {
  return MaterialRequirementListResponseSchema.parse(payload);
}

// src/operation.ts
var import_zod4 = require("zod");
var OperationTemplateSchema = import_zod4.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  requiredResourceKind: import_zod4.z.string().min(1).nullable(),
  defaultDurationMinutes: import_zod4.z.number().int().positive().nullable(),
  sourceModule: import_zod4.z.string().min(1).nullable(),
  sourceRefId: import_zod4.z.string().min(1).nullable()
});
var OperationSchema = import_zod4.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  sequence: import_zod4.z.number().int().positive(),
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  requiredResourceKind: import_zod4.z.string().min(1).nullable(),
  plannedDurationMinutes: import_zod4.z.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable()
});
var ScheduleableOperationSchema = import_zod4.z.object({
  productionOrderId: NonEmptyStringSchema,
  operationId: NonEmptyStringSchema,
  operationCode: NonEmptyStringSchema,
  requiredResourceKind: import_zod4.z.string().min(1).nullable(),
  plannedDurationMinutes: import_zod4.z.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  sourceModule: import_zod4.z.string().min(1).nullable(),
  sourceRefId: import_zod4.z.string().min(1).nullable()
});
function parseOperation(payload) {
  return OperationSchema.parse(payload);
}
function parseScheduleableOperation(payload) {
  return ScheduleableOperationSchema.parse(payload);
}

// src/productionOrder.ts
var import_zod5 = require("zod");
var ProductionOrderStatusSchema = import_zod5.z.enum([
  "planned",
  "released",
  "in_progress",
  "completed",
  "cancelled"
]);
var ProductionOrderLineSchema = import_zod5.z.object({
  id: NonEmptyStringSchema,
  productionOrderId: NonEmptyStringSchema,
  lineNumber: import_zod5.z.number().int().positive(),
  outputProductId: import_zod5.z.string().min(1).nullable(),
  outputVariantId: import_zod5.z.string().min(1).nullable(),
  description: import_zod5.z.string().min(1).nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema
});
var ProductionOrderSchema = import_zod5.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  orderNumber: NonEmptyStringSchema,
  status: ProductionOrderStatusSchema,
  sourceModule: import_zod5.z.string().min(1).nullable(),
  sourceRefId: import_zod5.z.string().min(1).nullable(),
  outputProductId: import_zod5.z.string().min(1).nullable(),
  outputVariantId: import_zod5.z.string().min(1).nullable(),
  quantity: QuantitySchema,
  unit: UnitCodeSchema,
  plannedStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
  lines: import_zod5.z.array(ProductionOrderLineSchema)
});
var ProductionOrderRefSchema = import_zod5.z.object({
  productionOrderId: NonEmptyStringSchema
});
var ProductionOrderListResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  items: import_zod5.z.array(ProductionOrderSchema)
});
var ProductionOrderGetResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  item: ProductionOrderSchema.extend({
    operations: import_zod5.z.array(OperationSchema),
    materialRequirements: import_zod5.z.array(MaterialRequirementSchema)
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
var import_zod6 = require("zod");
var WorkOrderPreviewSchema = import_zod6.z.object({
  productionOrder: ProductionOrderSchema,
  operations: import_zod6.z.array(OperationSchema),
  materialRequirements: import_zod6.z.array(MaterialRequirementSchema),
  operatorNotes: import_zod6.z.array(import_zod6.z.string().min(1))
});
var WorkOrderPreviewResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  item: WorkOrderPreviewSchema
});
var WorkOrderDocumentInputSchema = import_zod6.z.object({
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
var import_zod7 = require("zod");
var MrpListProductionOrdersToolInputSchema = import_zod7.z.object({
  status: import_zod7.z.enum(["planned", "released", "in_progress", "completed", "cancelled"]).optional()
}).strict();
var MrpGetProductionOrderToolInputSchema = import_zod7.z.object({
  productionOrderId: NonEmptyStringSchema
}).strict();
var MrpExplainMaterialRequirementsToolInputSchema = import_zod7.z.object({
  productionOrderId: NonEmptyStringSchema
}).strict();
var MrpSummarizeWorkOrderToolInputSchema = import_zod7.z.object({
  productionOrderId: NonEmptyStringSchema
}).strict();
var MrpListProductionOrdersToolOutputSchema = ProductionOrderListResponseSchema;
var MrpGetProductionOrderToolOutputSchema = ProductionOrderGetResponseSchema;
var MrpExplainMaterialRequirementsToolOutputSchema = MaterialRequirementListResponseSchema;
var MrpSummarizeWorkOrderToolOutputSchema = WorkOrderPreviewResponseSchema;

// src/documentTemplates.ts
var import_zod8 = require("zod");
var MRP_WORK_ORDER_PDF_TEMPLATE_REF = "mrp:work-order-pdf@v1";
var MRP_ROUTE_CARD_PDF_TEMPLATE_REF = "mrp:route-card-pdf@v1";
var MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF = "mrp:material-requirements-xlsx@v1";
var MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF = "mrp:production-order-csv@v1";
var MrpWorkOrderPdfInputSchema = WorkOrderDocumentInputSchema;
var MrpRouteCardPdfInputSchema = import_zod8.z.object({
  workspaceId: NonEmptyStringSchema,
  productionOrder: ProductionOrderSchema,
  operations: import_zod8.z.array(OperationSchema)
});
var MrpMaterialRequirementsXlsxInputSchema = import_zod8.z.object({
  workspaceId: NonEmptyStringSchema,
  productionOrder: ProductionOrderSchema,
  materialRequirements: import_zod8.z.array(MaterialRequirementSchema)
});
var MrpProductionOrderCsvInputSchema = import_zod8.z.object({
  workspaceId: NonEmptyStringSchema,
  productionOrders: import_zod8.z.array(ProductionOrderSchema)
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
