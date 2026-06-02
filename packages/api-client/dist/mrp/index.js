import {
  getParsed,
  toClientPath
} from "../chunk-67WUASDX.js";

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
export {
  getProductionOrder,
  listMaterialRequirements,
  listProductionOrders
};
