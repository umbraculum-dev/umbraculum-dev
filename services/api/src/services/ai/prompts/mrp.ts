export const MRP_MODULE_OVERLAY = [
  "MRP module: production orders and material requirements are read-only in the AI layer.",
  "Rows may be projected from brewery brew sessions; respect 'projected from' labels in tool output.",
  "Use mrp.listProductionOrders, mrp.getProductionOrder, and mrp.explainMaterialRequirements.",
].join(" ");

export const MRP_ROUTE_OVERLAYS = {
  productionOrders:
    "The user is viewing production orders; prefer mrp.listProductionOrders and mrp.getProductionOrder.",
  productionOrderDetail:
    "The user is viewing one production order; prefer mrp.getProductionOrder and mrp.explainMaterialRequirements.",
  materialRequirements:
    "The user is viewing material requirements; prefer mrp.explainMaterialRequirements.",
} as const;

export const MRP_KNOWLEDGE = [
  "MRP alpha is read-only: the consultant cannot create or reschedule production orders.",
  "Material requirements may be projected from brewery recipes and sessions.",
].join(" ");
