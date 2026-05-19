import type { AiTool, AiToolRegistry } from "@umbraculum/contracts";
import type { PrismaClient } from "@prisma/client";

import { createRecipeLookupTool } from "./recipeLookup.js";
import { createRecipeWaterStateTool } from "./recipeWaterState.js";
import { createEquipmentProfileGetTool } from "./equipmentProfileGet.js";
import { createCurrentBrewSessionStatusTool } from "./currentBrewSessionStatus.js";
import { createIngredientOnHandTool } from "./ingredientOnHand.js";

/**
 * Register all v0 brewery tools onto the given registry. Pure side-effect:
 * five `registry.register(tool)` calls.
 *
 * v0 keeps registration centralized here. Module-pluggable registration
 * (so a CRM/WMS module could ship its own tool bundle) is Sprint #3+ work
 * per docs/PLATFORM-ARCHITECTURE.md §6.2.
 *
 * The casts to `AiTool` widen the per-tool narrow generic parameters
 * (`AiTool<MyInput, MyOutput>`) back to the registry's runtime-shape
 * `AiTool<unknown, unknown>`. The handler is invoked by the orchestrator
 * with `unknown` input anyway (the model produces JSON the SDK doesn't
 * statically type), so there is no real safety loss — the narrowing is a
 * developer-ergonomics aid in each tool file only.
 */
export function registerBreweryTools(registry: AiToolRegistry, prisma: PrismaClient): void {
  registry.register(createRecipeLookupTool(prisma) as unknown as AiTool);
  registry.register(createRecipeWaterStateTool(prisma) as unknown as AiTool);
  registry.register(createEquipmentProfileGetTool(prisma) as unknown as AiTool);
  registry.register(createCurrentBrewSessionStatusTool(prisma) as unknown as AiTool);
  registry.register(createIngredientOnHandTool(prisma) as unknown as AiTool);
}
