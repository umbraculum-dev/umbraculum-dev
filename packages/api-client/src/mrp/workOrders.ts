import {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  WorkOrderPreviewResponseSchema,
  type ProductionOrderStatus,
  type WorkOrderPreviewResponse,
} from "@umbraculum/mrp-contracts";
import type { RenderVisibility } from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";
import {
  runAsyncRenderJobExport,
  submitRenderJob,
  type RenderJobPhase,
} from "../platform/rendering.js";

type MrpWorkOrderPreviewPath = "/mrp/work-orders/{orderId}/preview";
type MrpWorkOrderPreviewGet = PlatformOpenApiPaths[MrpWorkOrderPreviewPath]["get"];

export type WorkOrderRenderTemplateRef =
  | typeof MRP_WORK_ORDER_PDF_TEMPLATE_REF
  | typeof MRP_ROUTE_CARD_PDF_TEMPLATE_REF;

export type {
  MrpWorkOrderPreviewGet,
  WorkOrderPreviewResponse,
  RenderJobPhase,
  RenderVisibility,
};

export async function getWorkOrderPreview(
  client: ApiClient,
  orderId: string,
): Promise<WorkOrderPreviewResponse> {
  return getParsed(
    client,
    toClientPath(`/mrp/work-orders/${encodeURIComponent(orderId)}/preview`),
    (data) => WorkOrderPreviewResponseSchema.parse(data),
  );
}

export function workOrderRenderJobsPath(orderId: string): string {
  return toClientPath(`/mrp/work-orders/${encodeURIComponent(orderId)}/render-jobs`);
}

export function materialRequirementsRenderJobsPath(orderId: string): string {
  return toClientPath(
    `/mrp/production-orders/${encodeURIComponent(orderId)}/material-requirements/render-jobs`,
  );
}

export function productionOrdersListRenderJobsPath(): string {
  return toClientPath("/mrp/production-orders/render-jobs");
}

export async function submitWorkOrderRenderJob(
  client: ApiClient,
  orderId: string,
  body: { templateRef: WorkOrderRenderTemplateRef; visibility?: RenderVisibility },
): Promise<{ jobId: string }> {
  return submitRenderJob(client, workOrderRenderJobsPath(orderId), body);
}

export async function submitMaterialRequirementsRenderJob(
  client: ApiClient,
  orderId: string,
  body?: { visibility?: RenderVisibility },
): Promise<{ jobId: string }> {
  return submitRenderJob(client, materialRequirementsRenderJobsPath(orderId), body ?? {});
}

export async function submitProductionOrdersListRenderJob(
  client: ApiClient,
  body?: { status?: ProductionOrderStatus; visibility?: RenderVisibility },
): Promise<{ jobId: string }> {
  return submitRenderJob(client, productionOrdersListRenderJobsPath(), body ?? {});
}

function mrpRenderJobExportOpts<T extends Record<string, unknown>>(
  body: T,
  options?: { platform?: "web" | "native"; apiBaseUrl?: string },
): { body: T; platform?: "web" | "native"; apiBaseUrl?: string } {
  const exportOpts: { body: T; platform?: "web" | "native"; apiBaseUrl?: string } = { body };
  if (options?.platform !== undefined) exportOpts.platform = options.platform;
  if (options?.apiBaseUrl !== undefined) exportOpts.apiBaseUrl = options.apiBaseUrl;
  return exportOpts;
}

export async function runWorkOrderRenderJobExport(
  client: ApiClient,
  orderId: string,
  body: { templateRef: WorkOrderRenderTemplateRef; visibility?: RenderVisibility },
  options?: { platform?: "web" | "native"; apiBaseUrl?: string },
): Promise<string> {
  return runAsyncRenderJobExport(
    client,
    workOrderRenderJobsPath(orderId),
    mrpRenderJobExportOpts(body, options),
  );
}

export async function runMaterialRequirementsRenderJobExport(
  client: ApiClient,
  orderId: string,
  options?: { visibility?: RenderVisibility; platform?: "web" | "native"; apiBaseUrl?: string },
): Promise<string> {
  const body: { visibility?: RenderVisibility } = {};
  if (options?.visibility !== undefined) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    materialRequirementsRenderJobsPath(orderId),
    mrpRenderJobExportOpts(body, options),
  );
}

export async function runProductionOrdersListRenderJobExport(
  client: ApiClient,
  options?: {
    status?: ProductionOrderStatus;
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
  },
): Promise<string> {
  const body: { status?: ProductionOrderStatus; visibility?: RenderVisibility } = {};
  if (options?.status !== undefined) body.status = options.status;
  if (options?.visibility !== undefined) body.visibility = options.visibility;
  return runAsyncRenderJobExport(
    client,
    productionOrdersListRenderJobsPath(),
    mrpRenderJobExportOpts(body, options),
  );
}

export {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
};
