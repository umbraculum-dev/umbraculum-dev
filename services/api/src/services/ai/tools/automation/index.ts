import type { AiTool, AiToolRegistry } from "@umbraculum/contracts";
import type { PrismaClient } from "@prisma/client";

import { createListVesselsTool } from "./listVessels.js";
import { createVesselStateTool } from "./vesselState.js";

/**
 * Register all v0 `automation` tools onto the given registry. Pure
 * side-effect: two `registry.register(tool)` calls.
 *
 * Phase B-2 ships the read-scope pair (`automation.listVessels` +
 * `automation.vesselState`). Phase C will add write-scope tools (mode
 * change, target-temp setpoint) once adapter `applyCommand` is wired.
 *
 * The casts to `AiTool` widen the per-tool narrow generic parameters
 * back to the registry's runtime-shape `AiTool<unknown, unknown>` —
 * same pattern as `services/ai/tools/brewery/index.ts`.
 */
export function registerAutomationTools(
  registry: AiToolRegistry,
  prisma: PrismaClient,
): void {
  registry.register(createListVesselsTool(prisma) as unknown as AiTool);
  registry.register(createVesselStateTool(prisma) as unknown as AiTool);
}
