import type { AiTool, AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";

import { createCrpExplainCapacityLoadTool } from "./explainCapacityLoad.js";
import { createCrpListConflictsTool } from "./listConflicts.js";
import { createCrpListResourcesTool } from "./listResources.js";
import { createCrpListScheduledOperationsTool } from "./listScheduledOperations.js";
import { createCrpListWorkCentersTool } from "./listWorkCenters.js";
import { createCrpProposeScheduleAdjustmentTool } from "./proposeScheduleAdjustment.js";

export function registerCrpTools(registry: AiToolRegistry, prisma: PrismaClient): void {
  registry.register(createCrpListResourcesTool(prisma) as unknown as AiTool);
  registry.register(createCrpListWorkCentersTool(prisma) as unknown as AiTool);
  registry.register(createCrpListScheduledOperationsTool(prisma) as unknown as AiTool);
  registry.register(createCrpExplainCapacityLoadTool(prisma) as unknown as AiTool);
  registry.register(createCrpListConflictsTool(prisma) as unknown as AiTool);
  registry.register(createCrpProposeScheduleAdjustmentTool(prisma) as unknown as AiTool);
}

export {
  createCrpExplainCapacityLoadTool,
  createCrpListConflictsTool,
  createCrpListResourcesTool,
  createCrpListScheduledOperationsTool,
  createCrpListWorkCentersTool,
};
