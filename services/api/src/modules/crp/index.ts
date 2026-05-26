import type { FastifyInstance } from "fastify";
import {
  listRegisteredModules,
  listRegisteredWebModules,
  registerModule,
  registerWebModule,
} from "@umbraculum/module-sdk";

import { crpPlanningRoutes } from "./routes/planningRoutes.js";
import { crpResourcesRoutes } from "./routes/resourcesRoutes.js";

const MODULE_CODE = "crp";

/**
 * Wire the canonical `crp` module metadata and Wave 1 read-only API routes.
 *
 * Wave 1 intentionally records no runtime AI tools and no rendering templates:
 * `@umbraculum/crp-contracts` defines the future payload schemas, but the
 * runtime hooks wait for a later alpha wave with real capacity projections.
 */
export function registerCrpModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some((m) => m.code === MODULE_CODE);

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "crp",
      addonCodes: ["crp_module"],
      routes: [],
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
