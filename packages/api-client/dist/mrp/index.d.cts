import { ProductionOrderGetResponse, MaterialRequirementListResponse, ProductionOrderListResponse } from '@umbraculum/mrp-contracts';
import { a as ApiClient } from '../client-Dia82S7S.cjs';
import { p as paths } from '../platform.openapi-DFK6FUu2.cjs';

type MrpProductionOrdersListPath = "/mrp/production-orders";
type MrpProductionOrdersListGet = paths[MrpProductionOrdersListPath]["get"];
type MrpProductionOrderDetailPath = "/mrp/production-orders/{orderId}";
type MrpProductionOrderDetailGet = paths[MrpProductionOrderDetailPath]["get"];
type MrpMaterialRequirementsPath = "/mrp/production-orders/{orderId}/material-requirements";
type MrpMaterialRequirementsListGet = paths[MrpMaterialRequirementsPath]["get"];

declare function listProductionOrders(client: ApiClient): Promise<ProductionOrderListResponse>;
declare function getProductionOrder(client: ApiClient, orderId: string): Promise<ProductionOrderGetResponse>;
declare function listMaterialRequirements(client: ApiClient, orderId: string): Promise<MaterialRequirementListResponse>;

export { type MrpMaterialRequirementsListGet, type MrpProductionOrderDetailGet, type MrpProductionOrdersListGet, getProductionOrder, listMaterialRequirements, listProductionOrders };
