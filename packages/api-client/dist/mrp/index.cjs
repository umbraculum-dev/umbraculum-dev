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

// src/mrp/index.ts
var mrp_exports = {};
__export(mrp_exports, {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF: () => import_mrp_contracts3.MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF: () => import_mrp_contracts3.MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF: () => import_mrp_contracts3.MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF: () => import_mrp_contracts3.MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  createBom: () => createBom,
  deleteBom: () => deleteBom,
  getBom: () => getBom,
  getProductionOrder: () => getProductionOrder,
  getWorkOrderPreview: () => getWorkOrderPreview,
  listBoms: () => listBoms,
  listMaterialRequirements: () => listMaterialRequirements,
  listProductionOrders: () => listProductionOrders,
  materialRequirementsRenderJobsPath: () => materialRequirementsRenderJobsPath,
  patchBom: () => patchBom,
  productionOrdersListRenderJobsPath: () => productionOrdersListRenderJobsPath,
  runMaterialRequirementsRenderJobExport: () => runMaterialRequirementsRenderJobExport,
  runProductionOrdersListRenderJobExport: () => runProductionOrdersListRenderJobExport,
  runWorkOrderRenderJobExport: () => runWorkOrderRenderJobExport,
  submitMaterialRequirementsRenderJob: () => submitMaterialRequirementsRenderJob,
  submitProductionOrdersListRenderJob: () => submitProductionOrdersListRenderJob,
  submitWorkOrderRenderJob: () => submitWorkOrderRenderJob,
  workOrderRenderJobsPath: () => workOrderRenderJobsPath
});
module.exports = __toCommonJS(mrp_exports);

// src/mrp/boms.ts
var import_mrp_contracts = require("@umbraculum/mrp-contracts");

// src/internal/clientPath.ts
function toClientPath(openApiPath) {
  return `/api${openApiPath}`;
}

// src/errors.ts
var ApiClientError = class extends Error {
  status;
  body;
  constructor(res) {
    const detail = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    super(detail || `API request failed (${res.status})`);
    this.name = "ApiClientError";
    this.status = res.status;
    this.body = res.data;
  }
};

// src/internal/httpJson.ts
function assertOk(res, expectedStatus = 200) {
  if (res.status !== expectedStatus || !res.ok) {
    throw new ApiClientError(res);
  }
}
async function getParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.get(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function postParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.post(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function patchParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.patch(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function deleteParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.delete(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

// src/mrp/boms.ts
async function listBoms(client) {
  return getParsed(client, toClientPath("/mrp/boms"), (data) => import_mrp_contracts.BomListResponseSchema.parse(data));
}
async function createBom(client, body) {
  return postParsed(client, toClientPath("/mrp/boms"), body, (data) => import_mrp_contracts.BomGetResponseSchema.parse(data));
}
async function getBom(client, bomId) {
  return getParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    (data) => import_mrp_contracts.BomGetResponseSchema.parse(data)
  );
}
async function patchBom(client, bomId, body) {
  return patchParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    body,
    (data) => import_mrp_contracts.BomGetResponseSchema.parse(data)
  );
}
async function deleteBom(client, bomId) {
  return deleteParsed(
    client,
    toClientPath(`/mrp/boms/${encodeURIComponent(bomId)}`),
    (data) => import_mrp_contracts.MrpDeleteResponseSchema.parse(data)
  );
}

// src/mrp/productionOrders.ts
var import_mrp_contracts2 = require("@umbraculum/mrp-contracts");
async function listProductionOrders(client) {
  return getParsed(
    client,
    toClientPath("/mrp/production-orders"),
    (data) => import_mrp_contracts2.ProductionOrderListResponseSchema.parse(data)
  );
}
async function getProductionOrder(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}`),
    (data) => import_mrp_contracts2.ProductionOrderGetResponseSchema.parse(data)
  );
}
async function listMaterialRequirements(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}/material-requirements`),
    (data) => import_mrp_contracts2.MaterialRequirementListResponseSchema.parse(data)
  );
}

// src/mrp/workOrders.ts
var import_mrp_contracts3 = require("@umbraculum/mrp-contracts");

// src/platform/rendering.ts
var import_contracts = require("@umbraculum/contracts");
var POLL_INTERVAL_MS = 50;
var POLL_TIMEOUT_MS = 15e3;
function toWebArtifactUrl(signedUrl, apiBaseUrl) {
  if (signedUrl.startsWith("/api/")) return signedUrl;
  if (signedUrl.startsWith("/rendering/")) return `/api${signedUrl}`;
  if (signedUrl.startsWith("/") && apiBaseUrl) {
    const base = apiBaseUrl.replace(/\/+$/, "");
    return `${base}${signedUrl.startsWith("/api") ? signedUrl : `/api${signedUrl}`}`;
  }
  return signedUrl;
}
function resolveArtifactDownloadUrl(signedUrl, options) {
  if (options?.platform === "web") {
    return toWebArtifactUrl(signedUrl);
  }
  if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
    return signedUrl;
  }
  const base = options?.apiBaseUrl?.replace(/\/+$/, "") ?? "";
  if (!base) return signedUrl;
  if (signedUrl.startsWith("/api/")) return `${base}${signedUrl.slice(4)}`;
  if (signedUrl.startsWith("/")) return `${base}${signedUrl}`;
  return signedUrl;
}
async function submitRenderJob(client, postUrl, body) {
  const res = await client.post(postUrl, body ?? {});
  assertOk(res, 202);
  const parsed = import_contracts.RenderJobSubmitResponseSchema.parse(res.data);
  return { jobId: parsed.job.id };
}
async function pollRenderJobUntilSucceeded(client, jobId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStatus = "";
  const statusPath = `/api/rendering/jobs/${encodeURIComponent(jobId)}`;
  while (Date.now() < deadline) {
    const res = await client.get(statusPath);
    assertOk(res, 200);
    const body = import_contracts.RenderJobStatusResponseSchema.parse(res.data);
    lastStatus = body.job.status;
    if (body.job.status === "succeeded") return;
    if (body.job.status === "failed") {
      throw new Error(body.job.error?.code ?? "render_job_failed");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`Render job timed out (last status=${lastStatus})`);
}
async function fetchRenderJobDownloadUrl(client, jobId, options) {
  const res = await client.get(`/api/rendering/jobs/${encodeURIComponent(jobId)}/result`);
  assertOk(res, 200);
  const body = import_contracts.RenderJobResultResponseSchema.parse(res.data);
  return resolveArtifactDownloadUrl(body.signedUrl, options);
}
async function runAsyncRenderJobExport(client, postUrl, options) {
  const { jobId } = await submitRenderJob(client, postUrl, options?.body);
  await pollRenderJobUntilSucceeded(client, jobId);
  const downloadOpts = {};
  if (options?.platform !== void 0) downloadOpts.platform = options.platform;
  if (options?.apiBaseUrl !== void 0) downloadOpts.apiBaseUrl = options.apiBaseUrl;
  return fetchRenderJobDownloadUrl(client, jobId, downloadOpts);
}

// src/mrp/workOrders.ts
async function getWorkOrderPreview(client, orderId) {
  return getParsed(
    client,
    toClientPath(`/mrp/work-orders/${encodeURIComponent(orderId)}/preview`),
    (data) => import_mrp_contracts3.WorkOrderPreviewResponseSchema.parse(data)
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
