import type { FastifyInstance } from "fastify";
import {
  listRegisteredModules,
  listRegisteredWebModules,
  registerModule,
  registerWebModule,
} from "@umbraculum/module-sdk";

import { crpPlanningRoutes } from "./routes/planningRoutes.js";
import { crpResourcesRoutes } from "./routes/resourcesRoutes.js";
import { registerCrpTools } from "../../services/ai/tools/crp/index.js";

const MODULE_CODE = "crp";

/**
 * Wire the canonical `crp` module metadata and Wave 1 read-only API routes.
 *
 * Wave 5 registers read-only AI tools over the existing CRP read services.
 * Rendering templates remain deferred to a later alpha wave.
 */
export function registerCrpModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some((m) => m.code === MODULE_CODE);

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "crp",
      addonCodes: ["crp_module"],
      routes: [],
      registerAiTools: (registry, hostApp) => {
        registerCrpTools(registry, hostApp.prisma);
      },
    });
  }

  const alreadyRegisteredWeb = listRegisteredWebModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRegisteredWeb) {
    registerWebModule({
      code: MODULE_CODE,
      ownedUrlSegments: ["capacity", "schedule", "resources"],
    });
  }

  app.register(crpResourcesRoutes);
  app.register(crpPlanningRoutes);
}
