import {
  runAsyncRenderJobExport,
  submitRenderJob
} from "../chunk-PU7ET74O.js";
import {
  deleteParsed,
  getParsed,
  patchParsed,
  postParsed,
  toClientPath
} from "../chunk-EHQ6NO7O.js";

// src/mrp/boms.ts
import {
  BomGetResponseSchema,
  BomListResponseSchema,
  MrpDeleteResponseSchema
} from "@umbraculum/mrp-contracts";
async function listBoms(client) {
  return getParsed(client, toClientPath("/mrp/boms"), (data) => BomListResponseSchema.parse(data));
}
async function createBom(client, body) {
  return postParsed(client, toClientPath("/mrp/boms"), body, (data) => BomGetResponseSchema.parse(data));
}
async function getBom(client, bomId) {
  return getParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    (data) => BomGetResponseSchema.parse(data)
  );
}
async function patchBom(client, bomId, body) {
  return patchParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    body,
    (data) => BomGetResponseSchema.parse(data)
  );
}
async function deleteBom(client, bomId) {
  return deleteParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    (data) => MrpDeleteResponseSchema.parse(data)
  );
}

// src/mrp/productionOrders.ts
import {
  MaterialRequirementListResponseSchema,
  ProductionOrderGetResponseSchema,
  ProductionOrderListResponseSchema
} from "@umbraculum/mrp-contracts";
async function listProductionOrders(client) {
  return getParsed(
    client,
    toClientPath("/mrp/production-orders"),
    (data) => ProductionOrderListResponseSchema.parse(data)
  );
}
async function getProductionOrder(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}`),
    (data) => ProductionOrderGetResponseSchema.parse(data)
  );
}
async function listMaterialRequirements(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}/material-requirements`),
    (data) => MaterialRequirementListResponseSchema.parse(data)
  );
}

// src/mrp/workOrders.ts
import {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  WorkOrderPreviewResponseSchema
} from "@umbraculum/mrp-contracts";
async function getWorkOrderPreview(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/work-orders/${encodeURIComponent(orderId)}/preview`),
    (data) => WorkOrderPreviewResponseSchema.parse(data)
  );
}
function workOrderRenderJobsPath(orderId) {
  return toClientPath(`/mrp/work-orders/${encodeURIComponent(orderId)}/render-jobs`);
}
function materialRequirementsRenderJobsPath(orderId) {
  return toClientPath(
    `/mrp/production-orders/${encodeURIComponent(orderId)}/material-requirements/render-jobs`
  );
}
function productionOrdersListRenderJobsPath() {
  return toClientPath("/mrp/production-orders/render-jobs");
}
async function submitWorkOrderRenderJob(client, orderId, body) {
  return submitRenderJob(client, workOrderRenderJobsPath(orderId), body);
}
async function submitMaterialRequirementsRenderJob(client, orderId, body) {
  return submitRenderJob(client, materialRequirementsRenderJobsPath(orderId), body ?? {});
}
async function submitProductionOrdersListRenderJob(client, body) {
  return submitRenderJob(client, productionOrdersListRenderJobsPath(), body ?? {});
}
function mrpRenderJobExportOpts(body, options) {
  const exportOpts = { body };
  if (options?.platform !== void 0) exportOpts.platform = options.platform;
  if (options?.apiBaseUrl !== void 0) exportOpts.apiBaseUrl = options.apiBaseUrl;
  return exportOpts;
}
async function runWorkOrderRenderJobExport(client, orderId, body, options) {
  return runAsyncRenderJobExport(
    client,
    workOrderRenderJobsPath(orderId),
    mrpRenderJobExportOpts(body, options)
  );
}
async function runMaterialRequirementsRenderJobExport(client, orderId, options) {
  const body = {};
  if (options?.visibility !== void 0) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    materialRequirementsRenderJobsPath(orderId),
    mrpRenderJobExportOpts(body, options)
  );
}
async function runProductionOrdersListRenderJobExport(client, options) {
  const body = {};
  if (options?.status !== void 0) body.status = options.status;
  if (options?.visibility !== void 0) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    productionOrdersListRenderJobsPath(),
    mrpRenderJobExportOpts(body, options)
  );
}
export {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  createBom,
  deleteBom,
  getBom,
  getProductionOrder,
  getWorkOrderPreview,
  listBoms,
  listMaterialRequirements,
  listProductionOrders,
  materialRequirementsRenderJobsPath,
  patchBom,
  productionOrdersListRenderJobsPath,
  runMaterialRequirementsRenderJobExport,
  runProductionOrdersListRenderJobExport,
  runWorkOrderRenderJobExport,
  submitMaterialRequirementsRenderJob,
  submitProductionOrdersListRenderJob,
  submitWorkOrderRenderJob,
  workOrderRenderJobsPath
};
