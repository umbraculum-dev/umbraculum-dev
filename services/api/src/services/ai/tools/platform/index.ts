import type { AiTool, AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";

import { createPlatformReportingQueryTool } from "./reportingQuery.js";
import { createPlatformSearchProductDocsTool } from "./searchProductDocs.js";

export function registerPlatformAiTools(registry: AiToolRegistry, prisma: PrismaClient): void {
  registry.register(createPlatformReportingQueryTool(prisma) as unknown as AiTool);
  registry.register(createPlatformSearchProductDocsTool(prisma) as unknown as AiTool);
}
