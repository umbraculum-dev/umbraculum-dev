import type { FastifyInstance } from "fastify";
import {
  listRegisteredModules,
  listRegisteredWebModules,
  registerModule,
  registerWebModule,
} from "@umbraculum/module-sdk";

import { mrpBomsRoutes } from "./routes/bomsRoutes.js";
import { mrpProductionOrdersRoutes } from "./routes/productionOrdersRoutes.js";

const MODULE_CODE = "mrp";

/**
 * Wire the canonical `mrp` module metadata and Wave 1 read-only API routes.
 *
 * Wave 1 intentionally records no runtime AI tools and no rendering templates:
 * `@umbraculum/mrp-contracts` defines the future payload schemas, but the
 * runtime hooks wait for a later alpha wave with real brewery projections.
 */
export function registerMrpModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some((m) => m.code === MODULE_CODE);

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "mrp",
      addonCodes: ["mrp_module"],
      routes: [],
    });
  }

  const alreadyRegisteredWeb = listRegisteredWebModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRegisteredWeb) {
    registerWebModule({
      code: MODULE_CODE,
      ownedUrlSegments: ["production-orders", "work-orders", "material-requirements"],
    });
  }

  app.register(mrpProductionOrdersRoutes);
  app.register(mrpBomsRoutes);
}
