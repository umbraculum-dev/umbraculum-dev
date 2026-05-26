import type { AiTool, AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";

import { createGetProductDetailTool } from "./getProductDetail.js";
import { createListAttributeSetsTool } from "./listAttributeSets.js";
import { createListCategoriesTool } from "./listCategories.js";
import { createSearchProductsTool } from "./searchProducts.js";

export function registerPimTools(registry: AiToolRegistry, prisma: PrismaClient): void {
  registry.register(createSearchProductsTool(prisma) as unknown as AiTool);
  registry.register(createGetProductDetailTool(prisma) as unknown as AiTool);
  registry.register(createListCategoriesTool(prisma) as unknown as AiTool);
  registry.register(createListAttributeSetsTool(prisma) as unknown as AiTool);
}
