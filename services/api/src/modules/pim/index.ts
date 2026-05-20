import type { FastifyInstance } from "fastify";
import { listRegisteredModules, registerModule } from "@umbraculum/module-sdk";

import { pimAttributeSetsRoutes } from "./routes/attributeSetsRoutes.js";
import { pimCategoriesRoutes } from "./routes/categoriesRoutes.js";
import { pimProductsRoutes } from "./routes/productsRoutes.js";
import { pimVariantsRoutes } from "./routes/variantsRoutes.js";

const MODULE_CODE = "pim";

export function registerPimModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some((m) => m.code === MODULE_CODE);

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "pim",
      addonCodes: ["pim_module"],
      routes: [],
    });
  }

  app.register(pimProductsRoutes);
  app.register(pimVariantsRoutes);
  app.register(pimAttributeSetsRoutes);
  app.register(pimCategoriesRoutes);
}
