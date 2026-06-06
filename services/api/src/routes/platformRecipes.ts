import type { FastifyInstance } from "fastify";

import { PlatformRecipesService } from "../services/platformRecipesService.js";
import { registerPlatformRecipesCatalogRoutes } from "./platformRecipesCatalogRoutes.js";
import { registerPlatformRecipesExportRoutes } from "./platformRecipesExportRoutes.js";
import { registerPlatformRecipesImportRoutes } from "./platformRecipesImportRoutes.js";

export function platformRecipesRoutes(app: FastifyInstance) {
  const platformRecipes = new PlatformRecipesService(app.prisma);

  registerPlatformRecipesCatalogRoutes(app, platformRecipes);
  registerPlatformRecipesExportRoutes(app, platformRecipes);
  registerPlatformRecipesImportRoutes(app, platformRecipes);
}
