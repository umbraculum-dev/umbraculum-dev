import {
  MaterialRequirementListResponseSchema,
  ProductionOrderGetResponseSchema,
  ProductionOrderListResponseSchema,
  type MaterialRequirementListResponse,
  type ProductionOrderGetResponse,
  type ProductionOrderListResponse,
} from "@umbraculum/mrp-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type MrpProductionOrdersListPath = "/mrp/production-orders";
type MrpProductionOrdersListGet = PlatformOpenApiPaths[MrpProductionOrdersListPath]["get"];

type MrpProductionOrderDetailPath = "/mrp/production-orders/{orderId}";
type MrpProductionOrderDetailGet = PlatformOpenApiPaths[MrpProductionOrderDetailPath]["get"];

type MrpMaterialRequirementsPath = "/mrp/production-orders/{orderId}/material-requirements";
type MrpMaterialRequirementsListGet = PlatformOpenApiPaths[MrpMaterialRequirementsPath]["get"];

export type {
  MrpProductionOrdersListGet,
  MrpProductionOrderDetailGet,
  MrpMaterialRequirementsListGet,
};

export async function listProductionOrders(client: ApiClient): Promise<ProductionOrderListResponse> {
  return getParsed(client, toClientPath("/mrp/production-orders"), (data) =>
    ProductionOrderListResponseSchema.parse(data),
  );
}

export async function getProductionOrder(
  client: ApiClient,
  orderId: string,
): Promise<ProductionOrderGetResponse> {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}`),
    (data) => ProductionOrderGetResponseSchema.parse(data),
  );
}

export async function listMaterialRequirements(
  client: ApiClient,
  orderId: string,
): Promise<MaterialRequirementListResponse> {
  return getParsed(
    client,
    toClientPath(`/mrp/production-orders/${encodeURIComponent(orderId)}/material-requirements`),
    (data) => MaterialRequirementListResponseSchema.parse(data),
  );
}
