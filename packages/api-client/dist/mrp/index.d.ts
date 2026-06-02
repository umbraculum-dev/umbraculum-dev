import { BomLine, BomGetResponse, MrpDeleteResponse, BomListResponse, ProductionOrderGetResponse, MaterialRequirementListResponse, ProductionOrderListResponse, MRP_WORK_ORDER_PDF_TEMPLATE_REF, MRP_ROUTE_CARD_PDF_TEMPLATE_REF, WorkOrderPreviewResponse, ProductionOrderStatus } from '@umbraculum/mrp-contracts';
export { Bom, BomGetResponse, BomListResponse, MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF, MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF, MRP_ROUTE_CARD_PDF_TEMPLATE_REF, MRP_WORK_ORDER_PDF_TEMPLATE_REF, MrpDeleteResponse, WorkOrderPreviewResponse } from '@umbraculum/mrp-contracts';
import { a as ApiClient } from '../client-Dia82S7S.js';
import { p as paths } from '../platform.openapi-DFK6FUu2.js';
import { RenderVisibility } from '@umbraculum/contracts';
export { RenderVisibility } from '@umbraculum/contracts';
export { R as RenderJobPhase } from '../rendering-Dsx1_oqk.js';

type MrpBomsListPath = "/mrp/boms";
type MrpBomsListGet = paths[MrpBomsListPath]["get"];
type MrpBomDetailPath = "/mrp/boms/{bomId}";
type MrpBomDetailGet = paths[MrpBomDetailPath]["get"];
type BomCreateRequest = {
    code: string;
    name: string;
    ownerModule: string | null;
    sourceRefId: string | null;
    lines: Array<Omit<BomLine, "id" | "bomId">>;
};
type BomUpdateRequest = Partial<{
    code: string;
    name: string;
    ownerModule: string | null;
    sourceRefId: string | null;
    lines: Array<Omit<BomLine, "id" | "bomId">>;
}>;

declare function listBoms(client: ApiClient): Promise<BomListResponse>;
declare function createBom(client: ApiClient, body: BomCreateRequest): Promise<BomGetResponse>;
declare function getBom(client: ApiClient, bomId: string): Promise<BomGetResponse>;
declare function patchBom(client: ApiClient, bomId: string, body: BomUpdateRequest): Promise<BomGetResponse>;
declare function deleteBom(client: ApiClient, bomId: string): Promise<MrpDeleteResponse>;

type MrpProductionOrdersListPath = "/mrp/production-orders";
type MrpProductionOrdersListGet = paths[MrpProductionOrdersListPath]["get"];
type MrpProductionOrderDetailPath = "/mrp/production-orders/{orderId}";
type MrpProductionOrderDetailGet = paths[MrpProductionOrderDetailPath]["get"];
type MrpMaterialRequirementsPath = "/mrp/production-orders/{orderId}/material-requirements";
type MrpMaterialRequirementsListGet = paths[MrpMaterialRequirementsPath]["get"];

declare function listProductionOrders(client: ApiClient): Promise<ProductionOrderListResponse>;
declare function getProductionOrder(client: ApiClient, orderId: string): Promise<ProductionOrderGetResponse>;
declare function listMaterialRequirements(client: ApiClient, orderId: string): Promise<MaterialRequirementListResponse>;

type MrpWorkOrderPreviewPath = "/mrp/work-orders/{orderId}/preview";
type MrpWorkOrderPreviewGet = paths[MrpWorkOrderPreviewPath]["get"];
type WorkOrderRenderTemplateRef = typeof MRP_WORK_ORDER_PDF_TEMPLATE_REF | typeof MRP_ROUTE_CARD_PDF_TEMPLATE_REF;

declare function getWorkOrderPreview(client: ApiClient, orderId: string): Promise<WorkOrderPreviewResponse>;
declare function workOrderRenderJobsPath(orderId: string): string;
declare function materialRequirementsRenderJobsPath(orderId: string): string;
declare function productionOrdersListRenderJobsPath(): string;
declare function submitWorkOrderRenderJob(client: ApiClient, orderId: string, body: {
    templateRef: WorkOrderRenderTemplateRef;
    visibility?: RenderVisibility;
}): Promise<{
    jobId: string;
}>;
declare function submitMaterialRequirementsRenderJob(client: ApiClient, orderId: string, body?: {
    visibility?: RenderVisibility;
}): Promise<{
    jobId: string;
}>;
declare function submitProductionOrdersListRenderJob(client: ApiClient, body?: {
    status?: ProductionOrderStatus;
    visibility?: RenderVisibility;
}): Promise<{
    jobId: string;
}>;
declare function runWorkOrderRenderJobExport(client: ApiClient, orderId: string, body: {
    templateRef: WorkOrderRenderTemplateRef;
    visibility?: RenderVisibility;
}, options?: {
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;
declare function runMaterialRequirementsRenderJobExport(client: ApiClient, orderId: string, options?: {
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;
declare function runProductionOrdersListRenderJobExport(client: ApiClient, options?: {
    status?: ProductionOrderStatus;
    visibility?: RenderVisibility;
    platform?: "web" | "native";
    apiBaseUrl?: string;
}): Promise<string>;

export { type BomCreateRequest, type BomUpdateRequest, type MrpBomDetailGet, type MrpBomsListGet, type MrpMaterialRequirementsListGet, type MrpProductionOrderDetailGet, type MrpProductionOrdersListGet, type MrpWorkOrderPreviewGet, type WorkOrderRenderTemplateRef, createBom, deleteBom, getBom, getProductionOrder, getWorkOrderPreview, listBoms, listMaterialRequirements, listProductionOrders, materialRequirementsRenderJobsPath, patchBom, productionOrdersListRenderJobsPath, runMaterialRequirementsRenderJobExport, runProductionOrdersListRenderJobExport, runWorkOrderRenderJobExport, submitMaterialRequirementsRenderJob, submitProductionOrdersListRenderJob, submitWorkOrderRenderJob, workOrderRenderJobsPath };
