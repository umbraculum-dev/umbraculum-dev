import type { FastifyInstance } from "fastify";
import {
  listRegisteredModules,
  listRegisteredWebModules,
  registerModule,
  registerWebModule,
} from "@umbraculum/module-sdk";

import { mrpDocumentTemplates } from "./documentTemplates.js";
import { mrpBomsRoutes } from "./routes/bomsRoutes.js";
import { mrpProductionOrdersRoutes } from "./routes/productionOrdersRoutes.js";
import { mrpWorkOrdersRoutes } from "./routes/workOrdersRoutes.js";
import { registerMrpTools } from "../../services/ai/tools/mrp/index.js";

const MODULE_CODE = "mrp";

/**
 * Wire the canonical `mrp` module metadata and Wave 1 read-only API routes.
 *
 * Wave 5 registers read-only AI tools over the existing MRP read services.
 * Wave 6 registers RFC-0007 document templates and work-order render-job routes.
 */
export function registerMrpModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some((m) => m.code === MODULE_CODE);

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "mrp",
      addonCodes: ["mrp_module"],
      routes: [],
      documentTemplates: mrpDocumentTemplates,
      registerAiTools: (registry, hostApp) => {
        registerMrpTools(registry, hostApp.prisma);
      },
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
  app.register(mrpWorkOrdersRoutes);
}
