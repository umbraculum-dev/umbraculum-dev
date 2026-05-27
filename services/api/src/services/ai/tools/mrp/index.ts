import type { AiTool, AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";

import { createMrpExplainMaterialRequirementsTool } from "./explainMaterialRequirements.js";
import { createMrpGetProductionOrderTool } from "./getProductionOrder.js";
import { createMrpListProductionOrdersTool } from "./listProductionOrders.js";

export function registerMrpTools(registry: AiToolRegistry, prisma: PrismaClient): void {
  registry.register(createMrpListProductionOrdersTool(prisma) as unknown as AiTool);
  registry.register(createMrpGetProductionOrderTool(prisma) as unknown as AiTool);
  registry.register(createMrpExplainMaterialRequirementsTool(prisma) as unknown as AiTool);
}

export {
  createMrpExplainMaterialRequirementsTool,
  createMrpGetProductionOrderTool,
  createMrpListProductionOrdersTool,
};
